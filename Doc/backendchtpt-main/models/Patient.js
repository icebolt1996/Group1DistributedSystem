// models/Patient.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    fullName: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female"] },
    phone: String,
    email: String,
    address: String,
    medicalHistory: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
