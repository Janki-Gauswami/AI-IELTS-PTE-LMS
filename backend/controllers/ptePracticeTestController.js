const mongoose = require("mongoose");

const PTEPracticeTest = require("../models/PTEPracticeTest");
const PTEQuestion = require("../models/PTEQuestion");
const PTETestAttempt = require("../models/PTETestAttempt");

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
      status || "Published";

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
// START PTE TEST ATTEMPT
// POST /api/v1/pte/tests/:id/attempt/start
// ======================================================
const startPTETestAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid practice test ID.",
      });
    }

    const test = await PTEPracticeTest.findOne({ _id: id, status: "Published" });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Published PTE practice test not found.",
      });
    }

    let attempt = await PTETestAttempt.findOne({
      student: studentId,
      test: id,
      status: "In Progress",
    });

    if (attempt) {
      return res.status(200).json({
        success: true,
        message: "Existing active PTE attempt found.",
        data: attempt,
      });
    }

    const duration = test.duration || 60;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    attempt = await PTETestAttempt.create({
      student: studentId,
      test: id,
      answers: [],
      startedAt: new Date(),
      expiresAt,
      status: "In Progress",
      totalMarks: test.totalMarks || 90,
    });

    return res.status(201).json({
      success: true,
      message: "PTE test attempt started successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error("Start PTE Test Attempt Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to start PTE test attempt.",
    });
  }
};

// ======================================================
// SAVE PTE TEST ANSWERS
// PATCH /api/v1/pte/tests/:id/attempt/:attemptId/answers
// ======================================================
const savePTETestAnswers = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    let { answers = [] } = req.body;

    if (answers && !Array.isArray(answers) && typeof answers === "object") {
      answers = Object.entries(answers).map(([question, answer]) => ({
        question,
        answer: typeof answer === "string" ? answer : JSON.stringify(answer || ""),
      }));
    }

    const attempt = await PTETestAttempt.findOne({
      _id: attemptId,
      test: id,
      student: req.user._id,
      status: "In Progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test attempt not found or is no longer active.",
      });
    }

    const formattedAnswers = (Array.isArray(answers) ? answers : [])
      .filter((item) => item && item.question)
      .map((item) => ({
        question: typeof item.question === "object" ? (item.question._id || item.question.id) : item.question,
        answer: item.answer !== undefined && item.answer !== null ? String(item.answer) : "",
        audioUrl: item.audioUrl || "",
      }));

    attempt.answers = formattedAnswers;
    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "PTE test answers saved successfully.",
      data: {
        attemptId: attempt._id,
        answers: attempt.answers,
      },
    });
  } catch (error) {
    console.error("Save PTE Test Answers Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save PTE test answers.",
    });
  }
};

// ======================================================
// SUBMIT PTE TEST ATTEMPT
// POST /api/v1/pte/tests/:id/attempt/:attemptId/submit
// ======================================================
const submitPTETestAttempt = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    let { answers = [] } = req.body;

    const attempt = await PTETestAttempt.findOne({
      _id: attemptId,
      test: id,
      student: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test attempt not found.",
      });
    }

    if (attempt.status === "Submitted" || attempt.status === "Evaluated") {
      return res.status(400).json({
        success: false,
        message: "This PTE test attempt has already been submitted.",
      });
    }

    const test = await PTEPracticeTest.findById(id).populate("questions");
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "PTE practice test not found.",
      });
    }

    if (answers && !Array.isArray(answers) && typeof answers === "object") {
      answers = Object.entries(answers).map(([question, answer]) => ({
        question,
        answer: typeof answer === "string" ? answer : JSON.stringify(answer || ""),
      }));
    }

    const formattedAnswers = (Array.isArray(answers) ? answers : [])
      .filter((item) => item && item.question)
      .map((item) => ({
        question: typeof item.question === "object" ? (item.question._id || item.question.id) : item.question,
        answer: item.answer !== undefined && item.answer !== null ? String(item.answer) : "",
        audioUrl: item.audioUrl || "",
      }));

    attempt.answers = formattedAnswers.length > 0 ? formattedAnswers : attempt.answers;

    // Automatic scoring for objective questions
    const questionMap = new Map();
    (test.questions || []).forEach((q) => questionMap.set(String(q._id), q));

    let score = 0;
    let totalMarks = Number(test.totalMarks) || (test.questions?.length || 1) * 1;
    let correctCount = 0;

    attempt.answers.forEach((ans) => {
      const q = questionMap.get(String(ans.question));
      if (!q) return;

      const qMarks = Number(q.marks) || 1;
      const studentAns = (ans.answer || "").trim().toLowerCase();
      const correctAns = (q.correctAnswer || "").trim().toLowerCase();

      if (studentAns && correctAns && studentAns === correctAns) {
        score += qMarks;
        correctCount++;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const overallScore = Math.min(90, Math.max(10, Math.round(10 + (percentage / 100) * 80)));

    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.percentage = percentage;
    attempt.overallScore = overallScore;
    attempt.status = "Evaluated";
    attempt.submittedAt = new Date();

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "PTE practice test submitted successfully.",
      data: {
        attempt,
        score,
        percentage,
        overallScore,
      },
    });
  } catch (error) {
    console.error("Submit PTE Test Attempt Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit PTE test attempt.",
    });
  }
};

