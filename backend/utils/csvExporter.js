const { Parser } = require("json2csv");

// ==============================================
// Export Attendance Data to CSV
// ==============================================

const exportAttendanceCSV = (attendanceData) => {
  try {
    const fields = [
      {
        label: "Student Name",
        value: (row) => row.student?.fullName || "",
      },
      {
        label: "Student Email",
        value: (row) => row.student?.email || "",
      },
      {
        label: "Student Phone",
        value: (row) => row.student?.phone || "",
      },
      {
        label: "Teacher",
        value: (row) => row.teacher?.fullName || "",
      },
      {
        label: "Batch",
        value: (row) => row.batch?.batchName || "",
      },
      {
        label: "Course",
        value: (row) => row.batch?.course || "",
      },
      {
        label: "Date",
        value: (row) =>
          row.date
            ? new Date(row.date).toLocaleDateString("en-IN")
            : "",
      },
      {
        label: "Status",
        value: "status",
      },
      {
        label: "Remarks",
        value: "remarks",
      },
    ];

    const parser = new Parser({ fields });

    return parser.parse(attendanceData);

  } catch (error) {
    console.error("CSV Export Error:", error);
    throw error;
  }
};

module.exports = exportAttendanceCSV;