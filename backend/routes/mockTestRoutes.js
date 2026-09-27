const express = require("express");

const router = express.Router();

const {
  createMockTest,
  getAllMockTests,
  getMockTestById,
  updateMockTest,
  deleteMockTest,
  startMockTestAttempt,
  submitMockTestAttempt,
  evaluateMockTestAttempt,
  getMockTestAttempts,
  getMockTestAttemptById,
  getUnifiedStudentResults,
} = require("../controllers/mockTestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

/* =========================================================
   STUDENT RESULTS
========================================================= */

router.get(
  "/unified-results",
  protect,
  getUnifiedStudentResults
);

/* =========================================================
   MOCK TEST ATTEMPTS
========================================================= */

router.get(
  "/attempts",
  protect,
  getMockTestAttempts
);

router.get(
  "/attempts/:attemptId",
  protect,
  getMockTestAttemptById
);

router.post(
  "/attempts/:attemptId/submit",
  protect,
  authorize("student"),
  submitMockTestAttempt
);

router.patch(
  "/attempts/:attemptId/evaluate",
  protect,
  authorize("admin", "teacher"),
  evaluateMockTestAttempt
);

/* =========================================================
   MOCK TEST CRUD
========================================================= */

router.get(
  "/",
  protect,
  getAllMockTests
);

router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createMockTest
);

router.get(
  "/:id",
  protect,
  getMockTestById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  updateMockTest
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  deleteMockTest
);

/* =========================================================
   START TEST
========================================================= */

router.post(
  "/:id/attempt",
  protect,
  authorize("student"),
  startMockTestAttempt
);

module.exports = router;