const { check, body } = require("express-validator");
const User = require("../../models/UserModel");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const bcrypt = require("bcrypt");
const { State, City } = require("country-state-city");

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

  body("dateOfBirth.day")
    .isInt({ min: 1, max: 31 })
    .withMessage("Day must be between 1 and 31"),

  body("dateOfBirth.month")
    .isString()
    .notEmpty()
    .withMessage("Month is required")
    .isIn([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ])
    .withMessage(
      "Month must be a valid month name (e.g., January, February, etc.)"
    ),

  body("dateOfBirth.year")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear()}`),

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

  body("state")
    .isString()
    .notEmpty()
    .withMessage("State is required")
    .custom((state) => {
      const states = State.getStatesOfCountry("DE"); // DE = Germany
      const matchedState = states.find((s) => s.name === state);
      if (!matchedState) {
        throw new Error("Invalid state: not found in Germany");
      }
      return true;
    }),

  // ✅ التحقق من المدينة تبع الولاية
  body("city")
    .isString()
    .notEmpty()
    .withMessage("City is required")
    .custom((city, { req }) => {
      const states = State.getStatesOfCountry("DE");
      const matchedState = states.find((s) => s.name === req.body.state);
      if (!matchedState) {
        throw new Error("State must be valid before validating city");
      }

      const cities = City.getCitiesOfState("DE", matchedState.isoCode);
      const matchedCity = cities.find((c) => c.name === city);
      if (!matchedCity) {
        throw new Error("City is not valid for the selected state");
      }

      return true;
    }),

  body("fullAddress")
    .isString()
    .notEmpty()
    .withMessage("Full Address is required"),
  check("Specialty").custom((value, { req }) => {
    if (req.body.role === "doctor" && (!value || value.trim() === "")) {
      throw new Error("Specialty is required for doctors");
    }
    return true;
  }),

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

  check("Specialty").custom((value, { req }) => {
    if (req.body.role === "doctor" && (!value || value.trim() === "")) {
      throw new Error("Specialty is required for doctors");
    }
    return true;
  }),
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
  check("firstname")
    .optional()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  check("lastname")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user && user._id.toString() !== req.user._id.toString()) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  check("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  check("imageProfile")
    .optional()
    .isString()
    .withMessage("Image profile must be a string"),

  check("state").optional().isString().withMessage("State must be a string"),

  check("city").optional().isString().withMessage("City must be a string"),

  check("fullAddress")
    .optional()
    .isString()
    .withMessage("Full address must be a string"),

  validatorMiddleware,
];
