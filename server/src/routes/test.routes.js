import { Router } from "express";
import * as triageService from "../services/triage.service.js";

const router = Router();

const TEST_PAYLOAD = {
  likelyConcern: "Test Record",
  department: "General OPD",
  urgencyLevel: "Routine",
  explanation: "Automated test save from /test-save endpoint.",
  redAlert: false,
};

async function runTestSave() {
  return triageService.saveTriageRecord(
    `test-save check at ${new Date().toISOString()}`,
    TEST_PAYLOAD
  );
}

router.get("/", async (_req, res) => {
  try {
    const record = await runTestSave();
    return res.json({
      ok: true,
      message: "Test record saved to MongoDB successfully.",
      record,
    });
  } catch (err) {
    console.error("test-save GET error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Failed to save test record",
    });
  }
});

router.post("/", async (_req, res) => {
  try {
    const record = await runTestSave();
    return res.status(201).json({
      ok: true,
      message: "Test record saved to MongoDB successfully.",
      record,
    });
  } catch (err) {
    console.error("test-save POST error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Failed to save test record",
    });
  }
});

export default router;
