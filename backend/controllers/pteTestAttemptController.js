const PTETestAttempt = require("../models/PTETestAttempt");
const PTEPracticeTest = require("../models/PTEPracticeTest");
const PTEQuestion = require("../models/PTEQuestion");

// ======================================================
// Helper: Normalize Answer
// ======================================================

const normalizeAnswer = (answer) => {
  if (answer === undefined || answer === null) {
    return "";
  }

  return String(answer).trim().toLowerCase();
};

const isAnswerCorrect = (studentAnswer, correctAnswer, question = null) => {
  const student = normalizeAnswer(studentAnswer);
  const correct = normalizeAnswer(correctAnswer);

  if (!student || !correct) {
    return false;
  }

  if (student === correct) {
    return true;
  }

  if (question && Array.isArray(question.options) && question.options.length > 0) {
    const matchedStudentOption = question.options.find(
      (opt) =>
        (opt.label && normalizeAnswer(opt.label) === student) ||
        (opt.text && normalizeAnswer(opt.text) === student)
    );

    const matchedCorrectOption = question.options.find(
      (opt) =>
        (opt.label && normalizeAnswer(opt.label) === correct) ||
        (opt.text && normalizeAnswer(opt.text) === correct)
    );

    if (matchedStudentOption && matchedCorrectOption) {
      if (
        normalizeAnswer(matchedStudentOption.label) === normalizeAnswer(matchedCorrectOption.label) ||
        normalizeAnswer(matchedStudentOption.text) === normalizeAnswer(matchedCorrectOption.text)
      ) {
        return true;
      }
    } else if (
      matchedStudentOption &&
      (normalizeAnswer(matchedStudentOption.label) === correct || normalizeAnswer(matchedStudentOption.text) === correct)
    ) {
      return true;
    } else if (
      matchedCorrectOption &&
      (normalizeAnswer(matchedCorrectOption.label) === student || normalizeAnswer(matchedCorrectOption.text) === student)
    ) {
      return true;
    }
  }

  return false;
};

// ======================================================
// Helper: Determine Manual Review
// ======================================================

const requiresManualReview = (question) => {
  return (
    question.section === "Speaking" ||
    question.section === "Writing"
  );
};

// ======================================================
// 11.1.2.4.1
// Start PTE Test Attempt
// POST /api/v1/pte/attempts/start
// Student Only
// ======================================================

exports.startPTETestAttempt = async (req, res) => {
  try {
    const { testId } = req.body;

    // ==================================================
    // Validate Test ID
    // ==================================================

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "Test ID is required.",
      });
    }

    // ==================================================
    // Load Test
    // ==================================================

    const test = await PTEPracticeTest.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "PTE practice test not found.",
      });
    }

    // ==================================================
    // Only Published Tests Can Be Attempted
    // ==================================================

    if (test.status !== "Published") {
      return res.status(400).json({
        success: false,
        message: "This PTE test is not available for students.",
      });
    }

    // ==================================================
    // Prevent Multiple Active Attempts
    // ==================================================

    const existingAttempt = await PTETestAttempt.findOne({
      student: req.user._id,
      test: testId,
      status: "In Progress",
    });

    if (existingAttempt) {
      // If previous attempt has expired
      if (
        existingAttempt.expiresAt &&
        new Date() >= existingAttempt.expiresAt
      ) {
        existingAttempt.status = "Submitted";
        existingAttempt.submittedAt = new Date();

        await existingAttempt.save();
      } else {
        return res.status(200).json({
          success: true,
          message: "You already have an active attempt.",
          data: existingAttempt,
        });
      }
    }

    // ==================================================
    // Timing
    // ==================================================

    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt.getTime() + test.duration * 60 * 1000
    );

    // ==================================================
    // Create Attempt
    // ==================================================

    const attempt = await PTETestAttempt.create({
      student: req.user._id,
      test: test._id,
      batch: null,
      answers: [],
      status: "In Progress",
      startedAt,
      expiresAt,
      totalMarks: test.totalMarks || 0,
      score: 0,
      percentage: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unanswered: 0,
      manualReviewRequired: false,
    });

    return res.status(201).json({
      success: true,
      message: "PTE test attempt started successfully.",
      data: {
        attemptId: attempt._id,
        studentId: attempt.student,
        testId: attempt.test,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        status: attempt.status,
      },
    });
  } catch (error) {
    console.error(
      "Start PTE Test Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to start PTE test attempt.",
    });
  }
};

