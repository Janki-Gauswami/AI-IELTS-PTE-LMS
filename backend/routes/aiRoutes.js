const express = require("express");
const router = express.Router();

const {
  getBandPrediction,
  getWeaknessDetection,
  generateStudyPlan,
  getCohortAIOverview,
  evaluateSubmission,
  analyzeSpeechPractice,
} = require("../controllers/aiController");

const { protect, authorize } = require("../middleware/authMiddleware");

// AI Band Prediction
router.get("/band-prediction", protect, getBandPrediction);

// AI Weakness Detection
router.get("/weakness-detection", protect, getWeaknessDetection);

// AI Study Planner
router.post("/study-plan", protect, generateStudyPlan);

// AI Evaluate Submission
router.post("/evaluate-submission", protect, evaluateSubmission);

// AI Evaluate Public Speaking Practice (Student Only, stateless & private)
router.post(
  "/analyze-speech",
  (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      return protect(req, res, next);
    }
    next();
  },
  analyzeSpeechPractice
);

// Admin Cohort Overview
router.get("/cohort-overview", protect, authorize("admin", "teacher"), getCohortAIOverview);

module.exports = router;
