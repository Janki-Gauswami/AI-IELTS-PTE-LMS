const mongoose = require("mongoose");

// ======================================================
// PTE Lesson Schema
// ======================================================

const pteLessonSchema = new mongoose.Schema(
  {
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
      ],
      required: [true, "PTE section is required"],
      trim: true,
    },

    // ==================================================
    // Lesson Title
    // ==================================================

    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minlength: [
        3,
        "Lesson title must be at least 3 characters",
      ],
      maxlength: [
        200,
        "Lesson title cannot exceed 200 characters",
      ],
    },

    // ==================================================
    // Lesson Description
    // ==================================================

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        2000,
        "Lesson description cannot exceed 2000 characters",
      ],
    },

    // ==================================================
    // Learning Material
    // ==================================================

    learningMaterial: {
      type: String,
      default: "",
      trim: true,
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

    // Draft:
    // Visible to Admin/Teacher.
    //
    // Published:
    // Visible to students.
    //
    // Archived:
    // Removed from normal active lesson lists
    // but preserved in database.

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
// Indexes
// ======================================================

pteLessonSchema.index({
  section: 1,
});

pteLessonSchema.index({
  status: 1,
});

pteLessonSchema.index({
  createdBy: 1,
});

pteLessonSchema.index({
  createdAt: -1,
});

pteLessonSchema.index({
  title: 1,
});

pteLessonSchema.index({
  difficulty: 1,
});

pteLessonSchema.index({
  publishedAt: -1,
});

// ======================================================
// Export Model
// ======================================================

module.exports = mongoose.model(
  "PTELesson",
  pteLessonSchema
);