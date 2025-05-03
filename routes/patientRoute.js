const express = require("express");

const {
  createPatient,
  getPatients,
  getPatient,
  deletePatient,
  getMyPatients,
  getMyPatient,
  updateMypatient,
  deleteMyPatient,
} = require("../services/patientService"); // Adjust path to your patientService

const authService = require("../services/authService"); // Adjust path to your authService

const {
  createPatientValidator,
  getPatientValidator,
  deletePatientValidator,
  updatePatientValidator,
  getMyPatientValidator,
  deleteMyPatientValidator,
} = require("../utils/validation/PatientValidation"); // Adjust path to your PatientValidation

const router = express.Router();

// Routes accessible to authenticated users (opticians)
router.use(authService.protect);

router.get("/mypatients", getMyPatients); // Get all patients for the logged-in optician
router.get("/myPatient/:id", getMyPatientValidator, getMyPatient);
router.put("/myPatient/:id", updatePatientValidator, updateMypatient); // Get a specific patient for the logged-in optician
router.delete(
  "/deleteMyPatient/:id",
  deleteMyPatientValidator,
  deleteMyPatient
); // Delete a specific patient for the logged-in optician

// Routes restricted to opticians
router.use(authService.allowedTo("admin"));

router
  .route("/")
  .post(createPatientValidator, createPatient) // Create a new patient
  .get(getPatients); // Get all patients

router
  .route("/:id")
  .get(getPatientValidator, getPatient) // Get a specific patient by ID
  .delete(deletePatientValidator, deletePatient); // Delete a specific patient by ID
// Update a specific patient by ID

module.exports = router;
