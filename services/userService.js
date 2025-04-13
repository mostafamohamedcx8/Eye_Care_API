const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const createToken = require("../utils/CreateToken");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

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
  const User = await User.create(req.body);
  res.status(201).json({ data: User });
});

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
      age: req.body.age,
      gender: req.body.gender,
      imageProfile: req.body.imageProfile,
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
