import api from "../api/axios";

// ======================================
// Get Admin Dashboard Statistics
// ======================================

export const getAdminDashboard = async () => {
  try {
    const response = await api.get("/dashboard/stats");

    return {
      success: response.data.success,
      statistics: response.data.statistics,
    };
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to load dashboard statistics.",
      }
    );
  }
};