// models/Medicine.js
const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  instruction: String,
});

module.exports = mongoose.model("Medicine", medicineSchema);
