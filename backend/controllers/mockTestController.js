const mongoose = require("mongoose");

const MockTest = require("../models/MockTest");
const MockTestAttempt = require("../models/MockTestAttempt");

/* =========================================================
   HELPERS
========================================================= */

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const normalizeQuestion = (question, sectionName, order) => {
  return {
    order: Number(question.order || order || 1),

    section:
      question.section ||
      sectionName ||
      "Reading",

    questionType:
      question.questionType ||
      "Multiple Choice",

    question:
      question.question ||
      question.questionText ||
      "",

    passage: question.passage || "",

    audioUrl: question.audioUrl || "",

    imageUrl: question.imageUrl || "",

    options: Array.isArray(question.options)
      ? question.options.map((option, index) => {
          if (typeof option === "string") {
            return {
              label: String.fromCharCode(65 + index),
              text: option,
            };
          }

          return {
            label:
              option.label ||
              String.fromCharCode(65 + index),

            text: option.text || "",
          };
        })
      : [],

    correctAnswer: question.correctAnswer || "",

    acceptableAnswers: Array.isArray(
      question.acceptableAnswers
    )
      ? question.acceptableAnswers
      : [],

    wordLimit: Number(question.wordLimit || 250),

    prepTimeSeconds: Number(
      question.prepTimeSeconds || 60
    ),

    responseTimeSeconds: Number(
      question.responseTimeSeconds || 120
    ),

    marks: Number(question.marks ?? 1),

    explanation: question.explanation || "",

    difficulty:
      question.difficulty || "Medium",

    manualEvaluationRequired:
      Boolean(question.manualEvaluationRequired),

    ieltsQuestion:
      question.ieltsQuestion || null,

    pteQuestion:
      question.pteQuestion || null,
  };
};

const calculateTotalMarks = (sections = [], questions = []) => {
  let total = 0;

  if (Array.isArray(sections) && sections.length > 0) {
    sections.forEach((section) => {
      if (Array.isArray(section.questions)) {
        section.questions.forEach((question) => {
          total += Number(question.marks || 0);
        });
      }
    });
  }

  if (total === 0 && Array.isArray(questions)) {
    questions.forEach((question) => {
      total += Number(question.marks || 0);
    });
  }

  return total;
};

const flattenQuestions = (sections = [], questions = []) => {
  const result = [];

  if (Array.isArray(sections)) {
    sections.forEach((section) => {
      if (Array.isArray(section.questions)) {
        section.questions.forEach((question) => {
          result.push({
            ...question.toObject?.() || question,
            section:
              question.section ||
              section.name,
          });
        });
      }
    });
  }

  if (result.length === 0 && Array.isArray(questions)) {
    return questions.map((question) => ({
      ...question.toObject?.() || question,
    }));
  }

  return result;
};

/* =========================================================
   CREATE MOCK TEST
========================================================= */

const createMockTest = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      course,
      mockType,
      description,
      instructions,
      duration,
      passingScore,
      difficulty,
      assignedBatches,
      sections,
      questions,
      scheduledDate,
      expiresAt,
      status,
    } = req.body;

    if (!title || !course) {
      return res.status(400).json({
        success: false,
        message: "Title and course are required",
      });
    }

    if (!["IELTS", "PTE"].includes(course)) {
      return res.status(400).json({
        success: false,
        message: "Course must be IELTS or PTE",
      });
    }

    const normalizedSections = Array.isArray(sections)
      ? sections.map((section, sectionIndex) => ({
          name: section.name,
          duration: Number(section.duration || 30),
          instructions: section.instructions || "",
          order: Number(section.order || sectionIndex + 1),

          questions: Array.isArray(section.questions)
            ? section.questions.map((question, index) =>
                normalizeQuestion(
                  question,
                  section.name,
                  index + 1
                )
              )
            : [],
        }))
      : [];

    const normalizedQuestions = Array.isArray(questions)
      ? questions.map((question, index) =>
          normalizeQuestion(
            question,
            question.section,
            index + 1
          )
        )
      : [];

    const totalMarks = calculateTotalMarks(
      normalizedSections,
      normalizedQuestions
    );

    const mockTest = await MockTest.create({
      title: title.trim(),
      course,
      mockType: mockType || "Full Mock",
      description: description || "",
      instructions:
        instructions ||
        "Complete all sections within the allocated time. Do not refresh or close the browser during the exam.",
      duration: Number(duration || 180),
      totalMarks,
      passingScore: Number(passingScore || 0),
      difficulty: difficulty || "Medium",
      assignedBatches: Array.isArray(assignedBatches)
        ? assignedBatches
        : [],
      sections: normalizedSections,
      questions: normalizedQuestions,
      scheduledDate: scheduledDate || null,
      expiresAt: expiresAt || null,
      status: status || "Draft",
      createdBy: userId,
    });

    const populatedTest = await MockTest.findById(
      mockTest._id
    )
      .populate("assignedBatches")
      .populate("createdBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Mock test created successfully",
      data: populatedTest,
    });
  } catch (error) {
    console.error("createMockTest:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create mock test",
    });
  }
};

