import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 150 },
    contactNumber: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "patients",
  }
);

patientSchema.index({ createdAt: -1 });
patientSchema.index({ contactNumber: 1 });

export default mongoose.model("Patient", patientSchema);
