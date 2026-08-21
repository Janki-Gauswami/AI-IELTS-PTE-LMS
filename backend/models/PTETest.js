const mongoose = require("mongoose");

// ======================================================
// PTE Practice Test Schema
// ======================================================

const pteTestSchema = new mongoose.Schema(
  {
    // ==================================================
    // Test Title
    // ==================================================

    title: {
      type: String,
      required: [true, "PTE test title is required"],
      trim: true,
    },

    // ==================================================
    // PTE Section
    // ==================================================

    section: {
      type: String,
      enum: [
        "Speaking",
        "Writing",
        "Reading",
        "Listening",
        "Full Test",
      ],
      required: [true, "PTE section is required"],
    },

    // ==================================================
    // Questions
    // ==================================================

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PTEQuestion",
        required: true,
      },
    ],

    // ==================================================
    // Duration
    // Stored in minutes
    // ==================================================

    duration: {
      type: Number,
      required: [true, "Test duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },

    // ==================================================
    // Total Marks
    // ==================================================

    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [1, "Total marks must be at least 1"],
    },

    // ==================================================
    // Status
    // ==================================================

    status: {
      type: String,
      enum: [
        "Draft",
        "Published",
        "Archived",
      ],
      default: "Draft",
    },

    // ==================================================
    // Created By
    // ==================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// Indexes
// ======================================================

pteTestSchema.index({
  section: 1,
});

pteTestSchema.index({
  status: 1,
});

pteTestSchema.index({
  createdBy: 1,
});

pteTestSchema.index({
  createdAt: -1,
});

// ======================================================
// Export
// ======================================================

module.exports = mongoose.model(
  "PTETest",
  pteTestSchema
);