// Dependencies
const EyeExaminationModel = require("../models/EyeExaminationmodel.js");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

// ==========================
// 🔹 Multer Config
// ==========================
const multerstorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({ storage: multerstorage, fileFilter: multerFilter });
exports.UploadSingalImage = upload.single("image");

// ==========================
// 🔹 Image Resize Middleware
// ==========================
exports.resizeimage = asyncHandler(async (req, res, next) => {
  const filename = `examination-${uuidv4()}-${Date.now()}.jpeg`;
  // console.log("filename" + filename);
  if (req.file) {
    await sharp(req.file.buffer)
      .jpeg({ quality: 99 })
      .toFile(`uploads/${filename}`);

    req.body.image = `${filename}`;
  }
  next();
});

// ==========================
// 🔹 Create Examination
// ==========================
exports.createExamination = asyncHandler(async (req, res, next) => {
  console.log(req.body.image);
  const EyeExamination = await EyeExaminationModel.create({
    ...req.body,
    user: req.user._id, // هنا بنسجل الـ user اللي عمل الفحص
  });
  req.params.examId = EyeExamination._id;
  console.log(req.params.examId);
  // console.log("req.params" + req.params);
  // console.log("req.params" + req.user);
  res.status(201).json({
    message: "Image examination created successfully",
    data: EyeExamination,
  });
  // next();
});

// ==========================
// 🔹 Get All Examinations (Admin)
// ==========================
exports.getExaminations = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await EyeExaminationModel.countDocuments();
  const apifeatures = new ApiFeatures(EyeExaminationModel.find(), req.query)
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

// ==========================
// 🔹 Delete Examination (Admin)
// ==========================
exports.deleteExamination = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Examination = await EyeExaminationModel.findByIdAndDelete(id);

  if (!Examination) {
    return next(new ApiError(`No Examination for this id ${id}`, 404));
  }

  // Trigger "remove" event when update document
  await Examination.deleteOne();
  res.status(204).send();
});

// ==========================
// 🔹 Get Single Examination (Admin)
// ==========================
exports.getExamination = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let query = EyeExaminationModel.findById(id);

  const Examination = await query;
  if (!Examination) {
    return next(new ApiError(`No Examination for this id ${id}`, 404));
  }
  res.status(200).json({ data: Examination });
});

// ==========================
// 🔹 Get Logged-in User's Examinations
// ==========================
exports.getMyExaminations = asyncHandler(async (req, res) => {
  const countDocuments = await EyeExaminationModel.countDocuments({
    user: req.user._id,
  });

  const apifeatures = new ApiFeatures(
    EyeExaminationModel.find({ user: req.user._id }),
    req.query
  )
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();

  const { paginationresults, mongooseQuery } = apifeatures;
  const myExaminations = await mongooseQuery;

  res.status(200).json({
    results: myExaminations.length,
    paginationresults,
    data: myExaminations,
  });
});

// ==========================
// 🔹 Get Single Examination for Logged-in User
// ==========================
exports.getMyExamination = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // البحث عن الفحص مع التأكد إن الـ user هو اللي عمله
  const Examination = await EyeExaminationModel.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!Examination) {
    return next(
      new ApiError(
        `No Examination found with this ID for the logged-in user`,
        404
      )
    );
  }

  res.status(200).json({ data: Examination });
});

// ==========================
// 🔹 Delete Examination for Logged-in User
// ==========================
exports.deleteMyExamination = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Examination = await EyeExaminationModel.findByIdAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!Examination) {
    return next(new ApiError(`No Examination for this id ${id}`, 404));
  }

  // Trigger "remove" event when update document
  await Examination.deleteOne();
  res.status(204).send();
});
