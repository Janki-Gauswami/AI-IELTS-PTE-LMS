import api from "../api/axios";

export const getBandPrediction = async (params = {}) => {
  try {
    const res = await api.get("/ai/band-prediction", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch AI band prediction." };
  }
};

export const getWeaknessDetection = async (params = {}) => {
  try {
    const res = await api.get("/ai/weakness-detection", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to detect weaknesses." };
  }
};

export const generateStudyPlan = async (data) => {
  try {
    const res = await api.post("/ai/study-plan", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to generate AI study plan." };
  }
};

export const getCohortAIOverview = async () => {
  try {
    const res = await api.get("/ai/cohort-overview");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch cohort overview." };
  }
};
