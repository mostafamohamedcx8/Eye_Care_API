const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/UserModel");
const { State, City } = require("country-state-city");
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
  check("dateOfBirth.day")
    .isInt({ min: 1, max: 31 })
    .withMessage("Day must be between 1 and 31"),

  check("dateOfBirth.month")
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

  check("dateOfBirth.year")
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
  check("state")
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
  check("city")
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

  // تحقق من العنوان الكامل
  check("fullAddress")
    .isString()
    .notEmpty()
    .withMessage("Full Address is required"),

  check("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  check("Specialty").custom((value, { req }) => {
    if (req.body.role === "doctor" && (!value || value.trim() === "")) {
      throw new Error("Specialty is required for doctors");
    }
    return true;
  }),

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
