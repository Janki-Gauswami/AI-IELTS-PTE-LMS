const express = require("express");

const router = express.Router();

const {
  getStudentProgress,
  getMyProgress,
  getSectionPerformance,
  getScoreTrends,
  getWeakAreas,
  getPerformanceStatistics,
} = require("../controllers/ieltsProgressController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");


// ======================================================
// IELTS Progress Routes
// ======================================================
// Base URL:
// /api/v1/ielts/progress
// ======================================================


// ======================================================
// Get My IELTS Progress
// Student
// ======================================================

router.get(
  "/me",
  protect,
  authorize("student"),
  getMyProgress
);


// ======================================================
// Get My IELTS Section Performance
// Student
// ======================================================

router.get(
  "/me/sections",
  protect,
  authorize("student"),
  getSectionPerformance
);


// ======================================================
// Get My IELTS Score Trends
// Student
// ======================================================

router.get(
  "/me/trends",
  protect,
  authorize("student"),
  getScoreTrends
);


// ======================================================
// Get My IELTS Weak Areas
// Student
// ======================================================

router.get(
  "/me/weak-areas",
  protect,
  authorize("student"),
  getWeakAreas
);


// ======================================================
// Get My IELTS Performance Statistics
// Student
// ======================================================

router.get(
  "/me/statistics",
  protect,
  authorize("student"),
  getPerformanceStatistics
);


// ======================================================
// Get Student IELTS Progress
// Admin + Teacher
// ======================================================

router.get(
  "/student/:studentId",
  protect,
  authorize("admin", "teacher"),
  getStudentProgress
);


// ======================================================
// Get Student IELTS Section Performance
// Admin + Teacher
// ======================================================

router.get(
  "/student/:studentId/sections",
  protect,
  authorize("admin", "teacher"),
  getSectionPerformance
);


// ======================================================
// Get Student IELTS Score Trends
// Admin + Teacher
// ======================================================

router.get(
  "/student/:studentId/trends",
  protect,
  authorize("admin", "teacher"),
  getScoreTrends
);


// ======================================================
// Get Student IELTS Weak Areas
// Admin + Teacher
// ======================================================

router.get(
  "/student/:studentId/weak-areas",
  protect,
  authorize("admin", "teacher"),
  getWeakAreas
);


// ======================================================
// Get Student IELTS Performance Statistics
// Admin + Teacher
// ======================================================

router.get(
  "/student/:studentId/statistics",
  protect,
  authorize("admin", "teacher"),
  getPerformanceStatistics
);


module.exports = router;