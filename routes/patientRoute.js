const express = require("express");

const {
  createPatient,
  getPatients,
  getPatient,
  deletePatient,
  getMyPatients,
  getMyPatient,
  getMyPatientWithReports,
  updateMypatient,
  sendPatientToDoctor,
  deleteMyPatient,
  getArchivedPatients,
  toggleArchivePatient,
  getAllPatientReportStatsByDoctor,
} = require("../services/patientService");

const authService = require("../services/authService"); // Adjust path to your authService

const {
  createPatientValidator,
  getPatientValidator,
  deletePatientValidator,
  updatePatientValidator,
  getMyPatientValidator,
  deleteMyPatientValidator,
} = require("../utils/validation/PatientValidation");
// Adjust path to your PatientValidation

const router = express.Router();

// Routes accessible to authenticated users (opticians)
router.use(authService.protect);

router
  .route("/")
  .post(
    authService.allowedTo("optician"),
    createPatientValidator,
    createPatient
  );
router.route("/ReportStats").get(
  authService.allowedTo("doctor"),

  getAllPatientReportStatsByDoctor
);
router
  .route("/send")
  .post(authService.allowedTo("optician"), sendPatientToDoctor);

router.route("/mypatients").get(getMyPatients); // Get all patients for the logged-in optician
router.route("/myArchivepatients").get(getArchivedPatients); // Get all patients for the logged-in optician

router.route("/myPatient/:id").get(getMyPatientValidator, getMyPatient);
router.route("/myPatient/:id").put(toggleArchivePatient);
router.get(
  "/myPatientwithreport/:id",
  getMyPatientValidator,
  getMyPatientWithReports
);
// router.put("/myPatient/:id", updatePatientValidator, updateMypatient); // Get a specific patient for the logged-in optician
router
  .route("/deleteMyPatient/:id")
  .delete(
    authService.allowedTo("optician"),
    deleteMyPatientValidator,
    deleteMyPatient
  ); // Delete a specific patient for the logged-in optician

// Routes restricted to opticians
router.use(authService.allowedTo("admin"));
router.route("/").get(getPatients);
// Get all patients

router
  .route("/:id")
  .get(getPatientValidator, getPatient) // Get a specific patient by ID
  .delete(deletePatientValidator, deletePatient); // Delete a specific patient by ID
// Update a specific patient by ID

module.exports = router;
