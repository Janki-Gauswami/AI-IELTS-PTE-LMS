const mongoose = require("mongoose");

// ======================================================
// IELTS Test Attempt Schema
// ======================================================

const ieltsTestAttemptSchema = new mongoose.Schema(
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
    // Practice Test
    // ==================================================

    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IELTSPracticeTest",
      required: [true, "Practice test is required"],
    },

    // ==================================================
    // Submitted Answers
    // ==================================================

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "IELTSQuestion",
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
    // Evaluation Information
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
// IELTS Listening Band
// ==================================================

listeningBand: {
  type: Number,
  default: null,
  min: 0,
  max: 9,
},

// ==================================================
// IELTS Reading Band
// ==================================================

readingBand: {
  type: Number,
  default: null,
  min: 0,
  max: 9,
},
// ==================================================
// IELTS Writing Evaluation
// ==================================================

writingBand: {
  type: Number,
  default: null,
  min: 0,
  max: 9,
},

writingFeedback: {
  type: String,
  default: "",
  trim: true,
},

writingEvaluatedAt: {
  type: Date,
  default: null,
},

writingEvaluatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

// ==================================================
// IELTS Speaking Evaluation
// Teacher Evaluated
// ==================================================

speakingBand: {
  type: Number,
  default: null,
  min: 0,
  max: 9,
},

speakingFeedback: {
  type: String,
  default: "",
  trim: true,
},

speakingEvaluatedAt: {
  type: Date,
  default: null,
},

speakingEvaluatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
// ==================================================
// IELTS Overall Band
// ==================================================

overallBand: {
  type: Number,
  default: null,
  min: 0,
  max: 9,
},
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
    // Used for Writing / Speaking
    // ==================================================

    manualReviewRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// ======================================================
// Indexes
// ======================================================

// Quickly find student's attempts
ieltsTestAttemptSchema.index({
  student: 1,
  test: 1,
});

// Quickly find attempts by status
ieltsTestAttemptSchema.index({
  status: 1,
});

// Quickly retrieve latest attempts
ieltsTestAttemptSchema.index({
  student: 1,
  submittedAt: -1,
});


// ======================================================
// Export Model
// ======================================================

module.exports = mongoose.model(
  "IELTSTestAttempt",
  ieltsTestAttemptSchema
);