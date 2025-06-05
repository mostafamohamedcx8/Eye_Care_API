const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const createToken = require("../utils/CreateToken");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const Patient = require("../models/patientModel");
const sendEmail = require("../utils/sendemail");

const multerstorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({ storage: multerstorage, fileFilter: multerFilter });

exports.UploadSingalImage = upload.single("imageProfile");

exports.resizeimage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 99 })
      .toFile(`uploads/profile/${filename}`);

    req.body.imageProfile = filename;
  }
  next();
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ data: user });
});

exports.licenseVerified = async (req, res) => {
  const { userId } = req.body;

  try {
    // 1. البحث عن المستخدم
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. تعديل حالة الرخصة
    user.licenseVerified = true;
    await user.save();

    // 3. إرسال الإيميل
    const message = `
Dear ${user.firstname} ${user.lastname},

We are pleased to inform you that your license has been successfully reviewed and verified by the Eye-Care team.

You can now log in and start using all the features of our platform.

Thanks,  
Eye-Care Team`;

    await sendEmail({
      email: user.email,
      subject: "License Verified - Eye-Care",
      message,
    });

    res
      .status(200)
      .json({ message: "License verified and email sent successfully." });
  } catch (error) {
    console.error("Error verifying license:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsers = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await User.countDocuments();
  const apifeatures = new ApiFeatures(User.find(), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();
  // excute query
  const { paginationresults, mongooseQuery } = apifeatures;
  const Documents = await mongooseQuery;
  res
    .status(200)
    .json({ results: Documents.length, paginationresults, data: Documents });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new ApiError(`No User for this id ${id}`, 404));
  }

  // Trigger "remove" event when update document
  await user.deleteOne();
  res.status(204).send();
});

exports.getNewUsers = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await User.countDocuments({ licenseVerified: false });

  const apifeatures = new ApiFeatures(
    User.find({ licenseVerified: false }),
    req.query
  )
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();

  // execute query
  const { paginationresults, mongooseQuery } = apifeatures;
  const Documents = await mongooseQuery;

  res.status(200).json({
    results: Documents.length,
    paginationresults,
    data: Documents,
  });
});
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let query = User.findById(id);

  const user = await query;
  if (!user) {
    return next(new ApiError(`No User for this id ${id}`, 404));
  }
  res.status(200).json({ data: user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const Document = await User.findByIdAndUpdate(
    req.params.id,
    {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      gender: req.body.gender,
      age: req.body.age,
      imageProfile: req.body.imageProfile,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!Document) {
    return next(new ApiError(`No User for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: Document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new ApiError("Password is required", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const Document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: hashedPassword,
      passwordchangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!Document) {
    return next(new ApiError(`No Document for this id ${req.params.id}`, 404));
  }

  res.status(200).json({ data: Document });
});

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect

exports.UpdateUserLoggedPassword = asyncHandler(async (req, res, next) => {
  // 1)update user password based on user payload(req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordchangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2)generate token
  const token = createToken(user._id);
  // 2) return updated user
  res.status(200).json({ data: user, token });
});
// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.UpdateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateduser = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      imageProfile: req.body.imageProfile,
      state: req.body.state,
      city: req.body.city,
      fullAddress: req.body.fullAddress,
    },
    { new: true }
  );
  res.status(200).json({ data: updateduser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deletUserLoggedData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).send();
});

exports.getDoctors = asyncHandler(async (req, res) => {
  // Get count of all doctors
  const countDocuments = await User.countDocuments({ role: "doctor" });

  // Apply filters, search, pagination, etc., but only for doctors
  const apifeatures = new ApiFeatures(User.find({ role: "doctor" }), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();

  const { paginationresults, mongooseQuery } = apifeatures;
  const doctors = await mongooseQuery;

  res.status(200).json({
    results: doctors.length,
    paginationresults,
    data: doctors,
  });
});

exports.getOpticians = asyncHandler(async (req, res) => {
  // Get count of all doctors
  const countDocuments = await User.countDocuments({ role: "optician" });

  // Apply filters, search, pagination, etc., but only for doctors
  const apifeatures = new ApiFeatures(
    User.find({ role: "optician" }),
    req.query
  )
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();

  const { paginationresults, mongooseQuery } = apifeatures;
  const opticians = await mongooseQuery;

  res.status(200).json({
    results: opticians.length,
    paginationresults,
    data: opticians,
  });
});

exports.getDoctorById = asyncHandler(async (req, res, next) => {
  const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  res.status(200).json({
    data: doctor,
  });
});

exports.deleteDoctorById = asyncHandler(async (req, res, next) => {
  const doctorId = req.params.id;

  // 1. تأكد إن الدكتور موجود
  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }
  // 2. امسح الدكتور من مصفوفة doctors في كل المرضى
  await Patient.updateMany(
    { doctors: doctorId },
    { $pull: { doctors: doctorId } }
  );
  // 3. امسح الدكتور نفسه
  await User.deleteOne({ _id: doctorId });

  res.status(204).send();
});

exports.deleteOpticianById = asyncHandler(async (req, res, next) => {
  const opticianId = req.params.id;

  // 1. اتأكد إن الـ optician موجود
  const optician = await User.findOne({ _id: opticianId, role: "optician" });

  if (!optician) {
    return res.status(404).json({ message: "Optician not found" });
  }

  // 2. امسح كل المرضى اللي اتسجلوا بواسطة الـ optician ده
  await Patient.deleteMany({ optician: opticianId });

  // 3. امسح الـ optician نفسه
  await User.deleteOne({ _id: opticianId });

  res.status(204).send();
});

exports.updateOpticianRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { newRole, Specialty } = req.body;

  // 1. اتأكد إن الدور الجديد من القيم المسموحة
  const allowedRoles = ["admin", "doctor"];
  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({
      message: "Invalid role. Role must be either 'admin' or 'doctor'.",
    });
  }

  // 2. هات اليوزر واتأكد إنه أوبتيشن
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role !== "optician") {
    return res.status(400).json({
      message:
        "Only users with the role 'optician' can have their role updated.",
    });
  }

  // 3. لو هيتحول لدكتور، لازم يدخل التخصص
  if (newRole === "doctor" && (!Specialty || Specialty.trim() === "")) {
    return res.status(400).json({
      message: "Specialty is required when updating role to 'doctor'.",
    });
  }

  // 4. عدل البيانات
  user.role = newRole;
  if (newRole === "doctor") {
    user.Specialty = Specialty;
  } else {
    user.Specialty = undefined; // امسحها لو اتحول لأدمن
  }

  await user.save();

  res.status(200).json({
    message: `User role updated to '${newRole}' successfully.`,
    data: user,
  });
});
