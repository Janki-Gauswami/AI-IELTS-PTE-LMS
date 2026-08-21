const mongoose = require("mongoose");

const PTEQuestion = require("../models/PTEQuestion");
const PTELesson = require("../models/PTELesson");

// ======================================================
// Constants
// ======================================================

const SECTION_QUESTION_TYPES = {
  Speaking: [
    "Read Aloud",
    "Repeat Sentence",
    "Describe Image",
    "Re-tell Lecture",
    "Answer Short Question",
  ],

  Writing: [
    "Summarize Written Text",
    "Write Essay",
  ],

  Reading: [
    "Reading & Writing Fill in the Blanks",
    "Multiple Choice Single Answer",
    "Multiple Choice Multiple Answers",
    "Re-order Paragraphs",
    "Reading Fill in the Blanks",
  ],

  Listening: [
    "Summarize Spoken Text",
    "Listening Multiple Choice Single Answer",
    "Listening Multiple Choice Multiple Answers",
    "Fill in the Blanks",
    "Highlight Incorrect Words",
    "Write From Dictation",
  ],
};

// Question types that normally require options
const OPTION_QUESTION_TYPES = [
  "Multiple Choice Single Answer",
  "Multiple Choice Multiple Answers",
  "Reading & Writing Fill in the Blanks",
  "Reading Fill in the Blanks",
  "Re-order Paragraphs",
  "Listening Multiple Choice Single Answer",
  "Listening Multiple Choice Multiple Answers",
];

// Speaking/Writing questions are manually evaluated initially
const MANUAL_EVALUATION_SECTIONS = [
  "Speaking",
  "Writing",
];

// ======================================================
// Helper: Validate MongoDB ObjectId
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// Helper: Validate Question Type Against Section
// ======================================================

const isValidQuestionTypeForSection = (
  section,
  questionType
) => {
  return (
    SECTION_QUESTION_TYPES[section] &&
    SECTION_QUESTION_TYPES[section].includes(questionType)
  );
};

// ======================================================
// Helper: Check Whether Question Requires Options
// ======================================================

const requiresOptions = (questionType) => {
  return OPTION_QUESTION_TYPES.includes(questionType);
};

// ======================================================
// CREATE PTE QUESTION
// Admin + Teacher
//
// POST /api/v1/pte/questions
// ======================================================

