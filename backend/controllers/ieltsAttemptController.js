const IELTSAttempt = require("../models/IELTSAttempt");
const IELTSTest = require("../models/IELTSTest");

// ==========================================
// Convert Score to IELTS Band
// ==========================================

const calculateBand = (score, totalMarks) => {
  if (!totalMarks || totalMarks <= 0) {
    return 0;
  }

  const percentage = (score / totalMarks) * 100;

  if (percentage >= 95) return 9;
  if (percentage >= 90) return 8.5;
  if (percentage >= 85) return 8;
  if (percentage >= 80) return 7.5;
  if (percentage >= 75) return 7;
  if (percentage >= 70) return 6.5;
  if (percentage >= 65) return 6;
  if (percentage >= 60) return 5.5;
  if (percentage >= 55) return 5;
  if (percentage >= 50) return 4.5;
  if (percentage >= 40) return 4;
  if (percentage >= 30) return 3.5;
  if (percentage >= 20) return 3;
  if (percentage >= 10) return 2;
  return 1;
};

// ==========================================
// Start Test
// ==========================================

exports.startTest = async (req, res) => {
  try {
    const { testId, batchId } = req.body;

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "Test ID is required.",
      });
    }

    const test = await IELTSTest.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "IELTS test not found.",
      });
    }

    if (test.status !== "Published") {
      return res.status(400).json({
        success: false,
        message: "This test is not available.",
      });
    }

    // ==========================================
    // Check Existing Attempt
    // ==========================================

    const existingAttempt = await IELTSAttempt.findOne({
      student: req.user._id,
      test: testId,
      status: "In Progress",
    });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        message: "Existing test attempt found.",
        data: existingAttempt,
      });
    }

    // ==========================================
    // Create Attempt
    // ==========================================

    const attempt = await IELTSAttempt.create({
      student: req.user._id,
      test: testId,
      batch: batchId || null,
      totalMarks: test.totalMarks,
      answers: [],
      status: "In Progress",
    });

    return res.status(201).json({
      success: true,
      message: "IELTS test started.",
      data: attempt,
    });
  } catch (error) {
    console.error("Start IELTS Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Submit Test
// ==========================================

exports.submitTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const attempt = await IELTSAttempt.findById(id)
      .populate({
        path: "test",
        populate: {
          path: "questions",
        },
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found.",
      });
    }

    if (
      attempt.student.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only submit your own attempt.",
      });
    }

    if (attempt.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "This test has already been submitted.",
      });
    }

    let totalScore = 0;

    const evaluatedAnswers = [];

    // ==========================================
    // Evaluate Answers
    // ==========================================

    for (const question of attempt.test.questions) {
      const submittedAnswer =
        answers?.find(
          (item) =>
            item.questionId.toString() ===
            question._id.toString()
        );

      const answer =
        submittedAnswer?.answer || "";

      const isCorrect =
        answer.trim().toLowerCase() ===
        question.correctAnswer
          .trim()
          .toLowerCase();

      const marksObtained = isCorrect
        ? question.marks
        : 0;

      totalScore += marksObtained;

      evaluatedAnswers.push({
        question: question._id,
        answer,
        isCorrect,
        marksObtained,
      });
    }

    // ==========================================
    // Calculate Band
    // ==========================================

    const band = calculateBand(
      totalScore,
      attempt.test.totalMarks
    );

    attempt.answers = evaluatedAnswers;
    attempt.score = totalScore;
    attempt.totalMarks = attempt.test.totalMarks;
    attempt.band = band;
    attempt.status = "Evaluated";
    attempt.submittedAt = new Date();

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "IELTS test submitted successfully.",
      data: {
        attemptId: attempt._id,
        score: totalScore,
        totalMarks: attempt.test.totalMarks,
        band,
        status: attempt.status,
      },
    });
  } catch (error) {
    console.error("Submit IELTS Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get My Attempts
// ==========================================

exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await IELTSAttempt.find({
      student: req.user._id,
    })
      .populate("test", "title section testType")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    console.error("Get My IELTS Attempts Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Attempt By ID
// ==========================================

exports.getAttemptById = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await IELTSAttempt.findById(id)
      .populate("test")
      .populate("student", "name email");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS attempt not found.",
      });
    }

    if (
      req.user.role === "student" &&
      attempt.student._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own attempts.",
      });
    }

    return res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error("Get IELTS Attempt Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};