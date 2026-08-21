const mongoose = require("mongoose");

// ======================================================
// PTE Test Attempt Schema
// ======================================================

const pteTestAttemptSchema = new mongoose.Schema(
  {
    // ==================================================
    // Student
    // ==================================================

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    // ==================================================
    // PTE Practice Test
    // ==================================================

    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PTEPracticeTest",
      required: [true, "PTE practice test is required"],
    },

    // ==================================================
    // Batch
    // ==================================================

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // ==================================================
    // Submitted Answers
    // ==================================================

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PTEQuestion",
          required: true,
        },

        answer: {
          type: String,
          default: "",
          trim: true,
        },

        // Used for speaking/audio questions
        audioUrl: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    // ==================================================
    // Attempt Status
    // ==================================================

    status: {
      type: String,
      enum: [
        "In Progress",
        "Submitted",
        "Evaluated",
      ],
      default: "In Progress",
    },

    // ==================================================
    // Timing Information
    // ==================================================

    startedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // Score Information
    // ==================================================

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ==================================================
    // PTE Overall Score
    // PTE score range: 10 - 90
    // ==================================================

    overallScore: {
      type: Number,
      default: null,
      min: 0,
      max: 90,
    },

    // ==================================================
    // PTE Skill Scores
    // ==================================================

    listeningScore: {
      type: Number,
      default: null,
      min: 0,
      max: 90,
    },

    readingScore: {
      type: Number,
      default: null,
      min: 0,
      max: 90,
    },

    speakingScore: {
      type: Number,
      default: null,
      min: 0,
      max: 90,
    },

    writingScore: {
      type: Number,
      default: null,
      min: 0,
      max: 90,
    },

    // ==================================================
    // Question Statistics
    // ==================================================

    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    unanswered: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================================================
    // Manual Evaluation
    // Used for Speaking / Writing
    // ==================================================

    manualReviewRequired: {
      type: Boolean,
      default: false,
    },

    // ==================================================
    // Teacher Feedback
    // ==================================================

    feedback: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// Indexes
// ======================================================

// Find attempts of a particular student for a test
pteTestAttemptSchema.index({
  student: 1,
  test: 1,
});

// Find attempts by status
pteTestAttemptSchema.index({
  status: 1,
});

// Retrieve student's latest attempts
pteTestAttemptSchema.index({
  student: 1,
  submittedAt: -1,
});

// ======================================================
// Export Model
// ======================================================

module.exports = mongoose.model(
  "PTETestAttempt",
  pteTestAttemptSchema
);