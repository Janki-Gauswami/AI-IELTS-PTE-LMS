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
// Raw Score: 0 - 40 (scaled if totalMarks != 40)
// ======================================================

const calculateListeningBand = (rawScore, totalMarks) => {
  let score = Number(rawScore) || 0;
  if (totalMarks && Number(totalMarks) > 0 && Number(totalMarks) !== 40) {
    score = Math.round((score / Number(totalMarks)) * 40);
  }

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
// Raw Score: 0 - 40 (scaled if totalMarks != 40)
// ======================================================

const calculateReadingBand = (rawScore, totalMarks) => {
  let score = Number(rawScore) || 0;
  if (totalMarks && Number(totalMarks) > 0 && Number(totalMarks) !== 40) {
    score = Math.round((score / Number(totalMarks)) * 40);
  }

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
          req.body.status || "Published",

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
    // Status Filter (Students only see published tests)
    // ==================================================

    if (req.user && req.user.role === "student") {
      filter.status = "Published";
    } else if (status) {
      filter.status = status;
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
      "status",

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
        ([question, value]) => {
          if (value && typeof value === "object") {
            return {
              question,
              answer:
                value.answer === undefined || value.answer === null
                  ? ""
                  : String(value.answer),
              audioUrl: value.audioUrl ? String(value.audioUrl) : "",
            };
          }
          return {
            question,
            answer:
              value === undefined ||
              value === null
                ? ""
                : String(value),
            audioUrl: "",
          };
        }
      );
    } else if (Array.isArray(answers)) {
      answers = answers.map((item) => ({
        question: item.question || item.questionId,
        answer:
          item.answer === undefined || item.answer === null
            ? ""
            : String(item.answer),
        audioUrl: item.audioUrl ? String(item.audioUrl) : "",
      }));
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

            audioUrl:
              item.audioUrl ===
                undefined ||
              item.audioUrl === null
                ? ""
                : String(item.audioUrl).trim(),
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

    let submittedAnswers = [];

    if (Array.isArray(answers)) {
      submittedAnswers = answers.map((item) => ({
        question: item.question || item.questionId,
        answer: item.answer === undefined || item.answer === null ? "" : String(item.answer),
        audioUrl: item.audioUrl ? String(item.audioUrl) : "",
      }));
    } else if (answers && typeof answers === "object") {
      submittedAnswers = Object.entries(answers).map(([questionId, value]) => {
        if (value && typeof value === "object") {
          return {
            question: questionId,
            answer: value.answer === undefined || value.answer === null ? "" : String(value.answer),
            audioUrl: value.audioUrl ? String(value.audioUrl) : "",
          };
        }
        return {
          question: questionId,
          answer: value === undefined || value === null ? "" : String(value),
          audioUrl: "",
        };
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Answers must be provided as an array or object mapping.",
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

        // Normal correct answer direct match
        if (
          !isCorrect &&
          normalizedCorrectAnswer &&
          normalizedStudentAnswer === normalizedCorrectAnswer
        ) {
          isCorrect = true;
        }

        // Match option label (e.g. "A" -> "music") or option text
        if (!isCorrect && Array.isArray(question.options) && question.options.length > 0) {
          const matchedStudentOption = question.options.find(
            (opt) =>
              (opt.label && String(opt.label).trim().toLowerCase() === normalizedStudentAnswer) ||
              (opt.text && String(opt.text).trim().toLowerCase() === normalizedStudentAnswer)
          );

          const matchedCorrectOption = question.options.find(
            (opt) =>
              (opt.label && String(opt.label).trim().toLowerCase() === normalizedCorrectAnswer) ||
              (opt.text && String(opt.text).trim().toLowerCase() === normalizedCorrectAnswer)
          );

          if (matchedStudentOption && matchedCorrectOption) {
            if (
              String(matchedStudentOption.label).toLowerCase() === String(matchedCorrectOption.label).toLowerCase() ||
              String(matchedStudentOption.text).toLowerCase() === String(matchedCorrectOption.text).toLowerCase()
            ) {
              isCorrect = true;
            }
          } else if (matchedStudentOption && (
            String(matchedStudentOption.label).toLowerCase() === normalizedCorrectAnswer ||
            String(matchedStudentOption.text).toLowerCase() === normalizedCorrectAnswer
          )) {
            isCorrect = true;
          } else if (matchedCorrectOption && (
            String(matchedCorrectOption.label).toLowerCase() === normalizedStudentAnswer ||
            String(matchedCorrectOption.text).toLowerCase() === normalizedStudentAnswer
          )) {
            isCorrect = true;
          }
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
        attempt.readingBand = calculateReadingBand(score, totalMarks);
        attempt.overallBand = attempt.readingBand;
      }

      if (section === "Listening") {
        attempt.listeningBand = calculateListeningBand(score, totalMarks);
        attempt.overallBand = attempt.listeningBand;
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

      const answeredCount = questions.filter((q) => {
        const qId = String(q._id || q);
        const ans = submittedAnswers.find(
          (item) => String(item.question) === qId
        );
        if (!ans) return false;
        const hasText =
          ans.answer !== undefined &&
          ans.answer !== null &&
          String(ans.answer).trim() !== "";
        const hasAudio =
          ans.audioUrl !== undefined &&
          ans.audioUrl !== null &&
          String(ans.audioUrl).trim() !== "";
        return hasText || hasAudio;
      }).length;

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

      attempt.overallBand = null;
      if (section === "Speaking") attempt.speakingBand = null;
      if (section === "Writing") attempt.writingBand = null;

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
    // Answered Questions & Self-healing
    // ==================================================

    let answeredQuestions = 0;
    let unanswered = Number(attempt.unanswered) || 0;

    if (Array.isArray(questions) && questions.length > 0) {
      const calculatedAnswered = questions.filter((q) => {
        const qId = String(q._id || q);
        const ans = Array.isArray(attempt.answers)
          ? attempt.answers.find(
              (item) => String(item.question?._id || item.question) === qId
            )
          : null;
        if (!ans) return false;
        const hasText =
          ans.answer !== undefined &&
          ans.answer !== null &&
          String(ans.answer).trim() !== "";
        const hasAudio =
          ans.audioUrl !== undefined &&
          ans.audioUrl !== null &&
          String(ans.audioUrl).trim() !== "";
        return hasText || hasAudio;
      }).length;

      if (
        calculatedAnswered > 0 &&
        calculatedAnswered > totalQuestions - unanswered
      ) {
        answeredQuestions = calculatedAnswered;
        unanswered = Math.max(totalQuestions - answeredQuestions, 0);
        if (attempt.unanswered !== unanswered) {
          attempt.unanswered = unanswered;
          attempt.save().catch((err) =>
            console.error("Self-heal attempt error:", err)
          );
        }
      } else {
        answeredQuestions = Math.max(totalQuestions - unanswered, 0);
      }
    } else {
      answeredQuestions = Math.max(totalQuestions - unanswered, 0);
    }

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

    const testSection = test?.section;
    const calculatedBand =
      attempt.overallBand ??
      (testSection === "Reading"
        ? attempt.readingBand ?? null
        : testSection === "Listening"
        ? attempt.listeningBand ?? null
        : testSection === "Writing"
        ? attempt.writingBand ?? null
        : testSection === "Speaking"
        ? attempt.speakingBand ?? null
        : (attempt.status === "Evaluated" && attempt.totalMarks > 0 && attempt.score > 0
            ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
            : null));

    let resolvedScore = Number(attempt.score) || 0;
    let resolvedPercentage = Number(attempt.percentage) || 0;

    if (attempt.status === "Evaluated" && calculatedBand !== null && calculatedBand > 0) {
      if (resolvedScore === 0 && attempt.totalMarks > 0) {
        resolvedScore = Math.max(1, Math.round((calculatedBand / 9) * attempt.totalMarks));
      }
      if (resolvedPercentage === 0) {
        resolvedPercentage = Math.min(100, Math.round((calculatedBand / 9) * 100));
      }
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

        score: resolvedScore,

        totalMarks:
          Number(attempt.totalMarks) || 0,

        percentage:
          resolvedPercentage,

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
          attempt.overallBand ??
          (test?.section === "Reading"
            ? attempt.readingBand ?? null
            : test?.section === "Listening"
            ? attempt.listeningBand ?? null
            : test?.section === "Writing"
            ? attempt.writingBand ?? null
            : test?.section === "Speaking"
            ? attempt.speakingBand ?? null
            : (attempt.status === "Evaluated" && attempt.totalMarks > 0 && attempt.score > 0
                ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
                : null)),

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

          status: {
            $in: ["Submitted", "Evaluated"],
          },

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


      const formattedAttempts = attempts.map((attempt) => {
        const obj = attempt.toObject ? attempt.toObject() : { ...attempt };
        const testSection = obj.test?.section;
        const calculatedBand =
          obj.overallBand ??
          (testSection === "Reading"
            ? obj.readingBand ?? null
            : testSection === "Listening"
            ? obj.listeningBand ?? null
            : testSection === "Writing"
            ? obj.writingBand ?? null
            : testSection === "Speaking"
            ? obj.speakingBand ?? null
            : (obj.status === "Evaluated" && obj.totalMarks > 0 && obj.score > 0
                ? Number(((obj.score / obj.totalMarks) * 9).toFixed(1))
                : null));

        let finalScore = Number(obj.score) || 0;
        let finalPercentage = Number(obj.percentage) || 0;

        if (obj.status === "Evaluated" && calculatedBand !== null && calculatedBand > 0) {
          if (finalScore === 0 && obj.totalMarks > 0) {
            finalScore = Math.max(1, Math.round((calculatedBand / 9) * obj.totalMarks));
          }
          if (finalPercentage === 0) {
            finalPercentage = Math.min(100, Math.round((calculatedBand / 9) * 100));
          }
        }

        return {
          ...obj,
          score: finalScore,
          percentage: finalPercentage,
          overallBand: calculatedBand,
        };
      });

      return res.status(200).json({

        success:
          true,

        count:
          formattedAttempts.length,

        data:
          formattedAttempts,

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

// ======================================================
// TEACHER / ADMIN: Get IELTS Attempts For Review / Grading
// GET /api/v1/ielts/tests/attempts/review-list
// ======================================================

exports.getIELTSTestAttemptsForReview = async (req, res) => {
  try {
    const { status, section, search } = req.query;

    const filter = {};

    // Filter by status (default to "Submitted" if requesting pending, or allow all)
    if (status && status !== "all") {
      filter.status = status;
    } else if (!status) {
      filter.status = { $in: ["Submitted", "Evaluated"] };
    }

    const attempts = await IELTSTestAttempt.find(filter)
      .populate("student", "name email phone profilePicture")
      .populate("test", "title section duration totalMarks difficulty")
      .populate("speakingEvaluatedBy", "name email")
      .populate("writingEvaluatedBy", "name email")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    // Filter in-memory for populated fields (section, search)
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
    console.error("Get IELTS Test Attempts For Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load IELTS attempts for review.",
    });
  }
};

// ======================================================
// TEACHER / ADMIN: Get Detailed IELTS Attempt for Evaluation
// GET /api/v1/ielts/tests/attempts/:attemptId/review
// ======================================================

exports.getIELTSTestAttemptForReview = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await IELTSTestAttempt.findById(attemptId)
      .populate("student", "name email phone profilePicture")
      .populate({
        path: "test",
        populate: {
          path: "questions",
        },
      })
      .populate("speakingEvaluatedBy", "name email")
      .populate("writingEvaluatedBy", "name email");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS test attempt not found.",
      });
    }

    const test = attempt.test;
    const questionsList = test && Array.isArray(test.questions) ? test.questions : [];

    // Map each question with student answer, recorded audioUrl, and rubrics
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
        audioUrl: q.audioUrl || "", // Question prompt audio if any
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
        overallBand: attempt.overallBand,
        speakingBand: attempt.speakingBand,
        speakingFeedback: attempt.speakingFeedback,
        speakingEvaluatedAt: attempt.speakingEvaluatedAt,
        speakingEvaluatedBy: attempt.speakingEvaluatedBy,
        writingBand: attempt.writingBand,
        writingFeedback: attempt.writingFeedback,
        writingEvaluatedAt: attempt.writingEvaluatedAt,
        writingEvaluatedBy: attempt.writingEvaluatedBy,
        listeningBand: attempt.listeningBand,
        readingBand: attempt.readingBand,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        unanswered: attempt.unanswered,
        answers: detailedAnswers,
      },
    });
  } catch (error) {
    console.error("Get IELTS Test Attempt Details For Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load IELTS attempt details for evaluation.",
    });
  }
};

