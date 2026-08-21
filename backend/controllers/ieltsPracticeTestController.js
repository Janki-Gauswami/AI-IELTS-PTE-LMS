const IELTSPracticeTest = require("../models/IELTSPracticeTest");
const IELTSQuestion = require("../models/IELTSQuestion");
const IELTSTestAttempt = require("../models/IELTSTestAttempt");


// ======================================================
// Helper: Normalize Answer
// ======================================================

const normalizeAnswer = (answer) => {
  if (
    answer === undefined ||
    answer === null
  ) {
    return "";
  }

  return String(answer)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};


// ======================================================
// IELTS Listening Band Conversion
// Raw Score: 0 - 40
// ======================================================

const calculateListeningBand = (rawScore) => {
  const score = Number(rawScore) || 0;

  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score === 3) return 2.0;
  if (score === 2) return 1.5;
  if (score === 1) return 1.0;

  return 0;
};


// ======================================================
// IELTS Reading Band Conversion
// Raw Score: 0 - 40
// ======================================================

const calculateReadingBand = (rawScore) => {
  const score = Number(rawScore) || 0;

  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score === 3) return 2.0;
  if (score === 2) return 1.5;
  if (score === 1) return 1.0;

  return 0;
};


// ======================================================
// IELTS Overall Band Calculation
// ======================================================

const calculateOverallBand = (
  listeningBand,
  readingBand,
  writingBand,
  speakingBand
) => {

  const bands = [
    listeningBand,
    readingBand,
    writingBand,
    speakingBand,
  ];

  // All four section bands are required
  if (
    bands.some(
      (band) =>
        band === null ||
        band === undefined
    )
  ) {
    return null;
  }

  const total =
    bands.reduce(
      (sum, band) =>
        sum + Number(band),
      0
    );

  const average =
    total / 4;

  const decimal =
    average -
    Math.floor(average);

  let overallBand;

  if (decimal < 0.25) {

    overallBand =
      Math.floor(average);

  } else if (decimal < 0.75) {

    overallBand =
      Math.floor(average) + 0.5;

  } else {

    overallBand =
      Math.ceil(average);

  }

  return Math.min(
    9,
    overallBand
  );
};


// ======================================================
// Calculate Objective Raw Score
// Used for Listening + Reading
// ======================================================

const calculateObjectiveRawScore = (
  questions,
  submittedAnswers
) => {

  let score = 0;

  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;

  // ====================================================
  // Create Submitted Answer Lookup
  // ====================================================

  const answerMap = new Map();

  submittedAnswers.forEach(
    (item) => {

      if (
        item &&
        item.question
      ) {

        answerMap.set(
          String(item.question),
          item.answer
        );

      }

    }
  );


  // ====================================================
  // Evaluate Questions
  // ====================================================

  questions.forEach(
    (question) => {

      const questionId =
        String(question._id);

      const submittedAnswer =
        answerMap.get(
          questionId
        );

      const userAnswer =
        normalizeAnswer(
          submittedAnswer
        );

      const correctAnswer =
        normalizeAnswer(
          question.correctAnswer
        );


      // ==================================================
      // Unanswered
      // ==================================================

      if (!userAnswer) {

        unanswered++;

        return;
      }


      // ==================================================
      // Correct
      // ==================================================

      if (
        userAnswer ===
        correctAnswer
      ) {

        correctAnswers++;

        score +=
          Number(
            question.marks
          ) || 1;

        return;
      }


      // ==================================================
      // Incorrect
      // ==================================================

      incorrectAnswers++;

    }
  );


  // ====================================================
  // Total Marks
  // ====================================================

  const totalMarks =
    questions.reduce(
      (
        total,
        question
      ) =>
        total +
        (
          Number(
            question.marks
          ) || 1
        ),
      0
    );


  // ====================================================
  // Percentage
  // ====================================================

  const percentage =
    totalMarks > 0
      ? Number(
          (
            (score / totalMarks) *
            100
          ).toFixed(2)
        )
      : 0;


  // ====================================================
  // Return
  // ====================================================

  return {

    score,

    totalMarks,

    percentage,

    correctAnswers,

    incorrectAnswers,

    unanswered,

  };

};


