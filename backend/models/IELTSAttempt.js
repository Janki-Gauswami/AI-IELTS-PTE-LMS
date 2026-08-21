const mongoose = require("mongoose");

const ieltsAttemptSchema = new mongoose.Schema(
  {
    // ==========================================
    // Student
    // ==========================================

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // Test
    // ==========================================

    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IELTSTest",
      required: true,
    },

    // ==========================================
    // Batch
    // ==========================================

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // ==========================================
    // Answers
    // ==========================================

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "IELTSQuestion",
          required: true,
        },

        answer: {
          type: String,
          default: "",
        },

        isCorrect: {
          type: Boolean,
          default: false,
        },

        marksObtained: {
          type: Number,
          default: 0,
        },
      },
    ],

    // ==========================================
    // Score
    // ==========================================

    score: {
      type: Number,
      default: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // Band
    // ==========================================

    band: {
      type: Number,
      default: null,
    },

    // ==========================================
    // Attempt Status
    // ==========================================

    status: {
      type: String,
      enum: [
        "In Progress",
        "Submitted",
        "Evaluated",
      ],
      default: "In Progress",
    },

    // ==========================================
    // Dates
    // ==========================================

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "IELTSAttempt",
  ieltsAttemptSchema
);