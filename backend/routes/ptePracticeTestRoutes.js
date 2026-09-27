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
  startPTETestAttempt,
  savePTETestAnswers,
  submitPTETestAttempt,
  getPTETestResult,
  getStudentPreviousAttempts,
  getPTETestAttemptsForReview,
  getPTETestAttemptForReview,
  evaluatePTETestAttempt,
} = require("../controllers/ptePracticeTestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  checkTeacherSpecialization,
} = require("../middleware/specializationMiddleware");

// ======================================================
// PTE PRACTICE TEST ROUTES
//
// Base:
// /api/v1/pte/tests
// ======================================================

// Teacher / Admin: Review & Evaluation Endpoints
router.get(
  "/attempts/review-list",
  protect,
  authorize("admin", "teacher"),
  checkTeacherSpecialization("PTE"),
  getPTETestAttemptsForReview
);

router.get(
  "/attempts/:attemptId/review",
  protect,
  authorize("admin", "teacher"),
  checkTeacherSpecialization("PTE"),
  getPTETestAttemptForReview
);

router.post(
  "/attempts/:attemptId/evaluate",
  protect,
  authorize("admin", "teacher"),
  checkTeacherSpecialization("PTE"),
  evaluatePTETestAttempt
);

// Student Previous Attempts History
router.get(
  "/attempts/history",
  protect,
  authorize("student"),
  getStudentPreviousAttempts
);

// GET ALL PRACTICE TESTS
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

// Student Test Start / Attempt Endpoints
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
  startPTETestAttempt
);

router.patch(
  "/:id/attempt/:attemptId/answers",
  protect,
  authorize("student"),
  savePTETestAnswers
);

router.post(
  "/:id/attempt/:attemptId/submit",
  protect,
  authorize("student"),
  submitPTETestAttempt
);

router.get(
  "/:id/attempt/:attemptId/result",
  protect,
  authorize("student", "admin", "teacher"),
  getPTETestResult
);

// GET TEST DETAILS
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

// CREATE PRACTICE TEST
router.post(
  "/",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  checkTeacherSpecialization("PTE"),
  createPracticeTest
);

// EDIT PRACTICE TEST
router.patch(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  checkTeacherSpecialization("PTE"),
  updatePracticeTest
);

// ARCHIVE PRACTICE TEST
router.delete(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  checkTeacherSpecialization("PTE"),
  deletePracticeTest
);

// PUBLISH PRACTICE TEST
router.patch(
  "/:id/publish",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  checkTeacherSpecialization("PTE"),
  publishPracticeTest
);

// UNPUBLISH PRACTICE TEST
router.patch(
  "/:id/unpublish",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  checkTeacherSpecialization("PTE"),
  unpublishPracticeTest
);

module.exports = router;