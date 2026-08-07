const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");
const exportAttendanceCSV = require("../utils/csvExporter");
const exportAttendanceExcel = require("../utils/excelExporter");
const exportAttendancePDF = require("../utils/pdfExporter");
const StudentProfile = require("../models/StudentProfile");


// ==============================================
// Mark Attendance
// POST /api/v1/attendance
// ==============================================


exports.markAttendance = async (req, res) => {
  try {
    const {
      student,
      batch,
      date,
      status,
      remarks,
    } = req.body;

    // ==============================================
    // Validate Required Fields
    // ==============================================

    if (!student || !batch || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // ==============================================
    // Validate Status
    // ==============================================

    const validStatus = [
      "Present",
      "Absent",
      "Late",
      "Excused",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    // ==============================================
    // Prevent Future Attendance
    // ==============================================

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (attendanceDate > today) {
      return res.status(400).json({
        success: false,
        message: "Future attendance cannot be marked.",
      });
    }

    // ==============================================
    // Check Student Exists
    // ==============================================

    const studentData = await StudentProfile.findOne({
        userId: student,
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: "Student not found.",
        });
      }

    // ==============================================
    // Attendance Before Admission Not Allowed
    // ==============================================

    const admissionDate = new Date(studentData.joinedDate);
    admissionDate.setHours(0, 0, 0, 0);

    if (attendanceDate < admissionDate) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance cannot be marked before student admission.",
      });
    }

    // ==============================================
    // Check Batch Exists
    // ==============================================

    const batchData = await Batch.findById(batch);

    if (!batchData) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // ==============================================
    // Batch Must Be Active
    // ==============================================

    if (batchData.status !== "Active") {
      return res.status(400).json({
        success: false,
        message:
          "Attendance can only be marked for active batches.",
      });
    }

    // ==============================================
    // Teacher Can Mark Only Assigned Batch
    // ==============================================

    if (req.user.role === "teacher") {
      const isAssigned = batchData.teachers.some(
        (teacherId) =>
          teacherId.toString() === req.user._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this batch.",
        });
      }
    }

    // ==============================================
    // Prevent Duplicate Attendance
    // ==============================================

    const existingAttendance = await Attendance.findOne({
      student: studentData._id,
      batch,
      date: attendanceDate,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance already marked for this student.",
      });
    }

    // ==============================================
    // Create Attendance
    // ==============================================

    const attendance = await Attendance.create({
      student: studentData._id,
      teacher: req.user._id,
      batch,
      date: attendanceDate,
      status,
      remarks,
      markedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully.",
      data: attendance,
    });

  } catch (error) {
  console.log("========== ATTENDANCE ERROR ==========");
  console.log(error);
  console.log(error.stack);
  console.log("=====================================");

  return res.status(500).json({
    success: false,
    message: "Failed to mark attendance.",
    error: error.message,
  });
}
};
// ==============================================
// Get All Attendance
// GET /api/v1/attendance
// ==============================================

// ==============================================
// Get Attendance History
// GET /api/v1/attendance
// ==============================================

exports.getAttendance = async (req, res) => {
  try {
    const {
      date,
      batch,
      teacher,
      student,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Date Filter
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);

      query.date = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    }

    // Batch Filter
    if (batch) {
      query.batch = batch;
    }

    // Teacher Filter (Admin Only)
    if (teacher && req.user.role === "admin") {
      query.teacher = teacher;
    }

    // Status Filter
    if (status) {
      query.status = status;
    }

    // Teacher can view only their attendance
    if (req.user.role === "teacher") {
      query.teacher = req.user._id;
    }

    let attendance = await Attendance.find(query)
      .populate("student", "fullName email phone")
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course")
      .sort({ date: -1 });

    // Student Search
    if (student) {
      attendance = attendance.filter((record) => {
        const name =
          record.student?.fullName?.toLowerCase() || "";

        const email =
          record.student?.email?.toLowerCase() || "";

        const phone =
          record.student?.phone?.toLowerCase() || "";

        const keyword = student.toLowerCase();

        return (
          name.includes(keyword) ||
          email.includes(keyword) ||
          phone.includes(keyword)
        );
      });
    }

    const total = attendance.length;

    const start = (page - 1) * limit;
    const end = start + Number(limit);

    const paginatedAttendance = attendance.slice(start, end);

    return res.status(200).json({
      success: true,
      totalRecords: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: paginatedAttendance,
    });

  } catch (error) {

    console.error("Get Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance history.",
      error: error.message,
    });

  }
};

