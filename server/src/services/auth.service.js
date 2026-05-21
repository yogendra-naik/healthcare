import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import { toPatientDto, validatePatientInput } from "./patient.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

const GOOGLE_ISSUERS = new Set([
  "https://accounts.google.com",
  "accounts.google.com",
]);

function isEmailVerified(payload) {
  return payload.email_verified === true || payload.email_verified === "true";
}

function audienceMatches(payload) {
  const aud = payload.aud;
  if (Array.isArray(aud)) {
    return aud.includes(GOOGLE_CLIENT_ID);
  }
  return aud === GOOGLE_CLIENT_ID;
}

function normalizeDisplayName(name, email) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (trimmed.length >= 2) return trimmed;
  const local = (email?.split("@")[0] || "user").trim();
  return local.length >= 2 ? local : "MedRoute User";
}

function validateGoogleTokenPayload(payload) {
  if (!payload?.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid Google account identity");
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new Error("A valid Google email is required");
  }

  if (!isEmailVerified(payload)) {
    throw new Error(
      "Google email is not verified. Please use a real, verified Google account."
    );
  }

  if (!payload.iss || !GOOGLE_ISSUERS.has(payload.iss)) {
    throw new Error("Invalid Google sign-in token");
  }

  if (!audienceMatches(payload)) {
    throw new Error("Google token was not issued for this application");
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Google sign-in expired. Please try again.");
  }
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function toUserDto(user, patient = null) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    age: user.age ?? null,
    contactNumber: user.contactNumber ?? null,
    picture: user.picture ?? null,
    patientId: user.patientId?.toString() ?? null,
    patient: patient ? toPatientDto(patient) : null,
    googleId: user.googleId ? String(user.googleId) : null,
    authProvider: user.googleId ? "google" : "email",
  };
}

async function findPatientForUser(user) {
  if (!user.patientId) return null;
  if (!mongoose.Types.ObjectId.isValid(String(user.patientId))) {
    user.patientId = null;
    await user.save();
    return null;
  }
  return Patient.findById(user.patientId);
}

async function ensurePatientForUser(user) {
  let patient = await findPatientForUser(user);

  if (patient) {
    return patient;
  }

  const age = user.age ?? 25;
  const contact =
    user.contactNumber?.replace(/\D/g, "").length >= 10
      ? user.contactNumber
      : "0000000000";
  const displayName = normalizeDisplayName(user.name, user.email);

  const validation = validatePatientInput({
    name: displayName,
    age,
    contactNumber: contact,
  });

  if (validation.error) {
    patient = await Patient.create({
      name: displayName,
      age,
      contactNumber: contact,
    });
  } else {
    patient = await Patient.create(validation.data);
  }

  user.patientId = patient._id;
  await user.save();
  return patient;
}

export async function getUserWithPatient(userId) {
  const user = await User.findById(userId);
  if (!user || !user.googleId) return null;
  const patient = await findPatientForUser(user);
  return toUserDto(user, patient);
}

export async function registerWithEmail() {
  throw new Error(
    "Email registration is disabled. Sign in with a verified Google account."
  );
}

export async function loginWithEmail() {
  throw new Error(
    "Email sign-in is disabled. Use Continue with Google and a verified Google account."
  );
}

export async function loginWithGoogle({ credential }) {
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    throw new Error("Google sign-in is not configured on the server");
  }
  if (!credential || typeof credential !== "string") {
    throw new Error("Google credential is required");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new Error(
      "Invalid Google sign-in. Only real Google accounts are accepted."
    );
  }

  validateGoogleTokenPayload(payload);

  const email = payload.email.toLowerCase();
  const googleId = String(payload.sub);
  const name = normalizeDisplayName(
    payload.name ||
      [payload.given_name, payload.family_name].filter(Boolean).join(" "),
    email
  );
  const picture = payload.picture ?? null;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (user.googleId && String(user.googleId) !== googleId) {
      throw new Error("This email is linked to a different Google account");
    }
    if (user.email !== email) {
      throw new Error("Google account email does not match our records");
    }

    user.googleId = googleId;
    user.googleEmailVerified = true;
    user.passwordHash = null;
    if (!user.picture && picture) user.picture = picture;
    if (!user.name || String(user.name).trim().length < 2) user.name = name;
    await user.save();
  } else {
    try {
      user = await User.create({
        email,
        googleId,
        googleEmailVerified: true,
        name,
        picture,
        passwordHash: null,
      });
    } catch (err) {
      if (err?.code === 11000) {
        throw new Error(
          "An account with this email already exists. Try signing in again."
        );
      }
      throw err;
    }
  }

  const patient = await ensurePatientForUser(user);
  const token = signToken(user._id.toString());

  return { token, user: toUserDto(user, patient) };
}

export function userHasVerifiedGoogle(user) {
  return Boolean(user?.googleId && user?.authProvider === "google");
}
