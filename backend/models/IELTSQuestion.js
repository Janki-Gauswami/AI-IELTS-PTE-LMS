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
        // Reading & Listening
        "Multiple Choice",
        "True False Not Given",
        "Yes No Not Given",
        "Matching",
        "Matching Headings",
        "Fill in the Blanks",
        "Sentence Completion",
        "Summary Completion",
        "Map / Diagram Labelling",
        "Short Answer",
        // Writing
        "Essay Writing",
        "Task 1 Report",
        "Task 2 Essay",
        "Long Answer",
        "Email Writing",
        "Essay",
        // Speaking
        "Speaking Prompt",
        "Cue Card Topic",
        "Part 1 Interview",
        "Part 2 Cue Card",
        "Part 3 Discussion",
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
    // Passage (Reading)
    // ==========================================

    passage: {
      type: String,
      default: "",
    },

    // ==========================================
    // Audio URL (Listening & Speaking prompts)
    // ==========================================

    audioUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // Image URL (Charts/Diagrams/Cue cards)
    // ==========================================

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // Options (for MCQ & Matching)
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
    // Correct Answer / Key
    // ==========================================

    correctAnswer: {
      type: String,
      default: "",
    },

    // ==========================================
    // Sample / Model Answer (Writing & Speaking)
    // ==========================================

    sampleAnswer: {
      type: String,
      default: "",
    },

    // ==========================================
    // Writing Word Limit
    // ==========================================

    wordLimit: {
      type: Number,
      default: 250,
    },

    // ==========================================
    // Speaking Timers (in seconds)
    // ==========================================

    prepTimeSeconds: {
      type: Number,
      default: 60,
    },

    responseTimeSeconds: {
      type: Number,
      default: 120,
    },

    // ==========================================
    // Explanation
    // ==========================================

    explanation: {
      type: String,
      default: "",
    },

    // ==========================================
    // Marks / Weightage
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