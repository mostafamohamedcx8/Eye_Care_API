const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const createToken = require("../utils/CreateToken");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendemail");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public

const multerstorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({ storage: multerstorage, fileFilter: multerFilter });

exports.UploadSingalImage = upload.single("imagemedicallicense");

exports.resizeimage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 99 })
      .toFile(`uploads/Image_Medical_License/${filename}`);

    req.body.imagemedicallicense = filename;
  }
  next();
});

exports.signup = asyncHandler(async (req, res, next) => {
  // 1- Create User
  const dateOfBirth = {
    day: parseInt(req.body["dateOfBirth.day"]),
    month: req.body["dateOfBirth.month"],
    year: parseInt(req.body["dateOfBirth.year"]),
  };
  const user = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    salutation: req.body.salutation,
    dateOfBirth,
    state: req.body.state,
    city: req.body.city,
    fullAddress: req.body.fullAddress,
    postalCode: req.body.postalCode,
    imagemedicallicense: req.body.imagemedicallicense,
    Specialty: req.body.Specialty,
    role: req.body.role,
  });

  // 2- Generate token for email verification
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash the token before saving it to the DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Optional: Store token if you want to compare later or expire
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // Optional: 10 mins expiry
  user.emailVerified = false;

  await user.save();

  // 3- Send verification email with link
  const verificationUrl = `http://localhost:3000/verify-email?token=${rawToken}`;
  const message = `Hi ${user.firstname} ${user.lastname},

Welcome to Eye-Care!

Please click the link below to verify your email:
${verificationUrl}

If you did not sign up, please ignore this email.

Thanks,
Eye-Care Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification - Eye-Care",
      message,
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerified = undefined;
    await user.save();

    return next(new ApiError("Failed to send verification email", 500));
  }

  // 4- Response
  res.status(201).json({
    status: "success",
    message:
      "Account created. Please check your email for the verification link.",
    data: {
      userId: user._id,
      email: user.email,
    },
  });
});

exports.verifyEmailCode = asyncHandler(async (req, res, next) => {
  const rawToken = req.body.token;

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  let user = await User.findOne({
    emailVerificationToken: hashedToken,
  });

  if (!user) {
    return next(new ApiError("Invalid verification LInk", 400));
  }

  // Check if the code is expired
  if (user.emailVerificationExpires < Date.now()) {
    // Generate a new code
    const newRawToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving it to the DB
    const newHashedToken = crypto
      .createHash("sha256")
      .update(newRawToken)
      .digest("hex");

    const verificationUrl = `http://localhost:3000/verify-email?token=${newRawToken}`;
    user.emailVerificationToken = newHashedToken;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const message = `Hi ${user.firstname} ${user.lastname},\n\nYour previous verification link has expired.\n\nHere is your new verification code: ${verificationUrl}\n\nPlease enter this new code to verify your account.\n\nThanks,\nEye-Care Team`;

    try {
      await sendEmail({
        email: user.email,
        subject: "New Email Verification Link - Eye-Care",
        message,
      });
    } catch (err) {
      return next(new ApiError("Failed to send new verification Link", 500));
    }

    return res.status(400).json({
      status: "fail",
      message:
        "This verification Link has expired. We have sent a new Link to your email.",
    });
  }

  // Code is valid → verify user
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
  });
});

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public

// exports.login = asyncHandler(async (req, res, next) => {
//   // 1- Find User
//   const user = await User.findOne({
//     email: req.body.email,
//     role: req.body.role,
//   });
//   if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
//     return next(new ApiError("Invalid email or password or role", 401));
//   }

//   // 2- Check if email is verified
//   if (!user.emailVerified) {
//     // Generate a new verification code
//     const NewrawToken = crypto.randomBytes(32).toString("hex");

//     // Hash the token before saving it to the DB
//     const NewhashedToken = crypto
//       .createHash("sha256")
//       .update(NewrawToken)
//       .digest("hex");

//     // Update user with new verification code and expiration
//     const verificationUrl = `http://75.119.150.159:3000/verify-email?token=${NewrawToken}`;
//     user.emailVerificationToken = NewhashedToken;
//     user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 mins

//     await user.save();

