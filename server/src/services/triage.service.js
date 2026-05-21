import TriageRecord from "../models/TriageRecord.js";
import { analyzeWithGemini } from "./gemini.engine.js";
import { getPatientById } from "./patient.service.js";

export async function resolvePatientId(patientId) {
  if (!patientId) {
    return null;
  }
  const patient = await getPatientById(String(patientId));
  if (!patient) {
    throw new Error("Patient not found");
  }
  return patient.id;
}

export function toResponseDto(record) {
  return {
    id: record._id.toString(),
    patientId: record.patientId ? record.patientId.toString() : null,
    symptoms: record.symptoms,
    symptomInput: record.symptoms,
    likelyConcern: record.likelyConcern,
    department: record.department,
    urgencyLevel: record.urgencyLevel,
    explanation: record.explanation,
    firstAidTreatment: record.firstAidTreatment ?? [],
    redAlert: record.redAlert,
    checkedIn: record.checkedIn ?? false,
    queueNumber: record.queueNumber ?? null,
    createdAt: record.createdAt,
    timestamp: record.createdAt,
  };
}

export async function analyzeOnly(symptoms) {
  return analyzeWithGemini(symptoms.trim());
}

export async function saveTriageRecord(symptoms, triageResult, patientId = null) {
  const trimmed = symptoms.trim();
  const resolvedPatientId = await resolvePatientId(patientId);
  const saved = await TriageRecord.create({
    ...(resolvedPatientId ? { patientId: resolvedPatientId } : {}),
    symptoms: trimmed,
    likelyConcern: triageResult.likelyConcern,
    department: triageResult.department,
    urgencyLevel: triageResult.urgencyLevel,
    explanation: triageResult.explanation,
    firstAidTreatment: triageResult.firstAidTreatment ?? [],
    redAlert: Boolean(triageResult.redAlert),
  });
  return toResponseDto(saved);
}

export async function analyzeAndSave(symptoms, patientId = null) {
  const trimmed = symptoms.trim();
  const analyzed = await analyzeWithGemini(trimmed);
  return saveTriageRecord(trimmed, analyzed, patientId);
}

export async function getHistory(patientId) {
  if (!patientId) {
    return [];
  }
  const records = await TriageRecord.find({ patientId: String(patientId) })
    .sort({ createdAt: -1 })
    .limit(50);
  return records.map(toResponseDto);
}

function generateQueueNumber(department) {
  const prefix = department
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3) || "MR";
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${suffix}`;
}

export async function proceedToDesk(recordId, patientId = null) {
  const record = await TriageRecord.findById(recordId);
  if (!record) {
    throw new Error("Triage record not found");
  }

  if (patientId) {
    if (
      !record.patientId ||
      String(record.patientId) !== String(patientId)
    ) {
      throw new Error("Unauthorized access to this record");
    }
  }

  if (!record.checkedIn) {
    record.checkedIn = true;
    record.checkedInAt = new Date();
    record.queueNumber = generateQueueNumber(record.department);
    await record.save();
  }

  return toResponseDto(record);
}