// ======================================================
// TEACHER / ADMIN: Evaluate & Award Marks on IELTS Attempt
// POST /api/v1/ielts/tests/attempts/:attemptId/evaluate
// ======================================================

exports.evaluateIELTSTestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const {
      overallBand,
      speakingBand,
      speakingFeedback,
      writingBand,
      writingFeedback,
      listeningBand,
      readingBand,
      score,
      feedback,
      status = "Evaluated",
    } = req.body;

    const attempt = await IELTSTestAttempt.findById(attemptId).populate("test");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "IELTS test attempt not found.",
      });
    }

    const testSection = attempt.test?.section || "";

    // Set evaluated status
    attempt.status = status;
    attempt.manualReviewRequired = false;

    // Evaluate Speaking
    if (speakingBand !== undefined && speakingBand !== null && speakingBand !== "") {
      attempt.speakingBand = Number(speakingBand);
      attempt.speakingFeedback = speakingFeedback || feedback || attempt.speakingFeedback;
      attempt.speakingEvaluatedAt = new Date();
      attempt.speakingEvaluatedBy = req.user._id;
    } else if (testSection === "Speaking" && overallBand !== undefined) {
      attempt.speakingBand = Number(overallBand);
      attempt.speakingFeedback = speakingFeedback || feedback || attempt.speakingFeedback;
      attempt.speakingEvaluatedAt = new Date();
      attempt.speakingEvaluatedBy = req.user._id;
    }

    // Evaluate Writing
    if (writingBand !== undefined && writingBand !== null && writingBand !== "") {
      attempt.writingBand = Number(writingBand);
      attempt.writingFeedback = writingFeedback || feedback || attempt.writingFeedback;
      attempt.writingEvaluatedAt = new Date();
      attempt.writingEvaluatedBy = req.user._id;
    } else if (testSection === "Writing" && overallBand !== undefined) {
      attempt.writingBand = Number(overallBand);
      attempt.writingFeedback = writingFeedback || feedback || attempt.writingFeedback;
      attempt.writingEvaluatedAt = new Date();
      attempt.writingEvaluatedBy = req.user._id;
    }

    // Optional Listening / Reading bands
    if (listeningBand !== undefined && listeningBand !== null && listeningBand !== "") {
      attempt.listeningBand = Number(listeningBand);
    }
    if (readingBand !== undefined && readingBand !== null && readingBand !== "") {
      attempt.readingBand = Number(readingBand);
    }

    // Overall Band
    if (overallBand !== undefined && overallBand !== null && overallBand !== "") {
      attempt.overallBand = Number(overallBand);
    } else {
      const activeBands = [
        attempt.speakingBand,
        attempt.writingBand,
        attempt.listeningBand,
        attempt.readingBand,
      ].filter((b) => typeof b === "number" && !isNaN(b));

      if (activeBands.length > 0) {
        const sum = activeBands.reduce((a, b) => a + b, 0);
        attempt.overallBand = Number((sum / activeBands.length).toFixed(1));
      }
    }

    const bandToUse =
      attempt.overallBand ??
      (testSection === "Speaking" ? attempt.speakingBand : null) ??
      (testSection === "Writing" ? attempt.writingBand : null) ??
      attempt.speakingBand ??
      attempt.writingBand;

    // Numeric score and percentage if provided or derived from band
    if (score !== undefined && score !== null && score !== "" && !isNaN(Number(score)) && Number(score) >= 0) {
      attempt.score = Number(score);
      if (attempt.totalMarks > 0) {
        attempt.percentage = Math.min(100, Math.round((Number(score) / attempt.totalMarks) * 100));
      } else if (bandToUse) {
        attempt.percentage = Math.min(100, Math.round((bandToUse / 9) * 100));
      }
    } else if (bandToUse !== null && bandToUse !== undefined) {
      if (attempt.totalMarks > 0) {
        attempt.score = Math.round((bandToUse / 9) * attempt.totalMarks);
        if (bandToUse >= 5 && attempt.score === 0) {
          attempt.score = 1;
        }
      }
      attempt.percentage = Math.min(100, Math.round((bandToUse / 9) * 100));
    }

    attempt.correctAnswers = attempt.score;
    attempt.incorrectAnswers = Math.max(0, attempt.totalMarks - attempt.score);

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "IELTS test attempt successfully evaluated.",
      data: {
        attemptId: attempt._id,
        status: attempt.status,
        overallBand: attempt.overallBand,
        speakingBand: attempt.speakingBand,
        writingBand: attempt.writingBand,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        speakingFeedback: attempt.speakingFeedback,
        writingFeedback: attempt.writingFeedback,
      },
    });
  } catch (error) {
    console.error("Evaluate IELTS Test Attempt Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to evaluate IELTS test attempt.",
    });
  }
};