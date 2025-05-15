const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  report: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReportOfPatient",
      required: true,
    },
  ],
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  ethnicity: {
    type: String,
    required: true,
  },
  optician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
