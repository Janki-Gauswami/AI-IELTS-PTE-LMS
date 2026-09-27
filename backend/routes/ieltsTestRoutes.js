const express = require("express");

const router = express.Router();

const {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
} = require("../controllers/ieltsTestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// IELTS Test Routes
// Base URL:
// /api/v1/ielts/tests
// ======================================================


// ======================================================
// Get All Tests
// Admin + Teacher + Student
// ======================================================

router.get(
  "/",
  protect,
  authorize("admin", "teacher", "student"),
  getAllTests
);


// ======================================================
// Get Test By ID
// Admin + Teacher + Student
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("admin", "teacher", "student"),
  getTestById
);


// ======================================================
// Create Test
// Admin + Teacher
// ======================================================

router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createTest
);


// ======================================================
// Update Test
// Admin + Teacher
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  updateTest
);


// ======================================================
// Delete Test
// Admin + Teacher
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  deleteTest
);


module.exports = router;