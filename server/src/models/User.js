import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true, unique: true },
    googleEmailVerified: { type: Boolean, default: false },
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 1, max: 150, default: null },
    contactNumber: { type: String, trim: true, default: null },
    picture: { type: String, default: null },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.model("User", userSchema);
