const resultModel = require("../models/results");
const path = require("path");
const EyeExaminationModel = require("../models/EyeExaminationmodel.js");
const getPredictionFromModel = require("./data_science_handle");
const asyncHandler = require("express-async-handler");

// ==========================
// 🔹 Create results
// ==========================

exports.ceateExaminationResults = asyncHandler(async (req, res, next) => {
  const examId = req.params.examId;

  const exam = await EyeExaminationModel.findById(examId);
  if (!exam) return next(new ApiError("Examination not found", 404));

  const imagePath = path.join(__dirname, `../uploads/${exam.image}`);
  //   const results = await getPredictionFromModel(imagePath);

  //   const resultDoc = await resultModel.create({
  //     examination: examId,
  //     diseases: results,
  //   });
  console.log(imagePath);
  res.status(200).json({
    message: "Prediction completed successfully",
    data: exam,
  });
});
