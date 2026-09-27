const express = require("express");

const router = express.Router();

const {
  startPTETestAttempt,
  savePTEAnswers,
  submitPTETestAttempt,
  getPTETestAttemptById,
  getStudentPreviousPTEAttempts,
} = require("../controllers/pteTestAttemptController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// PTE Test Attempt Routes
// Base URL:
// /api/v1/pte/attempts
// ======================================================


// ======================================================
// Start PTE Test Attempt
// POST /api/v1/pte/attempts/start
// ======================================================

router.post(
  "/start",
  protect,
  authorize("student"),
  startPTETestAttempt
);


// ======================================================
// Save PTE Answer
// PATCH /api/v1/pte/attempts/:attemptId/answers
// ======================================================

router.patch(
  "/:attemptId/answers",
  protect,
  authorize("student"),
  savePTEAnswers
);


// ======================================================
// Submit PTE Test
// POST /api/v1/pte/attempts/:attemptId/submit
// ======================================================

router.post(
  "/:attemptId/submit",
  protect,
  authorize("student"),
  submitPTETestAttempt
);


// ======================================================
// Get My PTE Attempts
// GET /api/v1/pte/attempts/my
// ======================================================

router.get(
  "/my",
  protect,
  authorize("student"),
  getStudentPreviousPTEAttempts
);


// ======================================================
// Get Attempt By ID
// GET /api/v1/pte/attempts/:attemptId
// ======================================================

router.get(
  "/:attemptId",
  protect,
  authorize("student"),
  getPTETestAttemptById
);


// ======================================================
// Export
// ======================================================

module.exports = router;