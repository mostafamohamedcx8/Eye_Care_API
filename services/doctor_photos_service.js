const DoctorPhotosModel = require("../models/doctorPhotosModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// ==========================
// 🔹 Multer Configuration
// ==========================
const multerStorage = multer.memoryStorage(); // Store files in memory


const multerFilter = (req, file, cb) => {
  console.log(`Processing file: ${file.fieldname} - ${file.originalname}`);

  // Allow ONLY images for the 'images' field
  if (file.fieldname === "images" && !file.mimetype.startsWith("image")) {
    return cb(
      new ApiError("Only images are allowed for the 'images' field.", 400),
      false
    );
  }

  // Allow CSV/Excel for the 'sheet' field
  if (file.fieldname === "sheet") {
    const allowedMimetypes = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];

    if (!allowedMimetypes.includes(file.mimetype)) {
      return cb(
        new ApiError(
          "Only CSV or Excel files are allowed for the 'sheet' field.",
          400
        ),
        false
      );
    }
  }

  cb(null, true);
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 1000 * 1024 * 1024, // Max file size: 1000MB
  },
});

// ==========================
// 🔹 Upload Doctor Photos (multiple images and sheet)
// ==========================
exports.uploadDoctorPhotos = upload.fields([
  { name: "images" }, 
  { name: "sheet", maxCount: 1 },
]);

// ==========================
// 🔹 Image Resize Middleware
// ==========================
exports.resizeImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  console.log(req.user.firstname);
  const userName = (req.user.firstname + req.user.lastname).replace(/\s+/g, ""); // Sanitize username
  let folderName = userName;
  let folderPath = path.join(__dirname, "..", "uploads", folderName);

  // Check if folder exists, append UUID if it does
  if (fs.existsSync(folderPath)) {
    folderName = `${userName}-${uuidv4().split("-")[0]}`;
    folderPath = path.join(__dirname, "..", "uploads", folderName);
  }

  // Create folder if it doesn't exist
  fs.mkdirSync(folderPath, { recursive: true });

  const imageFilenames = [];

  // Resize and save each image
  await Promise.all(
    req.files.images.map(async (file) => {
      const filename = `examination-${uuidv4()}-${Date.now()}.jpeg`;
      const filePath = path.join(folderPath, filename);

      await sharp(file.buffer).jpeg({ quality: 99 }).toFile(filePath);

      imageFilenames.push(`${folderName}/${filename}`); // Store relative file path
    })
  );

  req.body.images = imageFilenames; // Attach image file paths to request body

  // Handle and save the Excel sheet if it exists
  if (req.files.sheet && req.files.sheet.length > 0) {
    const sheetFile = req.files.sheet[0];
    const sheetExtension = path.extname(sheetFile.originalname);
    const sheetName = `sheet-${uuidv4()}${sheetExtension}`;
    const sheetPath = path.join(folderPath, sheetName);

    // Save the Excel file
    fs.writeFileSync(sheetPath, sheetFile.buffer);
    req.body.sheet = `${folderName}/${sheetName}`; 
  }

  next();
});

// ==========================
// 🔹 Create Doctor Photos Entry in Database
// ==========================
exports.createExamination = asyncHandler(async (req, res, next) => {
  const DoctorPhotos = await DoctorPhotosModel.create({
    ...req.body,
    user: req.user._id,
    sheetType: req.body.sheet,
  });

  res.status(201).json({
    message: "Doctor photos created successfully",
    data: DoctorPhotos,
  });
});
