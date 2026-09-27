const mongoose = require("mongoose");

const ieltsLessonSchema = new mongoose.Schema(
  {
    // ==========================================
    // Basic Information
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
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
      ],
      required: true,
    },

    // ==========================================
    // Lesson Type
    // ==========================================

    lessonType: {
      type: String,
      enum: [
        "Lesson",
        "Practice",
        "Strategy",
        "Grammar",
        "Vocabulary",
        "Mock Test",
      ],
      default: "Lesson",
    },

    // ==========================================
    // Difficulty
    // ==========================================

    difficulty: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
      default: "Beginner",
    },

    // ==========================================
    // Content
    // ==========================================

    content: {
      type: String,
      default: "",
    },

    // ==========================================
    // Media
    // ==========================================

    audioUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
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

    // Duration is stored in minutes
    // ==========================================

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
  "IELTSLesson",
  ieltsLessonSchema
);