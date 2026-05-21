import { analyzeWithMock } from "./mock.engine.js";

const SYSTEM_PROMPT = `You are a hospital triage AI. Analyze the patient's symptoms. Respond ONLY with a raw, valid JSON object. Do not include any markdown formatting, no \`\`\`json blocks, and no conversational filler. The JSON must match this structure exactly:
{
  "likelyConcern": "string",
  "department": "General OPD" | "Cardiology" | "Orthopaedics" | "Neurology" | "Emergency",
  "urgencyLevel": "Routine" | "Urgent" | "Emergency",
  "explanation": "string",
  "redAlert": boolean
}`;

const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

import { parseTriageJson } from "./triage-parse.js";

export async function analyzeWithClaude(symptoms) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return analyzeWithMock(symptoms);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Patient symptoms:\n${symptoms}` }],
      }),
    });

    if (!response.ok) {
      return analyzeWithMock(symptoms);
    }

    const data = await response.json();
    const textBlock = data.content?.find((block) => block.type === "text");
    if (!textBlock?.text) {
      return analyzeWithMock(symptoms);
    }

    return parseTriageJson(textBlock.text);
  } catch {
    return analyzeWithMock(symptoms);
  }
}
