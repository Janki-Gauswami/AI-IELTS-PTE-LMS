const mongoose = require("mongoose");

// ======================================================
// PTE Question Schema
// ======================================================

const pteQuestionSchema = new mongoose.Schema(
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
    },

    // ==================================================
    // PTE Question Type
    // ==================================================

    questionType: {
      type: String,
      enum: [
        // Speaking
        "Read Aloud",
        "Repeat Sentence",
        "Describe Image",
        "Re-tell Lecture",
        "Answer Short Question",

        // Writing
        "Summarize Written Text",
        "Write Essay",

        // Reading
        "Reading & Writing Fill in the Blanks",
        "Multiple Choice Single Answer",
        "Multiple Choice Multiple Answers",
        "Re-order Paragraphs",
        "Reading Fill in the Blanks",

        // Listening
        "Summarize Spoken Text",
        "Listening Multiple Choice Single Answer",
        "Listening Multiple Choice Multiple Answers",
        "Fill in the Blanks",
        "Highlight Incorrect Words",
        "Write From Dictation",
      ],
      required: [true, "PTE question type is required"],
    },

    // ==================================================
    // Question Text
    // ==================================================

    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },

    // ==================================================
    // Passage / Context
    // ==================================================

    passage: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // Options
    // ==================================================

    options: [
      {
        label: {
          type: String,
          trim: true,
        },

        text: {
          type: String,
          trim: true,
        },
      },
    ],

    // ==================================================
    // Correct Answer
    // ==================================================

    correctAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // Explanation
    // ==================================================

    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // Marks
    // ==================================================

    marks: {
      type: Number,
      default: 1,
      min: 1,
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
    // Manual Evaluation
    //
    // Used mainly for:
    // Speaking
    // Writing
    //
    // This allows us to support manual evaluation now
    // and AI evaluation later.
    // ==================================================

    manualEvaluationRequired: {
      type: Boolean,
      default: false,
    },

    // ==================================================
    // Lesson Reference
    // ==================================================

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PTELesson",
      default: null,
    },

    // ==================================================
    // Created By
    // ==================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
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
  },
  {
    timestamps: true,
  }
);

// ======================================================
// Indexes
// ======================================================

pteQuestionSchema.index({
  section: 1,
});

pteQuestionSchema.index({
  questionType: 1,
});

pteQuestionSchema.index({
  difficulty: 1,
});

pteQuestionSchema.index({
  manualEvaluationRequired: 1,
});

pteQuestionSchema.index({
  lesson: 1,
});

pteQuestionSchema.index({
  status: 1,
});

// ======================================================
// Export
// ======================================================

module.exports = mongoose.model(
  "PTEQuestion",
  pteQuestionSchema
);