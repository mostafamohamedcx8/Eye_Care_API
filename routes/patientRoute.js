const express = require("express");
const router = express.Router();
const {
  uploadMultipleImages,
  resizeImages,
  createPatient,
  getPatients,
  deletePatient,
  getPatient,
  getMyPatients,
  getMyPatient,
  deleteMyPatient,
  updatePatient,
} = require("../services/patientService");

const {
  createPatientValidator,
  getPatientValidator,
  getMyPatientValidator,
  deletePatientValidator,
  deleteMyPatientValidator,
  updatePatientValidator,
} = require("../utils/validation/patientValidation");
const { protect, allowedTo } = require("../services/authService"); // Assuming you have auth middleware

// Routes
router
  .route("/")
  .post(
    protect,
    allowedTo("admin", "doctor", "optician"),
    uploadMultipleImages,
    createPatientValidator,
    resizeImages,
    createPatient
  )
  .get(protect, allowedTo("admin"), getPatients);

router.route("/my").get(protect, getMyPatients);

router
  .route("/my/:id")
  .get(protect, getMyPatientValidator, getMyPatient)
  .delete(protect, deleteMyPatientValidator, deleteMyPatient);

router
  .route("/:id")
  .get(protect, allowedTo("admin"), getPatientValidator, getPatient)
  .put(
    protect,
    allowedTo("admin", "doctor"),
    uploadMultipleImages,
    updatePatientValidator,
    resizeImages,
    updatePatient
  )
  .delete(protect, allowedTo("admin"), deletePatientValidator, deletePatient);

module.exports = router;
