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

router.use(authService.protect);
router.post(
  "/upload",
  (req, res, next) => {
    console.log("Raw headers:", req.headers);
    console.log("Raw body:", req.body);
    next();
  },
  authService.allowedTo("admin"),
  uploadDoctorPhotos,
  resizeImages,
  uploadDoctorPhotosValidator,
  createExamination
);

module.exports = router;