// ======================================================
// Create IELTS Practice Test
// ======================================================

exports.createPracticeTest = async (
  req,
  res
) => {

  try {

    const {
      title,
      section,
      description,
      instructions,
      duration,
      totalMarks,
      difficulty,
      questions,
    } = req.body;


    // ==================================================
    // Required Fields
    // ==================================================

    if (
      !title ||
      !section ||
      !duration
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Title, section and duration are required.",
      });

    }


    // ==================================================
    // Validate Questions
    // ==================================================

    if (
      questions &&
      questions.length > 0
    ) {

      const existingQuestions =
        await IELTSQuestion.find({
          _id: {
            $in: questions,
          },
        }).select("_id");


      if (
        existingQuestions.length !==
        questions.length
      ) {

        return res.status(400).json({
          success: false,
          message:
            "One or more IELTS questions are invalid.",
        });

      }

    }


    // ==================================================
    // Create Test
    // ==================================================

    const practiceTest =
      await IELTSPracticeTest.create({

        title,

        section,

        description,

        instructions,

        duration,

        totalMarks:
          totalMarks || 0,

        difficulty:
          difficulty || "Medium",

        questions:
          questions || [],

        status:
          "Draft",

        createdBy:
          req.user._id,

      });


    // ==================================================
    // Response
    // ==================================================

    return res.status(201).json({

      success: true,

      message:
        "IELTS practice test created successfully.",

      data:
        practiceTest,

    });

  } catch (error) {

    console.error(
      "Create IELTS Practice Test Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};


// ======================================================
// Get All IELTS Practice Tests
// ======================================================

exports.getAllPracticeTests = async (
  req,
  res
) => {

  try {

    const {
      section,
      difficulty,
      status,
      search,
    } = req.query;


    const filter = {};


    // ==================================================
    // Section Filter
    // ==================================================

    if (section) {

      filter.section =
        section;

    }


    // ==================================================
    // Difficulty Filter
    // ==================================================

    if (difficulty) {

      filter.difficulty =
        difficulty;

    }


    // ==================================================
    // Status Filter
    // ==================================================

    if (status) {

      filter.status =
        status;

    }


    // ==================================================
    // Search
    // ==================================================

    if (search) {

      filter.title = {

        $regex:
          search,

        $options:
          "i",

      };

    }


    // ==================================================
    // Fetch Tests
    // ==================================================

    const tests =
      await IELTSPracticeTest.find(
        filter
      )

        .populate(
          "questions",
          "section questionType questionText options marks"
        )

        .populate(
          "createdBy",
          "name email"
        )

        .sort({
          createdAt:
            -1,
        });


    return res.status(200).json({

      success:
        true,

      count:
        tests.length,

      data:
        tests,

    });

  } catch (error) {

    console.error(
      "Get IELTS Practice Tests Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        "Unable to fetch IELTS practice tests.",

    });

  }

};


// ======================================================
// Get Practice Test By ID
// ======================================================

exports.getPracticeTestById = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const test =
      await IELTSPracticeTest.findById(
        id
      )

        .populate(
          "questions",
          "section questionType questionText passage options correctAnswer explanation marks difficulty"
        )

        .populate(
          "createdBy",
          "name email"
        );


    if (!test) {

      return res.status(404).json({

        success:
          false,

        message:
          "IELTS practice test not found.",

      });

    }


    return res.status(200).json({

      success:
        true,

      data:
        test,

    });

  } catch (error) {

    console.error(
      "Get IELTS Practice Test Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        error.message,

    });

  }

};


// ======================================================
// Update Practice Test
// ======================================================

