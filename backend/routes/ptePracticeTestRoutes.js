const express = require("express");

const router = express.Router();

const {
  createPracticeTest,
  getAllPracticeTests,
  getPracticeTestById,
  updatePracticeTest,
  deletePracticeTest,
  publishPracticeTest,
  unpublishPracticeTest,
} = require("../controllers/ptePracticeTestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// PTE PRACTICE TEST ROUTES
//
// Base:
// /api/v1/pte/tests
// ======================================================

// ======================================================
// GET ALL PRACTICE TESTS
//
// Admin + Teacher + Student
//
// Examples:
//
// GET /api/v1/pte/tests
// GET /api/v1/pte/tests?section=Reading
// GET /api/v1/pte/tests?status=Published
// GET /api/v1/pte/tests?difficulty=Easy
// GET /api/v1/pte/tests?search=reading
// ======================================================

router.get(
  "/",
  protect,
  authorize(
    "admin",
    "teacher",
    "student"
  ),
  getAllPracticeTests
);

// ======================================================
// GET TEST DETAILS
//
// GET /api/v1/pte/tests/:id
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
  getPracticeTestById
);

// ======================================================
// CREATE PRACTICE TEST
//
// POST /api/v1/pte/tests
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
  createPracticeTest
);

// ======================================================
// EDIT PRACTICE TEST
//
// PATCH /api/v1/pte/tests/:id
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
  updatePracticeTest
);

// ======================================================
// ARCHIVE PRACTICE TEST
//
// DELETE /api/v1/pte/tests/:id
//
// This is a SOFT DELETE.
//
// Admin + Teacher
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  deletePracticeTest
);

// ======================================================
// PUBLISH PRACTICE TEST
//
// PATCH /api/v1/pte/tests/:id/publish
//
// Admin + Teacher
// ======================================================

router.patch(
  "/:id/publish",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  publishPracticeTest
);

// ======================================================
// UNPUBLISH PRACTICE TEST
//
// PATCH /api/v1/pte/tests/:id/unpublish
//
// Admin + Teacher
// ======================================================

router.patch(
  "/:id/unpublish",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  unpublishPracticeTest
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;