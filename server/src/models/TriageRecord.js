import mongoose from "mongoose";

const triageRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      index: true,
    },
    symptoms: { type: String, required: true },
    likelyConcern: { type: String, required: true },
    department: { type: String, required: true },
    urgencyLevel: { type: String, required: true },
    explanation: { type: String, required: true },
    firstAidTreatment: { type: [String], default: [] },
    redAlert: { type: Boolean, required: true, default: false },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    queueNumber: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "triage_records",
  }
);

triageRecordSchema.index({ createdAt: -1 });
triageRecordSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model("TriageRecord", triageRecordSchema);
