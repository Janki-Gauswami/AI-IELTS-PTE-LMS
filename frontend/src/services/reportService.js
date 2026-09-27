import api from "../api/axios";

export const getReportsSummary = async () => {
  try {
    const res = await api.get("/reports/summary");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to load reports summary." };
  }
};

export const getStudentPerformanceReport = async (params = {}) => {
  try {
    const res = await api.get("/reports/student-performance", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to load performance report." };
  }
};

export const exportStudentPerformanceCSV = async (params = {}) => {
  try {
    const res = await api.get("/reports/student-performance/csv", {
      params,
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to export performance CSV." };
  }
};
