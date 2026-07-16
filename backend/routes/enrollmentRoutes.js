const express = require("express");

const {
  assignStudent,
  removeStudent,
  transferStudent,
  getStudentsByBatch,
} = require("../controllers/enrollmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// Admin Only Routes
// ==========================================

// Assign Student to Batch
router.post(
  "/",
  protect,
  authorize("admin"),
  assignStudent
);

// Remove Student from Batch
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  removeStudent
);

// Transfer Student to Another Batch
router.put(
  "/transfer",
  protect,
  authorize("admin"),
  transferStudent
);

// Get All Students of a Batch
router.get(
  "/batch/:id/students",
  protect,
  authorize("admin"),
  getStudentsByBatch
);

module.exports = router;