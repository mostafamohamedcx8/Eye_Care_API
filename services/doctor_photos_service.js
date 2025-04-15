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
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Not an image! Please upload only images.", 400), false);
  }
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
  { name: "images" }, // Allow any number of images
  { name: "sheet", maxCount: 1 }, // Only one sheet
]);

// ==========================
// 🔹 Image Resize Middleware
// ==========================
exports.resizeImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(); // Skip if no files

  const userName = req.user.name.replace(/\s+/g, ""); // Sanitize username
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
    req.body.sheet = `${folderName}/${sheetName}`; // Attach sheet path to request body
  }

  next();
});

// ==========================
// 🔹 Create Doctor Photos Entry in Database
// ==========================
exports.createExamination = asyncHandler(async (req, res, next) => {
  // Create new doctor photos entry in the database
  const DoctorPhotos = await DoctorPhotosModel.create({
    ...req.body,
    user: req.user._id, // Assuming user is authenticated and available in req.user
  });

  res.status(201).json({
    message: "Doctor photos created successfully",
    data: DoctorPhotos,
  });
});

// const DoctorPhotosModel = require("../models/doctorPhotosModel");
// const asyncHandler = require("express-async-handler");
// const ApiError = require("../utils/ApiError");
// const multer = require("multer");
// const sharp = require("sharp");
// const { v4: uuidv4 } = require("uuid");
// const fs = require("fs");
// const path = require("path");

// // ==========================
// // 🔹 Multer Configuration
// // ==========================
// const multerStorage = multer.memoryStorage();

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("Not an image! Please upload only images.", 400), false);
//   }
// };
// const upload = multer({
//   storage: multerstorage,
//   fileFilter: multerFilter,
//   limits: {
//     fileSize: 1000 * 1024 * 1024,
//   },
// });
// // const upload = multer({ storage: multerStorage, fileFilter: multerFilter } , limits: {
// //     fileSize: 1000 * 1024 * 1024, // Max size per file: 10MB
// //     files: 101, // Max total files (100 images + 1 sheet)
// //   },);

// exports.uploadDoctorPhotos = upload.fields([
//   { name: "images" },
//   { name: "sheet", maxCount: 1 },
// ]);

// // ==========================
// // 🔹 Image Resize Middleware
// // ==========================
// // exports.resizeImages = asyncHandler(async (req, res, next) => {
// //   if (!req.files || req.files.length === 0) {
// //     return next();
// //   }

// //   const imageFilenames = [];

// //   await Promise.all(
// //     req.files.map(async (file) => {
// //       const filename = `examination-${uuidv4()}-${Date.now()}.jpeg`;

// //       await sharp(file.buffer)
// //         .jpeg({ quality: 99 })
// //         .toFile(`uploads/${filename}`);

// //       imageFilenames.push(filename);
// //     })
// //   );

// //   req.body.images = imageFilenames; // Set images array in request body
// //   next();
// // });

// exports.resizeImages = asyncHandler(async (req, res, next) => {
//   if (!req.files || req.files.length === 0) return next();

//   const userName = req.user.name.replace(/\s+/g, "");
//   let folderName = userName;
//   let folderPath = path.join(__dirname, "..", "uploads", folderName);

//   // Check if folder exists
//   if (fs.existsSync(folderPath)) {
//     // Append UUID to folder name if it already exists
//     folderName = `${userName}-${uuidv4().split("-")[0]}`;
//     folderPath = path.join(__dirname, "..", "uploads", folderName);
//   }

//   // Create the folder
//   fs.mkdirSync(folderPath, { recursive: true });

//   const imageFilenames = [];

//   await Promise.all(
//     req.files.map(async (file) => {
//       const filename = `examination-${uuidv4()}-${Date.now()}.jpeg`;
//       const filePath = path.join(folderPath, filename);

//       await sharp(file.buffer).jpeg({ quality: 99 }).toFile(filePath);

//       imageFilenames.push(`${folderName}/${filename}`); // Store relative path
//     })
//   );

//   req.body.images = imageFilenames;

//   // Save Excel file if exists
//   if (req.files.sheet && req.files.sheet.length > 0) {
//     const sheetFile = req.files.sheet[0];
//     const sheetExtension = path.extname(sheetFile.originalname);
//     const sheetName = `sheet-${uuidv4()}${sheetExtension}`;
//     const sheetPath = path.join(folderPath, sheetName);

//     // Save the Excel sheet
//     fs.writeFileSync(sheetPath, sheetFile.buffer);
//     req.body.sheet = `${folderName}/${sheetName}`;
//   }

//   next();
// });

// // ==========================
// // 🔹 Create Doctor Photos Entry
// // ==========================
// exports.createExamination = asyncHandler(async (req, res, next) => {
//   const DoctorPhotos = await DoctorPhotosModel.create({
//     ...req.body,
//     user: req.user._id, // Assuming user is authenticated and available in req.user
//   });

//   res.status(201).json({
//     message: "Doctor photos created successfully",
//     data: DoctorPhotos,
//   });
// });
