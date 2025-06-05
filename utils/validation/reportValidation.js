const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Patient = require("../../models/patientModel"); // Adjust path to your Patient model
const User = require("../../models/UserModel"); // Adjust path to your User model

// ==========================
// 🔹 Validation Rules
// ==========================

exports.createReportOfPatientValidator = [
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
    .withMessage("Medical condition name must be a string"),

  check("history.medical.*.hasCondition")
    .if(check("history.medical").exists())
    .notEmpty()
    .withMessage("Has condition is required for medical history")
    .isBoolean()
    .withMessage("Has condition must be a boolean"),
  check("history.medical.*.appliesTo")
    .if(check("history.medical").exists())
    .optional()
    .isIn(["Self", "In Family"])
    .withMessage("Applies to must be Self, In Family"),

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
    .withMessage("Eye condition name must be a string"),
  check("history.eye.*.hasCondition")
    .if(check("history.eye").exists())
    .notEmpty()
    .withMessage("Has condition is required for eye history")
    .isBoolean()
    .withMessage("Has condition must be a boolean"),
  check("history.eye.*.appliesTo")
    .if(check("history.eye").exists())
    .optional()
    .isIn(["Self", "In Family"])
    .withMessage("Applies to must be Self, In Family"),

  // Eye Examination - Right Eye validation
  check("eyeExamination.rightEye.visusCC").trim(),
  check("eyeExamination.rightEye.previousValue")
    .optional()
    .isString()
    .withMessage("Right eye previous value must be a string")
    .trim(),
  check("eyeExamination.rightEye.since")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Right eye since must be a valid date"),
  check("eyeExamination.rightEye.imageCaptureDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Right eye imageCaptureDate must be a valid date"),
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

  // Eye Examination - Left Eye validation
  check("eyeExamination.leftEye.visusCC").trim(),
  check("eyeExamination.leftEye.previousValue")
    .optional()
    .isString()
    .withMessage("Left eye previous value must be a string")
    .trim(),
  check("eyeExamination.leftEye.since")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Left eye since must be a valid date"),
  check("eyeExamination.leftEye.imageCaptureDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Left eye imageCaptureDate must be a valid date"),
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
