const express = require("express");
const router = express.Router();

const {
  getBandPrediction,
  getWeaknessDetection,
  generateStudyPlan,
  getCohortAIOverview,
} = require("../controllers/aiController");

const { protect, authorize } = require("../middleware/authMiddleware");

// AI Band Prediction
router.get("/band-prediction", protect, getBandPrediction);

// AI Weakness Detection
router.get("/weakness-detection", protect, getWeaknessDetection);

// AI Study Planner
router.post("/study-plan", protect, generateStudyPlan);

// Admin Cohort Overview
router.get("/cohort-overview", protect, authorize("admin", "teacher"), getCohortAIOverview);

module.exports = router;
