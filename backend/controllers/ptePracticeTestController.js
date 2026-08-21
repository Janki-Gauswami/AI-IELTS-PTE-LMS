const mongoose = require("mongoose");

const PTEPracticeTest = require("../models/PTEPracticeTest");
const PTEQuestion = require("../models/PTEQuestion");

// ======================================================
// HELPERS
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// CREATE PRACTICE TEST
// POST /api/v1/pte/tests
// Admin + Teacher
// ======================================================

const createPracticeTest = async (req, res) => {
  try {
    const {
      title,
      description,
      section,
      testType,
      questions,
      duration,
      difficulty,
      status,
    } = req.body;

    // --------------------------------------------------
    // Validate Title
    // --------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Test title is required.",
      });
    }

    // --------------------------------------------------
    // Validate Section
    // --------------------------------------------------

    const allowedSections = [
      "Speaking & Writing",
      "Reading",
      "Listening",
      "Full Test",
    ];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PTE section.",
      });
    }

    // --------------------------------------------------
    // Validate Test Type
    // --------------------------------------------------

    const allowedTestTypes = [
      "Practice",
      "Mock Test",
      "Section Test",
    ];

    const finalTestType =
      testType || "Practice";

    if (
      !allowedTestTypes.includes(
        finalTestType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid test type.",
      });
    }

    // --------------------------------------------------
    // Validate Difficulty
    // --------------------------------------------------

    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
    ];

    const finalDifficulty =
      difficulty || "Medium";

    if (
      !allowedDifficulties.includes(
        finalDifficulty
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty.",
      });
    }

    // --------------------------------------------------
    // Validate Duration
    // --------------------------------------------------

    const finalDuration = Number(duration);

    if (
      !Number.isFinite(finalDuration) ||
      finalDuration < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duration must be at least 1 minute.",
      });
    }

    // --------------------------------------------------
    // Validate Questions
    // --------------------------------------------------

    const questionIds = Array.isArray(
      questions
    )
      ? questions
      : [];

    const uniqueQuestionIds = [
      ...new Set(
        questionIds.map((id) =>
          String(id)
        )
      ),
    ];

    for (const questionId of uniqueQuestionIds) {
      if (!isValidObjectId(questionId)) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid question ID: ${questionId}`,
        });
      }
    }

    let questionDocuments = [];

    if (uniqueQuestionIds.length > 0) {
      questionDocuments =
        await PTEQuestion.find({
          _id: {
            $in: uniqueQuestionIds,
          },
        });

      if (
        questionDocuments.length !==
        uniqueQuestionIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected PTE questions do not exist.",
        });
      }
    }

    // --------------------------------------------------
    // Calculate Total Marks
    // --------------------------------------------------

    const totalMarks =
      questionDocuments.reduce(
        (total, question) =>
          total + Number(question.marks || 0),
        0
      );

    // --------------------------------------------------
    // Validate Status
    // --------------------------------------------------

    const finalStatus =
      status || "Draft";

    if (
      ![
        "Draft",
        "Published",
      ].includes(finalStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New practice tests can only be Draft or Published.",
      });
    }

    // --------------------------------------------------
    // Published At
    // --------------------------------------------------

    const publishedAt =
      finalStatus === "Published"
        ? new Date()
        : null;

    // --------------------------------------------------
    // Create
    // --------------------------------------------------

    const test =
      await PTEPracticeTest.create({
        title: title.trim(),
        description:
          typeof description === "string"
            ? description.trim()
            : "",
        section,
        testType: finalTestType,
        questions: uniqueQuestionIds,
        duration: finalDuration,
        totalMarks,
        difficulty: finalDifficulty,
        status: finalStatus,
        createdBy: req.user._id,
        publishedAt,
      });

    // --------------------------------------------------
    // Populate
    // --------------------------------------------------

    const populatedTest =
      await PTEPracticeTest.findById(
        test._id
      )
        .populate(
          "questions"
        )
        .populate(
          "createdBy",
          "name email role"
        );

    return res.status(201).json({
      success: true,
      message:
        "PTE practice test created successfully.",
      data: populatedTest,
    });
  } catch (error) {
    console.error(
      "Create PTE Practice Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create PTE practice test.",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL PRACTICE TESTS
// GET /api/v1/pte/tests
// ======================================================

const getAllPracticeTests = async (
  req,
  res
) => {
  try {
    const {
      search,
      section,
      status,
      difficulty,
      testType,
    } = req.query;

    const filter = {};

    // --------------------------------------------------
    // Students only see published tests
    // --------------------------------------------------

    if (req.user.role === "student") {
      filter.status = "Published";
    } else if (status) {
      filter.status = status;
    }

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    if (search && search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // --------------------------------------------------
    // Section
    // --------------------------------------------------

    if (section) {
      filter.section = section;
    }

    // --------------------------------------------------
    // Difficulty
    // --------------------------------------------------

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // --------------------------------------------------
    // Test Type
    // --------------------------------------------------

    if (testType) {
      filter.testType = testType;
    }

    // --------------------------------------------------
    // Fetch
    // --------------------------------------------------

    const tests =
      await PTEPracticeTest.find(filter)
        .populate(
          "questions",
          "section questionType questionText marks difficulty manualEvaluationRequired"
        )
        .populate(
          "createdBy",
          "name email role"
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
      "Get PTE Practice Tests Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch PTE practice tests.",
      error: error.message,
    });
  }
};

// ======================================================
// GET PRACTICE TEST BY ID
// GET /api/v1/pte/tests/:id
// ======================================================

const getPracticeTestById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid practice test ID.",
      });
    }

    const test =
      await PTEPracticeTest.findById(id)
        .populate(
          "questions"
        )
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "archivedBy",
          "name email role"
        );

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    // --------------------------------------------------
    // Student visibility
    // --------------------------------------------------

    if (
      req.user.role === "student" &&
      test.status !== "Published"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error(
      "Get PTE Practice Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch PTE practice test.",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE PRACTICE TEST
// PATCH /api/v1/pte/tests/:id
// Admin + Teacher
// ======================================================

const updatePracticeTest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid practice test ID.",
      });
    }

    const test =
      await PTEPracticeTest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    const {
      title,
      description,
      section,
      testType,
      questions,
      duration,
      difficulty,
      status,
    } = req.body;

    // --------------------------------------------------
    // Title
    // --------------------------------------------------

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Test title cannot be empty.",
        });
      }

      test.title = title.trim();
    }

    // --------------------------------------------------
    // Description
    // --------------------------------------------------

    if (description !== undefined) {
      test.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    // --------------------------------------------------
    // Section
    // --------------------------------------------------

    if (section !== undefined) {
      const allowedSections = [
        "Speaking & Writing",
        "Reading",
        "Listening",
        "Full Test",
      ];

      if (
        !allowedSections.includes(section)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid PTE section.",
        });
      }

      test.section = section;
    }

    // --------------------------------------------------
    // Test Type
    // --------------------------------------------------

    if (testType !== undefined) {
      const allowedTestTypes = [
        "Practice",
        "Mock Test",
        "Section Test",
      ];

      if (
        !allowedTestTypes.includes(
          testType
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid test type.",
        });
      }

      test.testType = testType;
    }

    // --------------------------------------------------
    // Duration
    // --------------------------------------------------

    if (duration !== undefined) {
      const finalDuration =
        Number(duration);

      if (
        !Number.isFinite(
          finalDuration
        ) ||
        finalDuration < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Duration must be at least 1 minute.",
        });
      }

      test.duration = finalDuration;
    }

    // --------------------------------------------------
    // Difficulty
    // --------------------------------------------------

    if (difficulty !== undefined) {
      const allowedDifficulties = [
        "Easy",
        "Medium",
        "Hard",
      ];

      if (
        !allowedDifficulties.includes(
          difficulty
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid difficulty.",
        });
      }

      test.difficulty = difficulty;
    }

    // --------------------------------------------------
    // Questions
    // --------------------------------------------------

    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message:
            "Questions must be an array.",
        });
      }

      const uniqueQuestionIds = [
        ...new Set(
          questions.map((id) =>
            String(id)
          )
        ),
      ];

      for (const questionId of uniqueQuestionIds) {
        if (
          !isValidObjectId(
            questionId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid question ID: ${questionId}`,
          });
        }
      }

      const questionDocuments =
        await PTEQuestion.find({
          _id: {
            $in: uniqueQuestionIds,
          },
        });

      if (
        questionDocuments.length !==
        uniqueQuestionIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected questions do not exist.",
        });
      }

      test.questions =
        uniqueQuestionIds;

      test.totalMarks =
        questionDocuments.reduce(
          (total, question) =>
            total +
            Number(
              question.marks || 0
            ),
          0
        );
    }

    // --------------------------------------------------
    // Status
    // --------------------------------------------------

    if (status !== undefined) {
      const allowedStatuses = [
        "Draft",
        "Published",
        "Archived",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid test status.",
        });
      }

      if (
        status === "Published"
      ) {
        test.status = "Published";

        if (!test.publishedAt) {
          test.publishedAt =
            new Date();
        }

        test.archivedAt = null;
        test.archivedBy = null;
      }

      if (
        status === "Draft"
      ) {
        test.status = "Draft";
        test.publishedAt = null;
      }

      if (
        status === "Archived"
      ) {
        test.status = "Archived";
        test.archivedAt =
          new Date();
        test.archivedBy =
          req.user._id;
      }
    }

    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    await test.save();

    const updatedTest =
      await PTEPracticeTest.findById(
        id
      )
        .populate("questions")
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "archivedBy",
          "name email role"
        );

    return res.status(200).json({
      success: true,
      message:
        "PTE practice test updated successfully.",
      data: updatedTest,
    });
  } catch (error) {
    console.error(
      "Update PTE Practice Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update PTE practice test.",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE / ARCHIVE PRACTICE TEST
// DELETE /api/v1/pte/tests/:id
// ======================================================

const deletePracticeTest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid practice test ID.",
      });
    }

    const test =
      await PTEPracticeTest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    if (
      test.status === "Archived"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Practice test is already archived.",
      });
    }

    test.status = "Archived";
    test.archivedAt = new Date();
    test.archivedBy = req.user._id;

    await test.save();

    return res.status(200).json({
      success: true,
      message:
        "PTE practice test archived successfully.",
      data: test,
    });
  } catch (error) {
    console.error(
      "Archive PTE Practice Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to archive PTE practice test.",
      error: error.message,
    });
  }
};

