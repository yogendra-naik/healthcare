import {
  verifyToken,
  getUserWithPatient,
  userHasVerifiedGoogle,
} from "../services/auth.service.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    const user = await getUserWithPatient(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found or Google sign-in required" });
    }
    req.user = user;
    req.userId = user.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireGoogleAuth(req, res, next) {
  if (!userHasVerifiedGoogle(req.user)) {
    return res.status(403).json({
      error: "A verified Google account is required. Use Continue with Google.",
    });
  }
  next();
}

export function requireOwnPatient(req, res, next) {
  const patientId = req.body?.patientId;
  if (!patientId) {
    return res.status(400).json({ error: "patientId is required" });
  }
  if (String(patientId) !== String(req.user.patientId)) {
    return res.status(403).json({ error: "Unauthorized patient access" });
  }
  next();
}
