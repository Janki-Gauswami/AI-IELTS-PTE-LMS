const IELTSTest = require("../models/IELTSTest");
const IELTSQuestion = require("../models/IELTSQuestion");

// ==========================================
// Create Test
// ==========================================

exports.createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      testType,
      section,
      questions,
      audioUrl,
      duration,
      status,
    } = req.body;

    if (!title || !section) {
      return res.status(400).json({
        success: false,
        message: "Title and section are required.",
      });
    }

    // ==========================================
    // Validate Questions
    // ==========================================

    let validQuestions = [];

    if (questions && questions.length > 0) {
      validQuestions = await IELTSQuestion.find({
        _id: { $in: questions },
      }).select("_id marks");

      if (validQuestions.length !== questions.length) {
        return res.status(400).json({
          success: false,
          message: "One or more questions are invalid.",
        });
      }
    }

    const totalMarks = validQuestions.reduce(
      (total, question) => total + (question.marks || 0),
      0
    );

    const test = await IELTSTest.create({
      title,
      description,
      testType,
      section,
      questions: questions || [],
      audioUrl,
      duration,
      totalMarks,
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "IELTS test created successfully.",
      data: test,
    });
  } catch (error) {
    console.error("Create IELTS Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Tests
// ==========================================

exports.getAllTests = async (req, res) => {
  try {
    const {
      section,
      testType,
      status,
    } = req.query;

    const filter = {};

    if (section) filter.section = section;
    if (testType) filter.testType = testType;
    if (status) filter.status = status;

    const tests = await IELTSTest.find(filter)
      .populate("createdBy", "name email")
      .populate(
        "questions",
        "questionText questionType marks difficulty"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    console.error("Get IELTS Tests Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Test By ID
// ==========================================

exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await IELTSTest.findById(id)
      .populate("createdBy", "name email")
      .populate("questions");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "IELTS test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error("Get IELTS Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Test
// ==========================================

exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await IELTSTest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "IELTS test not found.",
      });
    }

    const {
      title,
      description,
      testType,
      section,
      questions,
      audioUrl,
      duration,
      status,
    } = req.body;

    if (questions) {
      const validQuestions = await IELTSQuestion.find({
        _id: { $in: questions },
      }).select("_id marks");

      if (validQuestions.length !== questions.length) {
        return res.status(400).json({
          success: false,
          message: "One or more questions are invalid.",
        });
      }

      test.questions = questions;

      test.totalMarks = validQuestions.reduce(
        (total, question) =>
          total + (question.marks || 0),
        0
      );
    }

    test.title = title ?? test.title;
    test.description = description ?? test.description;
    test.testType = testType ?? test.testType;
    test.section = section ?? test.section;
    test.audioUrl = audioUrl ?? test.audioUrl;
    test.duration = duration ?? test.duration;
    test.status = status ?? test.status;

    await test.save();

    return res.status(200).json({
      success: true,
      message: "IELTS test updated successfully.",
      data: test,
    });
  } catch (error) {
    console.error("Update IELTS Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Delete Test
// ==========================================

exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await IELTSTest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "IELTS test not found.",
      });
    }

    await IELTSTest.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "IELTS test deleted successfully.",
    });
  } catch (error) {
    console.error("Delete IELTS Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
