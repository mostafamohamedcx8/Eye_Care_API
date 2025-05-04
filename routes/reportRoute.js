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
} = require("../services/reportService");
const authService = require("../services/authService");
const {
  createReportOfPatientValidator,
  getReportOfPatientValidator,
  getMyReportOfPatientValidator,
  deleteReportOfPatientValidator,
  deleteMyReportOfPatientValidator,
} = require("../utils/validation/reportValidation"); // Validators

router.use(authService.protect);

router
  .route("/")
  .post(
    UploadImages,
    resizeimage,
    createReportOfPatientValidator,
    createReport
  );

router.route("/myreport").get(getMyReports);
router
  .route("/myreport/:id")
  .get(getMyReportOfPatientValidator, getMyReport) // Get a specific patient by ID
  .delete(deleteMyReportOfPatientValidator, deleteMyReport);

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
