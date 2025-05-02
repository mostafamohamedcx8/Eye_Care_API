const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/UserModel");

exports.createReportValidator = [
  check("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format")
    .custom(async (val) => {
      const user = await User.findById(val);
      if (!user) {
        return Promise.reject(new Error("User not found"));
      }
      return true;
    }),

  check("patientInfo.name")
    .notEmpty()
    .withMessage("Patient name is required")
    .isLength({ min: 2 })
    .withMessage("Patient name must be at least 2 characters"),

  check("patientInfo.id")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isLength({ min: 1 })
    .withMessage("Patient ID cannot be empty"),

  check("patientInfo.gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  check("patientInfo.ethnicity")
    .optional()
    .isString()
    .withMessage("Ethnicity must be a string"),

  check("patientInfo.dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/)
    .withMessage("Date of birth must be in mm/dd/yyyy format"),

  check("patientInfo.dateOfExamination")
    .notEmpty()
    .withMessage("Date of examination is required")
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/)
    .withMessage("Date of examination must be in mm/dd/yyyy format"),

  check("history.medical")
    .optional()
    .isArray()
    .withMessage("Medical history must be an array")
    .custom((value) => {
      if (value) {
        value.forEach((item) => {
          if (!item.name) {
            throw new Error("Medical history item must have a name");
          }
          if (
            item.appliesTo &&
            !["Self", "In Family", null].includes(item.appliesTo)
          ) {
            throw new Error(
              "Medical history appliesTo must be Self, In Family, or null"
            );
          }
        });
      }
      return true;
    }),

  check("history.eye")
    .optional()
    .isArray()
    .withMessage("Eye history must be an array")
    .custom((value) => {
      if (value) {
        value.forEach((item) => {
          if (!item.name) {
            throw new Error("Eye history item must have a name");
          }
          if (
            item.appliesTo &&
            !["Self", "In Family", null].includes(item.appliesTo)
          ) {
            throw new Error(
              "Eye history appliesTo must be Self, In Family, or null"
            );
          }
        });
      }
      return true;
    }),

  check("eyeExamination.rightEye")
    .optional()
    .custom((value) => {
      if (value) {
        if (
          value.since &&
          !/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(
            value.since
          )
        ) {
          throw new Error("Right eye since date must be in mm/dd/yyyy format");
        }
        if (
          value.amslerTestAbnormal !== undefined &&
          typeof value.amslerTestAbnormal !== "boolean"
        ) {
          throw new Error("Right eye Amsler test must be a boolean");
        }
        if (value.images && !Array.isArray(value.images)) {
          throw new Error("Right eye images must be an array");
        }
      }
      return true;
    }),

  check("eyeExamination.leftEye")
    .optional()
    .custom((value) => {
      if (value) {
        if (
          value.since &&
          !/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(
            value.since
          )
        ) {
          throw new Error("Left eye since date must be in mm/dd/yyyy format");
        }
        if (
          value.amslerTestAbnormal !== undefined &&
          typeof value.amslerTestAbnormal !== "boolean"
        ) {
          throw new Error("Left eye Amsler test must be a boolean");
        }
        if (value.images && !Array.isArray(value.images)) {
          throw new Error("Left eye images must be an array");
        }
      }
      return true;
    }),

  check("prediction")
    .optional()
    .isString()
    .withMessage("Prediction must be a string"),

  validatorMiddleware,
];

exports.updateReportValidator = [
  check("userId")
    .optional()
    .isMongoId()
    .withMessage("Invalid User ID format")
    .custom(async (val) => {
      if (val) {
        const user = await User.findById(val);
        if (!user) {
          return Promise.reject(new Error("User not found"));
        }
      }
      return true;
    }),

  check("patientInfo.name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Patient name must be at least 2 characters"),

  check("patientInfo.id")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Patient ID cannot be empty"),

  check("patientInfo.gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  check("patientInfo.ethnicity")
    .optional()
    .isString()
    .withMessage("Ethnicity must be a string"),

  check("patientInfo.dateOfBirth")
    .optional()
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/)
    .withMessage("Date of birth must be in mm/dd/yyyy format"),

  check("patientInfo.dateOfExamination")
    .optional()
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/)
    .withMessage("Date of examination must be in mm/dd/yyyy format"),

  check("history.medical")
    .optional()
    .isArray()
    .withMessage("Medical history must be an array")
    .custom((value) => {
      if (value) {
        value.forEach((item) => {
          if (!item.name) {
            throw new Error("Medical history item must have a name");
          }
          if (
            item.appliesTo &&
            !["Self", "In Family", null].includes(item.appliesTo)
          ) {
            throw new Error(
              "Medical history appliesTo must be Self, In Family, or null"
            );
          }
        });
      }
      return true;
    }),

  check("history.eye")
    .optional()
    .isArray()
    .withMessage("Eye history must be an array")
    .custom((value) => {
      if (value) {
        value.forEach((item) => {
          if (!item.name) {
            throw new Error("Eye history item must have a name");
          }
          if (
            item.appliesTo &&
            !["Self", "In Family", null].includes(item.appliesTo)
          ) {
            throw new Error(
              "Eye history appliesTo must be Self, In Family, or null"
            );
          }
        });
      }
      return true;
    }),

  check("eyeExamination.rightEye")
    .optional()
    .custom((value) => {
      if (value) {
        if (
          value.since &&
          !/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(
            value.since
          )
        ) {
          throw new Error("Right eye since date must be in mm/dd/yyyy format");
        }
        if (
          value.amslerTestAbnormal !== undefined &&
          typeof value.amslerTestAbnormal !== "boolean"
        ) {
          throw new Error("Right eye Amsler test must be a boolean");
        }
        if (value.images && !Array.isArray(value.images)) {
          throw new Error("Right eye images must be an array");
        }
      }
      return true;
    }),

  check("eyeExamination.leftEye")
    .optional()
    .custom((value) => {
      if (value) {
        if (
          value.since &&
          !/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(
            value.since
          )
        ) {
          throw new Error("Left eye since date must be in mm/dd/yyyy format");
        }
        if (
          value.amslerTestAbnormal !== undefined &&
          typeof value.amslerTestAbnormal !== "boolean"
        ) {
          throw new Error("Left eye Amsler test must be a boolean");
        }
        if (value.images && !Array.isArray(value.images)) {
          throw new Error("Left eye images must be an array");
        }
      }
      return true;
    }),

  check("prediction")
    .optional()
    .isString()
    .withMessage("Prediction must be a string"),

  validatorMiddleware,
];
