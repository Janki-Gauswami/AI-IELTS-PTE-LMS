const express = require("express");
const router = express.Router();

const {
  getAdminAnalytics,
  getTeacherAnalytics,
  getStudentAnalytics,
} = require("../controllers/analyticsController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Admin Analytics
router.get("/admin", protect, authorize("admin"), getAdminAnalytics);

// Teacher Analytics
router.get("/teacher", protect, authorize("teacher", "admin"), getTeacherAnalytics);

// Student Analytics
router.get("/student", protect, authorize("student", "admin", "teacher"), getStudentAnalytics);

module.exports = router;
