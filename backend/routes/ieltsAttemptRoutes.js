const express = require("express");

const router = express.Router();

const {
  startTest,
  submitTest,
  getMyAttempts,
  getAttemptById,
} = require("../controllers/ieltsAttemptController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// IELTS Attempt Routes
// Base URL:
// /api/v1/ielts/attempts
// ======================================================


// ======================================================
// Start Test
// Student Only
// POST /api/v1/ielts/attempts/start
// ======================================================

router.post(
  "/start",
  protect,
  authorize("student"),
  startTest
);


// ======================================================
// Submit Test
// Student Only
// POST /api/v1/ielts/attempts/:id/submit
// ======================================================

router.post(
  "/:id/submit",
  protect,
  authorize("student"),
  submitTest
);


// ======================================================
// Get My Attempts
// Student Only
// GET /api/v1/ielts/attempts/my
// ======================================================

router.get(
  "/my",
  protect,
  authorize("student"),
  getMyAttempts
);


// ======================================================
// Get Attempt By ID
// Student Only
// GET /api/v1/ielts/attempts/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("student"),
  getAttemptById
);


module.exports = router;