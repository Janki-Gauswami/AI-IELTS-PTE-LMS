import api from "../api/axios";

export const getAdminAnalytics = async () => {
  try {
    const res = await api.get("/analytics/admin");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch admin analytics." };
  }
};

export const getTeacherAnalytics = async () => {
  try {
    const res = await api.get("/analytics/teacher");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch teacher analytics." };
  }
};

export const getStudentAnalytics = async () => {
  try {
    const res = await api.get("/analytics/student");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch student analytics." };
  }
};
