const express = require("express");

const router = express.Router();

const {
  markAttendance,
  getAttendance,
  getAttendanceDashboard,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,

  // ==============================================
  // Student Attendance
  // ==============================================
  getStudentAttendanceSummary,
  getStudentAttendanceHistory,
  getStudentAttendanceCalendar,
  getAttendanceReport,

  exportAttendanceCSV,
  exportAttendanceExcel,
  exportAttendancePDF,
} = require("../controllers/attendanceController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// Attendance Routes
// Base URL: /api/v1/attendance
// ======================================================

// ==============================================
// Student Attendance
// ==============================================

// Student Attendance Summary
router.get(
  "/student/summary",
  protect,
  authorize("student"),
  getStudentAttendanceSummary
);

// Student Attendance History
router.get(
  "/student/history",
  protect,
  authorize("student"),
  getStudentAttendanceHistory
);

// Student Attendance Calendar
router.get(
  "/student/calendar",
  protect,
  authorize("student"),
  getStudentAttendanceCalendar
);

// ==============================================
// Mark Attendance
// Admin & Teacher
// POST /api/v1/attendance
// ==============================================

router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  markAttendance
);

// ==============================================
// Attendance History
// Admin -> View All
// Teacher -> View Own Attendance
// GET /api/v1/attendance
// ==============================================

router.get(
  "/",
  protect,
  authorize("admin", "teacher"),
  getAttendance
);

// ==============================================
// Attendance Dashboard Analytics
// Admin Only
// GET /api/v1/attendance/dashboard
// ==============================================

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getAttendanceDashboard
);

// ==============================================
// Export Attendance CSV
// GET /api/v1/attendance/report/csv
// ==============================================

router.get(
  "/report/csv",
  protect,
  authorize("admin"),
  exportAttendanceCSV
);

// ==============================================
// Export Attendance Excel
// GET /api/v1/attendance/report/excel
// ==============================================

router.get(
  "/report/excel",
  protect,
  authorize("admin"),
  exportAttendanceExcel
);

// ==============================================
// Export Attendance PDF
// GET /api/v1/attendance/report/pdf
// ==============================================

router.get(
  "/report/pdf",
  protect,
  authorize("admin"),
  exportAttendancePDF
);

// ==============================================
// Attendance Report
// Admin Only
// GET /api/v1/attendance/report
// ==============================================

router.get(
  "/report",
  protect,
  authorize("admin"),
  getAttendanceReport
);

// ==============================================
// Get Attendance By ID
// Admin & Teacher
// GET /api/v1/attendance/:id
// ==============================================

router.get(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  getAttendanceById
);

// ==============================================
// Update Attendance
// Admin -> Any Record
// Teacher -> Own Batch & Same Day Only
// PUT /api/v1/attendance/:id
// ==============================================

router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  updateAttendance
);

// ==============================================
// Delete Attendance
// Admin Only
// DELETE /api/v1/attendance/:id
// ==============================================

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteAttendance
);

module.exports = router;
