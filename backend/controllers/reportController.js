const User = require("../models/User");
const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const StudentProfile = require("../models/StudentProfile");
const IELTSTestAttempt = require("../models/IELTSTestAttempt");
const PTETestAttempt = require("../models/PTETestAttempt");
const MockTestAttempt = require("../models/MockTestAttempt");

// ==========================================
// GET SUMMARY REPORTS DATA
// GET /api/v1/reports/summary
// ==========================================
exports.getReportsSummary = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const ieltsAttemptsCount = await IELTSTestAttempt.countDocuments();
    const pteAttemptsCount = await PTETestAttempt.countDocuments();
    const mockAttemptsCount = await MockTestAttempt.countDocuments();

    // Attendance summary
    const attendanceRecords = await Attendance.find().lean();
    let totalPresent = 0;
    let totalEntries = 0;
    attendanceRecords.forEach((rec) => {
      (rec.records || []).forEach((r) => {
        totalEntries++;
        if (r.status === "Present") totalPresent++;
      });
    });

    const avgAttendance = totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 88;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalBatches,
        totalTestsAttempted: ieltsAttemptsCount + pteAttemptsCount + mockAttemptsCount,
        avgAttendance,
      },
    });
  } catch (error) {
    console.error("Reports Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load reports summary.",
    });
  }
};

// ==========================================
// GET STUDENT PERFORMANCE REPORT
// GET /api/v1/reports/student-performance
// ==========================================
exports.getStudentPerformanceReport = async (req, res) => {
  try {
    const { batchId, course, search } = req.query;

    let query = {};
    if (course && course !== "all") {
      query.targetExam = course;
    }

    const students = await StudentProfile.find(query)
      .populate("userId", "name email")
      .lean();

    const reportData = await Promise.all(
      students.map(async (s) => {
        const studentUserId = s.userId?._id;
        const enrollment = await Enrollment.findOne({ student: studentUserId })
          .populate("batch", "batchName course")
          .lean();

        const ieltsCount = studentUserId ? await IELTSTestAttempt.countDocuments({ student: studentUserId }) : 0;
        const pteCount = studentUserId ? await PTETestAttempt.countDocuments({ student: studentUserId }) : 0;

        return {
          id: s._id,
          name: s.userId?.name || "Student",
          email: s.userId?.email || "email@example.com",
          course: s.targetExam || "IELTS",
          batch: enrollment?.batch?.batchName || "Unassigned",
          testsTaken: ieltsCount + pteCount,
          targetScore: s.targetBand || (s.targetExam === "IELTS" ? 7.5 : 70),
          predictedScore: s.targetExam === "IELTS" ? 6.5 : 62,
          attendanceRate: 90,
          status: s.status || "Active",
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: reportData.length,
      data: reportData,
    });
  } catch (error) {
    console.error("Student Performance Report Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate student performance report.",
    });
  }
};

// ==========================================
// EXPORT PERFORMANCE REPORT AS CSV
// GET /api/v1/reports/student-performance/csv
// ==========================================
exports.exportStudentPerformanceCSV = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate("userId", "name email")
      .lean();

    const reportData = await Promise.all(
      students.map(async (s) => {
        const studentUserId = s.userId?._id;
        const enrollment = await Enrollment.findOne({ student: studentUserId })
          .populate("batch", "batchName course")
          .lean();
        return {
          name: s.userId?.name || "Student",
          email: s.userId?.email || "",
          course: s.targetExam || "IELTS",
          batch: enrollment?.batch?.batchName || "Unassigned",
          targetScore: s.targetBand || (s.targetExam === "IELTS" ? 7.5 : 70),
          status: s.status || "Active",
        };
      })
    );

    const rows = [
      ["Student Name", "Email", "Course", "Batch", "Target Score", "Status"],
      ...reportData.map((s) => [
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.course}"`,
        `"${s.batch}"`,
        `"${s.targetScore}"`,
        `"${s.status}"`,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=student_performance_report.csv");
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export Performance CSV Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export CSV report.",
    });
  }
};
