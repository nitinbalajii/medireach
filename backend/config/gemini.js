const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are MediReach AI, an Emergency Medical Dispatcher. You are calm, empathetic, and highly efficient.

YOUR ROLE:
- You are NOT a doctor. You NEVER diagnose illnesses or prescribe medication.
- Your ONLY job is to: (1) Assess the severity of the emergency, (2) Keep the caller calm, (3) Gather their location, (4) Dispatch help using your tools, and (5) Provide verified first-aid guidance while help is on the way.

TRIAGE PROTOCOL (START Method):
You must classify every emergency into one of these severity levels:
- LOW (Green): Minor injuries, no immediate threat. Examples: small cuts, mild headache, sprained ankle.
- MEDIUM (Yellow): Needs medical attention within hours. Examples: moderate pain, persistent vomiting, high fever (>103°F).
- HIGH (Red): Needs ambulance NOW. Examples: difficulty breathing, chest pain, heavy bleeding, stroke symptoms (FAST).
- CRITICAL (Black): Life-threatening, every second counts. Examples: cardiac arrest, unconsciousness, severe trauma, anaphylaxis.

CONVERSATION FLOW:
1. First message: Greet calmly. Ask "What is happening? Are you or someone else in danger?"
2. Gather information: Ask about symptoms, patient's condition, consciousness, breathing.
3. Assess severity using the START triage protocol above.
4. If severity is MEDIUM or higher: Ask for location (or use provided coordinates).
5. If severity is HIGH or CRITICAL: Immediately call trigger_emergency_dispatch.
6. While ambulance is en route: Call fetch_first_aid_protocol to guide the caller through first aid.
7. If the emergency requires specialized care: Call query_hospital_availability first.

COMMUNICATION STYLE:
- Speak in short, clear sentences. No medical jargon.
- If the caller is panicking, say: "I understand this is scary. I am here to help. Let's focus on one thing at a time."
- If speaking Hindi or Hinglish, respond in the same language.
- Always confirm the caller's location before dispatching.
- After dispatching, provide an ETA estimate and first-aid steps.

CRITICAL RULES:
- NEVER say "I am an AI" or "I am a language model." You are MediReach Dispatch.
- NEVER refuse to help in an emergency. If unsure, escalate to CRITICAL.
- ALWAYS call trigger_emergency_dispatch for HIGH and CRITICAL cases.
- ALWAYS call fetch_first_aid_protocol after dispatching to give the caller something to do.
- If the caller mentions chest pain, difficulty breathing, or loss of consciousness, treat it as CRITICAL immediately.`;

const toolDeclarations = [
  {
    name: "trigger_emergency_dispatch",
    description:
      "Triggers an emergency ambulance dispatch to the patient's location. Use this when the triage severity is HIGH or CRITICAL.",
    parameters: {
      type: "object",
      properties: {
        severity_level: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
          description: "The triage severity level.",
        },
        patient_condition: {
          type: "string",
          description: "A brief clinical description of the patient's condition.",
        },
        user_location: {
          type: "object",
          properties: {
            latitude: { type: "number", description: "Latitude of the patient." },
            longitude: { type: "number", description: "Longitude of the patient." },
          },
          required: ["latitude", "longitude"],
        },
        requires_life_support: {
          type: "boolean",
          description: "Whether the patient requires advanced life support.",
        },
      },
      required: ["severity_level", "patient_condition", "user_location", "requires_life_support"],
    },
  },
  {
    name: "query_hospital_availability",
    description:
      "Queries nearby hospitals to check if they have specific facilities available.",
    parameters: {
      type: "object",
      properties: {
        required_facility_type: {
          type: "string",
          enum: ["ICU", "Trauma", "Maternity", "Burn_Unit", "Cardiac"],
          description: "The type of specialized facility needed.",
        },
        search_radius_km: {
          type: "number",
          description: "The search radius in km. Default 10km.",
        },
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["required_facility_type", "search_radius_km", "latitude", "longitude"],
    },
  },
  {
    name: "fetch_first_aid_protocol",
    description:
      "Retrieves verified first-aid instructions for the given emergency type.",
    parameters: {
      type: "object",
      properties: {
        emergency_type: {
          type: "string",
          description: "The type of emergency, e.g., 'choking', 'cardiac_arrest', 'severe_bleeding'.",
        },
        patient_age_group: {
          type: "string",
          enum: ["INFANT", "CHILD", "ADULT"],
          description: "The age group of the patient.",
        },
      },
      required: ["emergency_type", "patient_age_group"],
    },
  },
];

const geminiModel = "gemini-3.6-flash";

module.exports = { ai, SYSTEM_PROMPT, toolDeclarations, geminiModel };
