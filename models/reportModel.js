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
      imageCaptureDate: {
        type: Date,
      },
    },
    leftEye: {
      visusCC: {
        type: String,
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
      imageCaptureDate: {
        type: Date,
      },
    },
  },
  modelResults: {
    rightEye: {
      type: String, // بنخزن JSON string
      required: true,
    },
    leftEye: {
      type: String,
      required: true,
    },
  },
  doctorFeedbacks: [
    {
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rightEyeFeedback: {
        aiPredictionCorrect: {
          type: String,
          enum: ["correct", "incorrect", "uncertain"],
        },
        comment: {
          type: String,
          trim: true,
        },
      },
      leftEyeFeedback: {
        aiPredictionCorrect: {
          type: String,
          enum: ["correct", "incorrect", "uncertain"],
        },
        comment: {
          type: String,
          trim: true,
        },
      },
      diagnosis: {
        type: String,
        trim: true,
      },
      recommendedAction: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const setImageURLs = (doc) => {
  const baseUrl = process.env.BASE_URL;

  ["rightEye", "leftEye"].forEach((eye) => {
    if (doc.eyeExamination?.[eye]?.images) {
      doc.eyeExamination[eye].images = doc.eyeExamination[eye].images.map(
        (image) => {
          // لو الصورة بالفعل فيها URL، سيبها زي ما هي
          if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
          }
          return `${baseUrl}/funds/${image}`;
        }
      );
    }
  });
};

// findOne, findAll, Update
reportOfPatientSchema.post("init", setImageURLs);

// create
reportOfPatientSchema.post("save", setImageURLs);
reportOfPatientSchema.pre(/^find/, function (next) {
  this.populate({
    path: "doctorFeedbacks.doctor",
    select: "firstname  lastname  _id",
  });
  next();
});

// ثم أنشئ الموديل بعد ذلك
const ReportOfPatient = mongoose.model(
  "ReportOfPatient",
  reportOfPatientSchema
);
module.exports = ReportOfPatient;
