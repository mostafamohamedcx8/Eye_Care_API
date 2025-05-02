const express = require("express");
const {
  createReport,
  getReportById,
  getReportsByUserId,
  updateReport,
  deleteReport,
} = require("../services/reportService");
const {
  createReportValidator,
  updateReportValidator,
} = require("../utils/validation/reportValidation");

const router = express.Router();

router.route("/").post(createReportValidator, createReport);
router
  .route("/:id")
  .get(getReportById)
  .put(updateReportValidator, updateReport)
  .delete(deleteReport);
router.route("/user/:userId").get(getReportsByUserId);

module.exports = router;
