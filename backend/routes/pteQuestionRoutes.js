const express = require("express");

const router = express.Router();

const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/pteQuestionController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// PTE Question Routes
//
// Base URL:
// /api/v1/pte/questions
// ======================================================

// ======================================================
// Get All Questions
//
// Admin + Teacher + Student
//
// GET /api/v1/pte/questions
// ======================================================

router.get(
  "/",
  protect,
  authorize(
    "admin",
    "teacher",
    "student"
  ),
  getAllQuestions
);

// ======================================================
// Get Question By ID
//
// Admin + Teacher + Student
//
// GET /api/v1/pte/questions/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher",
    "student"
  ),
  getQuestionById
);

// ======================================================
// Create Question
//
// Admin + Teacher
//
// POST /api/v1/pte/questions
// ======================================================

router.post(
  "/",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  createQuestion
);

// ======================================================
// Update Question
//
// Admin + Teacher
//
// PATCH /api/v1/pte/questions/:id
// ======================================================

router.patch(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  updateQuestion
);

// ======================================================
// Delete Question
//
// Admin + Teacher
//
// DELETE /api/v1/pte/questions/:id
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  deleteQuestion
);

// ======================================================
// Export Router
// ======================================================

module.exports = router;