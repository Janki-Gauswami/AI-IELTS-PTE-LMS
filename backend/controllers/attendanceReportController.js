const attendanceController = require("./attendanceController");

module.exports = {
  getAttendanceReport: attendanceController.getAttendanceReport,
  exportAttendanceCSV: attendanceController.exportAttendanceCSV,
  exportAttendanceExcel: attendanceController.exportAttendanceExcel,
  exportAttendancePDF: attendanceController.exportAttendancePDF,
  getAttendanceDashboard: attendanceController.getAttendanceDashboard,
};
