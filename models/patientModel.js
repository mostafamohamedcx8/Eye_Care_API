const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Eye Examination sub-schema (for Right and Left Eye)
const EyeExaminationSchema = new Schema({
  visusCC: {
    type: String, // e.g., "Select Visus"
    default: null,
  },
  previousValue: {
    type: String, // e.g., "Select Visus"
    default: null,
  },
  since: {
    type: String, // Date in format mm/dd/yyyy
    default: null,
  },
  images: {
    type: [String], // Array of image URLs or file paths
    default: [],
  },
  sphere: {
    type: String, // e.g., "+/- 0.0 - 25.0"
    default: null,
  },
  cylinder: {
    type: String, // e.g., "(+/-)"
    default: null,
  },
  axis: {
    type: String,
    default: null,
  },
  intraocularPressure: {
    type: String, // e.g., "Select"
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
    type: Boolean, // e.g., "Select"
  },
});

// Define the History sub-schema
const HistorySchema = new Schema({
  medical: [
    {
      name: {
        type: String, // e.g., "Diabetes M.", "Hypertension"
        required: true,
      },
      hasCondition: {
        type: Boolean,
        default: false,
      },
      appliesTo: {
        type: String,
        enum: ["Self", "In Family", null], // Who the condition applies to
        default: null,
      },
    },
  ],
  eye: [
    {
      name: {
        type: String, // e.g., "Cataract", "Glaucoma"
        required: true,
      },
      hasCondition: {
        type: Boolean,
        default: false,
      },
      appliesTo: {
        type: String,
        enum: ["Self", "In Family", null],
        default: null,
      },
    },
  ],
});

// Define the main Patient schema
const PatientSchema = new Schema(
  {
    name: {
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
      type: String, // Format: mm/dd/yyyy
      required: true,
    },
    refraction: {
      od: {
        type: Boolean, // OD (Right eye)
        default: false,
      },
      os: {
        type: Boolean, // OS (Left eye)
        default: false,
      },
    },
    history: HistorySchema,
    eyeExamination: {
      rightEye: EyeExaminationSchema,
      leftEye: EyeExaminationSchema,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

const setImageURL = (doc) => {
  // Process rightEye images
  if (doc.eyeExamination?.rightEye?.images?.length) {
    doc.eyeExamination.rightEye.images = doc.eyeExamination.rightEye.images.map(
      (image) => `${process.env.BASE_URL}/${image}`
    );
  }
  // Process leftEye images
  if (doc.eyeExamination?.leftEye?.images?.length) {
    doc.eyeExamination.leftEye.images = doc.eyeExamination.leftEye.images.map(
      (image) => `${process.env.BASE_URL}/${image}`
    );
  }
};

// Middleware for findOne, findAll, and update operations
PatientSchema.post("init", (doc) => {
  setImageURL(doc);
});

// Middleware for create and update (save) operations
PatientSchema.post("save", (doc) => {
  setImageURL(doc);
});

// Create the model
const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;
