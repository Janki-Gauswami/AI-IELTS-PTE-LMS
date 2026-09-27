const express = require("express");

const router = express.Router();

const {
  startIELTSTestAttempt,
  saveIELTSAnswers,
  submitIELTSTestAttempt,
  getIELTSTestAttemptById,
  getStudentPreviousIELTSAttempts,
} = require("../controllers/ieltsTestAttemptController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

/**
 * ============================================================
 * IELTS TEST ATTEMPT ROUTES
 * ============================================================
 *
 * Base:
 * /api/v1/ielts/attempts
 * ============================================================
 */

/**
 * START ATTEMPT
 *
 * POST
 * /api/v1/ielts/attempts/start
 */
router.post(
  "/start",
  protect,
  authorize("student"),
  startIELTSTestAttempt
);

/**
 * GET MY PREVIOUS ATTEMPTS
 *
 * GET
 * /api/v1/ielts/attempts/my
 */
router.get(
  "/my",
  protect,
  authorize("student"),
  getStudentPreviousIELTSAttempts
);

/**
 * GET ATTEMPT BY ID
 *
 * GET
 * /api/v1/ielts/attempts/:attemptId
 *
 * THIS IS THE IMPORTANT RESULT ROUTE.
 */
router.get(
  "/:attemptId",
  protect,
  authorize("student"),
  getIELTSTestAttemptById
);

/**
 * SAVE ANSWERS
 *
 * PATCH
 * /api/v1/ielts/attempts/:attemptId/answers
 */
router.patch(
  "/:attemptId/answers",
  protect,
  authorize("student"),
  saveIELTSAnswers
);

/**
 * SUBMIT TEST
 *
 * POST
 * /api/v1/ielts/attempts/:attemptId/submit
 */
router.post(
  "/:attemptId/submit",
  protect,
  authorize("student"),
  submitIELTSTestAttempt
);

module.exports = router;