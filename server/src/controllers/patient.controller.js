import * as patientService from "../services/patient.service.js";

export async function register(req, res) {
  try {
    const result = await patientService.registerPatient(req.body ?? {});
    return res.status(201).json(result);
  } catch (err) {
    if (
      err.message?.includes("required") ||
      err.message?.includes("must be")
    ) {
      return res.status(400).json({ error: err.message });
    }
    console.error("register patient error:", err);
    return res.status(500).json({ error: "Failed to register visitor" });
  }
}
