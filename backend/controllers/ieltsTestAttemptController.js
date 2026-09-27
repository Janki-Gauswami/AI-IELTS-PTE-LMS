const mongoose = require("mongoose");

const IELTSTestAttempt = require("../models/IELTSTestAttempt");
const IELTSPracticeTest = require("../models/IELTSPracticeTest");

/**
 * ============================================================
 * START IELTS TEST ATTEMPT
 * ============================================================
 */

const startIELTSTestAttempt = async (req, res) => {
  try {
    const { testId } = req.body;

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "Test ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IELTS test ID.",
      });
    }

    const test = await IELTSPracticeTest.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "IELTS practice test not found.",
      });
    }

    if (test.status !== "Published") {
      return res.status(400).json({
        success: false,
        message: "This IELTS test is not published.",
      });
    }

    const existingAttempt =
      await IELTSTestAttempt.findOne({
        student: req.user._id,
        test: testId,
        status: "In Progress",
      }).sort({
        createdAt: -1,
      });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        message: "Existing attempt resumed.",
        data: existingAttempt,
      });
    }

    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt.getTime() +
        Number(test.duration || 1) * 60 * 1000
    );

    const attempt =
      await IELTSTestAttempt.create({
        student: req.user._id,
        test: testId,
        answers: [],
        status: "In Progress",
        startedAt,
        expiresAt,
        totalMarks: Number(test.totalMarks || 0),
      });

    return res.status(201).json({
      success: true,
      message: "IELTS test attempt started successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(
      "Start IELTS Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to start IELTS test attempt.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * ============================================================
 * SAVE IELTS ANSWERS
 * ============================================================
 */

const saveIELTSAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be provided as an array.",
      });
    }

    const attempt =
      await IELTSTestAttempt.findOne({
        _id: attemptId,
        student: req.user._id,
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS attempt not found.",
      });
    }

    if (attempt.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "This attempt is no longer active.",
      });
    }

    /**
     * Replace the stored answers with
     * the latest complete answer array.
     */
    attempt.answers = answers.map((item) => ({
      question: item.question,
      answer:
        item.answer === null ||
        item.answer === undefined
          ? ""
          : String(item.answer).trim(),
      audioUrl:
        item.audioUrl === null ||
        item.audioUrl === undefined
          ? ""
          : String(item.audioUrl).trim(),
    }));

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "IELTS answers saved successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(
      "Save IELTS Answers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save IELTS answers.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * ============================================================
 * SUBMIT IELTS TEST
 * ============================================================
 */

