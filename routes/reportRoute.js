const express = require("express");
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  deleteReport,
  getMyReports,
  getMyReport,
  deleteMyReport,
  updateReport,
  uploadReportImages,
} = require("../services/reportService"); // Adjust path to your controller
const authService = require("../services/authService"); // Adjust path
const {
  createReportOfPatientValidator,
  getReportOfPatientValidator,
  getMyReportOfPatientValidator,
  deleteReportOfPatientValidator,
  deleteMyReportOfPatientValidator,
  updateReportOfPatientValidator,
} = require("../utils/validation/reportValidation"); // Validators

// Logging middleware for debugging
const logRequest = (req, res, next) => {
  console.log("Raw headers:", req.headers);
  console.log("Raw body:", req.body);
  next();
};

// Protect all routes
router.use(authService.protect);

// Admin routes (restricted to admin)
router.route("/").get(authService.allowedTo("admin"), getReports);

router
  .route("/:id")
  .get(authService.allowedTo("admin"), getReportOfPatientValidator, getReport)
  .delete(
    authService.allowedTo("admin"),
    deleteReportOfPatientValidator,
    deleteReport
  );

// Optician routes (restricted to optician)
router
  .route("/my-reports")
  .get(authService.allowedTo("optician"), getMyReports);

router
  .route("/my-reports/:id")
  .get(
    authService.allowedTo("optician"),
    getMyReportOfPatientValidator,
    getMyReport
  )
  .delete(
    authService.allowedTo("optician"),
    deleteMyReportOfPatientValidator,
    deleteMyReport
  );

// Report creation and update (restricted to optician, with image upload and validation)
router
  .route("/")
  .post(
    authService.allowedTo("optician"),
    logRequest,
    uploadReportImages,
    createReportOfPatientValidator,
    createReport
  );

router
  .route("/:id")
  .put(
    authService.allowedTo("optician"),
    logRequest,
    uploadReportImages,
    updateReportOfPatientValidator,
    updateReport
  );

module.exports = router;
