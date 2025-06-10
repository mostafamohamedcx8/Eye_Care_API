const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const ReportOfPatient = require("../models/reportModel");
const { uploadMixOfImages } = require("../middleware/uploadimageMiddleware");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const Patient = require("../models/patientModel");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

async function sendImageToFlask(imagePath, eyeSide) {
  const form = new FormData();
  form.append("eye_side", eyeSide);
  form.append("image", fs.createReadStream(imagePath));

  const response = await axios.post("http://localhost:5000/predict", form, {
    headers: form.getHeaders(),
  });

  return response.data;
}

exports.UploadImages = uploadMixOfImages([
  {
    name: "rightEyeImages",
    maxCount: 8,
  },
  { name: "leftEyeImages", maxCount: 8 },
]);

exports.resizeimage = asyncHandler(async (req, res, next) => {
  // Initialize eyeExamination if not present
  req.body.eyeExamination = req.body.eyeExamination || {};
  req.body.eyeExamination.rightEye = req.body.eyeExamination.rightEye || {};
  req.body.eyeExamination.leftEye = req.body.eyeExamination.leftEye || {};

  if (req.files.rightEyeImages) {
    req.body.eyeExamination.rightEye.images = [];
    await Promise.all(
      req.files.rightEyeImages.map(async (img, index) => {
        const rightImageName = `RightEye-${uuidv4()}-${Date.now()}-${index}.jpeg`;
        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/funds/${rightImageName}`);
        req.body.eyeExamination.rightEye.images.push(rightImageName);
      })
    );
  }

  if (req.files.leftEyeImages) {
    req.body.eyeExamination.leftEye.images = [];
    await Promise.all(
      req.files.leftEyeImages.map(async (img, index) => {
        const leftImageName = `LeftEye-${uuidv4()}-${Date.now()}-${index}.jpeg`;
        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/funds/${leftImageName}`);
        req.body.eyeExamination.leftEye.images.push(leftImageName);
      })
    );
  }
  next();
});

exports.deleteReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await ReportOfPatient.findByIdAndDelete(id);

  if (!report) {
    return next(new ApiError(`No report for this id ${id}`, 404));
  }

  res.status(204).send();
});

exports.updateReport = asyncHandler(async (req, res, next) => {
  const report = await ReportOfPatient.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  if (!report) {
    return next(new ApiError(`No report for this id ${req.params.id}`, 404));
  }

  await report.save();
  res.status(200).json({ data: report });
});

// exports.createReport = asyncHandler(async (req, res) => {
//   // Ensure the logged-in user is an optician (اختياري لو حابب تأمين إضافي)
//   if (req.user.role !== "optician") {
//     return res
//       .status(403)
//       .json({ message: "Only opticians can create reports" });
//   }

//   const reportData = {
//     ...req.body,
//     optician: req.user._id, // أربط الريبورت بالأوبتيشن
//   };

//   const report = await ReportOfPatient.create(reportData);
//   res
//     .status(201)
//     .json({ message: "Report created successfully", data: report });
// });
// exports.createReport = asyncHandler(async (req, res) => {
//   if (req.user.role !== "optician") {
//     return res
//       .status(403)
//       .json({ message: "Only opticians can create reports" });
//   }
//   const patientId = req.params.id;

//   const reportData = {
//     ...req.body,
//     patient: patientId,
//     optician: req.user._id,
//   };

//   // 1. إنشاء الريبورت
//   const report = await ReportOfPatient.create(reportData);

//   // 2. تحديث المريض بإضافة الريبورت إلى الـ array
//   await Patient.findByIdAndUpdate(
//     report.patient, // لازم patient ID يكون ضمن بيانات الريبورت
//     { $push: { report: report._id } },
//     { new: true, useFindAndModify: false }
//   );

//   res
//     .status(201)
//     .json({ message: "Report created successfully", data: report });
// });

exports.createReport = asyncHandler(async (req, res) => {
  if (req.user.role !== "optician") {
    return res
      .status(403)
      .json({ message: "Only opticians can create reports" });
  }

  const patientId = req.params.id;
  let modelResults = { rightEye: "", leftEye: "" };

  // Right Eye
  if (req.body.eyeExamination?.rightEye?.images?.length > 0) {
    const rightImageURL = req.body.eyeExamination.rightEye.images[0];
    const rightFilename = path.basename(rightImageURL);
    const rightImagePath = path.join(
      __dirname,
      `../uploads/funds/${rightFilename}`
    );

    try {
      const result = await sendImageToFlask(rightImagePath, "right");
      modelResults.rightEye = JSON.stringify(result);
    } catch (error) {
      console.error("Error predicting right eye:", error.message);
      modelResults.rightEye = JSON.stringify({ error: "Prediction failed" });
    }
  }

  // Left Eye
  if (req.body.eyeExamination?.leftEye?.images?.length > 0) {
    const leftImageURL = req.body.eyeExamination.leftEye.images[0];
    const leftFilename = path.basename(leftImageURL);
    const leftImagePath = path.join(
      __dirname,
      `../uploads/funds/${leftFilename}`
    );

    try {
      const result = await sendImageToFlask(leftImagePath, "left");
      modelResults.leftEye = JSON.stringify(result);
    } catch (error) {
      console.error("Error predicting left eye:", error.message);
      modelResults.leftEye = JSON.stringify({ error: "Prediction failed" });
    }
  }

  const reportData = {
    ...req.body,
    modelResults,
    patient: patientId,
    optician: req.user._id,
  };

  const report = await ReportOfPatient.create(reportData);

  await Patient.findByIdAndUpdate(
    report.patient,
    { $push: { report: report._id } },
    { new: true, useFindAndModify: false }
  );

  res.status(201).json({
    message: "Report created successfully",
    data: report,
  });
});

