// Dependencies
const Patient = require("../models/patientModel"); // Adjust the path to your Patient schema
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");

// ==========================
// 🔹 Create Patient
// ==========================
exports.createPatient = asyncHandler(async (req, res, next) => {
  // Check if the logged-in user is an optician
  if (req.user.role !== "optician") {
    return next(new ApiError("Only opticians can create patients", 403));
  }

  const patientData = {
    ...req.body,
    optician: req.user._id, // Set the optician to the logged-in user
  };

  const patient = await Patient.create(patientData);

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
    .Limitfields()
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

  res.status(204).send(); // Removed redundant deleteOne
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
    optician: req.user._id, // Changed from user to optician to match schema
  });

  const apiFeatures = new ApiFeatures(
    Patient.find({ optician: req.user._id }), // Changed from user to optician
    req.query
  )
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
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
    optician: req.user._id, // Changed from user to optician
  });

  if (!patient) {
    return next(
      new ApiError(
        "No patient found with this ID for the logged-in optician",
        404
      )
    );
  }

  res.status(200).json({ data: patient });
});

exports.deleteMyPatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findByIdAndDelete({
    _id: id,
    optician: req.user._id,
  });

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }

  // Trigger "remove" event when update document
  await patient.deleteOne();
  res.status(204).send();
});

exports.updateMypatient = asyncHandler(async (req, res, next) => {
  // Check if the logged-in user is an optician
  if (req.user.role !== "optician") {
    return next(new ApiError("Only opticians can update patients", 403));
  }

  const { id } = req.params;

  // Find the patient by ID and ensure it belongs to the logged-in optician
  const patient = await Patient.findOne({
    _id: id,
    optician: req.user._id,
  });

  if (!patient) {
    return next(
      new ApiError(
        "No patient found with this ID for the logged-in optician",
        404
      )
    );
  }

  // Update patient with new data
  const updatedPatient = await Patient.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Patient updated successfully",
    data: updatedPatient,
  });
});
