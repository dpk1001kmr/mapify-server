const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const ZIP_REGEX = /^[A-Za-z0-9\- ]{3,12}$/;
const NAME_REGEX = /^[\p{L} .'-]{1,60}$/u;

const dataSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [1, "First name cannot be empty"],
      maxlength: [60, "First name must be at most 60 characters"],
      match: [NAME_REGEX, "First name contains invalid characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [1, "Last name cannot be empty"],
      maxlength: [60, "Last name must be at most 60 characters"],
      match: [NAME_REGEX, "Last name contains invalid characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email is too long"],
      match: [EMAIL_REGEX, "Email is invalid"],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        PHONE_REGEX,
        "Phone must be digits (optionally starting with +), 7–15 long",
      ],
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [80, "Job title must be at most 80 characters"],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [80, "Department must be at most 80 characters"],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [120, "Company must be at most 120 characters"],
    },
    street: {
      type: String,
      trim: true,
      maxlength: [160, "Street must be at most 160 characters"],
    },
    zipCode: {
      type: String,
      trim: true,
      match: [ZIP_REGEX, "Zip/Postal code is invalid"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [120, "City must be at most 120 characters"],
    },
    country: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: [2, "Use ISO 3166-1 alpha-2 code (e.g., IN)"],
      // maxlength: [2, "Use ISO 3166-1 alpha-2 code (e.g., IN)"],
    },
  },
  { timestamps: true }
);

const Data = mongoose.model("Data", dataSchema);

module.exports = { Data };
