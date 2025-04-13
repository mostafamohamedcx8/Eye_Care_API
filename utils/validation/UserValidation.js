const { check, body } = require("express-validator");
const User = require("../../models/UserModel");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const bcrypt = require("bcrypt");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("firstname")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  check("lastname")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),

  check("age")
    .notEmpty()
    .withMessage("Age is required")
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be between 0 and 120"),

  check("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password and passwordConfirm do not match");
      }
      return true;
    }),

  check("role")
    .optional()
    .isIn(["doctor", "optician", "admin"])
    .withMessage("Invalid role value"),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID format"),
  validatorMiddleware,
];

exports.UpdateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID format"),

  check("firstname")
    .optional()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  check("lastname")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),

  check("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  check("role")
    .optional()
    .isIn(["doctor", "optician", "admin"])
    .withMessage("Invalid role value"),

  validatorMiddleware,
];

exports.changeUserpasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User ID format"),

  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter currentPassword"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter passwordConfirm"),

  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("No user found for this ID");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCorrectPassword) {
        throw new Error("Current password is incorrect");
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error("Password and passwordConfirm do not match");
      }

      return true;
    }),

  validatorMiddleware,
];

exports.updateUserLoggedValidator = [
  check("firstname").optional(),

  check("lastname").optional(),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),

  check("imageProfile").optional(),

  check("age")
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be between 0 and 120"),

  check("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  validatorMiddleware,
];
