const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    gender: { type: String, enum: ["male", "female", "other"] },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password TOO short"],
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    emailVerified: Boolean,
    passwordchangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    imageProfile: String,
    active: { type: Boolean, default: false },
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

module.exports = mongoose.model("User", userSchema);
