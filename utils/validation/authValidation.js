const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/UserModel");

exports.SignupValidator = [
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
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),

  check("age")
    .notEmpty()
    .withMessage("Age Required")
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
        throw new Error("password must same paswordConfirm");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.LoginValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email address"),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ minn: 6 })
    .withMessage("password must be at least 6 characters"),

  validatorMiddleware,
];