/* =========================================================
   GET ALL MOCK TESTS
========================================================= */

const getAllMockTests = async (req, res) => {
  try {
    const {
      course,
      status,
      mockType,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (course && ["IELTS", "PTE"].includes(course)) {
      filter.course = course;
    }

    if (
      status &&
      ["Draft", "Published", "Archived"].includes(status)
    ) {
      filter.status = status;
    }

    if (
      mockType &&
      ["Full Mock", "Sectional Mock"].includes(mockType)
    ) {
      filter.mockType = mockType;
    }

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const [tests, total] = await Promise.all([
      MockTest.find(filter)
        .populate("assignedBatches")
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      MockTest.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: tests,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error("getAllMockTests:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch mock tests",
    });
  }
};

/* =========================================================
   GET MOCK TEST BY ID
========================================================= */

const getMockTestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mock test ID",
      });
    }

    const mockTest = await MockTest.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("assignedBatches")
      .populate("createdBy", "name email role");

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: mockTest,
    });
  } catch (error) {
    console.error("getMockTestById:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch mock test",
    });
  }
};

/* =========================================================
   UPDATE MOCK TEST
========================================================= */

const updateMockTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mock test ID",
      });
    }

    const existingTest = await MockTest.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    const body = req.body;

    if (body.title !== undefined) {
      existingTest.title = String(body.title).trim();
    }

    if (body.course !== undefined) {
      if (!["IELTS", "PTE"].includes(body.course)) {
        return res.status(400).json({
          success: false,
          message: "Course must be IELTS or PTE",
        });
      }

      existingTest.course = body.course;
    }

    if (body.mockType !== undefined) {
      existingTest.mockType = body.mockType;
    }

    if (body.description !== undefined) {
      existingTest.description = body.description;
    }

    if (body.instructions !== undefined) {
      existingTest.instructions = body.instructions;
    }

    if (body.duration !== undefined) {
      existingTest.duration = Number(body.duration);
    }

    if (body.passingScore !== undefined) {
      existingTest.passingScore = Number(
        body.passingScore
      );
    }

    if (body.difficulty !== undefined) {
      existingTest.difficulty = body.difficulty;
    }

    if (body.assignedBatches !== undefined) {
      existingTest.assignedBatches =
        Array.isArray(body.assignedBatches)
          ? body.assignedBatches
          : [];
    }

    if (body.scheduledDate !== undefined) {
      existingTest.scheduledDate =
        body.scheduledDate || null;
    }

    if (body.expiresAt !== undefined) {
      existingTest.expiresAt =
        body.expiresAt || null;
    }

    if (body.status !== undefined) {
      existingTest.status = body.status;
    }

    /* -----------------------------------------------------
       UPDATE SECTIONS
    ----------------------------------------------------- */

    if (Array.isArray(body.sections)) {
      existingTest.sections = body.sections.map(
        (section, sectionIndex) => ({
          name: section.name,
          duration: Number(
            section.duration || 30
          ),
          instructions:
            section.instructions || "",
          order: Number(
            section.order ||
              sectionIndex + 1
          ),

          questions: Array.isArray(
            section.questions
          )
            ? section.questions.map(
                (question, questionIndex) =>
                  normalizeQuestion(
                    question,
                    section.name,
                    questionIndex + 1
                  )
              )
            : [],
        })
      );
    }

    /* -----------------------------------------------------
       UPDATE FLAT QUESTIONS
    ----------------------------------------------------- */

    if (Array.isArray(body.questions)) {
      existingTest.questions =
        body.questions.map(
          (question, index) =>
            normalizeQuestion(
              question,
              question.section,
              index + 1
            )
        );
    }

    /* -----------------------------------------------------
       RECALCULATE TOTAL MARKS
    ----------------------------------------------------- */

    existingTest.totalMarks =
      calculateTotalMarks(
        existingTest.sections,
        existingTest.questions
      );

    await existingTest.save();

    const updatedTest = await MockTest.findById(
      existingTest._id
    )
      .populate("assignedBatches")
      .populate("createdBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Mock test updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    console.error("updateMockTest:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update mock test",
    });
  }
};

