const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

// ==========================
// 🔹 Validation Rules
// ==========================
exports.createPatientValidator = [
  // Name validation
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .trim(),

  // Gender validation
  check("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  // Ethnicity validation (optional)
  check("ethnicity")
    .optional()
    .isString()
    .withMessage("Ethnicity must be a string")
    .trim(),

  // Date of Birth validation
  check("dateOfBirth")
    .notEmpty()
    .withMessage("Date of Birth is required")
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .withMessage("Date of Birth must be in mm/dd/yyyy format"),

  // Refraction validation
  check("refraction.od")
    .notEmpty()
    .withMessage("Refraction OD is required")
    .isBoolean()
    .withMessage("Refraction OD must be a boolean"),
  check("refraction.os")
    .notEmpty()
    .withMessage("Refraction OS is required")
    .isBoolean()
    .withMessage("Refraction OS must be a boolean"),

  // History validation (optional but validated if provided)
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
    .trim(),
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
    .trim(),
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

  // Eye Examination validation (optional but validated if provided)
  check("eyeExamination.rightEye.visusCC")
    .optional()
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
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .withMessage("Right eye since must be in mm/dd/yyyy format"),
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

  check("eyeExamination.leftEye.visusCC")
    .optional()
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
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .withMessage("Left eye since must be in mm/dd/yyyy format"),
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

exports.getPatientValidator = [
  check("id").isMongoId().withMessage("Invalid Patient ID format"),
  validatorMiddleware,
];

exports.getMyPatientValidator = [
  check("id").isMongoId().withMessage("Invalid Patient ID format"),
  validatorMiddleware,
];

exports.deletePatientValidator = [
  check("id").isMongoId().withMessage("Invalid Patient ID format"),
  validatorMiddleware,
];

exports.deleteMyPatientValidator = [
  check("id").isMongoId().withMessage("Invalid Patient ID format"),
  validatorMiddleware,
];

exports.updatePatientValidator = [
  // Name validation (optional for update)
  check("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim(),

  // Gender validation (optional for update)
  check("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  // Ethnicity validation (optional)
  check("ethnicity")
    .optional()
    .isString()
    .withMessage("Ethnicity must be a string")
    .trim(),

  // Date of Birth validation (optional for update)
  check("dateOfBirth")
    .optional()
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .withMessage("Date of Birth must be in mm/dd/yyyy format"),

  // Refraction validation (optional for update)
  check("refraction.od")
    .optional()
    .isBoolean()
    .withMessage("Refraction OD must be a boolean"),
  check("refraction.os")
    .optional()
    .isBoolean()
    .withMessage("Refraction OS must be a boolean"),

  // History validation (optional but validated if provided)
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
    .trim(),
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
    .trim(),
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

  // Eye Examination validation (optional but validated if provided)
  check("eyeExamination.rightEye.visusCC")
    .optional()
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
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .withMessage("Right eye since must be in mm/dd/yyyy format"),
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

  check("eyeExamination.leftEye.visusCC")
    .optional()
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
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .withMessage("Left eye since must be in mm/dd/yyyy format"),
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

  // EyeSide validation for image uploads
  check("eyeSide")
    .notEmpty()
    .withMessage("eyeSide is required")
    .isIn(["right", "left"])
    .withMessage("eyeSide must be either 'right' or 'left'"),

  validatorMiddleware,
];
