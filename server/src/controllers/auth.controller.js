import * as authService from "../services/auth.service.js";

export async function register(req, res) {
  try {
    const result = await authService.registerWithEmail(req.body ?? {});
    return res.status(201).json(result);
  } catch (err) {
    const message = err.message || "Registration failed";
    const status =
      message.includes("disabled") ||
      message.includes("already exists") ||
      message.includes("required")
        ? 400
        : 500;
    if (status === 500) {
      console.error("register error:", err);
    }
    return res.status(status).json({ error: message });
  }
}

export async function login(req, res) {
  try {
    const result = await authService.loginWithEmail(req.body ?? {});
    return res.json(result);
  } catch (err) {
    const message = err.message || "Login failed";
    const status = message.includes("disabled") ? 403 : 401;
    return res.status(status).json({ error: message });
  }
}

export async function googleLogin(req, res) {
  try {
    const result = await authService.loginWithGoogle(req.body ?? {});
    return res.json(result);
  } catch (err) {
    console.error("google login error:", err);
    const message =
      err?.message ||
      (typeof err === "string" ? err : "Google sign-in failed");

    let status = 401;
    if (message.includes("not configured")) {
      status = 503;
    } else if (
      message.includes("verified") ||
      message.includes("Invalid Google")
    ) {
      status = 403;
    } else if (err?.code === 11000 || err?.name === "ValidationError") {
      status = 409;
    } else if (err?.name === "MongoServerError" || err?.name === "MongoNetworkError") {
      status = 503;
      return res.status(status).json({
        error: "Database error during sign-in. Check MongoDB connection and restart the server.",
      });
    }

    return res.status(status).json({ error: message });
  }
}

export async function me(req, res) {
  return res.json({ user: req.user });
}

export async function logout(_req, res) {
  return res.json({ ok: true });
}
