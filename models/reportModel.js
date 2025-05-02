const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Eye Examination sub-schema (for Right and Left Eye)
const EyeExaminationSchema = new Schema({
  visusCC: {
    type: String,
    default: null,
  },
  previousValue: {
    type: String,
    default: null,
  },
  since: {
    type: String,
    default: null,
  },
  sphere: {
    type: String,
    default: null,
  },
  cylinder: {
    type: String,
    default: null,
  },
  axis: {
    type: String,
    default: null,
  },
  intraocularPressure: {
    type: String,
    default: null,
  },
  cornealThickness: {
    type: String,
    default: null,
  },
  chamberAngle: {
    type: String,
    default: null,
  },
  amslerTestAbnormal: {
    type: Boolean,
    default: false,
  },
  images: {
    type: [String],
    default: [],
  },
});

// Define the History sub-schema for Medical History and Eye Diseases
const HistorySchema = new Schema({
  medical: [
    {
      name: {
        type: String,
        required: true,
      },
      appliesTo: {
        type: String,
        enum: ["Self", "In Family", null],
        default: null,
      },
    },
  ],
  eye: [
    {
      name: {
        type: String,
        required: true,
      },
      appliesTo: {
        type: String,
        enum: ["Self", "In Family", null],
        default: null,
      },
    },
  ],
});

// Define the main Report schema
const ReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientInfo: {
      name: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
      },
      ethnicity: {
        type: String,
        default: null,
      },
      dateOfBirth: {
        type: String,
        required: true,
      },
      dateOfExamination: {
        type: String,
        required: true,
      },
    },
    history: HistorySchema,
    eyeExamination: {
      rightEye: EyeExaminationSchema,
      leftEye: EyeExaminationSchema,
    },
    prediction: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Create the model
const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