exports.createQuestion = async (req, res) => {
  try {
    const {
      section,
      questionType,
      questionText,
      passage,
      options,
      correctAnswer,
      explanation,
      marks,
      difficulty,
      manualEvaluationRequired,
      lesson,
      status,
    } = req.body;

    // ==================================================
    // Required Fields
    // ==================================================

    if (
      !section ||
      !questionType ||
      !questionText
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Section, question type and question text are required.",
      });
    }

    // ==================================================
    // Validate Section
    // ==================================================

    if (!SECTION_QUESTION_TYPES[section]) {
      return res.status(400).json({
        success: false,
        message: "Invalid PTE section.",
      });
    }

    // ==================================================
    // Validate Question Type
    // ==================================================

    if (
      !isValidQuestionTypeForSection(
        section,
        questionType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Question type "${questionType}" is not valid for ${section}.`,
      });
    }

    // ==================================================
    // Validate Marks
    // ==================================================

    if (
      marks !== undefined &&
      (Number(marks) < 1 || isNaN(Number(marks)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Marks must be a number greater than 0.",
      });
    }

    // ==================================================
    // Validate Difficulty
    // ==================================================

    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
    ];

    if (
      difficulty &&
      !allowedDifficulties.includes(difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty.",
      });
    }

    // ==================================================
    // Validate Status
    // ==================================================

    const allowedStatuses = [
      "Draft",
      "Published",
      "Archived",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question status.",
      });
    }

    // ==================================================
    // Validate Options
    // ==================================================

    if (requiresOptions(questionType)) {
      if (
        !Array.isArray(options) ||
        options.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least two options are required for this question type.",
        });
      }

      const invalidOption = options.some(
        (option) =>
          !option ||
          !option.label ||
          !option.text
      );

      if (invalidOption) {
        return res.status(400).json({
          success: false,
          message:
            "Each option must contain a label and text.",
        });
      }
    }

    // ==================================================
    // Validate Lesson
    // ==================================================

    if (lesson) {
      if (!isValidObjectId(lesson)) {
        return res.status(400).json({
          success: false,
          message: "Invalid PTE lesson ID.",
        });
      }

      const existingLesson =
        await PTELesson.findById(lesson);

      if (!existingLesson) {
        return res.status(404).json({
          success: false,
          message: "PTE lesson not found.",
        });
      }

      // Question section must match lesson section
      if (
        existingLesson.section !== section
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question section and lesson section must match.",
        });
      }
    }

    // ==================================================
    // Manual Evaluation
    //
    // Speaking and Writing are automatically marked
    // for manual evaluation.
    // ==================================================

    let finalManualEvaluation =
      Boolean(manualEvaluationRequired);

    if (
      MANUAL_EVALUATION_SECTIONS.includes(
        section
      )
    ) {
      finalManualEvaluation = true;
    }

    // ==================================================
    // Create Question
    // ==================================================

    const question =
      await PTEQuestion.create({
        section,
        questionType,
        questionText: questionText.trim(),
        passage: passage || "",
        options: options || [],
        correctAnswer: correctAnswer || "",
        explanation: explanation || "",
        marks:
          marks !== undefined
            ? Number(marks)
            : 1,
        difficulty:
          difficulty || "Medium",

        manualEvaluationRequired:
          finalManualEvaluation,

        lesson: lesson || null,

        status: status || "Draft",

        createdBy: req.user._id,
      });

    // ==================================================
    // Response
    // ==================================================

    return res.status(201).json({
      success: true,
      message:
        "PTE question created successfully.",
      data: question,
    });
  } catch (error) {
    console.error(
      "Create PTE Question Error:",
      error
    );

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create PTE question.",
    });
  }
};

// ======================================================
// GET ALL PTE QUESTIONS
//
// Admin + Teacher + Student
//
// GET /api/v1/pte/questions
// ======================================================

exports.getAllQuestions = async (req, res) => {
  try {
    const {
      section,
      questionType,
      difficulty,
      lesson,
      status,
      manualEvaluationRequired,
      search,
    } = req.query;

    const filter = {};

    // ==================================================
    // Student Visibility
    //
    // Students should normally only see Published
    // questions.
    // ==================================================

    if (req.user.role === "student") {
      filter.status = "Published";
    } else if (status) {
      filter.status = status;
    }

    // ==================================================
    // Section Filter
    // ==================================================

    if (section) {
      if (!SECTION_QUESTION_TYPES[section]) {
        return res.status(400).json({
          success: false,
          message: "Invalid PTE section.",
        });
      }

      filter.section = section;
    }

    // ==================================================
    // Question Type Filter
    // ==================================================

    if (questionType) {
      filter.questionType = questionType;
    }

    // ==================================================
    // Difficulty Filter
    // ==================================================

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // ==================================================
    // Lesson Filter
    // ==================================================

    if (lesson) {
      if (!isValidObjectId(lesson)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lesson ID.",
        });
      }

      filter.lesson = lesson;
    }

    // ==================================================
    // Manual Evaluation Filter
    // ==================================================

    if (
      manualEvaluationRequired !== undefined
    ) {
      filter.manualEvaluationRequired =
        manualEvaluationRequired === "true";
    }

    // ==================================================
    // Search
    // ==================================================

    if (search && search.trim()) {
      filter.questionText = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // ==================================================
    // Fetch Questions
    // ==================================================

    const questions =
      await PTEQuestion.find(filter)
        .populate(
          "lesson",
          "title section"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error(
      "Get PTE Questions Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch PTE questions.",
    });
  }
};

// ======================================================
// GET PTE QUESTION BY ID
//
// Admin + Teacher + Student
//
// GET /api/v1/pte/questions/:id
// ======================================================

exports.getQuestionById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // ==================================================
    // Validate ID
    // ==================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PTE question ID.",
      });
    }

    // ==================================================
    // Fetch Question
    // ==================================================

    const question =
      await PTEQuestion.findById(id)
        .populate(
          "lesson",
          "title section"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "PTE question not found.",
      });
    }

    // ==================================================
    // Students cannot access unpublished questions
    // ==================================================

    if (
      req.user.role === "student" &&
      question.status !== "Published"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "PTE question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error(
      "Get PTE Question Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch PTE question.",
    });
  }
};

// ======================================================
// UPDATE PTE QUESTION
//
// Admin + Teacher
//
// PATCH /api/v1/pte/questions/:id
// ======================================================

// ======================================================
// Update PTE Question
// Admin + Teacher
// ======================================================

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // ==================================================
    // Find Question
    // ==================================================

    const question =
      await PTEQuestion.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "PTE question not found.",
      });
    }

    // ==================================================
    // Validate Section
    // ==================================================

    const newSection =
      req.body.section ||
      question.section;

    const newQuestionType =
      req.body.questionType ||
      question.questionType;

    // ==================================================
    // Validate Question Type Belongs To Section
    // ==================================================

    const questionTypes = {
      Speaking: [
        "Read Aloud",
        "Repeat Sentence",
        "Describe Image",
        "Re-tell Lecture",
        "Answer Short Question",
      ],

      Writing: [
        "Summarize Written Text",
        "Write Essay",
      ],

      Reading: [
        "Reading & Writing Fill in the Blanks",
        "Multiple Choice Single Answer",
        "Multiple Choice Multiple Answers",
        "Re-order Paragraphs",
        "Reading Fill in the Blanks",
      ],

      Listening: [
        "Summarize Spoken Text",
        "Listening Multiple Choice Single Answer",
        "Listening Multiple Choice Multiple Answers",
        "Fill in the Blanks",
        "Highlight Incorrect Words",
        "Write From Dictation",
      ],
    };

    if (
      questionTypes[newSection] &&
      !questionTypes[newSection].includes(
        newQuestionType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question type does not belong to the selected PTE section.",
      });
    }

    // ==================================================
    // Validate Lesson
    // ==================================================

    if (req.body.lesson) {
      const lesson =
        await PTELesson.findById(
          req.body.lesson
        );

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "PTE lesson not found.",
        });
      }

      if (
        lesson.section !== newSection
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question section and lesson section must match.",
        });
      }
    }

    // ==================================================
    // Allowed Fields
    // ==================================================

    const allowedFields = [
      "section",
      "questionType",
      "questionText",
      "passage",
      "options",
      "correctAnswer",
      "explanation",
      "marks",
      "difficulty",
      "manualEvaluationRequired",
      "lesson",
      "status",
    ];

    // ==================================================
    // Update Fields
    // ==================================================

    allowedFields.forEach((field) => {
      if (
        req.body[field] !==
        undefined
      ) {
        question[field] =
          req.body[field];
      }
    });

    // ==================================================
    // Save
    // ==================================================

    await question.save();

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,
      message:
        "PTE question updated successfully.",
      data: question,
    });
  } catch (error) {
    console.error(
      "Update PTE Question Error:",
      error
    );

    // ==================================================
    // Mongoose Validation Error
    // ==================================================

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: Object.values(
          error.errors
        )
          .map(
            (err) => err.message
          )
          .join(", "),
      });
    }

    // ==================================================
    // Invalid ObjectId
    // ==================================================

    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid PTE question ID.",
      });
    }

    // ==================================================
    // Server Error
    // ==================================================

    return res.status(500).json({
      success: false,
      message:
        "Unable to update PTE question.",
    });
  }
};

// ======================================================
// Delete PTE Question
// Admin + Teacher
// ======================================================

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // ==================================================
    // Validate Question ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PTE question ID.",
      });
    }

    // ==================================================
    // Find Question
    // ==================================================

    const question = await PTEQuestion.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "PTE question not found.",
      });
    }

    // ==================================================
    // Delete Question
    // ==================================================

    await PTEQuestion.findByIdAndDelete(id);

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(200).json({
      success: true,
      message: "PTE question deleted successfully.",
    });
  } catch (error) {
    console.error("Delete PTE Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete PTE question.",
    });
  }
};