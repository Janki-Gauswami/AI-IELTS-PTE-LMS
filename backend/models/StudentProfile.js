const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    // ==========================================
    // Reference to User
    // ==========================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },

    // ==========================================
    // Student Information
    // ==========================================

    enrollmentNumber: {
      type: String,
      required: [true, "Enrollment number is required"],
      unique: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },

    address: {
            type: String,
            trim: true,
            maxlength: [300, "Address cannot exceed 300 characters"],
            default: "",
        },

   emergencyContact: {
        type: String,
        trim: true,
        required: [true, "Emergency contact is required"],
        match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },

    // ==========================================
    // Academic Information
    // ==========================================

    targetExam: {
      type: String,
      enum: ["IELTS", "PTE"],
      required: [true, "Target exam is required"],
    },

    targetBand: {
    type: Number,
    required: [true, "Target band is required"],
    },

    targetCountry: {
      type: String,
      enum: [
        "Canada",
        "Australia",
        "UK",
        "USA",
        "New Zealand",
      ],
      required: [true, "Target country is required"],
    },

    goal: {
        type: String,
        enum: [
            "Study",
            "Work",
            "PR",
            "Migration",
            "Other",
        ],
        default: "Study",
    },

    // ==========================================
    // Admission Details
    // ==========================================

    joinedDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// MongoDB Indexes
// ==========================================

// One profile per user
studentProfileSchema.index({ userId: 1 }, { unique: true });

// Fast lookup by enrollment number
studentProfileSchema.index({ enrollmentNumber: 1 }, { unique: true });

// Filter students by target exam
studentProfileSchema.index({ targetExam: 1 });

// Filter students by status
studentProfileSchema.index({ status: 1 });

module.exports = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);