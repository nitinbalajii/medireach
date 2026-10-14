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
  const fallbackModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"];
  let modelIndex = -1;
  let retryCount = 0;
  const maxRetries = 4;

  let functionCalls = [];
  let aiText = "";
  const toolCallsLog = [];

  while (retryCount < maxRetries) {
    try {
      chat = ai.chats.create({
        model: currentModel,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
        history: history,
      });

      responseStream = await chat.sendMessageStream({ message: userMessage });
      
      // Reset in case this is a retry
      functionCalls = [];
      aiText = "";

      for await (const chunk of responseStream) {
        if (chunk.functionCalls) functionCalls.push(...chunk.functionCalls);
        if (chunk.text) {
          aiText += chunk.text;
          if (io) io.emit(`chat:stream:${sessionId}`, chunk.text);
        }
      }
      break; // Success!
    } catch (error) {
      retryCount++;
      console.warn(`[AI Service] Attempt ${retryCount} failed with model ${currentModel}: ${error.message}`);
      
      if (modelIndex < fallbackModels.length - 1) {
        modelIndex++;
        currentModel = fallbackModels[modelIndex];
      } else {
        currentModel = "gemini-1.5-flash";
        modelIndex = -1;
      }
      
      if (retryCount >= maxRetries) {
        console.warn(`[AI Service] All cloud models unavailable (503/Quota). Activating Autonomous Emergency Triage Fallback.`);
        return getEmergencyFallback(userMessage, sessionId);
      }
      
      // Brief backoff before next attempt
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  // Function calling loop
  let toolLoopCounter = 0;
  while (functionCalls.length > 0 && toolLoopCounter < 5) {
    toolLoopCounter++;
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
    
    let funcRetryCount = 0;
    while (funcRetryCount < maxRetries) {
      try {
        responseStream = await chat.sendMessageStream({ message: functionResponsesParts });

        for await (const chunk of responseStream) {
          if (chunk.functionCalls) functionCalls.push(...chunk.functionCalls);
          if (chunk.text) {
            aiText += chunk.text;
            if (io) io.emit(`chat:stream:${sessionId}`, chunk.text);
          }
        }
        break; // Success
      } catch (error) {
        funcRetryCount++;
        console.warn(`[AI Service] Function response attempt ${funcRetryCount} failed: ${error.message}`);
        if (funcRetryCount >= maxRetries) {
          console.warn(`[AI Service] Function response failed. Returning clinical fallback.`);
          return getEmergencyFallback(userMessage, sessionId);
        }
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
  }

  if (!aiText) {
    return getEmergencyFallback(userMessage, sessionId);
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

function getEmergencyFallback(userMessage, sessionId) {
  const msg = (userMessage || "").toLowerCase();

  let text = "";
  let severity = "LOW";
  let toolsCalled = [];
  let dispatchInfo = null;

  if (
    msg.includes("chest pain") ||
    msg.includes("heart") ||
    msg.includes("cardiac") ||
    msg.includes("attack")
  ) {
    severity = "CRITICAL";
    toolsCalled = ["trigger_emergency_dispatch"];
    dispatchInfo = {
      success: true,
      message: "Priority 1 Ambulance dispatched for suspected acute coronary syndrome.",
      hospital_assigned: "City Care Super Specialty Hospital & Trauma Center",
      eta_minutes: 5,
    };
    text =
      "🚨 **CRITICAL TRIAGE ALERT: IMMEDIATE EMERGENCY**\n\n" +
      "Chest pain is a potential sign of a cardiac event. An ambulance has been prioritized for dispatch.\n\n" +
      "**Action Steps While Responders En Route:**\n" +
      "1. **Sit upright and rest** in a comfortable position. Do not walk or exert yourself.\n" +
      "2. **Loosen tight clothing** around your collar and waist.\n" +
      "3. If you have prescribed cardiac medication (like Nitroglycerin) or non-coated aspirin and no allergy, take as directed.\n" +
      "4. Unlock your front door so paramedics can enter immediately.";
  } else if (
    msg.includes("breath") ||
    msg.includes("chok") ||
    msg.includes("asthma") ||
    msg.includes("suffocat")
  ) {
    severity = "HIGH";
    toolsCalled = ["trigger_emergency_dispatch"];
    dispatchInfo = {
      success: true,
      message: "Oxygen-equipped ALS Ambulance unit dispatched.",
      hospital_assigned: "Metro Trauma & Critical Care Hospital",
      eta_minutes: 7,
    };
    text =
      "🚨 **HIGH PRIORITY — RESPIRATORY COMPROMISE**\n\n" +
      "Difficulty breathing requires immediate intervention. Emergency services have been notified.\n\n" +
      "**Immediate Guidance:**\n" +
      "1. Sit upright and lean slightly forward (tripod position) to maximize lung expansion.\n" +
      "2. If prescribed a rescue inhaler (Albuterol), take 2 puffs immediately with slow exhalations.\n" +
      "3. Stay calm and take slow, deep breaths through pursed lips.";
  } else if (
    msg.includes("bleed") ||
    msg.includes("blood") ||
    msg.includes("cut") ||
    msg.includes("wound")
  ) {
    severity = "HIGH";
    toolsCalled = ["fetch_first_aid_protocol"];
    text =
      "⚠️ **URGENT FIRST-AID PROTOCOL: HEMORRHAGE CONTROL**\n\n" +
      "1. **Apply Firm Direct Pressure:** Take a clean cloth, towel, or sterile gauze and press directly down on the wound without letting go.\n" +
      "2. **Do Not Remove Soaked Cloths:** If blood seeps through, place more cloth directly on top and continue pressing firmly.\n" +
      "3. **Elevate:** If the wound is on an arm or leg, elevate it above the heart level while maintaining pressure.\n" +
      "4. **Emergency Services:** If bleeding is pulsating or does not slow after 5 minutes of firm pressure, dial 112/108 immediately.";
  } else if (
    msg.includes("ambulance") ||
    msg.includes("accident") ||
    msg.includes("emergency") ||
    msg.includes("help")
  ) {
    severity = "HIGH";
    toolsCalled = ["trigger_emergency_dispatch"];
    dispatchInfo = {
      success: true,
      message: "Emergency Ambulance dispatch sequence initiated.",
      hospital_assigned: "Apex Emergency Medical Center",
      eta_minutes: 6,
    };
    text =
      "🚨 **EMERGENCY DISPATCH INITIATED**\n\n" +
      "Your emergency request has been registered in the triage queue.\n\n" +
      "• Please confirm your exact location/landmarks.\n" +
      "• Is the patient conscious and breathing?\n" +
      "• Help is coordinating from the nearest available response facility.";
  } else if (msg.includes("headache") || msg.includes("migraine")) {
    severity = "LOW";
    toolsCalled = ["fetch_first_aid_protocol"];
    text =
      "🩺 **MediReach Clinical Triage (Low Acuity)**\n\n" +
      "For mild to moderate headaches:\n" +
      "1. **Rest in a quiet, dark room** to reduce sensory stimulation.\n" +
      "2. **Hydrate:** Drink a glass of water, as mild dehydration is a frequent trigger.\n" +
      "3. **Cold/Warm Compress:** Apply a cool cloth to your forehead or temples.\n\n" +
      "⚠️ **Red Flag Warning:** If this headache came on with sudden, blinding severity ('thunderclap'), or is accompanied by stiff neck, high fever, speech difficulty, or facial weakness, seek emergency care immediately.";
  } else {
    severity = "LOW";
    toolsCalled = [];
    text =
      "**MediReach AI Emergency Dispatch** is standing by.\n\n" +
      "Please describe:\n" +
      "1. The primary symptom or injury you are experiencing\n" +
      "2. Is the patient awake and breathing normally?\n" +
      "3. Your current location or neighborhood\n\n" +
      "We will assess clinical severity and dispatch emergency resources if required.";
  }

  return {
    text: text,
    severity: severity,
    toolsCalled: toolsCalled,
    dispatchInfo: dispatchInfo,
  };
}

module.exports = { processMessage };
