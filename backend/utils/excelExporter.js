const ExcelJS = require("exceljs");

// ==============================================
// Attendance Excel Export Utility
// ==============================================

const exportAttendanceExcel = async (attendance) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "AI IELTS PTE LMS";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Attendance Report");

  worksheet.columns = [
    { header: "Student Name", key: "studentName", width: 25 },
    { header: "Student Email", key: "studentEmail", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Teacher", key: "teacher", width: 25 },
    { header: "Batch", key: "batch", width: 20 },
    { header: "Course", key: "course", width: 15 },
    { header: "Date", key: "date", width: 18 },
    { header: "Status", key: "status", width: 15 },
    { header: "Remarks", key: "remarks", width: 35 },
  ];

  worksheet.getRow(1).font = {
    bold: true,
  };

  attendance.forEach((record) => {
    worksheet.addRow({
      studentName: record.student?.fullName || "",
      studentEmail: record.student?.email || "",
      phone: record.student?.phone || "",
      teacher: record.teacher?.fullName || "",
      batch: record.batch?.batchName || "",
      course: record.batch?.course || "",
      date: record.date
        ? new Date(record.date).toLocaleDateString("en-IN")
        : "",
      status: record.status,
      remarks: record.remarks || "",
    });
  });

  return workbook;
};

module.exports = exportAttendanceExcel;