import api from "../api/axios";

// ==============================================
// Student Attendance Summary
// GET /attendance/student/summary
// ==============================================

export const getAttendanceSummary = async () => {
  try {
    const response = await api.get(
      "/attendance/student/summary"
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch attendance summary."
    );
  }
};

// ==============================================
// Student Attendance History
// GET /attendance/student/history
// ==============================================

export const getAttendanceHistory = async (
  params = {}
) => {
  try {
    const response = await api.get(
      "/attendance/student/history",
      {
        params: {
  ...params,
  ...(params.month && {
    month: params.month.split("-")[1],
    year: params.month.split("-")[0],
  }),
},
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch attendance history."
    );
  }
};

// ==============================================
// Student Attendance Calendar
// GET /attendance/student/calendar
// ==============================================

export const getAttendanceCalendar = async (
  params = {}
) => {
  try {
    const response = await api.get(
      "/attendance/student/calendar",
      {
        params: {
  ...params,
  ...(params.month && {
    month: params.month.split("-")[1],
    year: params.month.split("-")[0],
  }),
},
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch attendance calendar."
    );
  }
};