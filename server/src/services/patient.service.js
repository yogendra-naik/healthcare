import Patient from "../models/Patient.js";

export function toPatientDto(record) {
  return {
    id: record._id.toString(),
    name: record.name,
    age: record.age,
    contactNumber: record.contactNumber,
    createdAt: record.createdAt,
  };
}

export function validatePatientInput({ name, age, contactNumber }) {
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedContact =
    typeof contactNumber === "string" ? contactNumber.trim() : "";

  if (!trimmedName || trimmedName.length < 2) {
    return { error: "name is required (at least 2 characters)" };
  }

  const parsedAge = Number(age);
  if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 150) {
    return { error: "age must be a whole number between 1 and 150" };
  }

  const digitsOnly = trimmedContact.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    return { error: "contactNumber must be at least 10 digits" };
  }

  return {
    data: {
      name: trimmedName,
      age: parsedAge,
      contactNumber: trimmedContact,
    },
  };
}

export async function registerPatient(input) {
  const validation = validatePatientInput(input);
  if (validation.error) {
    throw new Error(validation.error);
  }

  const saved = await Patient.create(validation.data);
  return toPatientDto(saved);
}

export async function getPatientById(patientId) {
  const record = await Patient.findById(patientId);
  if (!record) {
    return null;
  }
  return toPatientDto(record);
}
