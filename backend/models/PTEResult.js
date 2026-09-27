const mongoose = require("mongoose");

const pteResultSchema = new mongoose.Schema(
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
    // Batch
    // ==========================================

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // ==========================================
    // Attempt
    // ==========================================

    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PTETestAttempt",
      required: true,
    },

    // ==========================================
    // Speaking
    // ==========================================

    speaking: {
      score: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // Writing
    // ==========================================

    writing: {
      score: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // Reading
    // ==========================================

    reading: {
      score: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // Listening
    // ==========================================

    listening: {
      score: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // Overall Score
    // ==========================================

    overallScore: {
      type: Number,
      default: null,
    },

    // ==========================================
    // Result Type
    // ==========================================

    resultType: {
      type: String,
      enum: [
        "Practice",
        "Mock Test",
        "Final Assessment",
      ],
      default: "Practice",
    },

    // ==========================================
    // Evaluation Status
    // ==========================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Partially Evaluated",
        "Evaluated",
      ],
      default: "Pending",
    },

    // ==========================================
    // Evaluated By
    // ==========================================

    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==========================================
    // Evaluation Date
    // ==========================================

    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PTEResult",
  pteResultSchema
);