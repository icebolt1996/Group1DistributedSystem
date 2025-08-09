// models/MedicalRecord.js
const mongoose = require("mongoose");
const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    visitDate: Date,
    symptoms: String,
    diagnosis: String,
    prescription: [
      {
        medicineName: String,
        dosage: String,
        instruction: String,
      },
    ],
    notes: String,
    attachments: [
      {
        type: { type: String },
        url: String,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
