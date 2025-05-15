const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const patient = require("./patientModel");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "firstname is required"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "lastname is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "email is required"],
      unique: true,
    },
    dateOfBirth: {
      day: {
        type: Number,
        required: true,
      },
      month: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
    },
    Specialty: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password TOO short"],
    },
    imageProfile: String,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    emailVerified: Boolean,
    passwordchangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    active: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["doctor", "optician", "admin"],
      default: "optician",
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const setImageURL = (doc) => {
  if (doc.imageProfile) {
    const imageUrl = `${process.env.BASE_URL}/profile/${doc.imageProfile}`;
    doc.imageProfile = imageUrl;
  }
};

// findOne, findAll, Update
userSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
userSchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("User", userSchema);
