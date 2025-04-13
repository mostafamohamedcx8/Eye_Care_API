const { check } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.getExaminationValidator = [
  check("id").isMongoId().withMessage("invalid Examination id format"),
  validatorMiddleware,
];

exports.createExamnationValidator = [
  check("age")
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be between 0 and 120"),

  check("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  check("image").notEmpty().withMessage("image is required"),
  check("imagePosition")
    .notEmpty()
    .withMessage("image position is required")
    .isIn(["Right", "Left"])
    .withMessage("Invalid image position"),
  check("symptoms").optional(),
  check("otherDiseases").optional(),
  validatorMiddleware,
];

exports.deletexaminationValidator = [
  check("id").isMongoId().withMessage("invalid examination id format"),
  validatorMiddleware,
];
