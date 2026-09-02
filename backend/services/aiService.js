const { ai, SYSTEM_PROMPT, toolDeclarations, geminiModel } = require("../config/gemini");
const { triggerEmergencyDispatch } = require("../ai-tools/triggerEmergencyDispatch");
const { queryHospitalAvailability } = require("../ai-tools/queryHospitalAvailability");
const { fetchFirstAidProtocol } = require("../ai-tools/fetchFirstAidProtocol");

// In-memory session store (chat history per session)
// For production, swap this with a MongoDB collection
const sessions = new Map();

const toolHandlers = {
  trigger_emergency_dispatch: triggerEmergencyDispatch,
  query_hospital_availability: queryHospitalAvailability,
  fetch_first_aid_protocol: fetchFirstAidProtocol,
};

async function processMessage(sessionId, userMessage, io) {
  // Load or create session history
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  const history = sessions.get(sessionId);

  let chat;
  let responseStream;
  let currentModel = geminiModel;
  const fallbackModels = ["gemini-1.5-flash", "gemini-1.0-pro"];
  let modelIndex = -1;

  while (true) {
    try {
      // Create Gemini chat with history
      chat = ai.chats.create({
        model: currentModel,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
        history: history,
      });

      // Send message and stream response
      responseStream = await chat.sendMessageStream({ message: userMessage });
      break; // Success!
    } catch (error) {
      if ((error.status === 503 || error.status === 429 || error.status === 404) && modelIndex < fallbackModels.length - 1) {
        modelIndex++;
        currentModel = fallbackModels[modelIndex];
        console.warn(`[AI Service] Model failed, falling back to ${currentModel}...`);
      } else {
        throw error; // No more fallbacks, throw it up
      }
    }
  }
  const toolCallsLog = [];

  let functionCalls = [];
  let aiText = "";

  for await (const chunk of responseStream) {
    if (chunk.functionCalls) functionCalls.push(...chunk.functionCalls);
    if (chunk.text) {
      aiText += chunk.text;
      if (io) io.emit(`chat:stream:${sessionId}`, chunk.text);
    }
  }

  // Function calling loop
  while (functionCalls.length > 0) {
    const functionResponsesParts = [];

    for (const functionCall of functionCalls) {
      const toolName = functionCall.name;
      const toolArgs = functionCall.args;

      console.log(`[AI Service] Tool called: ${toolName}`, toolArgs);

      let toolResult;
      try {
        const handler = toolHandlers[toolName];
        if (!handler) throw new Error(`Unknown tool: ${toolName}`);

        if (toolName === "trigger_emergency_dispatch") {
          toolResult = await handler(toolArgs, io, sessionId);
        } else {
          toolResult = await handler(toolArgs);
        }
      } catch (error) {
        console.error(`[AI Service] Tool error (${toolName}):`, error.message);
        toolResult = {
          success: false,
          error: error.message,
          message: `Tool execution failed: ${error.message}`,
        };
      }

      toolCallsLog.push({ tool: toolName, result: toolResult });

      functionResponsesParts.push({
        functionResponse: {
          name: toolName,
          response: toolResult,
        },
      });
    }

    functionCalls = [];
    responseStream = await chat.sendMessageStream({ message: functionResponsesParts });

    for await (const chunk of responseStream) {
      if (chunk.functionCalls) functionCalls.push(...chunk.functionCalls);
      if (chunk.text) {
        aiText += chunk.text;
        if (io) io.emit(`chat:stream:${sessionId}`, chunk.text);
      }
    }
  }

  if (!aiText) {
    aiText = "I'm having trouble processing your request. Please describe your emergency again.";
  }

  // Detect severity
  let severity = null;
  for (const log of toolCallsLog) {
    if (log.tool === "trigger_emergency_dispatch" && log.result.success) {
      severity = log.result.severity || "HIGH";
    }
  }

  // Save to in-memory history
  history.push({ role: "user", parts: [{ text: userMessage }] });
  history.push({ role: "model", parts: [{ text: aiText }] });

  return {
    text: aiText,
    severity: severity,
    toolsCalled: toolCallsLog.map((t) => t.tool),
    dispatchInfo: toolCallsLog.find((t) => t.tool === "trigger_emergency_dispatch")?.result || null,
  };
}

module.exports = { processMessage };
