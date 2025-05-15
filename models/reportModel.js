const mongoose = require("mongoose");

const reportOfPatientSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  optician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  history: {
    medical: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        hasCondition: {
          type: Boolean,
          required: true,
        },
        appliesTo: {
          type: String,
          enum: ["Self", "In Family"],
          default: null,
        },
      },
    ],
    eye: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        hasCondition: {
          type: Boolean,
          required: true,
        },
        appliesTo: {
          type: String,
          enum: ["Self", "In Family"],
          default: null,
        },
      },
    ],
  },
  eyeExamination: {
    rightEye: {
      visusCC: {
        type: String,
        required: true,
      },
      previousValue: {
        type: String,
      },
      since: {
        type: Date,
      },
      sphere: {
        type: String,
      },
      cylinder: {
        type: String,
      },
      axis: {
        type: String,
      },
      intraocularPressure: {
        type: String,
      },
      cornealThickness: {
        type: String,
      },
      chamberAngle: {
        type: String,
      },
      amslerTestAbnormal: {
        type: Boolean,
      },
      images: [String],
    },
    leftEye: {
      visusCC: {
        type: String,
        required: true,
      },
      previousValue: {
        type: String,
      },
      since: {
        type: Date,
      },
      sphere: {
        type: String,
      },
      cylinder: {
        type: String,
      },
      axis: {
        type: String,
      },
      intraocularPressure: {
        type: String,
      },
      cornealThickness: {
        type: String,
      },
      chamberAngle: {
        type: String,
      },
      amslerTestAbnormal: {
        type: Boolean,
      },
      images: [String],
    },
  },
  modelResults: {
    disease1: {
      name: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    disease2: {
      name: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    disease3: {
      name: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const setImageURL = (doc) => {
  if (doc.eyeExamination?.rightEye?.images) {
    const rightImageList = doc.eyeExamination.rightEye.images.map((image) => {
      return `${process.env.BASE_URL}/funds/${image}`;
    });
    doc.eyeExamination.rightEye.images = rightImageList;
  }

  if (doc.eyeExamination?.leftEye?.images) {
    const leftImageList = doc.eyeExamination.leftEye.images.map((image) => {
      return `${process.env.BASE_URL}/funds/${image}`;
    });
    doc.eyeExamination.leftEye.images = leftImageList;
  }
};

// ✅ استخدم post على الـ schema نفسه
reportOfPatientSchema.post("init", (doc) => {
  setImageURL(doc);
});

reportOfPatientSchema.post("save", (doc) => {
  setImageURL(doc);
});

// ثم أنشئ الموديل بعد ذلك
const ReportOfPatient = mongoose.model(
  "ReportOfPatient",
  reportOfPatientSchema
);
module.exports = ReportOfPatient;
