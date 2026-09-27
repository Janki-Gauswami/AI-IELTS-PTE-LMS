const aiService = require("../services/aiService");
const IELTSTestAttempt = require("../models/IELTSTestAttempt");
const PTETestAttempt = require("../models/PTETestAttempt");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

// ==========================================
// GET AI BAND / SCORE PREDICTION
// GET /api/v1/ai/band-prediction
// ==========================================
exports.getBandPrediction = async (req, res) => {
  try {
    const studentId = req.user.role === "student" ? req.user._id : req.query.studentId || req.user._id;

    // Load student profile for target exam & target score
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    const targetExam = studentProfile?.targetExam || req.query.exam || "IELTS";
    const targetScore = studentProfile?.targetBand || (targetExam === "IELTS" ? 7.5 : 72);

    let attempts = [];
    if (targetExam === "IELTS") {
      attempts = await IELTSTestAttempt.find({ student: studentId, status: { $in: ["Submitted", "Evaluated"] } })
        .sort({ createdAt: 1 })
        .lean();
    } else {
      attempts = await PTETestAttempt.find({ student: studentId, status: { $in: ["Submitted", "Evaluated"] } })
        .sort({ createdAt: 1 })
        .lean();
    }

    const prediction = aiService.predictScore(attempts, targetExam, targetScore);

    return res.status(200).json({
      success: true,
      data: {
        studentId,
        targetExam,
        targetScore,
        ...prediction,
      },
    });
  } catch (error) {
    console.error("AI Band Prediction Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI band prediction.",
    });
  }
};

// ==========================================
// GET AI WEAKNESS DETECTION
// GET /api/v1/ai/weakness-detection
// ==========================================
exports.getWeaknessDetection = async (req, res) => {
  try {
    const studentId = req.user.role === "student" ? req.user._id : req.query.studentId || req.user._id;
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    const targetExam = studentProfile?.targetExam || req.query.exam || "IELTS";

    let sectionScores = {};
    if (targetExam === "IELTS") {
      const attempts = await IELTSTestAttempt.find({
        student: studentId,
        status: { $in: ["Submitted", "Evaluated"] },
      })
        .populate("test", "section")
        .lean();

      if (attempts.length > 0) {
        // Aggregate actual section scores from populated test section
        const sectionMap = {};
        const sectionCount = {};
        attempts.forEach((att) => {
          const section = att.test?.section;
          if (!section) return;
          const score = Number(att.overallBand || att.bandScore || att.score || 0);
          if (score > 0) {
            sectionMap[section] = (sectionMap[section] || 0) + score;
            sectionCount[section] = (sectionCount[section] || 0) + 1;
          }
        });

        Object.keys(sectionMap).forEach((sec) => {
          sectionScores[sec] = Number((sectionMap[sec] / sectionCount[sec]).toFixed(1));
        });

        // If sections found but some IELTS sections missing, fill missing with neutral 6.0
        const ieltsExpected = ["Listening", "Reading", "Writing", "Speaking"];
        ieltsExpected.forEach((s) => {
          if (sectionScores[s] === undefined) sectionScores[s] = 6.0;
        });
      }
    } else {
      const attempts = await PTETestAttempt.find({
        student: studentId,
        status: { $in: ["Submitted", "Evaluated"] },
      }).lean();

      if (attempts.length > 0) {
        const sectionMap = {};
        const sectionCount = {};
        attempts.forEach((att) => {
          const section = att.section;
          if (!section) return;
          const score = Number(att.overallScore || att.score || 0);
          if (score > 0) {
            sectionMap[section] = (sectionMap[section] || 0) + score;
            sectionCount[section] = (sectionCount[section] || 0) + 1;
          }
        });

        Object.keys(sectionMap).forEach((sec) => {
          sectionScores[sec] = Number((sectionMap[sec] / sectionCount[sec]).toFixed(0));
        });
      }
    }

    const analysis = aiService.detectWeaknesses(sectionScores, targetExam);

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("AI Weakness Detection Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to detect weaknesses.",
    });
  }
};

// ==========================================
// GENERATE AI STUDY PLAN
// POST /api/v1/ai/study-plan
// ==========================================
exports.generateStudyPlan = async (req, res) => {
  try {
    const { targetExam, targetScore, examDate, dailyHours, weaknesses } = req.body;

    const plan = aiService.generateStudyPlan({
      targetExam: targetExam || "IELTS",
      targetScore: targetScore || (targetExam === "IELTS" ? 7.5 : 74),
      examDate: examDate || null,
      dailyHours: Number(dailyHours) || 2,
      weaknesses: weaknesses || [],
    });

    return res.status(200).json({
      success: true,
      message: "Personalized AI study plan generated successfully.",
      data: plan,
    });
  } catch (error) {
    console.error("AI Study Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate study plan.",
    });
  }
};

