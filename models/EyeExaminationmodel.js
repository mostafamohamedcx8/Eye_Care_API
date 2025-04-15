const mongoose = require("mongoose");
// create schema
const ExaminationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: String,
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    imagePosition: String,
    symptoms: [String],
    otherDiseases: [String],
  },
  { timestamp: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/${doc.image}`;
    doc.image = imageUrl;
  }
};

// findOne, findAll, Update
ExaminationSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
ExaminationSchema.post("save", (doc) => {
  setImageURL(doc);
});

// create model
const ExaminationModel = mongoose.model("examination", ExaminationSchema);

module.exports = ExaminationModel;