// ======================================================
// GET PTE TEST RESULT
// GET /api/v1/pte/tests/:id/attempt/:attemptId/result
// ======================================================
const getPTETestResult = async (req, res) => {
  try {
    const { id, attemptId } = req.params;

    const attempt = await PTETestAttempt.findOne({
      _id: attemptId,
      test: id,
      student: req.user._id,
    }).populate({
      path: "test",
      select: "title section difficulty totalMarks duration questions",
      populate: {
        path: "questions",
        select: "questionText questionType options correctAnswer explanation marks audioUrl imageUrl",
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test result not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error("Get PTE Test Result Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load PTE test result.",
    });
  }
};

// ======================================================
// GET STUDENT PREVIOUS PTE ATTEMPTS
// GET /api/v1/pte/tests/attempts/history
// ======================================================
const getStudentPreviousAttempts = async (req, res) => {
  try {
    const attempts = await PTETestAttempt.find({
      student: req.user._id,
      status: { $in: ["Submitted", "Evaluated"] },
    })
      .populate("test", "title section difficulty totalMarks duration")
      .sort({ submittedAt: -1 });

    const formattedAttempts = attempts.map((attempt) => {
      const obj = attempt.toObject ? attempt.toObject() : { ...attempt };
      const scoreToUse = obj.overallScore ?? obj.speakingScore ?? obj.writingScore;
      let finalScore = Number(obj.score) || 0;
      let finalPercentage = Number(obj.percentage) || 0;

      if (obj.status === "Evaluated" && scoreToUse !== null && scoreToUse !== undefined && scoreToUse > 0) {
        if (finalScore === 0 && obj.totalMarks > 0) {
          finalScore = Math.max(1, Math.round((scoreToUse / 90) * obj.totalMarks));
        }
        if (finalPercentage === 0) {
          finalPercentage = Math.min(100, Math.round((scoreToUse / 90) * 100));
        }
      }

      return {
        ...obj,
        score: finalScore,
        percentage: finalPercentage,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedAttempts.length,
      data: formattedAttempts,
    });
  } catch (error) {
    console.error("Get PTE Previous Attempts Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load previous PTE attempts.",
    });
  }
};

// ======================================================
// TEACHER / ADMIN: Get PTE Attempts For Review / Grading
// GET /api/v1/pte/tests/attempts/review-list
// ======================================================

const getPTETestAttemptsForReview = async (req, res) => {
  try {
    const { status, section, search } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    } else if (!status) {
      filter.status = { $in: ["Submitted", "Evaluated"] };
    }

    const attempts = await PTETestAttempt.find(filter)
      .populate("student", "name email phone profilePicture")
      .populate("test", "title section duration totalMarks difficulty")
      .populate("evaluatedBy", "name email")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    let filtered = attempts.filter((att) => att.test != null);

    if (section && section !== "all") {
      filtered = filtered.filter(
        (att) => att.test && att.test.section?.toLowerCase() === section.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (att) =>
          att.student?.name?.toLowerCase().includes(q) ||
          att.student?.email?.toLowerCase().includes(q) ||
          att.test?.title?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error("Get PTE Test Attempts For Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load PTE attempts for review.",
    });
  }
};

// ======================================================
// TEACHER / ADMIN: Get Detailed PTE Attempt for Evaluation
// GET /api/v1/pte/tests/attempts/:attemptId/review
// ======================================================

const getPTETestAttemptForReview = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await PTETestAttempt.findById(attemptId)
      .populate("student", "name email phone profilePicture")
      .populate({
        path: "test",
        populate: {
          path: "questions",
        },
      })
      .populate("evaluatedBy", "name email");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test attempt not found.",
      });
    }

    const test = attempt.test;
    const questionsList = test && Array.isArray(test.questions) ? test.questions : [];

    const detailedAnswers = questionsList.map((q) => {
      const studentAnsObj = attempt.answers.find(
        (ans) => ans.question && ans.question.toString() === q._id.toString()
      );

      return {
        questionId: q._id,
        questionText: q.questionText || "",
        questionType: q.questionType || "",
        section: q.section || test?.section || "",
        passage: q.passage || "",
        options: q.options || [],
        marks: q.marks || 1,
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "",
        studentAnswer: studentAnsObj ? studentAnsObj.answer : "",
        studentAudioUrl: studentAnsObj ? studentAnsObj.audioUrl : "",
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        student: attempt.student,
        test: {
          _id: test?._id,
          title: test?.title,
          section: test?.section,
          duration: test?.duration,
          totalMarks: test?.totalMarks,
          difficulty: test?.difficulty,
        },
        status: attempt.status,
        manualReviewRequired: attempt.manualReviewRequired,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        overallScore: attempt.overallScore,
        speakingScore: attempt.speakingScore,
        writingScore: attempt.writingScore,
        readingScore: attempt.readingScore,
        listeningScore: attempt.listeningScore,
        feedback: attempt.feedback,
        evaluatedBy: attempt.evaluatedBy,
        evaluatedAt: attempt.evaluatedAt,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        unanswered: attempt.unanswered,
        answers: detailedAnswers,
      },
    });
  } catch (error) {
    console.error("Get PTE Test Attempt Details For Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load PTE attempt details for evaluation.",
    });
  }
};