// ==========================================
// GET ADMIN COHORT AI OVERVIEW
// Admin Only
// GET /api/v1/ai/cohort-overview
// ==========================================
exports.getCohortAIOverview = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const students = await StudentProfile.find().populate("userId", "name email").limit(50).lean();

    const studentReports = await Promise.all(
      students.map(async (s) => {
        const uId = s.userId?._id || s.userId;
        const exam = s.targetExam || "IELTS";
        const target = s.targetBand || (exam === "IELTS" ? 7.5 : 70);

        let attempts = [];
        if (uId) {
          if (exam === "IELTS") {
            attempts = await IELTSTestAttempt.find({
              student: uId,
              status: { $in: ["Submitted", "Evaluated"] },
            })
              .sort({ createdAt: 1 })
              .lean();
          } else {
            attempts = await PTETestAttempt.find({
              student: uId,
              status: { $in: ["Submitted", "Evaluated"] },
            })
              .sort({ createdAt: 1 })
              .lean();
          }
        }

        const scores = attempts.map((a) => a.overallBand || a.overallScore || a.score || 0).filter((sc) => sc > 0);
        let predictedScore = 0;
        let confidence = 75;

        if (scores.length > 0) {
          const prediction = aiService.predictScore(scores, exam, target);
          predictedScore = prediction.predictedBand;
          confidence = prediction.confidenceScore;
        } else {
          // If no attempt yet, default based on target band baseline
          predictedScore = exam === "IELTS" ? Math.max(5.5, Number((target - 1.0).toFixed(1))) : Math.max(50, target - 10);
          confidence = 60;
        }

        const primaryWeakness =
          exam === "IELTS" ? "Writing Task 2 / Lexical Resource" : "Speaking Read Aloud / Fluency";

        return {
          studentId: s._id,
          name: s.userId?.name || "Student",
          email: s.userId?.email || "student@example.com",
          exam,
          targetScore: target,
          predictedScore: Number(predictedScore),
          status: Number(predictedScore) >= target ? "On Track" : "Needs Attention",
          primaryWeakness,
          confidence,
        };
      })
    );

    const onTrackCount = studentReports.filter((r) => r.status === "On Track").length;
    const atRiskCount = studentReports.length - onTrackCount;

    return res.status(200).json({
      success: true,
      data: {
        totalAnalyzed: studentReports.length,
        totalStudents,
        onTrackRate: Math.round((onTrackCount / (studentReports.length || 1)) * 100),
        atRiskCount,
        studentReports,
        topInstituteWeaknesses: [
          { skill: "Writing Task 2 / Essay Cohesion", affectedPercentage: 68 },
          { skill: "Reading Time Management", affectedPercentage: 54 },
          { skill: "Listening Section 3 Dialogue Tracking", affectedPercentage: 42 },
        ],
      },
    });
  } catch (error) {
    console.error("Cohort AI Overview Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate cohort AI overview.",
    });
  }
};

// ==========================================
// EVALUATE SUBMISSION WITH AI
// POST /api/v1/ai/evaluate-submission
// ==========================================
exports.evaluateSubmission = async (req, res) => {
  try {
    const { examType, section, questionText, studentAnswer, wordCount } = req.body;

    const evaluation = aiService.evaluateSubmission({
      examType: examType || "IELTS",
      section: section || "Writing",
      questionText: questionText || "",
      studentAnswer: studentAnswer || "",
      wordCount: Number(wordCount) || 0,
    });

    return res.status(200).json({
      success: true,
      message: "AI evaluation completed.",
      data: evaluation,
    });
  } catch (error) {
    console.error("AI Submission Evaluation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to perform AI evaluation.",
    });
  }
};

// ==========================================
// EVALUATE PUBLIC SPEAKING / EXTEMPORE SPEECH
// POST /api/v1/ai/analyze-speech
// (Student Only, No database persistence)
// ==========================================
exports.analyzeSpeechPractice = async (req, res) => {
  try {
    const {
      topic = "Impromptu Speech",
      transcript = "",
      duration = 60,
      pauseCount = 0,
      pauseDuration = 0,
      fillerCounts = {},
      scratchpadNotes = "",
    } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "No spoken transcript provided for evaluation.",
      });
    }

    const evaluation = aiService.evaluateSpeechPractice({
      topic,
      transcript,
      duration,
      pauseCount,
      pauseDuration,
      fillerCounts,
      scratchpadNotes,
    });

    return res.status(200).json({
      success: true,
      message: "Speech evaluated successfully.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Speech Practice Evaluation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to evaluate speech practice.",
    });
  }
};

