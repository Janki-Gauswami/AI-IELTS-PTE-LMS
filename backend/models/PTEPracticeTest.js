const mongoose = require("mongoose");

// ======================================================
// PTE PRACTICE TEST SCHEMA
// ======================================================

const ptePracticeTestSchema = new mongoose.Schema(
  {
    // ==================================================
    // Test Title
    // ==================================================

    title: {
      type: String,
      required: [true, "Test title is required"],
      trim: true,
      minlength: [
        3,
        "Test title must be at least 3 characters",
      ],
      maxlength: [
        200,
        "Test title cannot exceed 200 characters",
      ],
    },

    // ==================================================
    // Description
    // ==================================================

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        2000,
        "Description cannot exceed 2000 characters",
      ],
    },

    // ==================================================
    // PTE Section
    // ==================================================

    section: {
      type: String,
      enum: [
        "Speaking & Writing",
        "Reading",
        "Listening",
        "Full Test",
      ],
      required: [true, "PTE section is required"],
    },

    // ==================================================
    // Test Type
    // ==================================================

    testType: {
      type: String,
      enum: [
        "Practice",
        "Mock Test",
        "Section Test",
      ],
      default: "Practice",
    },

    // ==================================================
    // Questions
    // ==================================================

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PTEQuestion",
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
    // Automatically calculated from questions
    // ==================================================

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================================================
    // Difficulty
    // ==================================================

    difficulty: {
      type: String,
      enum: [
        "Easy",
        "Medium",
        "Hard",
      ],
      default: "Medium",
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
      required: [
        true,
        "Created by user is required",
      ],
    },

    // ==================================================
    // Published At
    // ==================================================

    publishedAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // Archived At
    // ==================================================

    archivedAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // Archived By
    // ==================================================

    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// INDEXES
// ======================================================

ptePracticeTestSchema.index({
  section: 1,
});

ptePracticeTestSchema.index({
  status: 1,
});

ptePracticeTestSchema.index({
  createdBy: 1,
});

ptePracticeTestSchema.index({
  createdAt: -1,
});

ptePracticeTestSchema.index({
  title: 1,
});

ptePracticeTestSchema.index({
  difficulty: 1,
});

ptePracticeTestSchema.index({
  publishedAt: -1,
});

// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
  "PTEPracticeTest",
  ptePracticeTestSchema
);