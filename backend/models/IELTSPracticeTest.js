const mongoose = require("mongoose");

// ======================================================
// IELTS Practice Test Schema
// ======================================================

const ieltsPracticeTestSchema =
  new mongoose.Schema(
    {
      // ==================================================
      // Test Title
      // ==================================================

      title: {
        type: String,
        required: true,
        trim: true,
      },

      // ==================================================
      // IELTS Section
      // ==================================================

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

      // ==================================================
      // Description
      // ==================================================

      description: {
        type: String,
        trim: true,
        default: "",
      },

      // ==================================================
      // Instructions
      // ==================================================

      instructions: {
        type: String,
        trim: true,
        default: "",
      },

      // ==================================================
      // Duration
      // Stored in minutes
      // ==================================================

      duration: {
        type: Number,
        required: true,
        min: 1,
      },

      // ==================================================
      // Total Marks
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
      // Questions
      //
      // References IELTSQuestion documents
      // ==================================================

      questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "IELTSQuestion",
        },
      ],

      // ==================================================
      // Test Status
      // ==================================================

      status: {
        type: String,
        enum: [
          "Draft",
          "Published",
        ],
        default: "Draft",
      },

      // ==================================================
      // Created By
      // Admin / Teacher
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
// Export Model
// ======================================================

module.exports = mongoose.model(
  "IELTSPracticeTest",
  ieltsPracticeTestSchema
);