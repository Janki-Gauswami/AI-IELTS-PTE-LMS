const express = require("express");

const router = express.Router();

const {
  createResult,
  getStudentResults,
  getMyResults,
  getResultById,
  updateResult,
  createResultFromAttempt,
} = require("../controllers/ieltsResultController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// IELTS Result Routes
// Base URL:
// /api/v1/ielts/results
// ======================================================


// ======================================================
// Get My Results
// Student Only
// GET /api/v1/ielts/results/my
// ======================================================

router.get(
  "/my",
  protect,
  authorize("student"),
  getMyResults
);


// ======================================================
// Get Result By ID
// Admin + Teacher + Student
// GET /api/v1/ielts/results/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("admin", "teacher", "student"),
  getResultById
);


// ======================================================
// Get Student Results
// Admin + Teacher
// GET /api/v1/ielts/results/student/:studentId
// ======================================================

router.get(
  "/student/:studentId",
  protect,
  authorize("admin", "teacher"),
  getStudentResults
);


// ======================================================
// Create Result
// Admin + Teacher
// POST /api/v1/ielts/results
// ======================================================

router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createResult
);


// ======================================================
// Update Result
// Admin + Teacher
// PUT /api/v1/ielts/results/:id
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  updateResult
);

// ==========================================
// Create Result From IELTS Attempt
// ==========================================

router.post(
  "/from-attempt/:attemptId",
  protect,
  authorize("admin", "teacher"),
  createResultFromAttempt
);

module.exports = router;