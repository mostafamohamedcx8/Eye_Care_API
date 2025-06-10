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
    salutation: {
      type: String,
      enum: ["Mr", "Mrs", "Ms", "Mx"],
      required: [true, "Salutation is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password TOO short"],
    },
    imageProfile: String,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    emailVerified: Boolean,
    licenseVerified: { type: Boolean, default: false },
    passwordchangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    active: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["doctor", "optician", "admin"],
      required: true,
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
    postalCode: {
      type: String,
      required: [true, "postalCode is required"],
      match: [/^\d{5}$/, "postalCode must be 5 digits"],
      // التحقق من أنها 5 أرقام
    },
    imagemedicallicense: {
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

const setImageURLs = (doc) => {
  if (
    doc.imagemedicallicense &&
    !doc.imagemedicallicense.startsWith("http://") &&
    !doc.imagemedicallicense.startsWith("https://")
  ) {
    doc.imagemedicallicense = `${process.env.BASE_URL}/Image_Medical_License/${doc.imagemedicallicense}`;
  }

  if (
    doc.imageProfile &&
    !doc.imageProfile.startsWith("http://") &&
    !doc.imageProfile.startsWith("https://")
  ) {
    doc.imageProfile = `${process.env.BASE_URL}/profile/${doc.imageProfile}`;
  }
};

// findOne, findAll, Update
userSchema.post("init", setImageURLs);

// create
module.exports = mongoose.model("User", userSchema);
