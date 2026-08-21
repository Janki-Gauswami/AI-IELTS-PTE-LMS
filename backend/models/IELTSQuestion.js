const mongoose = require("mongoose");

const ieltsQuestionSchema = new mongoose.Schema(
  {
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
    // Question Type
    // ==========================================

    questionType: {
      type: String,
      enum: [
        "Multiple Choice",
        "True False Not Given",
        "Yes No Not Given",
        "Matching",
        "Matching Headings",
        "Fill in the Blanks",
        "Sentence Completion",
        "Short Answer",
        "Essay",
        "Speaking Prompt",
      ],
      required: true,
    },

    // ==========================================
    // Question
    // ==========================================

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // Passage
    // ==========================================

    passage: {
      type: String,
      default: "",
    },

    // ==========================================
    // Options
    // ==========================================

    options: [
      {
        label: {
          type: String,
        },

        text: {
          type: String,
        },
      },
    ],

    // ==========================================
    // Correct Answer
    // ==========================================

    correctAnswer: {
      type: String,
      default: "",
    },

    // ==========================================
    // Explanation
    // ==========================================

    explanation: {
      type: String,
      default: "",
    },

    // ==========================================
    // Marks
    // ==========================================

    marks: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==========================================
    // Difficulty
    // ==========================================

    difficulty: {
      type: String,
      enum: [
        "Easy",
        "Medium",
        "Hard",
      ],
      default: "Medium",
    },

    // ==========================================
    // Lesson Reference
    // ==========================================

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IELTSLesson",
      default: null,
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
  "IELTSQuestion",
  ieltsQuestionSchema
);