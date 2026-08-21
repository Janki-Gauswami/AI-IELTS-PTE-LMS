const express = require("express");

const router = express.Router();

const {
  createPTELesson,
  getAllPTELessons,
  getPTELessonById,
  updatePTELesson,
  deletePTELesson,
  publishPTELesson,
  unpublishPTELesson,
  restorePTELesson,
} = require("../controllers/pteLessonController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// PTE LESSON ROUTES
//
// Base URL:
// /api/v1/pte/lessons
// ======================================================

// ======================================================
// GET ALL PTE LESSONS
//
// Admin + Teacher + Student
//
// Search:
//
// GET /api/v1/pte/lessons?search=grammar
//
// Section:
//
// GET /api/v1/pte/lessons?section=Reading
//
// Status:
//
// GET /api/v1/pte/lessons?status=Published
//
// Difficulty:
//
// GET /api/v1/pte/lessons?difficulty=Easy
//
// Combined:
//
// GET /api/v1/pte/lessons
// ?section=Reading
// &status=Published
// &difficulty=Easy
// &search=grammar
// ======================================================

router.get(
  "/",
  protect,
  authorize(
    "admin",
    "teacher",
    "student"
  ),
  getAllPTELessons
);

// ======================================================
// GET LESSON BY ID
//
// GET /api/v1/pte/lessons/:id
//
// Admin + Teacher + Student
// ======================================================

router.get(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher",
    "student"
  ),
  getPTELessonById
);

// ======================================================
// CREATE LESSON
//
// POST /api/v1/pte/lessons
//
// Admin + Teacher
// ======================================================

router.post(
  "/",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  createPTELesson
);

// ======================================================
// UPDATE LESSON
//
// PATCH /api/v1/pte/lessons/:id
//
// Admin + Teacher
// ======================================================

router.patch(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  updatePTELesson
);

// ======================================================
// ARCHIVE LESSON
//
// DELETE /api/v1/pte/lessons/:id
//
// IMPORTANT:
// This performs a SOFT DELETE.
// Lesson is changed to Archived.
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  deletePTELesson
);

// ======================================================
// PUBLISH LESSON
//
// PATCH /api/v1/pte/lessons/:id/publish
//
// Draft → Published
// ======================================================

router.patch(
  "/:id/publish",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  publishPTELesson
);

// ======================================================
// UNPUBLISH LESSON
//
// PATCH /api/v1/pte/lessons/:id/unpublish
//
// Published → Draft
// ======================================================

router.patch(
  "/:id/unpublish",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  unpublishPTELesson
);

// ======================================================
// RESTORE LESSON
//
// PATCH /api/v1/pte/lessons/:id/restore
//
// Archived → Draft
// ======================================================

router.patch(
  "/:id/restore",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  restorePTELesson
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;