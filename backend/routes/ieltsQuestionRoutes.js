const express = require("express");

const router = express.Router();

const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/ieltsQuestionController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// IELTS Question Routes
// Base URL:
// /api/v1/ielts/questions
// ======================================================


// ======================================================
// Get All Questions
// Admin + Teacher + Student
// ======================================================

router.get(
  "/",
  protect,
  authorize("admin", "teacher", "student"),
  getAllQuestions
);


// ======================================================
// Get Question By ID
// Admin + Teacher + Student
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("admin", "teacher", "student"),
  getQuestionById
);


// ======================================================
// Create Question
// Admin + Teacher
// ======================================================

router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createQuestion
);


// ======================================================
// Update Question
// Admin + Teacher
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  updateQuestion
);


// ======================================================
// Delete Question
// Admin + Teacher
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  deleteQuestion
);


module.exports = router;