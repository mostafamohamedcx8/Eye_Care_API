const express = require("express");
const {
  signup,
  login,
  forgetpassword,
  verifypassResetCode,
  resetpassword,
} = require("../services/authService");
const {
  SignupValidator,
  LoginValidator,
} = require("../utils/validation/authValidation");

const router = express.Router();

router.route("/signup").post(SignupValidator, signup);
router.route("/login").post(LoginValidator, login);
router.route("/forgetpassword").post(forgetpassword);
router.route("/verifyresetcode").post(verifypassResetCode);
router.route("/resetpassword").put(resetpassword);

module.exports = router;
