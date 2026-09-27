const mongoose = require("mongoose");

/* =========================================================
   ANSWER SCHEMA
========================================================= */

const mockAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    answer: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    marksObtained: {
      type: Number,
      default: 0,
    },

    evaluated: {
      type: Boolean,
      default: false,
    },

    feedback: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   MOCK TEST ATTEMPT
========================================================= */

const mockTestAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: [true, "Mock test reference is required"],
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    course: {
      type: String,
      enum: ["IELTS", "PTE"],
      required: true,
    },

    status: {
      type: String,
      enum: ["In Progress", "Submitted", "Evaluated"],
      default: "In Progress",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    score: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    /*
      IELTS example:
      7.5

      PTE example:
      78
    */
    overallBandOrScore: {
      type: Number,
      default: 0,
    },

    sectionBreakdown: {
      listening: {
        type: Number,
        default: 0,
      },

      reading: {
        type: Number,
        default: 0,
      },

      writing: {
        type: Number,
        default: 0,
      },

      speaking: {
        type: Number,
        default: 0,
      },
    },

    answers: [mockAnswerSchema],

    feedback: {
      type: String,
      default: "",
    },

    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

mockTestAttemptSchema.index({
  student: 1,
  mockTest: 1,
});

mockTestAttemptSchema.index({
  status: 1,
});

mockTestAttemptSchema.index({
  createdAt: -1,
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = mongoose.model(
  "MockTestAttempt",
  mockTestAttemptSchema
);