/* =========================================================
   DELETE MOCK TEST
========================================================= */

const deleteMockTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mock test ID",
      });
    }

    const mockTest = await MockTest.findById(id);

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    mockTest.isDeleted = true;
    mockTest.status = "Archived";

    await mockTest.save();

    return res.status(200).json({
      success: true,
      message: "Mock test deleted successfully",
    });
  } catch (error) {
    console.error("deleteMockTest:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete mock test",
    });
  }
};

/* =========================================================
   START MOCK TEST ATTEMPT
========================================================= */

const startMockTestAttempt = async (req, res) => {
  try {
    const studentId = getUserId(req);
    const { id } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mock test ID",
      });
    }

    const mockTest = await MockTest.findOne({
      _id: id,
      isDeleted: false,
      status: "Published",
    });

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message:
          "Mock test not found or not published",
      });
    }

    /* -----------------------------------------------------
       CHECK EXISTING ATTEMPT
    ----------------------------------------------------- */

    let attempt = await MockTestAttempt.findOne({
      student: studentId,
      mockTest: id,
      status: "In Progress",
    });

    if (!attempt) {
      attempt = await MockTestAttempt.create({
        student: studentId,
        mockTest: id,
        course: mockTest.course,
        status: "In Progress",
        startedAt: new Date(),
        answers: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mock test started",
      data: {
        attempt,
        mockTest,
      },
    });
  } catch (error) {
    console.error("startMockTestAttempt:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to start mock test",
    });
  }
};

/* =========================================================
   OBJECTIVE QUESTION CHECK
========================================================= */

const normalizeAnswer = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

const checkAnswer = (
  question,
  submittedAnswer
) => {
  const answer = normalizeAnswer(
    submittedAnswer
  );

  if (!answer) {
    return false;
  }

  const questionType =
    question.questionType || "";

  /*
    Manual evaluation questions should not
    automatically receive marks.
  */

  if (
    question.manualEvaluationRequired ||
    [
      "Writing",
      "Essay",
      "Speaking",
      "Speaking Prompt",
      "Write Essay",
      "Summarize Written Text",
      "Describe Image",
      "Re-tell Lecture",
      "Read Aloud",
      "Repeat Sentence",
    ].includes(questionType)
  ) {
    return null;
  }

  const correctAnswers = [];

  if (question.correctAnswer) {
    correctAnswers.push(
      normalizeAnswer(
        question.correctAnswer
      )
    );
  }

  if (
    Array.isArray(
      question.acceptableAnswers
    )
  ) {
    question.acceptableAnswers.forEach(
      (item) => {
        if (item) {
          correctAnswers.push(
            normalizeAnswer(item)
          );
        }
      }
    );
  }

  return correctAnswers.includes(answer);
};

/* =========================================================
   SUBMIT MOCK TEST ATTEMPT
========================================================= */