// ======================================================
// PUBLISH PRACTICE TEST
// PATCH /api/v1/pte/tests/:id/publish
// ======================================================

const publishPracticeTest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid practice test ID.",
      });
    }

    const test =
      await PTEPracticeTest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    if (
      test.status === "Archived"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Archived test must be restored before publishing.",
      });
    }

    if (
      !test.questions ||
      test.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A practice test must contain at least one question before publishing.",
      });
    }

    test.status = "Published";
    test.publishedAt = new Date();
    test.archivedAt = null;
    test.archivedBy = null;

    await test.save();

    const updatedTest =
      await PTEPracticeTest.findById(
        id
      )
        .populate("questions")
        .populate(
          "createdBy",
          "name email role"
        );

    return res.status(200).json({
      success: true,
      message:
        "PTE practice test published successfully.",
      data: updatedTest,
    });
  } catch (error) {
    console.error(
      "Publish PTE Practice Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to publish PTE practice test.",
      error: error.message,
    });
  }
};

// ======================================================
// UNPUBLISH PRACTICE TEST
// PATCH /api/v1/pte/tests/:id/unpublish
// ======================================================

const unpublishPracticeTest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid practice test ID.",
      });
    }

    const test =
      await PTEPracticeTest.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test not found.",
      });
    }

    if (
      test.status !== "Published"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only published tests can be unpublished.",
      });
    }

    test.status = "Draft";
    test.publishedAt = null;

    await test.save();

    const updatedTest =
      await PTEPracticeTest.findById(
        id
      )
        .populate("questions")
        .populate(
          "createdBy",
          "name email role"
        );

    return res.status(200).json({
      success: true,
      message:
        "PTE practice test moved to draft.",
      data: updatedTest,
    });
  } catch (error) {
    console.error(
      "Unpublish PTE Practice Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to unpublish PTE practice test.",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createPracticeTest,
  getAllPracticeTests,
  getPracticeTestById,
  updatePracticeTest,
  deletePracticeTest,
  publishPracticeTest,
  unpublishPracticeTest,
};