exports.updatePracticeTest = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const test =
      await IELTSPracticeTest.findById(
        id
      );


    if (!test) {

      return res.status(404).json({

        success:
          false,

        message:
          "IELTS practice test not found.",

      });

    }


    const fields = [

      "title",
      "section",
      "description",
      "instructions",
      "duration",
      "totalMarks",
      "difficulty",
      "questions",

    ];


    fields.forEach(
      (field) => {

        if (
          req.body[field] !==
          undefined
        ) {

          test[field] =
            req.body[field];

        }

      }
    );


    await test.save();


    return res.status(200).json({

      success:
        true,

      message:
        "IELTS practice test updated successfully.",

      data:
        test,

    });

  } catch (error) {

    console.error(
      "Update IELTS Practice Test Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        error.message,

    });

  }

};


// ======================================================
// Delete Practice Test
// ======================================================

exports.deletePracticeTest = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const test =
      await IELTSPracticeTest.findById(
        id
      );


    if (!test) {

      return res.status(404).json({

        success:
          false,

        message:
          "IELTS practice test not found.",

      });

    }


    await IELTSPracticeTest.findByIdAndDelete(
      id
    );


    return res.status(200).json({

      success:
        true,

      message:
        "IELTS practice test deleted successfully.",

    });

  } catch (error) {

    console.error(
      "Delete IELTS Practice Test Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        error.message,

    });

  }

};


// ======================================================
// Publish Practice Test
// ======================================================

exports.publishPracticeTest = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const test =
      await IELTSPracticeTest.findById(
        id
      );


    if (!test) {

      return res.status(404).json({

        success:
          false,

        message:
          "IELTS practice test not found.",

      });

    }


    test.status =
      "Published";


    await test.save();


    return res.status(200).json({

      success:
        true,

      message:
        "IELTS practice test published successfully.",

      data:
        test,

    });

  } catch (error) {

    console.error(
      "Publish IELTS Practice Test Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        error.message,

    });

  }

};


// ======================================================
// Unpublish Practice Test
// ======================================================

exports.unpublishPracticeTest = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const test =
      await IELTSPracticeTest.findById(
        id
      );


    if (!test) {

      return res.status(404).json({

        success:
          false,

        message:
          "IELTS practice test not found.",

      });

    }


    test.status =
      "Draft";


    await test.save();


    return res.status(200).json({

      success:
        true,

      message:
        "IELTS practice test unpublished successfully.",

      data:
        test,

    });

  } catch (error) {

    console.error(
      "Unpublish IELTS Practice Test Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        "Unable to unpublish IELTS practice test.",

    });

  }

};


// ======================================================
// Get Practice Test For Student
// Does Not Expose Correct Answers
// ======================================================

exports.getStudentPracticeTest = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const test =
      await IELTSPracticeTest.findOne({

        _id:
          id,

        status:
          "Published",

      })

        .populate({

          path:
            "questions",

          select:
            "section questionType questionText passage options marks difficulty",

        });


    if (!test) {

      return res.status(404).json({

        success:
          false,

        message:
          "Published IELTS practice test not found.",

      });

    }


    return res.status(200).json({

      success:
        true,

      data:
        test,

    });

  } catch (error) {

    console.error(
      "Get Student IELTS Practice Test Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        "Unable to load IELTS practice test.",

    });

  }

};


// ======================================================
// Start IELTS Test Attempt
// ======================================================

