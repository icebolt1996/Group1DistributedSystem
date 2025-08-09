// models/Doctor.js
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    fullName: String,
    specialty: String,
    phone: String,
    email: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
