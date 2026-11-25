import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/db.js";
import triageRoutes from "./routes/triage.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";

const app = express();
const port = Number(process.env.PORT) || 8080;

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === "true";

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;
  if (allowVercelPreviews && /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked origin:", origin);
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use((req, _res, next) => {
  if (
    req.path.startsWith("/api/triage") ||
    req.path.startsWith("/api/auth") ||
    req.path.startsWith("/test-save")
  ) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/test-save", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/triage", triageRoutes);

app.use((err, req, res, _next) => {
  console.error(`[${req.method} ${req.path}]`, err);
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    error: err?.message || "Internal server error",
  });
});

async function start() {
  await connectDatabase();
  app.listen(port, "0.0.0.0", () => {
    console.log(`MedRoute API listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
