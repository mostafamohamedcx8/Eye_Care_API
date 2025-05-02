const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.uploadDoctorPhotosValidator = [
  // Validation for images
  check("images").custom((value, { req }) => {
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      throw new Error("At least one image is required");
    }
    // Optional: You can add more checks here (e.g., max count or file size checks)

    return true; // If all checks pass
  }),

  // Validation for sheet
  check("sheet").custom((value, { req }) => {
    // Check if 'sheet' file exists (optional)
    if (req.files && req.files.sheet && req.files.sheet.length > 1) {
      throw new Error("Only one sheet file is allowed");
    }
    return true;
  }),

  // Optional: you can validate other fields as needed
  validatorMiddleware,
];
