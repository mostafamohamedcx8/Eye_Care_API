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
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password TOO short"],
    },
    passwordchangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    imageProfile: String,
    active: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["doctor", "optician", "admin"],
      default: "optician",
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
