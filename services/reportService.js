const ReportOfPatient = require("../models/reportModel"); // Adjust path
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const fs = require("fs");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const path = require("path");

// Configure Multer for multiple image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const opticianId = req.body.optician; // Assuming optician ID is in req.body
    const patientId = req.body.patient; // Assuming patient ID is in req.body
    const createdAt = new Date(req.body.createdAt || Date.now());
    const yearMonth = createdAt.toISOString().slice(0, 7); // e.g., 2025-05

    const uploadDir = path.join(
      __dirname,
      "..",
      "upload",
      "optician",
      opticianId,
      "patient",
      patientId,
      yearMonth
    );

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const patientId = req.body.patient; // Assuming patient ID is in req.body
    const eyeType = file.fieldname.includes("rightEye")
      ? "rightEye"
      : "leftEye";
    const dateOfUpload = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${patientId}-${eyeType}-${dateOfUpload}${path.extname(
      file.originalname
    )}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  },
}).any(); // Accept any fields to handle nested field names

// ==========================
// 🔹 Create Report
// ==========================
exports.createReport = asyncHandler(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new ApiError(`Image upload failed: ${err.message}`, 400));
    }

    // Extract image paths from nested field names
    const rightEyeImages = req.files
      .filter((file) => file.fieldname === "eyeExamination.rightEye.images")
      .map((file) => file.path.replace(__dirname + "/..", ""));
    const leftEyeImages = req.files
      .filter((file) => file.fieldname === "eyeExamination.leftEye.images")
      .map((file) => file.path.replace(__dirname + "/..", ""));

    // Validate max count
    if (rightEyeImages.length > 10 || leftEyeImages.length > 10) {
      return next(new ApiError("Maximum 10 images per eye allowed", 400));
    }

    const reportData = {
      ...req.body,
      eyeExamination: {
        ...req.body.eyeExamination,
        rightEye: {
          ...req.body.eyeExamination?.rightEye,
          images: rightEyeImages,
        },
        leftEye: {
          ...req.body.eyeExamination?.leftEye,
          images: leftEyeImages,
        },
      },
    };

    const report = await ReportOfPatient.create(reportData);

    res.status(201).json({
      message: "Report created successfully",
      data: report,
    });
  });
});

// ==========================
// 🔹 Get All Reports (Admin)
// ==========================
exports.getReports = asyncHandler(async (req, res) => {
  const reports = await ReportOfPatient.find()
    .populate("patient")
    .populate("optician");

  res.status(200).json({
    results: reports.length,
    data: reports,
  });
});

// ==========================
// 🔹 Delete Report (Admin)
// ==========================
exports.deleteReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await ReportOfPatient.findByIdAndDelete(id);

  if (!report) {
    return next(new ApiError(`No report for this id ${id}`, 404));
  }

  res.status(204).send();
});

// ==========================
// 🔹 Get Single Report (Admin)
// ==========================
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

// ==========================
// 🔹 Get Logged-in Optician's Reports
// ==========================
exports.getMyReports = asyncHandler(async (req, res) => {
  const reports = await ReportOfPatient.find({
    optician: req.user._id,
  }).populate("patient");

  res.status(200).json({
    results: reports.length,
    data: reports,
  });
});

// ==========================
// 🔹 Get Single Report for Logged-in Optician
// ==========================
exports.getMyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const report = await ReportOfPatient.findOne({
    _id: id,
    optician: req.user._id,
  }).populate("patient");

  if (!report) {
    return next(
      new ApiError(
        "No report found with this ID for the logged-in optician",
        404
      )
    );
  }

  res.status(200).json({ data: report });
});

// ==========================
// 🔹 Delete Report for Logged-in Optician
// ==========================
exports.deleteMyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await ReportOfPatient.findOneAndDelete({
    _id: id,
    optician: req.user._id,
  });

  if (!report) {
    return next(new ApiError(`No report for this id ${id}`, 404));
  }

  res.status(204).send();
});

// ==========================
// 🔹 Update Report
// ==========================
exports.updateReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  upload(req, res, async (err) => {
    if (err) {
      return next(new ApiError(`Image upload failed: ${err.message}`, 400));
    }

    // Extract new image paths if provided
    const rightEyeImages = req.files
      .filter((file) => file.fieldname === "eyeExamination.rightEye.images")
      .map((file) => file.path.replace(__dirname + "/..", ""));
    const leftEyeImages = req.files
      .filter((file) => file.fieldname === "eyeExamination.leftEye.images")
      .map((file) => file.path.replace(__dirname + "/..", ""));

    // Validate max count
    if (rightEyeImages.length > 10 || leftEyeImages.length > 10) {
      return next(new ApiError("Maximum 10 images per eye allowed", 400));
    }

    const reportData = { ...req.body };
    if (rightEyeImages.length > 0) {
      reportData.eyeExamination = {
        ...req.body.eyeExamination,
        rightEye: {
          ...req.body.eyeExamination?.rightEye,
          images: rightEyeImages,
        },
      };
    }
    if (leftEyeImages.length > 0) {
      reportData.eyeExamination = {
        ...req.body.eyeExamination,
        leftEye: {
          ...req.body.eyeExamination?.leftEye,
          images: leftEyeImages,
        },
      };
    }

    const report = await ReportOfPatient.findByIdAndUpdate(id, reportData, {
      new: true,
      runValidators: true,
    });

    if (!report) {
      return next(new ApiError(`No report for this id ${id}`, 404));
    }

    res.status(200).json({
      message: "Report updated successfully",
      data: report,
    });
  });
});

// Export upload middleware for use in routes
exports.uploadReportImages = upload;
