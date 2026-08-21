const mongoose = require("mongoose");

const ieltsResultSchema = new mongoose.Schema(
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
    // Listening
    // ==========================================

    listening: {
      rawScore: {
        type: Number,
        default: 0,
      },

      band: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // Reading
    // ==========================================

    reading: {
      rawScore: {
        type: Number,
        default: 0,
      },

      band: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // Writing
    // ==========================================

    writing: {
      band: {
        type: Number,
        default: null,
      },

      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      feedback: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // Speaking
    // ==========================================

    speaking: {
      band: {
        type: Number,
        default: null,
      },

      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      feedback: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // Overall Band
    // ==========================================

    overallBand: {
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
    // Evaluated By
    // ==========================================

    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
    // Date
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
  "IELTSResult",
  ieltsResultSchema
);