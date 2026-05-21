function normalizeFirstAidSteps(value) {
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|(?<=[.!?])\s+/)
      .map((s) => s.trim().replace(/^[-•*\d.)]+\s*/, ""))
      .filter(Boolean);
  }
  return [
    "Rest and stay hydrated while waiting for your appointment.",
    "Monitor symptoms and seek urgent care if they worsen suddenly.",
  ];
}

export function parseTriageJson(rawText) {
  let cleaned = rawText.trim();
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) cleaned = fenced[1].trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object in AI response");
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  return {
    likelyConcern: String(parsed.likelyConcern),
    department: String(parsed.department),
    urgencyLevel: String(parsed.urgencyLevel),
    explanation: String(parsed.explanation),
    firstAidTreatment: normalizeFirstAidSteps(parsed.firstAidTreatment),
    redAlert: Boolean(parsed.redAlert),
  };
}
