import * as triageService from "../services/triage.service.js";

export async function analyze(req, res) {
  try {
    const symptoms = req.body?.symptoms;
    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({ error: "symptoms is required" });
    }

    const patientId = req.body?.patientId;
    const result = await triageService.analyzeAndSave(symptoms, patientId);
    return res.json(result);
  } catch (err) {
    if (err.message === "Patient not found") {
      return res.status(400).json({ error: err.message });
    }
    console.error("analyze error:", err);
    return res.status(500).json({ error: "Failed to analyze symptoms" });
  }
}

export async function save(req, res) {
  try {
    const {
      symptoms,
      likelyConcern,
      department,
      urgencyLevel,
      explanation,
      firstAidTreatment,
      redAlert,
    } = req.body ?? {};

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({ error: "symptoms is required" });
    }
    if (!likelyConcern || !department || !urgencyLevel || !explanation) {
      return res.status(400).json({
        error:
          "likelyConcern, department, urgencyLevel, and explanation are required",
      });
    }

    const result = await triageService.saveTriageRecord(
      symptoms,
      {
        likelyConcern,
        department,
        urgencyLevel,
        explanation,
        firstAidTreatment: Array.isArray(firstAidTreatment)
          ? firstAidTreatment
          : [],
        redAlert: Boolean(redAlert),
      },
      req.body?.patientId
    );
    return res.status(201).json(result);
  } catch (err) {
    if (err.message === "Patient not found") {
      return res.status(400).json({ error: err.message });
    }
    console.error("save error:", err);
    return res.status(500).json({ error: "Failed to save triage record" });
  }
}

export async function history(req, res) {
  try {
    const records = await triageService.getHistory(req.user?.patientId);
    return res.json(records);
  } catch (err) {
    console.error("history error:", err);
    return res.status(500).json({ error: "Failed to load triage history" });
  }
}

export async function proceed(req, res) {
  try {
    const { id } = req.params;
    const record = await triageService.proceedToDesk(id, req.user?.patientId);
    return res.json(record);
  } catch (err) {
    if (err.message === "Triage record not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Unauthorized access to this record") {
      return res.status(403).json({ error: err.message });
    }
    console.error("proceed error:", err);
    return res.status(500).json({ error: "Failed to check in to department" });
  }
}
