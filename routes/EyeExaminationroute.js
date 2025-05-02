const express = require("express");
const {
  createExamination,
  getExaminations,
  getExamination,
  deleteExamination,
  getMyExaminations,
  getMyExamination,
  deleteMyExamination,
  UploadSingalImage,
  resizeimage,
} = require("../services/EyeExaminationservices");
const { ceateExaminationResults } = require("../services/results");

const {
  createExamnationValidator,
  getExaminationValidator,
  deletexaminationValidator,
} = require("../utils/validation/Examinationvalidation");

const authService = require("../services/authService");

const router = express.Router();
// Test
router.route("/").get(getExaminations);

// ===========================
// 🔹 Logged-in User Routes
// ===========================
router.use(authService.protect); // Protect all routes below

router.get("/getMyExaminations", getMyExaminations);
router.get("/getMyExamination/:id", getMyExamination);
router.delete("/deleteMyExamination/:id", deleteMyExamination);

// ===========================
// 🔹 Admin Routes
// ===========================

router
  .route("/")
  .post(
    UploadSingalImage,
    resizeimage,
    createExamnationValidator,
<<<<<<< HEAD
    createExamination
  );
//   .get(authService.allowedTo("admin"), getExaminations);
=======
    createExamination,
    ceateExaminationResults
  )
  .get(authService.allowedTo("admin"), getExaminations);
>>>>>>> f5a6b9ffd2c4461a60ce751933a07ebbc840d78d
router
  .route("/:id")
  .get(authService.allowedTo("admin"), getExaminationValidator, getExamination)
  .delete(
    authService.allowedTo("admin"),
    deletexaminationValidator,
    deleteExamination
  );

module.exports = router;
