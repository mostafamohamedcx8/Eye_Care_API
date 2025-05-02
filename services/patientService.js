// Dependencies
const Patient = require("../models/patientModel"); // Adjust the path to your Patient schema
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

// ==========================
// 🔹 Multer Config
// ==========================
const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Not an image! Please upload only images.", 400), false);
  }
};

// Configure multer to accept multiple files for rightEye and leftEye
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadMultipleImages = upload.fields([
  { name: "rightEyeImages", maxCount: 10 }, // Max 10 images per eye
  { name: "leftEyeImages", maxCount: 10 },
]);

// ==========================
// 🔹 Image Resize Middleware
// ==========================
exports.resizeImages = asyncHandler(async (req, res, next) => {
  if (req.files) {
    // Process right eye images
    if (req.files.rightEyeImages) {
      const rightEyeImageFilenames = [];
      for (let file of req.files.rightEyeImages) {
        const filename = `patient-right-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(file.buffer)
          .jpeg({ quality: 99 })
          .toFile(`uploads/${filename}`);
        rightEyeImageFilenames.push(filename);
      }
      // Add filenames to rightEye.images array
      if (!req.body.eyeExamination) {
        req.body.eyeExamination = { rightEye: {}, leftEye: {} };
      }
      if (!req.body.eyeExamination.rightEye.images) {
        req.body.eyeExamination.rightEye.images = [];
      }
      req.body.eyeExamination.rightEye.images = [
        ...req.body.eyeExamination.rightEye.images,
        ...rightEyeImageFilenames,
      ];
    }

    // Process left eye images
    if (req.files.leftEyeImages) {
      const leftEyeImageFilenames = [];
      for (let file of req.files.leftEyeImages) {
        const filename = `patient-left-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(file.buffer)
          .jpeg({ quality: 99 })
          .toFile(`uploads/${filename}`);
        leftEyeImageFilenames.push(filename);
      }
      // Add filenames to leftEye.images array
      if (!req.body.eyeExamination) {
        req.body.eyeExamination = { rightEye: {}, leftEye: {} };
      }
      if (!req.body.eyeExamination.leftEye.images) {
        req.body.eyeExamination.leftEye.images = [];
      }
      req.body.eyeExamination.leftEye.images = [
        ...req.body.eyeExamination.leftEye.images,
        ...leftEyeImageFilenames,
      ];
    }
  }
  next();
});

// ==========================
// 🔹 Create Patient
// ==========================
exports.createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create({
    ...req.body,
    user: req.user._id, // Record the user who created the patient
  });

  res.status(201).json({
    message: "Patient created successfully",
    data: patient,
  });
});

// ==========================
// 🔹 Get All Patients (Admin)
// ==========================
exports.getPatients = asyncHandler(async (req, res) => {
  const countDocuments = await Patient.countDocuments();
  const apiFeatures = new ApiFeatures(Patient.find(), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .limitFields()
    .search();
  const { paginationResults, mongooseQuery } = apiFeatures;
  const patients = await mongooseQuery;

  res.status(200).json({
    results: patients.length,
    paginationResults,
    data: patients,
  });
});

// ==========================
// 🔹 Delete Patient (Admin)
// ==========================
exports.deletePatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findByIdAndDelete(id);

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }

  await patient.deleteOne();
  res.status(204).send();
});

// ==========================
// 🔹 Get Single Patient (Admin)
// ==========================
exports.getPatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findById(id);

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }
  res.status(200).json({ data: patient });
});

// ==========================
// 🔹 Get Logged-in User's Patients
// ==========================
exports.getMyPatients = asyncHandler(async (req, res) => {
  const countDocuments = await Patient.countDocuments({
    user: req.user._id,
  });

  const apiFeatures = new ApiFeatures(
    Patient.find({ user: req.user._id }),
    req.query
  )
    .filter()
    .paginate(countDocuments)
    .sort()
    .limitFields()
    .search();

  const { paginationResults, mongooseQuery } = apiFeatures;
  const myPatients = await mongooseQuery;

  res.status(200).json({
    results: myPatients.length,
    paginationResults,
    data: myPatients,
  });
});

// ==========================
// 🔹 Get Single Patient for Logged-in User
// ==========================
exports.getMyPatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!patient) {
    return next(
      new ApiError("No patient found with this ID for the logged-in user", 404)
    );
  }

  res.status(200).json({ data: patient });
});

// ==========================
// 🔹 Delete Patient for Logged-in User
// ==========================
exports.deleteMyPatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }

  await patient.deleteOne();
  res.status(204).send();
});

// ==========================
// 🔹 Update Patient
// ==========================
exports.updatePatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }

  res.status(200).json({
    message: "Patient updated successfully",
    data: patient,
  });
});
