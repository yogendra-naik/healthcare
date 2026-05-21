import { Router } from "express";
import * as patientController from "../controllers/patient.controller.js";

const router = Router();

router.post("/register", patientController.register);

export default router;