// ======================================================
// 11.1.2.4.7
// Save / Upsert PTE Answer
// PATCH /api/v1/pte/attempts/:attemptId/answers
// Student Only
// ======================================================

exports.savePTEAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const {
      questionId,
      answer,
      audioUrl,
    } = req.body;

    // ==================================================
    // Validate Input
    // ==================================================

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required.",
      });
    }

    // ==================================================
    // Find Attempt
    // ==================================================

    const attempt = await PTETestAttempt.findById(
      attemptId
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test attempt not found.",
      });
    }

    // ==================================================
    // Student Ownership
    // ==================================================

    if (
      attempt.student.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this attempt.",
      });
    }

    // ==================================================
    // Attempt Status
    // ==================================================

    if (attempt.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "This test attempt is no longer active.",
      });
    }

    // ==================================================
    // Check Expiration
    // ==================================================

    if (
      attempt.expiresAt &&
      new Date() >= attempt.expiresAt
    ) {
      attempt.status = "Submitted";
      attempt.submittedAt = new Date();

      await attempt.save();

      return res.status(400).json({
        success: false,
        message: "The test time has expired.",
      });
    }

    // ==================================================
    // Check Question
    // ==================================================

    const question = await PTEQuestion.findById(
      questionId
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "PTE question not found.",
      });
    }

    // ==================================================
    // Check Question Belongs To Test
    // ==================================================

    const questionBelongsToTest =
      await PTEPracticeTest.exists({
        _id: attempt.test,
        questions: questionId,
      });

    if (!questionBelongsToTest) {
      return res.status(400).json({
        success: false,
        message:
          "This question does not belong to the current test.",
      });
    }

    // ==================================================
    // Upsert Answer
    // ==================================================

    const existingAnswerIndex =
      attempt.answers.findIndex(
        (item) =>
          item.question.toString() ===
          questionId.toString()
      );

    const answerData = {
      question: questionId,
      answer:
        answer !== undefined
          ? String(answer).trim()
          : "",
      audioUrl:
        audioUrl !== undefined
          ? String(audioUrl).trim()
          : "",
    };

    if (existingAnswerIndex !== -1) {
      // Update existing answer

      attempt.answers[existingAnswerIndex] =
        answerData;
    } else {
      // Create new answer

      attempt.answers.push(answerData);
    }

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully.",
      data: {
        attemptId: attempt._id,
        questionId,
        answer: answerData.answer,
        audioUrl: answerData.audioUrl,
      },
    });
  } catch (error) {
    console.error(
      "Save PTE Answer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save PTE answer.",
    });
  }
};

// ======================================================
// 11.1.2.4.8
// Submit PTE Test Attempt
// POST /api/v1/pte/attempts/:attemptId/submit
// Student Only
// ======================================================