// ==============================================
// Get Attendance By ID
// GET /api/v1/attendance/:id
// ==============================================

exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("student", "fullName email phone")
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: attendance,
    });

  } catch (error) {
    console.error("Get Attendance By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance record.",
      error: error.message,
    });
  }
};

// ==============================================
// Update Attendance
// PUT /api/v1/attendance/:id
// ==============================================

exports.updateAttendance = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id)
      .populate("batch");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    // Validate status
    const validStatus = [
      "Present",
      "Absent",
      "Late",
      "Excused",
    ];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    // ==============================
    // Teacher Restrictions
    // ==============================
    if (req.user.role === "teacher") {

      // Teacher must be assigned to the batch
      const isAssigned = attendance.batch.teachers.some(
        (teacherId) =>
          teacherId.toString() === req.user._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this batch.",
        });
      }

// Teacher Can Edit Only Within 24 Hours

const hoursDifference =
    (Date.now() - attendance.date.getTime()) /
    (1000 * 60 * 60);

if (hoursDifference > 24) {
    return res.status(403).json({
        success: false,
        message:
            "Teachers can edit attendance only within 24 hours.",
    });
}
    }

    // ==============================
    // Update Fields
    // ==============================

    if (status) {
      attendance.status = status;
    }

    if (remarks !== undefined) {
      attendance.remarks = remarks;
    }

    attendance.markedBy = req.user._id;

    await attendance.save();

    const updatedAttendance = await Attendance.findById(
      attendance._id
    )
      .populate("student", "fullName email")
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course");

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      data: updatedAttendance,
    });

  } catch (error) {

    console.error("Update Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update attendance.",
      error: error.message,
    });

  }
};

// ==============================================
// Delete Attendance
// DELETE /api/v1/attendance/:id
// ==============================================

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    // ==============================
    // Role Authorization
    // ==============================

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete attendance records.",
      });
    }

    await attendance.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete attendance.",
      error: error.message,
    });
  }
};
// ==============================================
// Student Attendance Summary
// GET /api/v1/attendance/student/summary
// ==============================================

exports.getStudentAttendanceSummary = async (req, res) => {
  try {

    // Logged-in student
    const studentId = req.user._id;

    const attendance = await Attendance.find({
      student: studentId,
    });

    const total = attendance.length;

    const present = attendance.filter(
      (record) => record.status === "Present"
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "Absent"
    ).length;

    const late = attendance.filter(
      (record) => record.status === "Late"
    ).length;

    const excused = attendance.filter(
      (record) => record.status === "Excused"
    ).length;

    const percentage =
      total === 0
        ? 0
        : Number(((present / total) * 100).toFixed(2));

    return res.status(200).json({
      success: true,

      data: {
        totalDays: total,
        presentDays: present,
        absentDays: absent,
        lateDays: late,
        excusedDays: excused,
        attendancePercentage: percentage,
      },
    });

  } catch (error) {

    console.error(
      "Student Attendance Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance summary.",
      error: error.message,
    });

  }
};

// ==============================================
// Student Attendance History
// GET /api/v1/attendance/student/history
// ==============================================

exports.getStudentAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.user._id;

    const {
      month,
      year,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      student: studentId,
    };

    // ==========================================
    // Month & Year Filter
    // ==========================================

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);

      const endDate = new Date(year, month, 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // ==========================================
    // Status Filter
    // ==========================================

    if (status) {
      query.status = status;
    }

    // ==========================================
    // Total Records
    // ==========================================

    const totalRecords = await Attendance.countDocuments(
      query
    );

    // ==========================================
    // Attendance History
    // ==========================================

    const attendance = await Attendance.find(query)
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(
        totalRecords / Number(limit)
      ),
      data: attendance,
    });

  } catch (error) {

    console.error(
      "Student Attendance History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance history.",
      error: error.message,
    });

  }
};

