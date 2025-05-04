const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const ReportOfPatient = require("../models/reportModel");
const multer = require("multer");
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

exports.UploadImages = upload.fields([
  { name: "rightEyeImages", maxCount: 5 },
  { name: "leftEyeImages", maxCount: 5 },
]);

exports.resizeimage = asyncHandler(async (req, res, next) => {
  req.body.eyeExamination = req.body.eyeExamination || {};

  // Process right eye images
  if (req.files.rightEyeImages) {
    req.body.eyeExamination.rightEye = req.body.eyeExamination.rightEye || {};
    req.body.eyeExamination.rightEye.images = [];

    await Promise.all(
      req.files.rightEyeImages.map(async (img, index) => {
        const imageName = `rightEye-${uuidv4()}-${Date.now()}-${index}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1335)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/funds/${imageName}`);

        req.body.eyeExamination.rightEye.images.push(imageName);
      })
    );
  }

  // Process left eye images
  if (req.files.leftEyeImages) {
    req.body.eyeExamination.leftEye = req.body.eyeExamination.leftEye || {};
    req.body.eyeExamination.leftEye.images = [];

    await Promise.all(
      req.files.leftEyeImages.map(async (img, index) => {
        const imageName = `leftEye-${uuidv4()}-${Date.now()}-${index}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1335)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/funds/${imageName}`);

        req.body.eyeExamination.leftEye.images.push(imageName);
      })
    );
  }

  next();
});

exports.deleteReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await ReportOfPatient.findByIdAndDelete(id);

  if (!report) {
    return next(new ApiError(`No report for this id ${id}`, 404));
  }

  res.status(204).send();
});

exports.updateReport = asyncHandler(async (req, res, next) => {
  const report = await ReportOfPatient.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  if (!report) {
    return next(new ApiError(`No report for this id ${req.params.id}`, 404));
  }

  await report.save();
  res.status(200).json({ data: report });
});

exports.createReport = asyncHandler(async (req, res) => {
  const report = await ReportOfPatient.create(req.body);
  res.status(201).json({ data: report });
});

exports.getReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await ReportOfPatient.findById(id)
    .populate("patient")
    .populate("optician");

  if (!report) {
    return next(new ApiError(`No report for this id ${id}`, 404));
  }

  res.status(200).json({ data: report });
});

exports.getReports = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }

  const countDocuments = await ReportOfPatient.countDocuments(filter); // use filtered count

  const apiFeatures = new ApiFeatures(ReportOfPatient.find(filter), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search("ReportOfPatient"); // Ensure this targets searchable fields

  const { paginationResults, mongooseQuery } = apiFeatures;

  const reports = await mongooseQuery
    .populate("patient") // Include related patient
    .populate("optician"); // Include related optician

  res.status(200).json({
    results: reports.length,
    paginationResults,
    data: reports,
  });
});

exports.getMyReports = asyncHandler(async (req, res) => {
  const opticianId = req.user._id;
  const filter = { optician: opticianId };

  const countDocuments = await ReportOfPatient.countDocuments(filter);

  const apiFeatures = new ApiFeatures(ReportOfPatient.find(filter), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search("ReportOfPatient");

  const { paginationResults, mongooseQuery } = apiFeatures;

  const reports = await mongooseQuery.populate("patient").populate("optician");

  res.status(200).json({
    results: reports.length,
    paginationResults,
    data: reports,
  });
});

exports.getMyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const opticianId = req.user._id;

  const report = await ReportOfPatient.findOne({
    _id: id,
    optician: opticianId,
  })
    .populate("patient")
    .populate("optician");

  if (!report) {
    return next(
      new ApiError(
        `No report found for this id ${id} or you are not authorized`,
        404
      )
    );
  }

  res.status(200).json({ data: report });
});

exports.deleteMyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const opticianId = req.user._id;

  const report = await ReportOfPatient.findOneAndDelete({
    _id: id,
    optician: opticianId,
  });

  if (!report) {
    return next(
      new ApiError(
        `No report found for this id ${id} or you are not authorized`,
        404
      )
    );
  }

  res.status(204).send();
});
