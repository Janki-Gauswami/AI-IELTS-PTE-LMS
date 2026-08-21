const express = require("express");
const router = express.Router();

const {
  getReportsSummary,
  getStudentPerformanceReport,
  exportStudentPerformanceCSV,
} = require("../controllers/reportController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/summary", protect, authorize("admin", "teacher"), getReportsSummary);
router.get("/student-performance", protect, authorize("admin", "teacher"), getStudentPerformanceReport);
router.get("/student-performance/csv", protect, authorize("admin", "teacher"), exportStudentPerformanceCSV);

module.exports = router;
