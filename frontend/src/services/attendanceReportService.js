import api from "../api/axios";

// ==============================================
// Attendance Report
// ==============================================

// ==============================================
// Get Attendance Report
// GET /attendance/report
// ==============================================

export const getAttendanceReport = async (filters = {}) => {
  try {
    const response = await api.get("/attendance/report", {
      params: filters,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch attendance report."
    );
  }
};

// ==============================================
// Export CSV
// GET /attendance/report/csv
// ==============================================

export const exportAttendanceCSV = async (filters = {}) => {
  try {
    const response = await api.get(
      "/attendance/report/csv",
      {
        params: filters,
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to export CSV."
    );
  }
};

// ==============================================
// Export Excel
// GET /attendance/report/excel
// ==============================================

export const exportAttendanceExcel = async (
  filters = {}
) => {
  try {
    const response = await api.get(
      "/attendance/report/excel",
      {
        params: filters,
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to export Excel."
    );
  }
};

// ==============================================
// Export PDF
// GET /attendance/report/pdf
// ==============================================

export const exportAttendancePDF = async (
  filters = {}
) => {
  try {
    const response = await api.get(
      "/attendance/report/pdf",
      {
        params: filters,
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to export PDF."
    );
  }
};