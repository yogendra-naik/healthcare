import { Router } from "express";
import * as triageController from "../controllers/triage.controller.js";
import {
  requireAuth,
  requireGoogleAuth,
  requireOwnPatient,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/analyze",
  requireAuth,
  requireGoogleAuth,
  requireOwnPatient,
  triageController.analyze
);
router.post(
  "/save",
  requireAuth,
  requireGoogleAuth,
  requireOwnPatient,
  triageController.save
);
router.get(
  "/history",
  requireAuth,
  requireGoogleAuth,
  triageController.history
);
router.post(
  "/:id/proceed",
  requireAuth,
  requireGoogleAuth,
  triageController.proceed
);

export default router;