const submitMockTestAttempt = async (
  req,
  res
) => {
  try {
    const studentId = getUserId(req);
    const { attemptId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        attemptId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    const attempt =
      await MockTestAttempt.findOne({
        _id: attemptId,
        student: studentId,
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    if (attempt.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "This attempt has already been submitted",
      });
    }

    const mockTest =
      await MockTest.findById(
        attempt.mockTest
      );

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    const submittedAnswers =
      Array.isArray(req.body.answers)
        ? req.body.answers
        : [];

    const allQuestions =
      flattenQuestions(
        mockTest.sections,
        mockTest.questions
      );

    let score = 0;
    let manualEvaluationCount = 0;

    const sectionScores = {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0,
    };

    const finalAnswers = [];

    for (
      let i = 0;
      i < allQuestions.length;
      i++
    ) {
      const question = allQuestions[i];

      const submitted =
        submittedAnswers.find(
          (item) =>
            String(item.questionId) ===
            String(question._id)
        );

      const submittedAnswer =
        submitted?.answer ?? "";

      const result = checkAnswer(
        question,
        submittedAnswer
      );

      const marks = Number(
        question.marks || 0
      );

      let marksObtained = 0;
      let evaluated = true;

      if (result === null) {
        manualEvaluationCount += 1;
        evaluated = false;
      } else if (result === true) {
        marksObtained = marks;
        score += marks;
      }

      const section =
        String(
          question.section || ""
        ).toLowerCase();

      if (
        result === true &&
        sectionScores.hasOwnProperty(
          section
        )
      ) {
        sectionScores[section] +=
          marksObtained;
      }

      finalAnswers.push({
        questionId: question._id,
        answer: submittedAnswer,
        isCorrect:
          result === null
            ? false
            : result,
        marksObtained,
        evaluated,
      });
    }

    const totalMarks =
      Number(mockTest.totalMarks || 0);

    const percentage =
      totalMarks > 0
        ? Number(
            (
              (score / totalMarks) *
              100
            ).toFixed(2)
          )
        : 0;

    /*
      For now:
      - IELTS percentage -> rough band mapping
      - PTE -> score remains percentage-style until
        detailed PTE scoring is implemented.

      This is intentionally simple and deterministic.
    */

    let overallBandOrScore = 0;

    if (attempt.course === "IELTS") {
      if (percentage >= 90) {
        overallBandOrScore = 9;
      } else if (percentage >= 80) {
        overallBandOrScore = 8;
      } else if (percentage >= 70) {
        overallBandOrScore = 7;
      } else if (percentage >= 60) {
        overallBandOrScore = 6;
      } else if (percentage >= 50) {
        overallBandOrScore = 5;
      } else if (percentage >= 40) {
        overallBandOrScore = 4;
      } else {
        overallBandOrScore = 3;
      }
    } else {
      overallBandOrScore = Math.round(
        percentage
      );
    }

    attempt.answers = finalAnswers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.overallBandOrScore =
      overallBandOrScore;

    attempt.sectionBreakdown =
      sectionScores;

    attempt.status =
      manualEvaluationCount > 0
        ? "Submitted"
        : "Evaluated";

    attempt.submittedAt =
      new Date();

    await attempt.save();

    return res.status(200).json({
      success: true,
      message:
        manualEvaluationCount > 0
          ? "Mock test submitted and is waiting for evaluation"
          : "Mock test submitted and evaluated successfully",

      data: {
        attempt,
        score,
        percentage,
        overallBandOrScore,
        manualEvaluationRequired:
          manualEvaluationCount > 0,
      },
    });
  } catch (error) {
    console.error(
      "submitMockTestAttempt:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to submit mock test",
    });
  }
};

/* =========================================================
   EVALUATE MOCK TEST ATTEMPT
========================================================= */

