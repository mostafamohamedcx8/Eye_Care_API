const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/UserModel"); // Adjust path to your User model

// ==========================
// 🔹 Validation Rules
// ==========================
exports.createPatientValidator = [
  // Name validation
  check("firstname")
    .notEmpty()
    .withMessage("firstname is required")
    .isString()
    .withMessage("firstname must be a string")
    .trim(),
  check("lastname")
    .notEmpty()
    .withMessage("lastname is required")
    .isString()
    .withMessage("lastname must be a string")
    .trim(),

  // Gender validation
  check("salutation")
    .notEmpty()
    .withMessage("salutation is required")
    .isIn(["Mr", "Mrs", "Ms", "Mx"])
    .withMessage("salutation must be Mr, Mrs, Ms or Mx"),

  // Ethnicity validation
  check("ethnicity")
    .notEmpty() // Changed to required as per schema
    .withMessage("Ethnicity is required")
    .isString()
    .withMessage("Ethnicity must be a string")
    .trim(),

  // Date of Birth validation
  check("dateOfBirth")
    .notEmpty()
    .withMessage("Date of Birth is required")
    .isISO8601()
    .withMessage("Date of Birth must be a valid date in yyyy-mm-dd format"),

  // Optician validation
  // check("optician")
  //   .notEmpty()
  //   .withMessage("Optician is required")
  //   .isMongoId()
  //   .withMessage("Optician must be a valid MongoDB ObjectId")
  //   .custom(async (opticianId) => {
  //     const user = await User.findById(opticianId);
  //     if (!user) {
  //       throw new Error("User not found");
  //     }
  //     if (user.role !== "optician") {
  //       throw new Error(
  //         "The referenced user must be an optician, not a doctor or admin"
  //       );
  //     }
  //     return true;
  //   }),

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

  // Ethnicity validation
  check("ethnicity")
    .optional()
    .isString()
    .withMessage("Ethnicity must be a string")
    .trim(),

  // Date of Birth validation (optional for update)
  check("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of Birth must be a valid date in yyyy-mm-dd format"),
  // Optician validation (optional for update)
  check("optician")
    .optional()
    .isMongoId()
    .withMessage("Optician must be a valid MongoDB ObjectId")
    .custom(async (opticianId) => {
      if (opticianId) {
        // Only validate if provided
        const user = await User.findById(opticianId);
        if (!user) {
          throw new Error("User not found");
        }
        if (user.role !== "optician") {
          throw new Error(
            "The referenced user must be an optician, not a doctor or admin"
          );
        }
      }
      return true;
    }),

  validatorMiddleware,
];
