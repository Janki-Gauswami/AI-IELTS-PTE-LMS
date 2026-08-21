const mongoose = require("mongoose");

const ieltsTestSchema = new mongoose.Schema(
  {
    // ==========================================
    // Test Information
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // ==========================================
    // Test Type
    // ==========================================

    testType: {
      type: String,
      enum: [
        "Practice",
        "Mock Test",
        "Section Test",
      ],
      default: "Practice",
    },

    // ==========================================
    // IELTS Section
    // ==========================================

    section: {
      type: String,
      enum: [
        "Listening",
        "Reading",
        "Writing",
        "Speaking",
        "Full Test",
      ],
      required: true,
    },

    // ==========================================
    // Questions
    // ==========================================

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IELTSQuestion",
      },
    ],

    // ==========================================
    // Audio
    // ==========================================

    audioUrl: {
      type: String,
      default: "",
    },

    // ==========================================
    // Duration
    // ==========================================

    duration: {
      type: Number,
      default: 0,
    },

    // Duration in minutes
    // ==========================================

    // ==========================================
    // Total Marks
    // ==========================================

    totalMarks: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // Created By
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // Status
    // ==========================================

    status: {
      type: String,
      enum: [
        "Draft",
        "Published",
        "Archived",
      ],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "IELTSTest",
  ieltsTestSchema
);