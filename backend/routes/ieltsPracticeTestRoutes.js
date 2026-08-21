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
} = require("../controllers/ieltsPracticeTestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// IELTS PRACTICE TEST ROUTES
// Base:
// /api/v1/ielts/tests
// ======================================================


// ======================================================
// GET ALL PRACTICE TESTS
// GET /api/v1/ielts/tests
//
// Admin + Teacher + Student
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
// GET PRACTICE TEST BY ID
// GET /api/v1/ielts/tests/:id
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
// POST /api/v1/ielts/tests
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
// UPDATE PRACTICE TEST
// PATCH /api/v1/ielts/tests/:id
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
// DELETE / ARCHIVE PRACTICE TEST
// DELETE /api/v1/ielts/tests/:id
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
// PATCH /api/v1/ielts/tests/:id/publish
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
// PATCH /api/v1/ielts/tests/:id/unpublish
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