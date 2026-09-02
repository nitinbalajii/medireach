const { firstAidSchema } = require("./validationSchemas");

// Hardcoded first-aid protocols (no separate DB needed)
const PROTOCOLS = [
  {
    emergencyType: "cardiac_arrest",
    title: "CPR - Cardiopulmonary Resuscitation",
    patientAgeGroup: "ADULT",
    steps: JSON.stringify([
      "Call for help. If an AED is nearby, get it.",
      "Place the patient on a firm, flat surface.",
      "Place the heel of one hand on the center of the chest, interlock your other hand on top.",
      "Push hard and fast — at least 2 inches deep, at a rate of 100-120 compressions per minute.",
      "After 30 compressions, tilt the head back, lift the chin, and give 2 rescue breaths.",
      "Continue the cycle of 30 compressions and 2 breaths until help arrives.",
      "If an AED arrives, turn it on and follow the voice prompts."
    ]),
    warnings: "Do NOT stop CPR unless the patient starts breathing or professional help takes over.",
    keywords: ["heart", "chest", "cardiac", "cpr", "not breathing", "pulse"],
    source: "American Heart Association (AHA)"
  },
  {
    emergencyType: "severe_bleeding",
    title: "Severe Bleeding Control",
    patientAgeGroup: "ADULT",
    steps: JSON.stringify([
      "Put on gloves if available.",
      "Apply direct, firm pressure to the wound with a clean cloth or bandage.",
      "Do NOT remove the cloth if it soaks through — add more layers on top.",
      "If bleeding is from a limb, elevate it above the heart level.",
      "If bleeding does not stop after 10 minutes of direct pressure, apply a tourniquet 2-3 inches above the wound.",
      "Note the time the tourniquet was applied.",
      "Keep the patient warm and calm. Do not give food or water."
    ]),
    warnings: "A tourniquet should only be used as a LAST RESORT for life-threatening limb bleeding.",
    keywords: ["blood", "bleeding", "cut", "wound", "hemorrhage"],
    source: "Red Cross"
  },
  {
    emergencyType: "choking",
    title: "Choking - Heimlich Maneuver",
    patientAgeGroup: "ADULT",
    steps: JSON.stringify([
      "Ask the person: 'Are you choking?' If they cannot speak, cough, or breathe, act immediately.",
      "Stand behind the person. Wrap your arms around their waist.",
      "Make a fist with one hand. Place it just above the belly button.",
      "Grab the fist with your other hand. Give quick, upward thrusts.",
      "Repeat until the object is expelled or the person can breathe.",
      "If the person becomes unconscious, lower them to the ground and begin CPR."
    ]),
    warnings: "For pregnant women or obese individuals, perform chest thrusts instead of abdominal thrusts.",
    keywords: ["choking", "stuck", "throat", "cannot breathe", "swallow"],
    source: "American Red Cross"
  },
  {
    emergencyType: "burn",
    title: "Burn Treatment",
    patientAgeGroup: "ADULT",
    steps: JSON.stringify([
      "Remove the person from the source of the burn.",
      "Cool the burn under cool (not cold) running water for at least 10-20 minutes.",
      "Do NOT use ice, butter, toothpaste, or any home remedy.",
      "Remove any jewelry or tight clothing near the burn BEFORE swelling starts.",
      "Cover the burn loosely with a sterile, non-stick bandage or clean cloth.",
      "Give over-the-counter pain relief if available (ibuprofen or paracetamol).",
      "For chemical burns, flush with large amounts of water continuously."
    ]),
    warnings: "Do NOT pop blisters. Do NOT remove clothing stuck to the burn. Seek immediate medical attention for burns larger than 3 inches.",
    keywords: ["burn", "fire", "scald", "chemical", "hot"],
    source: "WHO Burns Guidelines"
  },
  {
    emergencyType: "seizure",
    title: "Seizure First Aid",
    patientAgeGroup: "ADULT",
    steps: JSON.stringify([
      "Stay calm. Time the seizure.",
      "Clear the area of any hard or sharp objects.",
      "Do NOT restrain the person or put anything in their mouth.",
      "Gently guide them to the ground if they are standing.",
      "Turn the person on their side (recovery position) to prevent choking.",
      "Place something soft under their head.",
      "Stay with them until the seizure ends and they are fully conscious.",
      "If the seizure lasts more than 5 minutes, call emergency services immediately."
    ]),
    warnings: "NEVER put anything in the mouth of a person having a seizure. They cannot swallow their tongue.",
    keywords: ["seizure", "convulsion", "epilepsy", "shaking", "fit"],
    source: "Epilepsy Foundation"
  },
  {
    emergencyType: "fracture",
    title: "Fracture / Broken Bone",
    patientAgeGroup: "ADULT",
    steps: JSON.stringify([
      "Do NOT try to realign the bone or push a bone that is sticking out back in.",
      "Immobilize the injured area. Use a splint or padding to keep it still.",
      "Apply ice packs wrapped in cloth to reduce swelling (20 minutes on, 20 off).",
      "If there is bleeding, apply gentle pressure with a clean bandage.",
      "Keep the person still and calm.",
      "Do NOT move the person if you suspect a spinal injury."
    ]),
    warnings: "If you suspect a neck or back injury, do NOT move the patient. Wait for paramedics.",
    keywords: ["fracture", "broken", "bone", "fall", "snap", "swelling"],
    source: "Mayo Clinic"
  },
  {
    emergencyType: "stroke",
    title: "Stroke Recognition (FAST)",
    patientAgeGroup: "ADULT",
    steps: JSON.stringify([
      "Use FAST: Face drooping? Arm weakness? Speech difficulty? Time to call emergency.",
      "Note the exact time symptoms started — this is critical for treatment.",
      "Keep the person calm and lying down with their head slightly elevated.",
      "Do NOT give them food, water, or medication.",
      "If the person is unconscious, place them in the recovery position.",
      "Monitor breathing and be ready to perform CPR if necessary."
    ]),
    warnings: "Every minute counts in a stroke. The sooner treatment begins, the better the outcome.",
    keywords: ["stroke", "face", "drooping", "slurred", "speech", "weakness", "paralysis"],
    source: "American Stroke Association"
  }
];

async function fetchFirstAidProtocol(args) {
  const validated = firstAidSchema.parse(args);

  const searchTerms = validated.emergency_type.toLowerCase().split(/[\s_]+/);

  // Search through hardcoded protocols
  let protocol = PROTOCOLS.find(
    (p) =>
      p.emergencyType === validated.emergency_type.toLowerCase().replace(/\s+/g, "_") &&
      p.patientAgeGroup === validated.patient_age_group
  );

  // Fallback: keyword search
  if (!protocol) {
    protocol = PROTOCOLS.find((p) =>
      searchTerms.some(
        (term) =>
          p.keywords.some((k) => k.includes(term)) ||
          p.emergencyType.includes(term) ||
          p.title.toLowerCase().includes(term)
      )
    );
  }

  // Final fallback: any adult protocol
  if (!protocol) {
    protocol = PROTOCOLS.find((p) => p.patientAgeGroup === validated.patient_age_group) || PROTOCOLS[0];
  }

  let steps;
  try {
    steps = JSON.parse(protocol.steps);
  } catch {
    steps = [protocol.steps];
  }

  return {
    success: true,
    protocol_title: protocol.title,
    emergency_type: protocol.emergencyType,
    age_group: protocol.patientAgeGroup,
    steps: steps,
    warnings: protocol.warnings || "None",
    source: protocol.source || "Verified Medical Guidelines",
  };
}

module.exports = { fetchFirstAidProtocol };
