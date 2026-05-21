/**
 * Seed demo triage records into MongoDB.
 * Run from server/: npm run db:seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import TriageRecord from "../src/models/TriageRecord.js";

const DEMO_RECORDS = [
  {
    symptoms: "chest pain and left arm numbness",
    likelyConcern: "Acute Coronary Syndrome",
    department: "Cardiology",
    urgencyLevel: "Emergency",
    explanation:
      "Symptoms indicate potential acute coronary syndrome. Immediate evaluation is critical.",
    redAlert: true,
  },
  {
    symptoms: "severe headache and sudden blurry vision",
    likelyConcern: "Acute Neurological Event",
    department: "Neurology",
    urgencyLevel: "Urgent",
    explanation:
      "Acute neurological symptoms require rapid assessment to rule out severe underlying conditions.",
    redAlert: false,
  },
  {
    symptoms: "twisted ankle playing basketball, swelling",
    likelyConcern: "Ankle Sprain / Minor Fracture",
    department: "Orthopaedics",
    urgencyLevel: "Routine",
    explanation:
      "Presentation consistent with a localized musculoskeletal strain or minor fracture.",
    redAlert: false,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medroute";
  await mongoose.connect(uri);
  await TriageRecord.deleteMany({});
  await TriageRecord.insertMany(DEMO_RECORDS);
  console.log(`Seeded ${DEMO_RECORDS.length} triage records.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