exports.submitPTETestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // ==================================================
    // STEP 1 — Validate Attempt
    // ==================================================

    const attempt = await PTETestAttempt.findById(
      attemptId
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test attempt not found.",
      });
    }

    // ==================================================
    // Check Student Ownership
    // ==================================================

    if (
      attempt.student.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to submit this attempt.",
      });
    }

    // ==================================================
    // Prevent Duplicate Submission
    // ==================================================

    if (
      attempt.status === "Submitted" ||
      attempt.status === "Evaluated"
    ) {
      return res.status(400).json({
        success: false,
        message: "This test attempt has already been submitted.",
      });
    }

    // ==================================================
    // STEP 2 — Load Practice Test
    // ==================================================

    const test = await PTEPracticeTest.findById(
      attempt.test
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "PTE practice test not found.",
      });
    }

    // ==================================================
    // STEP 3 — Load Test Questions
    // ==================================================

    const questions = await PTEQuestion.find({
      _id: {
        $in: test.questions,
      },
    });

    if (!questions.length) {
      return res.status(400).json({
        success: false,
        message: "No questions found for this test.",
      });
    }

    // ==================================================
    // STEP 4 — Create Answer Map
    // ==================================================

    const answerMap = new Map();

    attempt.answers.forEach((item) => {
      answerMap.set(
        item.question.toString(),
        item
      );
    });

    // ==================================================
    // STEP 5 — Automatic Evaluation
    // ==================================================

    let score = 0;
    let totalMarks = 0;

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    let manualReviewRequired = false;

    // ==================================================
    // Evaluate Each Question
    // ==================================================

    for (const question of questions) {
      const marks = question.marks || 1;

      totalMarks += marks;

      const studentAnswer = answerMap.get(
        question._id.toString()
      );

      // ================================================
      // Manual Review Question
      // ================================================

      if (
        requiresManualReview(question)
      ) {
        manualReviewRequired = true;

        // Speaking/Writing are not automatically
        // scored by this controller.

        if (
          !studentAnswer ||
          (
            !studentAnswer.answer &&
            !studentAnswer.audioUrl
          )
        ) {
          unanswered++;
        }

        continue;
      }

      // ================================================
      // No Answer
      // ================================================

      if (
        !studentAnswer ||
        !studentAnswer.answer
      ) {
        unanswered++;
        continue;
      }

      // ================================================
      // Automatic Evaluation
      // ================================================

      const correct = isAnswerCorrect(
        studentAnswer.answer,
        question.correctAnswer,
        question
      );

      if (correct) {
        correctAnswers++;

        score += marks;
      } else {
        incorrectAnswers++;
      }
    }

    // ==================================================
    // STEP 6 — Calculate Percentage
    // ==================================================

    const percentage =
      totalMarks > 0
        ? Number(
            ((score / totalMarks) * 100).toFixed(2)
          )
        : 0;

    // ==================================================
    // STEP 7 — Determine Status
    // ==================================================

    /*
      If Speaking/Writing questions require
      manual evaluation, keep the attempt as
      Submitted.

      If everything can be automatically evaluated,
      mark it Evaluated.
    */

    const finalStatus =
      manualReviewRequired
        ? "Submitted"
        : "Evaluated";

    // ==================================================
    // STEP 8 — Update Attempt
    // ==================================================

    attempt.status = finalStatus;

    attempt.submittedAt = new Date();

    attempt.totalMarks = totalMarks;

    attempt.score = score;

    attempt.percentage = percentage;

    attempt.correctAnswers =
      correctAnswers;

    attempt.incorrectAnswers =
      incorrectAnswers;

    attempt.unanswered =
      unanswered;

    attempt.manualReviewRequired =
      manualReviewRequired;

    // ==================================================
    // STEP 9 — Save Attempt
    // ==================================================

    await attempt.save();

    // ==================================================
    // STEP 10 — Generate Result
    // ==================================================

    return res.status(200).json({
      success: true,

      message: manualReviewRequired
        ? "PTE test submitted successfully. Some questions require manual evaluation."
        : "PTE test submitted and evaluated successfully.",

      data: {
        attemptId: attempt._id,

        studentId: attempt.student,

        testId: attempt.test,

        status: attempt.status,

        startedAt: attempt.startedAt,

        submittedAt: attempt.submittedAt,

        totalMarks: attempt.totalMarks,

        score: attempt.score,

        percentage: attempt.percentage,

        correctAnswers:
          attempt.correctAnswers,

        incorrectAnswers:
          attempt.incorrectAnswers,

        unanswered:
          attempt.unanswered,

        manualReviewRequired:
          attempt.manualReviewRequired,

        overallScore:
          attempt.overallScore,

        listeningScore:
          attempt.listeningScore,

        readingScore:
          attempt.readingScore,

        speakingScore:
          attempt.speakingScore,

        writingScore:
          attempt.writingScore,
      },
    });
  } catch (error) {
    console.error(
      "Submit PTE Test Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit PTE test attempt.",
    });
  }
};

// ======================================================
// 11.1.2.4.9 — Student Result
// Get PTE Test Attempt / Result
//
// GET /api/v1/pte/attempts/:attemptId
//
// Student Only
// ======================================================

