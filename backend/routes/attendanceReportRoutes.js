const express = require("express");
const router = express.Router();

const {
  getAttendanceReport,
  exportAttendanceCSV,
  exportAttendanceExcel,
  exportAttendancePDF,
  getAttendanceDashboard,
} = require("../controllers/attendanceReportController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, authorize("admin"), getAttendanceDashboard);
router.get("/report", protect, authorize("admin"), getAttendanceReport);
router.get("/report/csv", protect, authorize("admin"), exportAttendanceCSV);
router.get("/report/excel", protect, authorize("admin"), exportAttendanceExcel);
router.get("/report/pdf", protect, authorize("admin"), exportAttendancePDF);

module.exports = router;
