const mongoose = require("mongoose");

const resultsSchema = new mongoose.Schema(
  {
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "examination",
      required: true,
    },
    diseases: [
      {
        name: {
          type: String,
          required: true,
          enum: ["Diabetic Retinopathy", "Drusense", "Increase Cup Disk"],
        },
        Probability: {
          type: Number,
          required: true,
        },
      },
    ],
    report: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultsSchema);
