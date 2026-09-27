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
  startIELTSTestAttempt,
  saveIELTSTestAnswers,
  submitIELTSTestAttempt,
  getIELTSTestResult,
  getStudentPreviousAttempts,
  getIELTSTestAttemptsForReview,
  getIELTSTestAttemptForReview,
  evaluateIELTSTestAttempt,
} = require("../controllers/ieltsPracticeTestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  checkTeacherSpecialization,
} = require("../middleware/specializationMiddleware");

// ======================================================
// IELTS PRACTICE TEST ROUTES
// Base:
// /api/v1/ielts/tests
// ======================================================

// Teacher / Admin: Review & Evaluation Endpoints
router.get(
  "/attempts/review-list",
  protect,
  authorize("admin", "teacher"),
  checkTeacherSpecialization("IELTS"),
  getIELTSTestAttemptsForReview
);

router.get(
  "/attempts/:attemptId/review",
  protect,
  authorize("admin", "teacher"),
  checkTeacherSpecialization("IELTS"),
  getIELTSTestAttemptForReview
);

router.post(
  "/attempts/:attemptId/evaluate",
  protect,
  authorize("admin", "teacher"),
  checkTeacherSpecialization("IELTS"),
  evaluateIELTSTestAttempt
);

// Student Previous Attempts History
router.get(
  "/attempts/history",
  protect,
  authorize("student"),
  getStudentPreviousAttempts
);

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

// Student Test Start / Attempt
router.get(
  "/:id/start",
  protect,
  authorize("student", "admin", "teacher"),
  getPracticeTestById
);

router.post(
  "/:id/attempt/start",
  protect,
  authorize("student"),
  startIELTSTestAttempt
);

router.patch(
  "/:id/attempt/:attemptId/answers",
  protect,
  authorize("student"),
  saveIELTSTestAnswers
);

router.post(
  "/:id/attempt/:attemptId/submit",
  protect,
  authorize("student"),
  submitIELTSTestAttempt
);

router.get(
  "/:id/attempt/:attemptId/result",
  protect,
  authorize("student", "admin", "teacher"),
  getIELTSTestResult
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
  checkTeacherSpecialization("IELTS"),
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
  checkTeacherSpecialization("IELTS"),
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
  checkTeacherSpecialization("IELTS"),
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
  checkTeacherSpecialization("IELTS"),
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
  checkTeacherSpecialization("IELTS"),
  unpublishPracticeTest
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;