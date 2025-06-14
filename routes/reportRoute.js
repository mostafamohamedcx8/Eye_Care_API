const express = require("express");
const router = express.Router();

const {
  deleteReport,
  getReport,
  getReports,
  createReport,
  getMyReport,
  getMyReports,
  deleteMyReport,
  UploadImages,
  resizeimage,
  createDoctorFeedback,
  markDoctorFeedbackAsRead,
} = require("../services/reportService");
const authService = require("../services/authService");
const {
  createReportOfPatientValidator,
  getReportOfPatientValidator,
  getMyReportOfPatientValidator,
  deleteReportOfPatientValidator,
  deleteMyReportOfPatientValidator,
  eyeExaminationValidation,
} = require("../utils/validation/reportValidation"); // Validators

router.use(authService.protect);

router.route("/myreport").get(getMyReports);
router
  .route("/myreport/:id")
  .get(getMyReportOfPatientValidator, getMyReport) // Get a specific patient by ID
  .delete(
    authService.allowedTo("optician"),
    deleteMyReportOfPatientValidator,
    deleteMyReport
  );
router
  .route("/feedback/:id")
  .put(authService.allowedTo("optician"), markDoctorFeedbackAsRead); // Get a specific patient by ID

router
  .route("/myreport/:id")
  .put(authService.allowedTo("doctor"), createDoctorFeedback);
router
  .route("/:id")
  .post(
    authService.allowedTo("optician"),
    UploadImages,
    resizeimage,
    createReportOfPatientValidator,
    createReport
  );
router.use(authService.allowedTo("admin"));

router
  .route("/")
  .post(UploadImages, resizeimage, createReportOfPatientValidator, createReport)
  .get(getReports);

router
  .route("/:id")
  .get(getReportOfPatientValidator, getReport) // Get a specific patient by ID
  .delete(deleteReportOfPatientValidator, deleteReport);
module.exports = router;
