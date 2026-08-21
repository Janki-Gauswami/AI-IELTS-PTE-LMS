const PTETest = require("../models/PTETest");
const PTEQuestion = require("../models/PTEQuestion");

// ======================================================
// Create PTE Practice Test
// Admin + Teacher
// ======================================================

exports.createTest = async (req, res) => {
  try {
    const {
      title,
      section,
      questions,
      duration,
      totalMarks,
      status,
    } = req.body;

    // ==================================================
    // Required Fields
    // ==================================================

    if (
      !title ||
      !section ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0 ||
      !duration ||
      !totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, section, questions, duration and total marks are required.",
      });
    }

    // ==================================================
    // Validate Question IDs
    // ==================================================

    const existingQuestions = await PTEQuestion.find({
      _id: { $in: questions },
    });

    if (existingQuestions.length !== questions.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more PTE question IDs are invalid.",
      });
    }

    // ==================================================
    // Validate Question Sections
    // ==================================================

    if (section !== "Full Test") {
      const invalidQuestion = existingQuestions.find(
        (question) => question.section !== section
      );

      if (invalidQuestion) {
        return res.status(400).json({
          success: false,
          message:
            "All questions must belong to the selected PTE section.",
        });
      }
    }

    // ==================================================
    // Create Test
    // ==================================================

    const test = await PTETest.create({
      title,
      section,
      questions,
      duration,
      totalMarks,
      status: status || "Draft",
      createdBy: req.user._id,
    });

    // ==================================================
    // Response
    // ==================================================

    return res.status(201).json({
      success: true,
      message:
        "PTE practice test created successfully.",
      data: test,
    });
  } catch (error) {
    console.error(
      "Create PTE Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Get All PTE Practice Tests
// Admin + Teacher + Student
// ======================================================

exports.getAllTests = async (req, res) => {
  try {
    const {
      section,
      status,
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
    // Status Filter
    // ==================================================

    if (status) {
      filter.status = status;
    }

    // ==================================================
    // Search
    // ==================================================

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    // ==================================================
    // Student should normally see published tests
    // ==================================================

    if (
      req.user.role === "student" &&
      !status
    ) {
      filter.status = "Published";
    }

    // ==================================================
    // Fetch Tests
    // ==================================================

    const tests = await PTETest.find(filter)
      .populate(
        "questions",
        "section questionType questionText marks difficulty"
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
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    console.error(
      "Get PTE Tests Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch PTE practice tests.",
    });
  }
};

// ======================================================
// Get PTE Test By ID
// Admin + Teacher + Student
// ======================================================

exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await PTETest.findById(id)
      .populate(
        "questions",
        "section questionType questionText passage options marks difficulty"
      )
      .populate(
        "createdBy",
        "name email"
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    // ==================================================
    // Students can only access published tests
    // ==================================================

    if (
      req.user.role === "student" &&
      test.status !== "Published"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This PTE test is not available.",
      });
    }

    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error(
      "Get PTE Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Update PTE Practice Test
// Admin + Teacher
// ======================================================

exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await PTETest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    const {
      title,
      section,
      questions,
      duration,
      totalMarks,
      status,
    } = req.body;

    // ==================================================
    // Validate Questions If Provided
    // ==================================================

    if (questions !== undefined) {
      if (
        !Array.isArray(questions) ||
        questions.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Questions must be a non-empty array.",
        });
      }

      const existingQuestions =
        await PTEQuestion.find({
          _id: { $in: questions },
        });

      if (
        existingQuestions.length !==
        questions.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more PTE question IDs are invalid.",
        });
      }

      const selectedSection =
        section || test.section;

      if (selectedSection !== "Full Test") {
        const invalidQuestion =
          existingQuestions.find(
            (question) =>
              question.section !== selectedSection
          );

        if (invalidQuestion) {
          return res.status(400).json({
            success: false,
            message:
              "All questions must belong to the selected PTE section.",
          });
        }
      }

      test.questions = questions;
    }

    // ==================================================
    // Update Fields
    // ==================================================

    if (title !== undefined) {
      test.title = title;
    }

    if (section !== undefined) {
      test.section = section;
    }

    if (duration !== undefined) {
      test.duration = duration;
    }

    if (totalMarks !== undefined) {
      test.totalMarks = totalMarks;
    }

    if (status !== undefined) {
      test.status = status;
    }

    await test.save();

    return res.status(200).json({
      success: true,
      message:
        "PTE practice test updated successfully.",
      data: test,
    });
  } catch (error) {
    console.error(
      "Update PTE Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Delete PTE Practice Test
// Admin + Teacher
// ======================================================

exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await PTETest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    await PTETest.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "PTE practice test deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete PTE Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete PTE practice test.",
    });
  }
};

// ======================================================
// Publish PTE Practice Test
// Admin + Teacher
// ======================================================

exports.publishTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await PTETest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    // ==================================================
    // Test must contain questions
    // ==================================================

    if (
      !test.questions ||
      test.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot publish a test without questions.",
      });
    }

    // ==================================================
    // Publish
    // ==================================================

    test.status = "Published";

    await test.save();

    return res.status(200).json({
      success: true,
      message:
        "PTE practice test published successfully.",
      data: test,
    });
  } catch (error) {
    console.error(
      "Publish PTE Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to publish PTE practice test.",
    });
  }
};