exports.startIELTSTestAttempt = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const studentId =
      req.user._id;


    // ==================================================
    // Find Published Test
    // ==================================================

    const practiceTest =
      await IELTSPracticeTest.findOne({

        _id:
          id,

        status:
          "Published",

      });


    if (!practiceTest) {

      return res.status(404).json({

        success:
          false,

        message:
          "Published IELTS practice test not found.",

      });

    }


    // ==================================================
    // Check Existing In-Progress Attempt
    // ==================================================

    let attempt =
      await IELTSTestAttempt.findOne({

        student:
          studentId,

        test:
          id,

        status:
          "In Progress",

      });


    if (attempt) {

      return res.status(200).json({

        success:
          true,

        message:
          "Existing IELTS test attempt found.",

        data:
          attempt,

      });

    }


    // ==================================================
    // Calculate Total Marks
    // ==================================================

    const totalMarks =
      practiceTest.totalMarks ||
      0;


    // ==================================================
    // Calculate Expiry
    // ==================================================

    const expiresAt =
      new Date(

        Date.now() +
        (
          practiceTest.duration *
          60 *
          1000
        )

      );


    // ==================================================
    // Create Attempt
    // ==================================================

    attempt =
      await IELTSTestAttempt.create({

        student:
          studentId,

        test:
          id,

        answers:
          [],

        startedAt:
          new Date(),

        expiresAt:
          expiresAt,

        status:
          "In Progress",

        totalMarks:
          totalMarks,

      });


    return res.status(201).json({

      success:
        true,

      message:
        "IELTS test attempt started successfully.",

      data:
        attempt,

    });

  } catch (error) {

    console.error(
      "Start IELTS Test Attempt Error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        "Unable to start IELTS test attempt.",

    });

  }

};


// ======================================================
// Save IELTS Test Answers
// ======================================================

exports.saveIELTSTestAnswers = async (
  req,
  res
) => {
  try {
    const {
      id,
      attemptId,
    } = req.params;

    let {
      answers = [],
    } = req.body || {};

    // ==================================================
    // NORMALIZE ANSWERS
    // ==================================================
    //
    // Accept both:
    //
    // Object:
    // {
    //   questionId: "answer"
    // }
    //
    // Array:
    // [
    //   {
    //     question: questionId,
    //     answer: "answer"
    //   }
    // ]
    // ==================================================

    if (
      answers &&
      !Array.isArray(answers) &&
      typeof answers === "object"
    ) {
      answers = Object.entries(
        answers
      ).map(
        ([question, answer]) => ({
          question,
          answer:
            answer === undefined ||
            answer === null
              ? ""
              : answer,
        })
      );
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message:
          "Answers must be provided as an array or object.",
      });
    }

    // ==================================================
    // FIND ATTEMPT
    // ==================================================

    const attempt =
      await IELTSTestAttempt.findOne({
        _id: attemptId,
        test: id,
        student: req.user._id,
        status: "In Progress",
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "IELTS test attempt not found or is no longer active.",
      });
    }

    // ==================================================
    // VALIDATE ANSWERS
    // ==================================================

    const validAnswers =
      answers
        .filter(
          (item) =>
            item &&
            item.question
        )
        .map(
          (item) => ({
            question:
              typeof item.question ===
              "object"
                ? item.question._id ||
                  item.question.id
                : item.question,

            answer:
              item.answer ===
                undefined ||
              item.answer === null
                ? ""
                : String(item.answer),
          })
        )
        .filter(
          (item) =>
            item.question
        );

    // ==================================================
    // SAVE ANSWERS
    // ==================================================

    attempt.answers =
      validAnswers;

    await attempt.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      message:
        "IELTS test answers saved successfully.",
      data: {
        attemptId:
          attempt._id,
        answers:
          attempt.answers,
      },
    });
  } catch (error) {
    console.error(
      "Save IELTS Test Answers Error:",
      error
    );

    // Invalid MongoDB ID
    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid IELTS test or attempt ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to save IELTS test answers.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};


// ======================================================
// Submit IELTS Test Attempt
// ======================================================

// ======================================================
// Submit IELTS Test Attempt
// ======================================================
// Student only
// POST /api/v1/ielts/tests/:id/attempt/:attemptId/submit
// ======================================================