// ======================================================
// TEACHER / ADMIN: Evaluate & Award Marks on PTE Attempt
// POST /api/v1/pte/tests/attempts/:attemptId/evaluate
// ======================================================

const evaluatePTETestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const {
      overallScore,
      speakingScore,
      writingScore,
      readingScore,
      listeningScore,
      score,
      feedback,
      status = "Evaluated",
    } = req.body;

    const attempt = await PTETestAttempt.findById(attemptId).populate("test");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test attempt not found.",
      });
    }

    const testSection = attempt.test?.section || "";

    attempt.status = status;
    attempt.manualReviewRequired = false;
    attempt.evaluatedBy = req.user._id;
    attempt.evaluatedAt = new Date();

    if (speakingScore !== undefined && speakingScore !== null && speakingScore !== "") {
      attempt.speakingScore = Number(speakingScore);
    } else if (testSection === "Speaking" && overallScore !== undefined) {
      attempt.speakingScore = Number(overallScore);
    }

    if (writingScore !== undefined && writingScore !== null && writingScore !== "") {
      attempt.writingScore = Number(writingScore);
    } else if (testSection === "Writing" && overallScore !== undefined) {
      attempt.writingScore = Number(overallScore);
    }

    if (readingScore !== undefined && readingScore !== null && readingScore !== "") {
      attempt.readingScore = Number(readingScore);
    } else if (testSection === "Reading" && overallScore !== undefined) {
      attempt.readingScore = Number(overallScore);
    }

    if (listeningScore !== undefined && listeningScore !== null && listeningScore !== "") {
      attempt.listeningScore = Number(listeningScore);
    } else if (testSection === "Listening" && overallScore !== undefined) {
      attempt.listeningScore = Number(overallScore);
    }

    if (overallScore !== undefined && overallScore !== null && overallScore !== "") {
      attempt.overallScore = Number(overallScore);
    } else {
      const activeScores = [
        attempt.speakingScore,
        attempt.writingScore,
        attempt.readingScore,
        attempt.listeningScore,
      ].filter((s) => typeof s === "number" && !isNaN(s));

      if (activeScores.length > 0) {
        const sum = activeScores.reduce((a, b) => a + b, 0);
        attempt.overallScore = Math.round(sum / activeScores.length);
      }
    }

    if (feedback !== undefined) {
      attempt.feedback = feedback;
    }

    const scoreToUse = attempt.overallScore ?? attempt.speakingScore ?? attempt.writingScore;

    if (score !== undefined && score !== null && score !== "" && !isNaN(Number(score)) && Number(score) >= 0) {
      attempt.score = Number(score);
      if (attempt.totalMarks > 0) {
        attempt.percentage = Math.min(100, Math.round((Number(score) / attempt.totalMarks) * 100));
      } else if (scoreToUse) {
        attempt.percentage = Math.min(100, Math.round((scoreToUse / 90) * 100));
      }
    } else if (scoreToUse !== null && scoreToUse !== undefined) {
      if (attempt.totalMarks > 0) {
        attempt.score = Math.round((scoreToUse / 90) * attempt.totalMarks);
        if (scoreToUse >= 40 && attempt.score === 0) {
          attempt.score = 1;
        }
      }
      attempt.percentage = Math.min(100, Math.round((scoreToUse / 90) * 100));
    }

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "PTE test attempt successfully evaluated.",
      data: {
        attemptId: attempt._id,
        status: attempt.status,
        overallScore: attempt.overallScore,
        speakingScore: attempt.speakingScore,
        writingScore: attempt.writingScore,
        readingScore: attempt.readingScore,
        listeningScore: attempt.listeningScore,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        feedback: attempt.feedback,
      },
    });
  } catch (error) {
    console.error("Evaluate PTE Test Attempt Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to evaluate PTE test attempt.",
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
  startPTETestAttempt,
  savePTETestAnswers,
  submitPTETestAttempt,
  getPTETestResult,
  getStudentPreviousAttempts,
  getPTETestAttemptsForReview,
  getPTETestAttemptForReview,
  evaluatePTETestAttempt,
};