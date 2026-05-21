const PRESETS = {
  "chest pain and left arm numbness": {
    likelyConcern: "Acute Coronary Syndrome",
    department: "Cardiology",
    urgencyLevel: "Emergency",
    explanation:
      "Symptoms indicate potential acute coronary syndrome. Immediate evaluation is critical.",
    firstAidTreatment: [
      "Stop activity and sit or lie down in a comfortable position.",
      "Loosen tight clothing and try to stay calm; avoid eating or drinking.",
      "If prescribed, take aspirin only if you are not allergic and staff confirms it is appropriate.",
      "Do not drive yourself — alert staff or call emergency services immediately.",
    ],
    redAlert: true,
  },
  "severe headache and sudden blurry vision": {
    likelyConcern: "Acute Neurological Event",
    department: "Neurology",
    urgencyLevel: "Urgent",
    explanation:
      "Acute neurological symptoms require rapid assessment to rule out severe underlying conditions.",
    firstAidTreatment: [
      "Rest in a quiet, dimly lit room and avoid screens.",
      "Do not take new pain medicines without clinician advice.",
      "Note when symptoms started and any neck stiffness or weakness.",
      "Seek immediate help if confusion, vomiting, or weakness develops.",
    ],
    redAlert: false,
  },
  "twisted ankle playing basketball, swelling": {
    likelyConcern: "Ankle Sprain / Minor Fracture",
    department: "Orthopaedics",
    urgencyLevel: "Routine",
    explanation:
      "Presentation consistent with a localized musculoskeletal strain or minor fracture.",
    firstAidTreatment: [
      "Rest and avoid putting weight on the injured ankle.",
      "Apply ice wrapped in cloth for 15–20 minutes every few hours.",
      "Elevate the foot above heart level to reduce swelling.",
      "Use a firm bandage for gentle compression if comfortable.",
    ],
    redAlert: false,
  },
};

const FEVER_FIRST_AID = [
  "Rest in a cool, well-ventilated area and wear light clothing.",
  "Drink water, oral rehydration solution, or clear fluids frequently.",
  "Take paracetamol/acetaminophen as directed on the package if you have no allergy (avoid if liver disease — ask staff).",
  "Use a cool compress on forehead, neck, or armpits for comfort.",
  "Seek urgent care if fever is above 103°F (39.4°C), lasts more than 3 days, or you have stiff neck, rash, or confusion.",
];

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function analyzeWithMock(symptoms) {
  const normalized = normalize(symptoms);

  for (const [key, preset] of Object.entries(PRESETS)) {
    if (normalized.includes(key)) {
      return { ...preset, firstAidTreatment: [...preset.firstAidTreatment] };
    }
  }

  if (/\bfever\b/i.test(symptoms)) {
    return {
      likelyConcern: "Fever",
      department: "General OPD",
      urgencyLevel: "Routine",
      explanation:
        "Fever is common and often managed in outpatient care. Monitor closely and seek help if symptoms worsen.",
      firstAidTreatment: FEVER_FIRST_AID,
      redAlert: false,
    };
  }

  if (
    /\b(chest pain|can't breathe|unconscious|severe bleeding|stroke|heart attack)\b/i.test(
      symptoms
    )
  ) {
    return {
      likelyConcern: "Potentially Life-Threatening Condition",
      department: "Emergency",
      urgencyLevel: "Emergency",
      explanation:
        "Reported symptoms may indicate a serious acute condition. Seek immediate clinical evaluation.",
      firstAidTreatment: [
        "Call emergency services or alert hospital staff immediately.",
        "Keep the patient still and monitor breathing and responsiveness.",
        "Do not give food or drink unless staff instructs you to.",
        "If trained and appropriate, follow basic life support until help arrives.",
      ],
      redAlert: true,
    };
  }

  if (
    /\b(high fever|vomiting blood|severe pain|confusion|fainting)\b/i.test(
      symptoms
    )
  ) {
    return {
      likelyConcern: "Acute Symptom Complex",
      department: "General OPD",
      urgencyLevel: "Urgent",
      explanation:
        "Symptoms warrant prompt medical assessment within the same day.",
      firstAidTreatment: [
        "Sit or lie down safely and have someone stay with you if possible.",
        "Sip small amounts of clear fluids if you are not vomiting.",
        "Do not drive yourself to the hospital.",
        "Tell reception staff immediately if pain or confusion worsens.",
      ],
      redAlert: false,
    };
  }

  return {
    likelyConcern: "General Medical Complaint",
    department: "General OPD",
    urgencyLevel: "Routine",
    explanation:
      "Symptoms appear non-urgent. A standard outpatient evaluation is recommended.",
    firstAidTreatment: [
      "Rest and drink fluids unless staff advises otherwise.",
      "Write down when symptoms started and any triggers.",
      "Avoid strenuous activity until you are assessed.",
      "Seek urgent care if symptoms suddenly worsen.",
    ],
    redAlert: false,
  };
}