exports.submitIELTSTestAttempt = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    const { answers = [] } = req.body;

    // ==================================================
    // Validate IDs
    // ==================================================

    if (!id || !attemptId) {
      return res.status(400).json({
        success: false,
        message: "IELTS test ID and attempt ID are required.",
      });
    }

    // ==================================================
    // Validate answers
    // ==================================================

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be provided as an array.",
      });
    }

    // ==================================================
    // Find attempt
    // ==================================================

    const attempt = await IELTSTestAttempt.findOne({
      _id: attemptId,
      test: id,
      student: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS test attempt not found.",
      });
    }

    // ==================================================
    // Prevent duplicate submission
    // ==================================================

    if (
      attempt.status === "Submitted" ||
      attempt.status === "Evaluated"
    ) {
      return res.status(400).json({
        success: false,
        message: "This IELTS test attempt has already been submitted.",
      });
    }

    // ==================================================
    // Load practice test + questions
    // ==================================================

    const practiceTest = await IELTSPracticeTest.findById(id).populate(
      "questions"
    );

    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "IELTS practice test not found.",
      });
    }

    // ==================================================
    // Normalize submitted answers
    // ==================================================

    const submittedAnswers = answers.map((item) => ({
      question: item.question,
      answer:
        item.answer === undefined || item.answer === null
          ? ""
          : String(item.answer),
    }));

    attempt.answers = submittedAnswers;

    // ==================================================
    // Determine section
    // ==================================================

    const section = practiceTest.section;

    // ==================================================
    // Objective Evaluation
    // ==================================================

    let score = 0;
    let totalMarks = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    const evaluatedAnswerMap = new Map();

    submittedAnswers.forEach((item) => {
      if (item.question) {
        evaluatedAnswerMap.set(String(item.question), item.answer);
      }
    });

    // ==================================================
    // Reading / Listening
    // Automatically evaluated
    // ==================================================

    if (
      section === "Reading" ||
      section === "Listening"
    ) {
      const questions = Array.isArray(practiceTest.questions)
        ? practiceTest.questions
        : [];

      questions.forEach((question) => {
        const questionId = String(question._id);

        const studentAnswer =
          evaluatedAnswerMap.get(questionId) ?? "";

        const correctAnswer =
          question.correctAnswer ?? "";

        const marks = Number(question.marks) || 1;

        totalMarks += marks;

        const normalizedStudentAnswer = String(studentAnswer)
          .trim()
          .toLowerCase();

        const normalizedCorrectAnswer = String(correctAnswer)
          .trim()
          .toLowerCase();

        // Empty answer
        if (!normalizedStudentAnswer) {
          unanswered += 1;
          return;
        }

        // Acceptable answers
        let isCorrect = false;

        if (Array.isArray(question.acceptableAnswers)) {
          isCorrect = question.acceptableAnswers.some(
            (acceptableAnswer) =>
              String(acceptableAnswer)
                .trim()
                .toLowerCase() === normalizedStudentAnswer
          );
        }

        // Normal correct answer
        if (
          !isCorrect &&
          normalizedCorrectAnswer &&
          normalizedStudentAnswer === normalizedCorrectAnswer
        ) {
          isCorrect = true;
        }

        if (isCorrect) {
          score += marks;
          correctAnswers += 1;
        } else {
          incorrectAnswers += 1;
        }
      });

      // ==================================================
      // Percentage
      // ==================================================

      const percentage =
        totalMarks > 0
          ? Number(((score / totalMarks) * 100).toFixed(2))
          : 0;

      attempt.totalMarks = totalMarks;
      attempt.score = score;
      attempt.percentage = percentage;

      attempt.correctAnswers = correctAnswers;
      attempt.incorrectAnswers = incorrectAnswers;
      attempt.unanswered = unanswered;

      // ==================================================
      // IELTS Band
      // ==================================================

      if (section === "Reading") {
        attempt.readingBand = calculateReadingBand(score);
      }

      if (section === "Listening") {
        attempt.listeningBand = calculateListeningBand(score);
      }

      // ==================================================
      // Objective tests are automatically evaluated
      // ==================================================

      attempt.manualReviewRequired = false;
      attempt.status = "Evaluated";
    }

    // ==================================================
    // Writing / Speaking
    // Requires manual evaluation
    // ==================================================

    else if (
      section === "Writing" ||
      section === "Speaking"
    ) {
      const questions = Array.isArray(practiceTest.questions)
        ? practiceTest.questions
        : [];

      totalMarks = questions.reduce(
        (total, question) =>
          total + (Number(question.marks) || 1),
        0
      );

      const answeredCount = submittedAnswers.filter(
        (item) =>
          item.answer !== undefined &&
          item.answer !== null &&
          String(item.answer).trim() !== ""
      ).length;

      unanswered = Math.max(
        questions.length - answeredCount,
        0
      );

      attempt.totalMarks = totalMarks;
      attempt.score = 0;
      attempt.percentage = 0;

      attempt.correctAnswers = 0;
      attempt.incorrectAnswers = 0;
      attempt.unanswered = unanswered;

      attempt.manualReviewRequired = true;

      // Keep Submitted until teacher evaluates it
      attempt.status = "Submitted";
    }

    // ==================================================
    // Unknown section protection
    // ==================================================

    else {
      return res.status(400).json({
        success: false,
        message: `Unsupported IELTS section: ${section}`,
      });
    }

    // ==================================================
    // Submission timestamp
    // ==================================================

    attempt.submittedAt = new Date();

    // ==================================================
    // Save
    // ==================================================

    await attempt.save();

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        attempt.status === "Evaluated"
          ? "IELTS test submitted and automatically evaluated successfully."
          : "IELTS test submitted successfully. Manual evaluation is required.",

      data: {
        attemptId: attempt._id,
        testId: practiceTest._id,

        section,

        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,

        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        unanswered: attempt.unanswered,

        listeningBand: attempt.listeningBand,
        readingBand: attempt.readingBand,
        writingBand: attempt.writingBand,
        speakingBand: attempt.speakingBand,
        overallBand: attempt.overallBand,

        manualReviewRequired:
          attempt.manualReviewRequired,

        status: attempt.status,

        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    console.error(
      "Submit IELTS Test Attempt Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid IELTS test or attempt ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit IELTS test.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// ======================================================
// Get IELTS Test Result
// Student Only
// GET /api/v1/ielts/tests/:id/attempt/:attemptId/result
// ======================================================

// ======================================================
// Get IELTS Test Result
// ======================================================
// Student Only
// GET /api/v1/ielts/tests/:id/attempt/:attemptId/result
// ======================================================

exports.getIELTSTestResult = async (req, res) => {
  try {
    const { id, attemptId } = req.params;

    // ==================================================
    // Validate IDs
    // ==================================================

    if (!id || !attemptId) {
      return res.status(400).json({
        success: false,
        message: "IELTS test ID and attempt ID are required.",
      });
    }

    // ==================================================
    // Find student's attempt
    // ==================================================

    const attempt = await IELTSTestAttempt.findOne({
      _id: attemptId,
      test: id,
      student: req.user._id,
    })
      .populate({
        path: "test",
        select:
          "title section description duration totalMarks difficulty questions",
        populate: {
          path: "questions",
          select:
            "section questionType questionText question passage options correctAnswer acceptableAnswers explanation marks difficulty",
        },
      })
      .populate("student", "name email");

    // ==================================================
    // Attempt not found
    // ==================================================

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS test result not found.",
      });
    }

    // ==================================================
    // Allow both:
    //
    // Evaluated = automatic result available
    // Submitted = submitted, but manual review may remain
    // ==================================================

    if (
      attempt.status !== "Evaluated" &&
      attempt.status !== "Submitted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This IELTS test has not been submitted yet.",
        status: attempt.status,
      });
    }

    // ==================================================
    // Test information
    // ==================================================

    const test = attempt.test;

    const questions =
      test && Array.isArray(test.questions)
        ? test.questions
        : [];

    const totalQuestions = questions.length;

    // ==================================================
    // Answered Questions
    // ==================================================

    const unanswered =
      Number(attempt.unanswered) || 0;

    const answeredQuestions = Math.max(
      totalQuestions - unanswered,
      0
    );

    // ==================================================
    // Time Taken
    // ==================================================

    let timeTaken = 0;

    if (
      attempt.startedAt &&
      attempt.submittedAt
    ) {
      timeTaken = Math.max(
        0,
        Math.floor(
          (
            new Date(attempt.submittedAt).getTime() -
            new Date(attempt.startedAt).getTime()
          ) / 1000
        )
      );
    }

    // ==================================================
    // Section scores
    // ==================================================

    let readingScore = null;
    let listeningScore = null;

    if (test?.section === "Reading") {
      readingScore = attempt.score;
    }

    if (test?.section === "Listening") {
      listeningScore = attempt.score;
    }

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,

      data: {
        // ----------------------------------------------
        // Attempt
        // ----------------------------------------------

        attemptId: attempt._id,

        // ----------------------------------------------
        // Test
        // ----------------------------------------------

        test,

        // ----------------------------------------------
        // Student
        // ----------------------------------------------

        student: attempt.student,

        // ----------------------------------------------
        // Answers
        // ----------------------------------------------

        answers: Array.isArray(attempt.answers)
          ? attempt.answers
          : [],

        // ----------------------------------------------
        // General Score
        // ----------------------------------------------

        score: Number(attempt.score) || 0,

        totalMarks:
          Number(attempt.totalMarks) || 0,

        percentage:
          Number(attempt.percentage) || 0,

        // ----------------------------------------------
        // Question Statistics
        // ----------------------------------------------

        totalQuestions,

        answeredQuestions,

        correctAnswers:
          Number(attempt.correctAnswers) || 0,

        incorrectAnswers:
          Number(attempt.incorrectAnswers) || 0,

        unanswered,

        // ----------------------------------------------
        // Reading
        // ----------------------------------------------

        readingScore,

        readingBand:
          attempt.readingBand ?? null,

        // ----------------------------------------------
        // Listening
        // ----------------------------------------------

        listeningScore,

        listeningBand:
          attempt.listeningBand ?? null,

        // ----------------------------------------------
        // Writing
        // ----------------------------------------------

        writingBand:
          attempt.writingBand ?? null,

        writingFeedback:
          attempt.writingFeedback || "",

        // ----------------------------------------------
        // Speaking
        // ----------------------------------------------

        speakingBand:
          attempt.speakingBand ?? null,

        speakingFeedback:
          attempt.speakingFeedback || "",

        // ----------------------------------------------
        // Overall
        // ----------------------------------------------

        overallBand:
          attempt.overallBand ?? null,

        // ----------------------------------------------
        // Timing
        // ----------------------------------------------

        startedAt:
          attempt.startedAt,

        submittedAt:
          attempt.submittedAt,

        timeTaken,

        // ----------------------------------------------
        // Status
        // ----------------------------------------------

        status:
          attempt.status,

        manualReviewRequired:
          Boolean(
            attempt.manualReviewRequired
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get IELTS Test Result Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid IELTS test or attempt ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to load IELTS test result.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// ======================================================
// Get Student Previous IELTS Attempts
// Student Only
// GET /api/v1/ielts/tests/attempts/history
// ======================================================

exports.getStudentPreviousAttempts =
  async (
    req,
    res
  ) => {

    try {

      const attempts =
        await IELTSTestAttempt.find({

          student:
            req.user._id,

          status:
            "Evaluated",

        })

          .populate(

            {

              path:
                "test",

              select:
                "title section difficulty totalMarks duration questions",

              populate: {

                path:
                  "questions",

                select:
                  "marks",

              },

            }

          )

          .sort({

            submittedAt:
              -1,

          });


      return res.status(200).json({

        success:
          true,

        count:
          attempts.length,

        data:
          attempts,

      });

    } catch (error) {

      console.error(
        "Get Previous IELTS Attempts Error:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          "Unable to load previous IELTS attempts.",

      });

    }

  };