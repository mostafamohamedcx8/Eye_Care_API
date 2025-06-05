const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  report: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReportOfPatient",
      required: true,
    },
  ],
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  salutation: {
    type: String,
    enum: ["Mr", "Mrs", "Ms", "Mx"],
    required: [true, "Salutation is required"],
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

patientSchema.pre(/^find/, function (next) {
  this.populate({
    path: "optician",
    select: "firstname  lastname  _id",
  });
  next();
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
