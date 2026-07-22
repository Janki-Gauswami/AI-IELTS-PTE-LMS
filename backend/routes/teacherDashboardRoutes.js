const express = require("express");

const router = express.Router();

const {
  getDashboardSummary,
  getMyBatches,
  getTodayClasses,
  getTeacherProfile,
  updateTeacherProfile,
  getMyStudents,
} = require("../controllers/teacherDashboardController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ==========================================
// Teacher Dashboard
// ==========================================

// Dashboard Summary
router.get(
  "/dashboard",
  protect,
  authorize("teacher"),
  getDashboardSummary
);

// My Batches
router.get(
  "/my-batches",
  protect,
  authorize("teacher"),
  getMyBatches
);

// Today's Classes
router.get(
  "/today-classes",
  protect,
  authorize("teacher"),
  getTodayClasses
);

// Teacher Profile
router.get(
  "/profile",
  protect,
  authorize("teacher"),
  getTeacherProfile
);

// Profile
router.put(
  "/profile",
  protect,
  authorize("teacher"),
  updateTeacherProfile
);

// My Students
router.get(
  "/my-students",
  protect,
  authorize("teacher"),
  getMyStudents
);

module.exports = router;