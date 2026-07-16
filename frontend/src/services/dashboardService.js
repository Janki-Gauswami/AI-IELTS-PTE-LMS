import api from "../api/axios";

export const getAdminDashboard =
  async () => {

    try {

      const response =
        await api.get("/dashboard/admin");

      return response.data;

    } catch (error) {

      throw (
        error.response?.data || {
          success: false,
          message:
            "Failed to load dashboard.",
        }
      );

    }

  };