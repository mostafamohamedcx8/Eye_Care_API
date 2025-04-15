const mongoose = require("mongoose");

const DoctorPhotosSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    images: [
      {
        type: String,
        required: true,
      },
    ],
    sheet: String,
    sheetType: String,
  },
  { timestamps: true }
);

// Updated function to handle list of images
const setImageURLs = (doc) => {
  if (doc.images && Array.isArray(doc.images)) {
    doc.images = doc.images.map(
      (img) => `${process.env.BASE_URL}/uploads/${img}`
    );
  }
  if (doc.sheet) {
    doc.sheet = `${process.env.BASE_URL}/uploads/${doc.sheet}`;
  }
};

// Use post middleware to update the images array with full URLs
DoctorPhotosSchema.post("init", (doc) => {
  setImageURLs(doc);
});

DoctorPhotosSchema.post("save", (doc) => {
  setImageURLs(doc);
});

const DoctorPhotosModel = mongoose.model("DoctorPhotos", DoctorPhotosSchema);

module.exports = DoctorPhotosModel;
