const express = require("express");

const router = express.Router();

const {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  publishTest,
} = require("../controllers/pteTestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// PTE Practice Test Routes
//
// Base URL:
// /api/v1/pte/tests
// ======================================================


// ======================================================
// Get All Tests
//
// Admin + Teacher + Student
//
// GET /api/v1/pte/tests
// ======================================================

router.get(
  "/",
  protect,
  authorize(
    "admin",
    "teacher",
    "student"
  ),
  getAllTests
);


// ======================================================
// Get Test By ID
//
// Admin + Teacher + Student
//
// GET /api/v1/pte/tests/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher",
    "student"
  ),
  getTestById
);


// ======================================================
// Create Test
//
// Admin + Teacher
//
// POST /api/v1/pte/tests
// ======================================================

router.post(
  "/",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  createTest
);


// ======================================================
// Update Test
//
// Admin + Teacher
//
// PATCH /api/v1/pte/tests/:id
// ======================================================

router.patch(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  updateTest
);


// ======================================================
// Delete Test
//
// Admin + Teacher
//
// DELETE /api/v1/pte/tests/:id
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  deleteTest
);


// ======================================================
// Publish Test
//
// Admin + Teacher
//
// PATCH /api/v1/pte/tests/:id/publish
// ======================================================

router.patch(
  "/:id/publish",
  protect,
  authorize(
    "admin",
    "teacher"
  ),
  publishTest
);


module.exports = router;