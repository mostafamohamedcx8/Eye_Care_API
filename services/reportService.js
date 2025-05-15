const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const ReportOfPatient = require("../models/reportModel");
const { uploadMixOfImages } = require("../middleware/uploadimageMiddleware");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const Patient = require("../models/patientModel");

exports.UploadImages = uploadMixOfImages([
  {
    name: "rightEyeImages",
    maxCount: 8,
  },
  { name: "leftEyeImages", maxCount: 8 },
]);

exports.resizeimage = asyncHandler(async (req, res, next) => {
  // Initialize eyeExamination if not present
  req.body.eyeExamination = req.body.eyeExamination || {};
  req.body.eyeExamination.rightEye = req.body.eyeExamination.rightEye || {};
  req.body.eyeExamination.leftEye = req.body.eyeExamination.leftEye || {};

  if (req.files.rightEyeImages) {
    req.body.eyeExamination.rightEye.images = [];
    await Promise.all(
      req.files.rightEyeImages.map(async (img, index) => {
        const rightImageName = `RightEye-${uuidv4()}-${Date.now()}-${index}.jpeg`;
        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/funds/${rightImageName}`);
        req.body.eyeExamination.rightEye.images.push(rightImageName);
      })
    );
  }

  if (req.files.leftEyeImages) {
    req.body.eyeExamination.leftEye.images = [];
    await Promise.all(
      req.files.leftEyeImages.map(async (img, index) => {
        const leftImageName = `LeftEye-${uuidv4()}-${Date.now()}-${index}.jpeg`;
        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/funds/${leftImageName}`);
        req.body.eyeExamination.leftEye.images.push(leftImageName);
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

// exports.createReport = asyncHandler(async (req, res) => {
//   // Ensure the logged-in user is an optician (اختياري لو حابب تأمين إضافي)
//   if (req.user.role !== "optician") {
//     return res
//       .status(403)
//       .json({ message: "Only opticians can create reports" });
//   }

//   const reportData = {
//     ...req.body,
//     optician: req.user._id, // أربط الريبورت بالأوبتيشن
//   };

//   const report = await ReportOfPatient.create(reportData);
//   res
//     .status(201)
//     .json({ message: "Report created successfully", data: report });
// });
exports.createReport = asyncHandler(async (req, res) => {
  if (req.user.role !== "optician") {
    return res
      .status(403)
      .json({ message: "Only opticians can create reports" });
  }

  const reportData = {
    ...req.body,
    optician: req.user._id,
  };

  // 1. إنشاء الريبورت
  const report = await ReportOfPatient.create(reportData);

  // 2. تحديث المريض بإضافة الريبورت إلى الـ array
  await Patient.findByIdAndUpdate(
    report.patient, // لازم patient ID يكون ضمن بيانات الريبورت
    { $push: { report: report._id } },
    { new: true, useFindAndModify: false }
  );

  res
    .status(201)
    .json({ message: "Report created successfully", data: report });
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
  const userId = req.user._id;
  const role = req.user.role;

  const report = await ReportOfPatient.findById(id)
    .populate("patient")
    .populate("optician");

  if (!report) {
    return next(new ApiError(`No report found for this id ${id}`, 404));
  }

  // تحقق من الصلاحية
  if (
    (role === "optician" &&
      report.optician._id.toString() !== userId.toString()) ||
    (role === "doctor" && !report.patient.doctors.includes(userId.toString()))
  ) {
    return next(
      new ApiError(`You are not authorized to access this report`, 403)
    );
  }

  res.status(200).json({ data: report });
});

// exports.deleteMyReport = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const opticianId = req.user._id;

//   const report = await ReportOfPatient.findOneAndDelete({
//     _id: id,
//     optician: opticianId,
//   });

//   if (!report) {
//     return next(
//       new ApiError(
//         `No report found for this id ${id} or you are not authorized`,
//         404
//       )
//     );
//   }

//   res.status(204).send();
// });

exports.deleteMyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const opticianId = req.user._id;

  // نحاول نلاقي التقرير الأول
  const report = await ReportOfPatient.findOne({
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

  // احذف التقرير
  await ReportOfPatient.deleteOne({ _id: id });

  // شيل الـ report ID من الـ patient
  await Patient.findByIdAndUpdate(report.patient, {
    $pull: { report: id },
  });

  res.status(204).send();
});