//     // Send verification email
//     const message = `Hi ${user.firstname} ${user.lastname},\n\nYou need to verify your email to log in.\n\nHere is your verification Link: ${verificationUrl}\n\nPlease enter this code to verify your account.\n\nThanks,\nEye-Care Team`;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: "Email Verification Required - Eye-Care",
//         message,
//       });
//     } catch (err) {
//       return next(new ApiError("Failed to send verification email", 500));
//     }

//     return res.status(403).json({
//       status: "fail",
//       message:
//         "Your email is not verified. We have sent a new verification Link to your email.",
//     });
//   }

//   // 3- Create token if email is verified
//   const token = createToken(user._id);

//   // 4- Send response
//   res.status(200).json({
//     status: "success",
//     data: user,
//     token,
//   });
// });

exports.login = asyncHandler(async (req, res, next) => {
  // 1- Find User
  const user = await User.findOne({
    email: req.body.email,
    role: req.body.role,
  });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Invalid email or password or role", 401));
  }

  // 2- Check if email is verified
  if (!user.emailVerified) {
    const NewrawToken = crypto.randomBytes(32).toString("hex");
    const NewhashedToken = crypto
      .createHash("sha256")
      .update(NewrawToken)
      .digest("hex");

    const verificationUrl = `http://75.119.150.159:3000/verify-email?token=${NewrawToken}`;
    user.emailVerificationToken = NewhashedToken;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const message = `Hi ${user.firstname} ${user.lastname},\n\nYou need to verify your email to log in.\n\nHere is your verification Link: ${verificationUrl}\n\nThanks,\nEye-Care Team`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification Required - Eye-Care",
        message,
      });
    } catch (err) {
      return next(new ApiError("Failed to send verification email", 500));
    }

    return res.status(403).json({
      status: "fail",
      message:
        "Your email is not verified. We have sent a new verification link to your email.",
    });
  }

  // ✅ 3- Check if license is verified
  if (!user.licenseVerified) {
    return res.status(403).json({
      status: "fail",
      message:
        "Your medical license is still under review. You will be notified by email once it's verified.",
    });
  }

  // 4- Create token if both email and license are verified
  const token = createToken(user._id);

  // 5- Send response
  res.status(200).json({
    status: "success",
    data: user,
    token,
  });
});

// make sure that user is loggin
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exist and if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("You are not logged in", 401));
  }
  //2- verify token (no change happen, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3- check if user still exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError("User no longer exist", 401));
  }
  // 4- check if user changed his password after token created
  if (currentUser.passwordchangedAt) {
    const passchangedTimeStamp = parseInt(
      currentUser.passwordchangedAt.getTime / 1000,
      10
    );
    if (passchangedTimeStamp > decoded.iat) {
      return next(
        new ApiError("User recently changed password, PLZ login Again", 401)
      );
    }
  }
  req.user = currentUser;
  next();
});

// Authorization {User Permission}
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not authorized to perform this action", 403)
      );
    }
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgetpassword = asyncHandler(async (req, res, next) => {
  // 1) get User by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("No user found with this email", 404));
  }
  // 2) generate reset code 6 digit
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // save hashedResetCode into DB
  user.passwordResetCode = hashedResetCode;
  // add expiration time for ResetCode 10 min
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${
    user.firstname + " " + user.lastname
  },\nWe received a request to reset the password for your Eye-Care account.\n${resetCode}\nEnter this code to complete the reset.\nThanks`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password Eye-Care",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("Failed to send email", 500));
  }

  res.status(200).json({
    status: "ok",
    message: "Check your email for further instructions",
  });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifypassResetCode = asyncHandler(async (req, res, next) => {
  // 1)get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Invalid or expired reset code", 400));
  }
  // 2)reset code valid
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({
    status: "ok",
    message: "Reset code verified successfully",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetpassword = asyncHandler(async (req, res, next) => {
  // 1) get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("No user found with this email", 404));
  }
  // 2)check if resetcode verifyed
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code is not verified", 400));
  }
  // 3) update password
  user.password = req.body.newpassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = false;

  await user.save();

  // 4)if everything ok generate new token
  const token = createToken(user._id);
  res.status(200).json({
    status: "ok",
    message: "Password reset successfully",
    token,
  });
});