exports.createDoctorFeedback = asyncHandler(async (req, res) => {
  // 1. تأكد إن المسجل دكتور
  if (req.user.role !== "doctor") {
    return res
      .status(403)
      .json({ message: "Only doctors can give feedback on reports" });
  }

  const { id } = req.params;
  const doctorId = req.user._id;
  const { rightEyeFeedback, leftEyeFeedback, diagnosis, recommendedAction } =
    req.body;

  // 2. تأكد إن التقرير موجود
  const report = await ReportOfPatient.findById(id);
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  // 3. التأكد إن الدكتور مرسل له المريض
  const patient = await Patient.findById(report.patient);
  if (!patient) {
    return res.status(404).json({ message: "Associated patient not found" });
  }

  const isDoctorAssigned = patient.doctors.some((docId) =>
    docId.equals(doctorId)
  );

  if (!isDoctorAssigned) {
    return res.status(403).json({
      message:
        "This doctor is not authorized to give feedback on this patient's report",
    });
  }

  // 4. إعداد الفيدباك
  const feedback = {
    doctor: doctorId,
    rightEyeFeedback,
    leftEyeFeedback,
    diagnosis,
    recommendedAction,
    createdAt: new Date(),
  };

  const existingFeedbackIndex = report.doctorFeedbacks.findIndex((fb) =>
    fb.doctor.equals(doctorId)
  );

  if (existingFeedbackIndex !== -1) {
    // دكتور بالفعل حط فيدباك قبل كده -> نعمل update
    report.doctorFeedbacks[existingFeedbackIndex] = {
      ...report.doctorFeedbacks[existingFeedbackIndex]._doc,
      rightEyeFeedback,
      leftEyeFeedback,
      diagnosis,
      recommendedAction,
      createdAt: new Date(),
    };
  } else {
    // دكتور لسه ماحطش فيدباك -> نضيفه
    report.doctorFeedbacks.push(feedback);
  }

  await report.save();

  res.status(200).json({
    message: "Feedback added successfully",
    data: report,
  });
});
exports.getReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await ReportOfPatient.findById(id)
    .populate("patient")
    .populate("optician");

  if (!report) {
    return next(new ApiError(`No report for this id ${id}`, 404));
  }

  res.status(200).json({ data: report });
});

exports.getReports = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }

  const countDocuments = await ReportOfPatient.countDocuments(filter); // use filtered count

  const apiFeatures = new ApiFeatures(ReportOfPatient.find(filter), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search("ReportOfPatient"); // Ensure this targets searchable fields

  const { paginationResults, mongooseQuery } = apiFeatures;

  const reports = await mongooseQuery
    .populate("patient") // Include related patient
    .populate("optician"); // Include related optician

  res.status(200).json({
    results: reports.length,
    paginationResults,
    data: reports,
  });
});

exports.getMyReports = asyncHandler(async (req, res) => {
  const opticianId = req.user._id;
  const filter = { optician: opticianId };

  const countDocuments = await ReportOfPatient.countDocuments(filter);

  const apiFeatures = new ApiFeatures(ReportOfPatient.find(filter), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search("ReportOfPatient");

  const { paginationResults, mongooseQuery } = apiFeatures;

  const reports = await mongooseQuery.populate("patient").populate("optician");

  res.status(200).json({
    results: reports.length,
    paginationResults,
    data: reports,
  });
});

exports.getMyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const role = req.user.role;

  const report = await ReportOfPatient.findById(id)
    .populate("patient")
    .populate("optician");

  if (!report) {
    return next(new ApiError(`No report found for this id ${id}`, 404));
  }

  // تحقق من الصلاحية
  if (
    (role === "optician" &&
      report.optician._id.toString() !== userId.toString()) ||
    (role === "doctor" && !report.patient.doctors.includes(userId.toString()))
  ) {
    return next(
      new ApiError(`You are not authorized to access this report`, 403)
    );
  }

  res.status(200).json({ data: report });
});

// exports.deleteMyReport = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const opticianId = req.user._id;

//   const report = await ReportOfPatient.findOneAndDelete({
//     _id: id,
//     optician: opticianId,
//   });

//   if (!report) {
//     return next(
//       new ApiError(
//         `No report found for this id ${id} or you are not authorized`,
//         404
//       )
//     );
//   }

//   res.status(204).send();
// });

exports.deleteMyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const opticianId = req.user._id;

  // نحاول نلاقي التقرير الأول
  const report = await ReportOfPatient.findOne({
    _id: id,
    optician: opticianId,
  });

  if (!report) {
    return next(
      new ApiError(
        `No report found for this id ${id} or you are not authorized`,
        404
      )
    );
  }

  // احذف التقرير
  await ReportOfPatient.deleteOne({ _id: id });

  // شيل الـ report ID من الـ patient
  await Patient.findByIdAndUpdate(report.patient, {
    $pull: { report: id },
  });

  res.status(204).send();
});