// ==============================================
// Student Attendance Calendar
// GET /api/v1/attendance/student/calendar
// ==============================================

exports.getStudentAttendanceCalendar = async (req, res) => {
  try {
    const studentId = req.user._id;

    const { month, year } = req.query;

    const query = {
      student: studentId,
    };

    // ==========================================
    // Month & Year Filter
    // ==========================================

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);

      const endDate = new Date(year, month, 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // ==========================================
    // Fetch Attendance
    // ==========================================

    const attendance = await Attendance.find(query)
      .select("date status remarks")
      .sort({ date: 1 });

    // ==========================================
    // Calendar Data
    // ==========================================

    const calendarData = attendance.map((record) => ({
      date: record.date,
      status: record.status,
      remarks: record.remarks || "",
    }));

    return res.status(200).json({
      success: true,
      count: calendarData.length,
      data: calendarData,
    });

  } catch (error) {

    console.error(
      "Student Attendance Calendar Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance calendar.",
      error: error.message,
    });

  }
};
// ==============================================
// Attendance Dashboard Analytics
// GET /api/v1/attendance/dashboard
// ==============================================

exports.getAttendanceDashboard = async (req, res) => {
  try {
    const today = new Date();

    const startToday = new Date(today);
    startToday.setHours(0, 0, 0, 0);

    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    // ==========================================
    // Today's Attendance
    // ==========================================

    const todayAttendance = await Attendance.find({
      date: {
        $gte: startToday,
        $lte: endToday,
      },
    });

    const present = todayAttendance.filter(
      (item) => item.status === "Present"
    ).length;

    const absent = todayAttendance.filter(
      (item) => item.status === "Absent"
    ).length;

    const late = todayAttendance.filter(
      (item) => item.status === "Late"
    ).length;

    const excused = todayAttendance.filter(
      (item) => item.status === "Excused"
    ).length;

    // ==========================================
    // Overall Attendance %
    // ==========================================

    const totalAttendance = await Attendance.countDocuments();

    const totalPresent = await Attendance.countDocuments({
      status: "Present",
    });

    const overallPercentage =
      totalAttendance === 0
        ? 0
        : Number(
            (
              (totalPresent / totalAttendance) *
              100
            ).toFixed(2)
          );

    // ==========================================
    // Attendance Trend (Last 7 Days)
    // ==========================================

    const attendanceTrend = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(today.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Attendance.countDocuments({
        date: {
          $gte: dayStart,
          $lte: dayEnd,
        },
      });

      attendanceTrend.push({
        date: dayStart.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        count,
      });
    }

    // ==========================================
    // Batch Comparison
    // ==========================================

    const batchComparison = await Attendance.aggregate([
      {
        $group: {
          _id: "$batch",
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "batches",
          localField: "_id",
          foreignField: "_id",
          as: "batch",
        },
      },
      {
        $unwind: "$batch",
      },
      {
        $project: {
          batchName: "$batch.batchName",
          total: 1,
        },
      },
    ]);

    // ==========================================
    // Monthly Attendance
    // ==========================================

    const monthlyAttendance = await Attendance.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,

      cards: {
        todayAttendance: todayAttendance.length,
        present,
        absent,
        late,
        excused,
        overallPercentage,
      },

      attendanceTrend,

      batchComparison,

      monthlyAttendance,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to load attendance dashboard.",
      error: error.message,
    });
  }
};

// ==============================================
// Attendance Report
// GET /api/v1/attendance/report
// ==============================================

exports.getAttendanceReport = async (req, res) => {
  try {

    const {
      batch,
      teacher,
      student,
      date,
      month,
      year,
    } = req.query;

    const query = {};

    // ==========================================
    // Batch Filter
    // ==========================================

    if (batch) {
      query.batch = batch;
    }

    // ==========================================
    // Teacher Filter
    // ==========================================

    if (teacher) {
      query.teacher = teacher;
    }

    // ==========================================
    // Student Filter
    // ==========================================

    if (student) {
      query.student = student;
    }
        // ==========================================
    // Exact Date Filter
    // ==========================================

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end,
      };

    }

    // ==========================================
    // Month & Year Filter
    // ==========================================

    else if (month && year) {

      const start = new Date(year, month - 1, 1);

      const end = new Date(year, month, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };

    }
        // ==========================================
    // Fetch Report
    // ==========================================

    const attendance = await Attendance.find(query)

      .populate(
        "student",
        "fullName email phone"
      )

      .populate(
        "teacher",
        "fullName email"
      )

      .populate(
        "batch",
        "batchName course"
      )

      .sort({
        date: -1,
      });
          return res.status(200).json({

      success: true,

      totalRecords: attendance.length,

      data: attendance,

    });

  } catch (error) {

    console.error(
      "Attendance Report Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to generate attendance report.",

      error: error.message,

    });

  }
};