exports.getPTETestAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // ==================================================
    // Find Attempt
    // ==================================================

    const attempt = await PTETestAttempt.findById(attemptId)
      .populate(
        "test",
        "title section duration totalMarks"
      );

    // ==================================================
    // Attempt Not Found
    // ==================================================

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "PTE test attempt not found.",
      });
    }

    // ==================================================
    // Check Student Ownership
    // ==================================================

    if (
      attempt.student.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this result.",
      });
    }

    // ==================================================
    // Test Not Found
    // ==================================================

    if (!attempt.test) {
      return res.status(404).json({
        success: false,
        message:
          "PTE practice test associated with this attempt was not found.",
      });
    }

    // ==================================================
    // Convert Internal Status
    //
    // Database:
    // In Progress
    // Submitted
    // Evaluated
    //
    // Student Result:
    // in_progress
    // completed
    // completed
    // ==================================================

    let resultStatus = "in_progress";

    if (
      attempt.status === "Submitted" ||
      attempt.status === "Evaluated"
    ) {
      resultStatus = "completed";
    }

    // ==================================================
    // Return Comprehensive Student Result & Attempt Details
    // ==================================================

    const rawTest = await PTEPracticeTest.findById(attempt.test._id).populate("questions");
    const questionsList = rawTest ? rawTest.questions : [];

    const detailedAnswers = questionsList.map((q) => {
      const studentAnsObj = attempt.answers.find(
        (a) => a.question && a.question.toString() === q._id.toString()
      );
      const studentAnswer = studentAnsObj ? studentAnsObj.answer : "";
      const audioUrl = studentAnsObj ? studentAnsObj.audioUrl : "";
      const isCorrect = isAnswerCorrect(studentAnswer, q.correctAnswer);

      return {
        questionId: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        section: q.section,
        passage: q.passage,
        options: q.options,
        marks: q.marks || 1,
        studentAnswer,
        audioUrl,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
        manualEvaluationRequired: q.manualEvaluationRequired || false,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        _id: attempt._id,
        attemptId: attempt._id,
        testId: attempt.test._id,
        testName: attempt.test.title,
        testTitle: attempt.test.title,
        section: attempt.test.section,
        duration: attempt.test.duration,
        totalMarks: attempt.totalMarks || attempt.test.totalMarks || questionsList.length,
        score: attempt.score || 0,
        percentage: attempt.percentage || 0,
        overallScore: attempt.overallScore || Math.min(90, Math.max(10, Math.round(10 + ((attempt.score || 0) / (attempt.totalMarks || 1)) * 80))),
        listeningScore: attempt.listeningScore || 0,
        readingScore: attempt.readingScore || 0,
        speakingScore: attempt.speakingScore || 0,
        writingScore: attempt.writingScore || 0,
        correctAnswers: attempt.correctAnswers || 0,
        incorrectAnswers: attempt.incorrectAnswers || 0,
        unanswered: attempt.unanswered || 0,
        manualReviewRequired: attempt.manualReviewRequired || false,
        feedback: attempt.feedback || "",
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        submittedAt: attempt.submittedAt,
        status: resultStatus,
        answers: attempt.answers,
        detailedAnswers,
        questions: questionsList,
      },
    });
  } catch (error) {
    console.error(
      "Get PTE Student Result Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch PTE student result.",
    });
  }
};
// ======================================================
// 11.1.2.4.10 — Previous Attempts
//
// GET /api/v1/pte/attempts/my
//
// Student Only
// ======================================================

exports.getStudentPreviousPTEAttempts = async (
  req,
  res
) => {
  try {
    // ==================================================
    // Find Student's Attempts
    // ==================================================

    const attempts = await PTETestAttempt.find({
      student: req.user._id,
    })
      .populate(
        "test",
        "title section"
      )
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // Format Previous Attempts
    // ==================================================

    const previousAttempts = attempts.map(
      (attempt) => {
        // ----------------------------------------------
        // Convert Database Status
        // ----------------------------------------------

        let status = "in_progress";

        if (
          attempt.status === "Submitted" ||
          attempt.status === "Evaluated"
        ) {
          status = "completed";
        }

        // ----------------------------------------------
        // Return Required Fields
        // ----------------------------------------------

        return {
          _id: attempt._id,
          testId: attempt.test ? attempt.test._id : null,
          test: attempt.test
            ? attempt.test.title
            : "Unknown Test",

          section: attempt.test
            ? attempt.test.section
            : "",

          score: attempt.score,

          percentage: attempt.percentage,

          date: attempt.submittedAt
            ? attempt.submittedAt
            : attempt.createdAt,

          status,
        };
      }
    );

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,

      count: previousAttempts.length,

      data: previousAttempts,
    });
  } catch (error) {
    console.error(
      "Get Previous PTE Attempts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch previous PTE attempts.",
    });
  }
};