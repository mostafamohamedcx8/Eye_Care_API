const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Patient = require("../../models/patientModel"); // Adjust path to your Patient model
const User = require("../../models/UserModel"); // Adjust path to your User model

// ==========================
// 🔹 Validation Rules
// ==========================

exports.createReportOfPatientValidator = [
  // Patient validation
  check("patient")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isMongoId()
    .withMessage("Patient must be a valid MongoDB ObjectId")
    .custom(async (patientId) => {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        throw new Error("Patient not found");
      }
      return true;
    }),

  // Optician validation
  check("optician")
    .notEmpty()
    .withMessage("Optician ID is required")
    .isMongoId()
    .withMessage("Optician must be a valid MongoDB ObjectId")
    .custom(async (opticianId) => {
      const user = await User.findById(opticianId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.role !== "optician") {
        throw new Error(
          "The referenced user must be an optician, not a doctor or admin"
        );
      }
      return true;
    }),

  // History - Medical validation
  check("history.medical")
    .optional()
    .isArray()
    .withMessage("Medical history must be an array"),
  check("history.medical.*.name")
    .if(check("history.medical").exists())
    .notEmpty()
    .withMessage("Medical condition name is required")
    .isString()
    .withMessage("Medical condition name must be a string")
    .isIn([
      "Diabetes M.",
      "Hypertension",
      "Rheumatic diseases",
      "Thyroid",
      "Tumours",
      "Genetic",
    ])
    .withMessage("Invalid medical condition name"),
  check("history.medical.*.hasCondition")
    .if(check("history.medical").exists())
    .notEmpty()
    .withMessage("Has condition is required for medical history")
    .isBoolean()
    .withMessage("Has condition must be a boolean"),
  check("history.medical.*.appliesTo")
    .if(check("history.medical").exists())
    .optional()
    .isIn(["Self", "In Family", null])
    .withMessage("Applies to must be Self, In Family, or null"),

  // History - Eye validation
  check("history.eye")
    .optional()
    .isArray()
    .withMessage("Eye history must be an array"),
  check("history.eye.*.name")
    .if(check("history.eye").exists())
    .notEmpty()
    .withMessage("Eye condition name is required")
    .isString()
    .withMessage("Eye condition name must be a string")
    .isIn(["Cataract", "Glaucoma", "Age-related macular degeneration"])
    .withMessage("Invalid eye condition name"),
  check("history.eye.*.hasCondition")
    .if(check("history.eye").exists())
    .notEmpty()
    .withMessage("Has condition is required for eye history")
    .isBoolean()
    .withMessage("Has condition must be a boolean"),
  check("history.eye.*.appliesTo")
    .if(check("history.eye").exists())
    .optional()
    .isIn(["Self", "In Family", null])
    .withMessage("Applies to must be Self, In Family, or null"),

  // Eye Examination - Right Eye validation
  check("eyeExamination.rightEye.visusCC")
    .notEmpty()
    .withMessage("Right eye Visus CC is required")
    .isString()
    .withMessage("Right eye Visus CC must be a string")
    .trim(),
  check("eyeExamination.rightEye.previousValue")
    .optional()
    .isString()
    .withMessage("Right eye previous value must be a string")
    .trim(),
  check("eyeExamination.rightEye.since")
    .optional()
    .isISO8601()
    .withMessage("Right eye since must be a valid date"),
  check("eyeExamination.rightEye.sphere")
    .optional()
    .isString()
    .withMessage("Right eye sphere must be a string")
    .trim(),
  check("eyeExamination.rightEye.cylinder")
    .optional()
    .isString()
    .withMessage("Right eye cylinder must be a string")
    .trim(),
  check("eyeExamination.rightEye.axis")
    .optional()
    .isString()
    .withMessage("Right eye axis must be a string")
    .trim(),
  check("eyeExamination.rightEye.intraocularPressure")
    .optional()
    .isString()
    .withMessage("Right eye intraocular pressure must be a string")
    .trim(),
  check("eyeExamination.rightEye.cornealThickness")
    .optional()
    .isString()
    .withMessage("Right eye corneal thickness must be a string")
    .trim(),
  check("eyeExamination.rightEye.chamberAngle")
    .optional()
    .isString()
    .withMessage("Right eye chamber angle must be a string")
    .trim(),
  check("eyeExamination.rightEye.amslerTestAbnormal")
    .optional()
    .isBoolean()
    .withMessage("Right eye Amsler test abnormal must be a boolean"),
  check("eyeExamination.rightEye.images")
    .optional()
    .isArray()
    .withMessage("Right eye images must be an array")
    .custom((images) => {
      if (images && images.length > 0) {
        images.forEach((img) => {
          if (typeof img !== "string" || !img.trim()) {
            throw new Error(
              "Each right eye image URL must be a non-empty string"
            );
          }
        });
      }
      return true;
    }),

  // Eye Examination - Left Eye validation
  check("eyeExamination.leftEye.visusCC")
    .notEmpty()
    .withMessage("Left eye Visus CC is required")
    .isString()
    .withMessage("Left eye Visus CC must be a string")
    .trim(),
  check("eyeExamination.leftEye.previousValue")
    .optional()
    .isString()
    .withMessage("Left eye previous value must be a string")
    .trim(),
  check("eyeExamination.leftEye.since")
    .optional()
    .isISO8601()
    .withMessage("Left eye since must be a valid date"),
  check("eyeExamination.leftEye.sphere")
    .optional()
    .isString()
    .withMessage("Left eye sphere must be a string")
    .trim(),
  check("eyeExamination.leftEye.cylinder")
    .optional()
    .isString()
    .withMessage("Left eye cylinder must be a string")
    .trim(),
  check("eyeExamination.leftEye.axis")
    .optional()
    .isString()
    .withMessage("Left eye axis must be a string")
    .trim(),
  check("eyeExamination.leftEye.intraocularPressure")
    .optional()
    .isString()
    .withMessage("Left eye intraocular pressure must be a string")
    .trim(),
  check("eyeExamination.leftEye.cornealThickness")
    .optional()
    .isString()
    .withMessage("Left eye corneal thickness must be a string")
    .trim(),
  check("eyeExamination.leftEye.chamberAngle")
    .optional()
    .isString()
    .withMessage("Left eye chamber angle must be a string")
    .trim(),
  check("eyeExamination.leftEye.amslerTestAbnormal")
    .optional()
    .isBoolean()
    .withMessage("Left eye Amsler test abnormal must be a boolean"),
  check("eyeExamination.leftEye.images")
    .optional()
    .isArray()
    .withMessage("Left eye images must be an array")
    .custom((images) => {
      if (images && images.length > 0) {
        images.forEach((img) => {
          if (typeof img !== "string" || !img.trim()) {
            throw new Error(
              "Each left eye image URL must be a non-empty string"
            );
          }
        });
      }
      return true;
    }),

  // Model Results validation
  check("modelResults.disease1.name")
    .notEmpty()
    .withMessage("Disease 1 name is required")
    .isString()
    .withMessage("Disease 1 name must be a string")
    .trim(),
  check("modelResults.disease1.percentage")
    .notEmpty()
    .withMessage("Disease 1 percentage is required")
    .isInt({ min: 0, max: 100 })
    .withMessage("Disease 1 percentage must be between 0 and 100"),
  check("modelResults.disease2.name")
    .notEmpty()
    .withMessage("Disease 2 name is required")
    .isString()
    .withMessage("Disease 2 name must be a string")
    .trim(),
  check("modelResults.disease2.percentage")
    .notEmpty()
    .withMessage("Disease 2 percentage is required")
    .isInt({ min: 0, max: 100 })
    .withMessage("Disease 2 percentage must be between 0 and 100"),
  check("modelResults.disease3.name")
    .notEmpty()
    .withMessage("Disease 3 name is required")
    .isString()
    .withMessage("Disease 3 name must be a string")
    .trim(),
  check("modelResults.disease3.percentage")
    .notEmpty()
    .withMessage("Disease 3 percentage is required")
    .isInt({ min: 0, max: 100 })
    .withMessage("Disease 3 percentage must be between 0 and 100"),

  validatorMiddleware,
];

exports.getReportOfPatientValidator = [
  check("id").isMongoId().withMessage("Invalid Report Of Patient ID format"),
  validatorMiddleware,
];

exports.getMyReportOfPatientValidator = [
  check("id").isMongoId().withMessage("Invalid Report Of Patient ID format"),
  validatorMiddleware,
];

exports.deleteReportOfPatientValidator = [
  check("id").isMongoId().withMessage("Invalid Report Of Patient ID format"),
  validatorMiddleware,
];

exports.deleteMyReportOfPatientValidator = [
  check("id").isMongoId().withMessage("Invalid Report Of Patient ID format"),
  validatorMiddleware,
];