// ==============================================
// Export Attendance Report (CSV)
// GET /api/v1/attendance/report/csv
// ==============================================

exports.exportAttendanceCSV = async (req, res) => {
  try {
    const {
      batch,
      teacher,
      student,
      date,
      month,
      year,
    } = req.query;

    const query = {};

    // Batch
    if (batch) {
      query.batch = batch;
    }

    // Teacher
    if (teacher) {
      query.teacher = teacher;
    }

    // Student
    if (student) {
      query.student = student;
    }

    // Date
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    // Month + Year
    else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };
    }

    const attendance = await Attendance.find(query)
      .populate("student", "fullName email phone")
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course")
      .sort({ date: -1 });

    const csv = exportAttendanceCSV(attendance);

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment("attendance-report.csv");

    return res.send(csv);

  } catch (error) {

    console.error("CSV Export Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export CSV.",
      error: error.message,
    });

  }
};
// ==============================================
// Export Attendance Report (Excel)
// GET /api/v1/attendance/report/excel
// ==============================================

exports.exportAttendanceExcel = async (req, res) => {
  try {

    const {
      batch,
      teacher,
      student,
      date,
      month,
      year,
    } = req.query;

    const query = {};

    if (batch) query.batch = batch;
    if (teacher) query.teacher = teacher;
    if (student) query.student = student;

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end,
      };

    } else if (month && year) {

      const start = new Date(year, month - 1, 1);

      const end = new Date(year, month, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };

    }

    const attendance = await Attendance.find(query)
      .populate("student", "fullName email phone")
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course")
      .sort({ date: -1 });

    const workbook =
      await exportAttendanceExcel(attendance);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance-report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error(
      "Excel Export Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to export Excel.",
      error: error.message,
    });

  }
};

// ==============================================
// Export Attendance Report (PDF)
// GET /api/v1/attendance/report/pdf
// ==============================================

exports.exportAttendancePDF = async (req, res) => {
  try {

    const {
      batch,
      teacher,
      student,
      date,
      month,
      year,
    } = req.query;

    const query = {};

    if (batch) query.batch = batch;
    if (teacher) query.teacher = teacher;
    if (student) query.student = student;

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end,
      };

    } else if (month && year) {

      const start = new Date(year, month - 1, 1);

      const end = new Date(year, month, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };

    }

    const attendance = await Attendance.find(query)
      .populate("student", "fullName email phone")
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course")
      .sort({ date: -1 });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance-report.pdf"
    );

    exportAttendancePDF(attendance, res);

  } catch (error) {

    console.error("PDF Export Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to export PDF.",
      error: error.message,
    });

  }
};// ==============================================
// Export Attendance Report (PDF)
// GET /api/v1/attendance/report/pdf
// ==============================================

exports.exportAttendancePDF = async (req, res) => {
  try {

    const {
      batch,
      teacher,
      student,
      date,
      month,
      year,
    } = req.query;

    const query = {};

    if (batch) query.batch = batch;
    if (teacher) query.teacher = teacher;
    if (student) query.student = student;

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end,
      };

    } else if (month && year) {

      const start = new Date(year, month - 1, 1);

      const end = new Date(year, month, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };

    }

    const attendance = await Attendance.find(query)
      .populate("student", "fullName email phone")
      .populate("teacher", "fullName email")
      .populate("batch", "batchName course")
      .sort({ date: -1 });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance-report.pdf"
    );

    exportAttendancePDF(attendance, res);

  } catch (error) {

    console.error("PDF Export Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to export PDF.",
      error: error.message,
    });

  }
};