const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| MOCK QUESTION SCHEMA
|--------------------------------------------------------------------------
*/

const mockQuestionSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      default: 1,
      min: 1,
    },

    section: {
      type: String,
      enum: [
        "Listening",
        "Reading",
        "Writing",
        "Speaking",
        "Speaking & Writing",
      ],
      required: [true, "Section is required"],
    },

    questionType: {
      type: String,
      enum: [
        "Multiple Choice",
        "True/False",
        "Fill in the Blank",
        "Writing",
        "Speaking",
        "Short Answer",
        "Matching",
      ],
      default: "Multiple Choice",
    },

    question: {
      type: String,
      required: [true, "Question text or prompt is required"],
      trim: true,
    },

    passage: {
      type: String,
      default: "",
      trim: true,
    },

    audioUrl: {
      type: String,
      default: "",
      trim: true,
    },

    options: [
      {
        type: String,
        trim: true,
      },
    ],

    correctAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    acceptableAnswers: [
      {
        type: String,
        trim: true,
      },
    ],

    wordLimit: {
      type: Number,
      default: 250,
      min: 1,
    },

    prepTimeSeconds: {
      type: Number,
      default: 60,
      min: 0,
    },

    responseTimeSeconds: {
      type: Number,
      default: 120,
      min: 0,
    },

    marks: {
      type: Number,
      default: 1,
      min: 0,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| MOCK SECTION SCHEMA
|--------------------------------------------------------------------------
*/

const mockSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Section name is required"],
      enum: [
        "Listening",
        "Reading",
        "Writing",
        "Speaking",
        "Speaking & Writing",
      ],
    },

    duration: {
      type: Number,
      default: 30,
      min: 0,
      // minutes
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 1,
      min: 1,
    },

    questions: {
      type: [mockQuestionSchema],
      default: [],
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| MOCK TEST SCHEMA
|--------------------------------------------------------------------------
*/

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Mock test title is required"],
      trim: true,
    },

    course: {
      type: String,
      enum: ["IELTS", "PTE"],
      required: [true, "Course (IELTS/PTE) is required"],
    },

    mockType: {
      type: String,
      enum: ["Full Mock", "Sectional Mock"],
      default: "Full Mock",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    instructions: {
      type: String,
      default:
        "Complete all sections within the allocated time. Do not refresh or close the browser during the exam.",
      trim: true,
    },

    duration: {
      type: Number,
      required: [true, "Duration in minutes is required"],
      default: 180,
      min: 0,
      // minutes
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    passingScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    assignedBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Sections
    |--------------------------------------------------------------------------
    */

    sections: {
      type: [mockSectionSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Flat Questions
    |--------------------------------------------------------------------------
    |
    | This is kept for:
    | - quick indexing
    | - compatibility
    | - fallback
    |
    */

    questions: {
      type: [mockQuestionSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | IELTS / PTE Reference
    |--------------------------------------------------------------------------
    */

    ieltsTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IELTSPracticeTest",
      default: null,
    },

    pteTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PTEPracticeTest",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Scheduling
    |--------------------------------------------------------------------------
    */

    scheduledDate: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | Created By
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| PRE-SAVE MIDDLEWARE
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Mongoose 9 does NOT support the old:
|
| schema.pre("save", function(next) {
|     ...
|     next();
| });
|
| Therefore we use an async middleware with NO next parameter.
|
|--------------------------------------------------------------------------
*/

mockTestSchema.pre("save", async function () {
  /*
   * If sections exist, synchronize the flat questions list.
   *
   * We intentionally do NOT force this if the developer/controller
   * is explicitly using the flat questions array.
   */

  if (Array.isArray(this.sections) && this.sections.length > 0) {
    const flattenedQuestions = [];

    this.sections.forEach((section) => {
      if (!Array.isArray(section.questions)) {
        return;
      }

      section.questions.forEach((question, index) => {
        const questionObject =
          typeof question.toObject === "function"
            ? question.toObject()
            : { ...question };

        questionObject.section = section.name;

        if (!questionObject.order) {
          questionObject.order = index + 1;
        }

        flattenedQuestions.push(questionObject);
      });
    });

    /*
     * Only synchronize the flat list when sections actually
     * contain questions.
     */
    if (flattenedQuestions.length > 0) {
      this.questions = flattenedQuestions;
    }
  }

  /*
   * Calculate total marks automatically.
   */

  let calculatedTotalMarks = 0;

  if (Array.isArray(this.questions)) {
    this.questions.forEach((question) => {
      const marks = Number(question.marks);

      if (Number.isFinite(marks) && marks > 0) {
        calculatedTotalMarks += marks;
      }
    });
  }

  /*
   * If the flat list has no questions, calculate from sections.
   */

  if (
    calculatedTotalMarks === 0 &&
    Array.isArray(this.sections) &&
    this.sections.length > 0
  ) {
    this.sections.forEach((section) => {
      if (!Array.isArray(section.questions)) {
        return;
      }

      section.questions.forEach((question) => {
        const marks = Number(question.marks);

        if (Number.isFinite(marks) && marks > 0) {
          calculatedTotalMarks += marks;
        }
      });
    });
  }

  /*
   * Do not overwrite an explicitly supplied non-zero total
   * when there are no questions yet.
   */

  if (calculatedTotalMarks > 0) {
    this.totalMarks = calculatedTotalMarks;
  }

  /*
   * Make sure passing score never exceeds total marks.
   */

  if (
    this.totalMarks > 0 &&
    this.passingScore > this.totalMarks
  ) {
    this.passingScore = this.totalMarks;
  }

  /*
   * IMPORTANT:
   * NO next() HERE.
   *
   * Returning from this async function tells Mongoose
   * that the middleware has completed.
   */
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

mockTestSchema.index({
  course: 1,
  status: 1,
});

mockTestSchema.index({
  assignedBatches: 1,
});

mockTestSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model("MockTest", mockTestSchema);