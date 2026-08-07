import api from "../api/axios";

// ==============================================
// Attendance Dashboard Analytics
// GET /attendance/dashboard
// ==============================================

export const getAttendanceDashboard = async () => {
  try {
    const response = await api.get("/attendance/dashboard");

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch attendance dashboard."
    );
  }
};

// ==============================================
// Dashboard Cards
// ==============================================

export const getAttendanceCards = async () => {
  try {
    const { cards } = await getAttendanceDashboard();

    return cards;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// Attendance Trend
// ==============================================

export const getAttendanceTrend = async () => {
  try {
    const { attendanceTrend } =
      await getAttendanceDashboard();

    return attendanceTrend;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// Batch Comparison
// ==============================================

export const getBatchComparison = async () => {
  try {
    const { batchComparison } =
      await getAttendanceDashboard();

    return batchComparison;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// Daily Attendance
// ==============================================

export const getDailyAttendance = async () => {
  try {
    const { dailyAttendance } =
      await getAttendanceDashboard();

    return dailyAttendance;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// Monthly Attendance
// ==============================================

export const getMonthlyAttendance = async () => {
  try {
    const { monthlyAttendance } =
      await getAttendanceDashboard();

    return monthlyAttendance;
  } catch (error) {
    throw error;
  }
};