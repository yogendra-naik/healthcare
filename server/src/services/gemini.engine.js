import { analyzeWithMock } from "./mock.engine.js";
import { parseTriageJson } from "./triage-parse.js";

const SYSTEM_PROMPT = `You are a hospital triage AI. Analyze the patient's symptoms. Respond ONLY with a raw, valid JSON object. Do not include any markdown formatting, no \`\`\`json blocks, and no conversational filler. The JSON must match this structure exactly:
{
  "likelyConcern": "string",
  "department": "General OPD" | "Cardiology" | "Orthopaedics" | "Neurology" | "Emergency",
  "urgencyLevel": "Routine" | "Urgent" | "Emergency",
  "explanation": "string",
  "firstAidTreatment": ["string"],
  "redAlert": boolean
}

For firstAidTreatment, provide 4-6 short, practical first-aid steps the patient can follow safely while waiting to be seen (hydration, rest, when to seek urgent help, etc.). Tailor steps to their specific symptoms. This is general guidance only, not a diagnosis or prescription.`;

const GEMINI_MODEL = "gemini-2.5-flash";

export async function analyzeWithGemini(symptoms) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return analyzeWithMock(symptoms);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: `Patient symptoms:\n${symptoms}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return analyzeWithMock(symptoms);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return analyzeWithMock(symptoms);
    }

    return parseTriageJson(text);
  } catch (err) {
    console.error("Gemini request failed:", err.message);
    return analyzeWithMock(symptoms);
  }
}
