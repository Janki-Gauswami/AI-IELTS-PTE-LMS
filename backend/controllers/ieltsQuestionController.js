const IELTSQuestion = require("../models/IELTSQuestion");
const IELTSLesson = require("../models/IELTSLesson");

// ======================================================
// Create Question
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
      lesson,
      status,
    } = req.body;

    if (!section || !questionType || !questionText) {
      return res.status(400).json({
        success: false,
        message:
          "Section, question type and question text are required.",
      });
    }

    // ==================================================
    // Check Lesson If Provided
    // ==================================================

    if (lesson) {
      const existingLesson =
        await IELTSLesson.findById(lesson);

      if (!existingLesson) {
        return res.status(404).json({
          success: false,
          message: "IELTS lesson not found.",
        });
      }
    }

    // ==================================================
    // Create Question
    // ==================================================

    const question = await IELTSQuestion.create({
      section,
      questionType,
      questionText,
      passage,
      options,
      correctAnswer,
      explanation,
      marks,
      difficulty,
      lesson: lesson || null,
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "IELTS question created successfully.",
      data: question,
    });

  } catch (error) {
    console.error(
      "Create IELTS Question Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// Get All Questions
// ======================================================

exports.getAllQuestions = async (req, res) => {
  try {
    const {
      section,
      questionType,
      difficulty,
      search,
    } = req.query;

    const filter = {};

    // ==================================================
    // Section Filter
    // ==================================================

    if (section) {
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
    // Search Filter
    // ==================================================

    if (search) {
      filter.questionText = {
        $regex: search,
        $options: "i",
      };
    }

    // ==================================================
    // Fetch Questions
    // ==================================================

    const questions =
      await IELTSQuestion.find(filter)
        .populate("lesson", "title section")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });

  } catch (error) {
    console.error(
      "Get IELTS Questions Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch IELTS questions.",
    });
  }
};


// ======================================================
// Get Question By ID
// ======================================================

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question =
      await IELTSQuestion.findById(id)
        .populate("lesson", "title section")
        .populate("createdBy", "name email");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "IELTS question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });

  } catch (error) {
    console.error(
      "Get IELTS Question Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// Update Question
// ======================================================

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question =
      await IELTSQuestion.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "IELTS question not found.",
      });
    }

    const fields = [
      "section",
      "questionType",
      "questionText",
      "passage",
      "options",
      "correctAnswer",
      "explanation",
      "marks",
      "difficulty",
      "lesson",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    await question.save();

    return res.status(200).json({
      success: true,
      message: "IELTS question updated successfully.",
      data: question,
    });

  } catch (error) {
    console.error(
      "Update IELTS Question Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// Delete Question
// ======================================================

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question =
      await IELTSQuestion.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "IELTS question not found.",
      });
    }

    await IELTSQuestion.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "IELTS question deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete IELTS Question Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};