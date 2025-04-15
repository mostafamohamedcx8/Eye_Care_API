const express = require("express");
const router = express.Router();
const {
  uploadDoctorPhotos,
  resizeImages,
  createExamination,
} = require("../services/doctor_photos_service"); // Adjust paths as needed
const authService = require("../services/authService");
const {
  uploadDoctorPhotosValidator,
} = require("../utils/validation/doctorPhotosValidator");

// Route to upload doctor photos
router.post(
  "/upload",
  authService.allowedTo("admin"),
  uploadDoctorPhotosValidator,
  uploadDoctorPhotos,
  resizeImages,
  createExamination
);

module.exports = router;