const evaluateMockTestAttempt = async (
  req,
  res
) => {
  try {
    const evaluatorId = getUserId(req);
    const { attemptId } = req.params;

    if (!evaluatorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const attempt =
      await MockTestAttempt.findById(
        attemptId
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    const mockTest =
      await MockTest.findById(
        attempt.mockTest
      );

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    const evaluationAnswers =
      Array.isArray(req.body.answers)
        ? req.body.answers
        : [];

    const allQuestions =
      flattenQuestions(
        mockTest.sections,
        mockTest.questions
      );

    let score = 0;

    const sectionScores = {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0,
    };

    const updatedAnswers =
      attempt.answers.map(
        (existingAnswer) => {
          const evaluation =
            evaluationAnswers.find(
              (item) =>
                String(
                  item.questionId
                ) ===
                String(
                  existingAnswer.questionId
                )
            );

          const question =
            allQuestions.find(
              (item) =>
                String(item._id) ===
                String(
                  existingAnswer.questionId
                )
            );

          if (!question) {
            return existingAnswer;
          }

          if (!evaluation) {
            score += Number(
              existingAnswer.marksObtained ||
                0
            );

            return existingAnswer;
          }

          const marksObtained = Math.max(
            0,
            Math.min(
              Number(
                evaluation.marksObtained ||
                  0
              ),
              Number(
                question.marks || 0
              )
            )
          );

          score += marksObtained;

          const section =
            String(
              question.section || ""
            ).toLowerCase();

          if (
            sectionScores.hasOwnProperty(
              section
            )
          ) {
            sectionScores[section] +=
              marksObtained;
          }

          return {
            questionId:
              existingAnswer.questionId,

            answer:
              existingAnswer.answer,

            isCorrect:
              marksObtained >
              0,

            marksObtained,

            evaluated: true,

            feedback:
              evaluation.feedback ||
              "",
          };
        }
      );

    const totalMarks =
      Number(mockTest.totalMarks || 0);

    const percentage =
      totalMarks > 0
        ? Number(
            (
              (score / totalMarks) *
              100
            ).toFixed(2)
          )
        : 0;

    let overallBandOrScore = 0;

    if (attempt.course === "IELTS") {
      if (percentage >= 90) {
        overallBandOrScore = 9;
      } else if (percentage >= 80) {
        overallBandOrScore = 8;
      } else if (percentage >= 70) {
        overallBandOrScore = 7;
      } else if (percentage >= 60) {
        overallBandOrScore = 6;
      } else if (percentage >= 50) {
        overallBandOrScore = 5;
      } else {
        overallBandOrScore = 4;
      }
    } else {
      overallBandOrScore =
        Math.round(percentage);
    }

    attempt.answers =
      updatedAnswers;

    attempt.score = score;

    attempt.percentage =
      percentage;

    attempt.overallBandOrScore =
      overallBandOrScore;

    attempt.sectionBreakdown =
      sectionScores;

    attempt.status =
      "Evaluated";

    attempt.evaluatedBy =
      evaluatorId;

    attempt.evaluatedAt =
      new Date();

    if (req.body.feedback !== undefined) {
      attempt.feedback =
        req.body.feedback;
    }

    await attempt.save();

    return res.status(200).json({
      success: true,
      message:
        "Mock test attempt evaluated successfully",
      data: attempt,
    });
  } catch (error) {
    console.error(
      "evaluateMockTestAttempt:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to evaluate attempt",
    });
  }
};

/* =========================================================
   GET MOCK TEST ATTEMPTS
========================================================= */

const getMockTestAttempts = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    const filter = {};

    /*
      Students only see their own attempts.
    */

    if (req.user?.role === "student") {
      filter.student = userId;
    }

    if (req.query.student) {
      filter.student =
        req.query.student;
    }

    if (req.query.mockTest) {
      filter.mockTest =
        req.query.mockTest;
    }

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    const attempts =
      await MockTestAttempt.find(filter)
        .populate(
          "student",
          "name email"
        )
        .populate(
          "mockTest",
          "title course duration totalMarks"
        )
        .populate(
          "batch",
          "name"
        )
        .populate(
          "evaluatedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error(
      "getMockTestAttempts:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch mock test attempts",
    });
  }
};

/* =========================================================
   UNIFIED STUDENT RESULTS
========================================================= */

const getUnifiedStudentResults =
  async (req, res) => {
    try {
      const userId = getUserId(req);

      const filter = {};

      if (req.user?.role === "student") {
        filter.student = userId;
      } else if (req.query.student) {
        filter.student =
          req.query.student;
      }

      const mockResults =
        await MockTestAttempt.find(filter)
          .populate(
            "mockTest",
            "title course totalMarks"
          )
          .sort({
            createdAt: -1,
          });

      const results =
        mockResults.map((attempt) => ({
          type: "Mock Test",

          id: attempt._id,

          title:
            attempt.mockTest?.title ||
            "Mock Test",

          course:
            attempt.course,

          score:
            attempt.score,

          percentage:
            attempt.percentage,

          overallBandOrScore:
            attempt.overallBandOrScore,

          status:
            attempt.status,

          submittedAt:
            attempt.submittedAt,

          sectionBreakdown:
            attempt.sectionBreakdown,
        }));

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error(
        "getUnifiedStudentResults:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch unified results",
      });
    }
  };

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createMockTest,
  getAllMockTests,
  getMockTestById,
  updateMockTest,
  deleteMockTest,
  startMockTestAttempt,
  submitMockTestAttempt,
  evaluateMockTestAttempt,
  getMockTestAttempts,
  getUnifiedStudentResults,
};