const submitIELTSTestAttempt = async (
  req,
  res
) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    if (
      answers !== undefined &&
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: "Answers must be provided as an array.",
      });
    }

    const attempt =
      await IELTSTestAttempt.findOne({
        _id: attemptId,
        student: req.user._id,
      }).populate({
        path: "test",
        populate: {
          path: "questions",
          model: "IELTSQuestion",
        },
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS attempt not found.",
      });
    }

    if (attempt.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "This IELTS test has already been submitted.",
      });
    }

    /**
     * If answers are sent during submit,
     * save them first.
     */
    if (Array.isArray(answers)) {
      attempt.answers = answers.map(
        (item) => ({
          question: item.question,
          answer:
            item.answer === null ||
            item.answer === undefined
              ? ""
              : String(item.answer).trim(),
          audioUrl:
            item.audioUrl === null ||
            item.audioUrl === undefined
              ? ""
              : String(item.audioUrl).trim(),
        })
      );
    }

    const questionList =
      attempt.test?.questions || [];

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    const answerMap = new Map();

    attempt.answers.forEach((item) => {
      if (!item.question) return;

      answerMap.set(
        String(item.question),
        {
          answer: item.answer || "",
          audioUrl: item.audioUrl || "",
        }
      );
    });

    const evaluatedAnswers =
      questionList.map((question) => {
        const questionId =
          String(question._id);

        const ansData =
          answerMap.get(questionId) || { answer: "", audioUrl: "" };
        const studentAnswer = ansData.answer;
        const studentAudio = ansData.audioUrl;

        const correctAnswer =
          question.correctAnswer ??
          question.answer ??
          question.correctOption ??
          "";

        const normalizedStudent =
          String(studentAnswer)
            .trim()
            .toLowerCase();

        const normalizedCorrect =
          String(correctAnswer)
            .trim()
            .toLowerCase();

        const isUnanswered =
          normalizedStudent === "" &&
          (!studentAudio || String(studentAudio).trim() === "");

        const isCorrect =
          !isUnanswered &&
          normalizedCorrect !== "" &&
          normalizedStudent ===
            normalizedCorrect;

        const marks =
          Number(question.marks || 1);

        if (isUnanswered) {
          unanswered += 1;
        } else if (isCorrect) {
          correctAnswers += 1;
          score += marks;
        } else {
          incorrectAnswers += 1;
        }

        return {
          question: question._id,
          answer: studentAnswer,
          audioUrl: studentAudio,
        };
      });

    attempt.answers = evaluatedAnswers;

    const totalMarks =
      Number(attempt.test?.totalMarks || 0) ||
      questionList.reduce(
        (total, question) =>
          total +
          Number(question.marks || 1),
        0
      );

    const percentage =
      totalMarks > 0
        ? (score / totalMarks) * 100
        : 0;

    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.percentage = Number(
      percentage.toFixed(2)
    );

    attempt.correctAnswers =
      correctAnswers;

    attempt.incorrectAnswers =
      incorrectAnswers;

    attempt.unanswered =
      unanswered;

    attempt.status = "Evaluated";
    attempt.submittedAt = new Date();

    /**
     * Reading/listening band can be calculated
     * from objective score.
     *
     * Keep existing writing/speaking teacher
     * evaluations untouched.
     */
    if (
      attempt.test?.section === "Reading"
    ) {
      attempt.readingBand =
        calculateIELTSBand(
          score,
          totalMarks
        );
    }

    if (
      attempt.test?.section === "Listening"
    ) {
      attempt.listeningBand =
        calculateIELTSBand(
          score,
          totalMarks
        );
    }

    /**
     * Overall band:
     *
     * For single-section practice tests,
     * use the evaluated section band.
     *
     * Full/mock multi-section evaluation can
     * update overallBand separately.
     */
    if (
      attempt.test?.section === "Reading"
    ) {
      attempt.overallBand =
        attempt.readingBand;
    }

    if (
      attempt.test?.section === "Listening"
    ) {
      attempt.overallBand =
        attempt.listeningBand;
    }

    await attempt.save();

    /**
     * Set manualReviewRequired for Speaking/Writing tests
     */
    if (
      attempt.test?.section === "Speaking" ||
      attempt.test?.section === "Writing"
    ) {
      attempt.manualReviewRequired = true;
      await attempt.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "IELTS test submitted successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(
      "Submit IELTS Test Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit IELTS test.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * ============================================================
 * GET IELTS ATTEMPT BY ID
 * ============================================================
 */

const getIELTSTestAttemptById = async (
  req,
  res
) => {
  try {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    const attempt =
      await IELTSTestAttempt.findOne({
        _id: attemptId,
        student: req.user._id,
      })
        .populate({
          path: "test",
          select:
            "title section description duration totalMarks difficulty",
        })
        .populate({
          path: "student",
          select: "name email",
        });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS attempt not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error(
      "Get IELTS Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load IELTS attempt.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * ============================================================
 * GET STUDENT PREVIOUS IELTS ATTEMPTS
 * ============================================================
 */

const getStudentPreviousIELTSAttempts =
  async (req, res) => {
    try {
      const attempts =
        await IELTSTestAttempt.find({
          student: req.user._id,
        })
          .populate({
            path: "test",
            select:
              "title section duration totalMarks difficulty",
          })
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        data: attempts,
      });
    } catch (error) {
      console.error(
        "Get Previous IELTS Attempts Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load previous IELTS attempts.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

/**
 * ============================================================
 * IELTS BAND CALCULATOR
 * ============================================================
 *
 * This is an approximate practice-test conversion.
 * It is NOT an official IELTS conversion table.
 *
 * For your LMS, this provides a real score-derived
 * band instead of fake hardcoded data.
 * ============================================================
 */

const calculateIELTSBand = (
  score,
  totalMarks
) => {
  const marks = Number(score || 0);
  const total = Number(totalMarks || 0);

  if (total <= 0) {
    return null;
  }

  const percentage =
    (marks / total) * 100;

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
  if (percentage >= 45) return 4;
  if (percentage >= 40) return 3.5;
  if (percentage >= 35) return 3;
  if (percentage >= 30) return 2.5;
  if (percentage >= 25) return 2;
  if (percentage >= 20) return 1.5;
  if (percentage > 0) return 1;

  return 0;
};

module.exports = {
  startIELTSTestAttempt,
  saveIELTSAnswers,
  submitIELTSTestAttempt,
  getIELTSTestAttemptById,
  getStudentPreviousIELTSAttempts,
};