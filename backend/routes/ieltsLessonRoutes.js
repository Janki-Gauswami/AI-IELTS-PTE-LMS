const express = require("express");

const router = express.Router();

const {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/ieltsLessonController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// IELTS Lesson Routes
// Base URL:
// /api/v1/ielts/lessons
// ======================================================


// ======================================================
// Get All Lessons
// Admin + Teacher + Student
// GET /api/v1/ielts/lessons
// ======================================================

router.get(
  "/",
  protect,
  authorize("admin", "teacher", "student"),
  getAllLessons
);


// ======================================================
// Get Lesson By ID
// Admin + Teacher + Student
// GET /api/v1/ielts/lessons/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("admin", "teacher", "student"),
  getLessonById
);


// ======================================================
// Create Lesson
// Admin + Teacher
// POST /api/v1/ielts/lessons
// ======================================================

router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createLesson
);


// ======================================================
// Update Lesson
// Admin + Teacher
// PUT /api/v1/ielts/lessons/:id
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  updateLesson
);


// ======================================================
// Delete Lesson
// Admin + Teacher
// DELETE /api/v1/ielts/lessons/:id
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  deleteLesson
);


module.exports = router;