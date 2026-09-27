import api from "../api/axios";

export const getAllMockTests = async (params = {}) => {
  try {
    const res = await api.get("/mock-tests", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch mock tests." };
  }
};

export const getMockTestById = async (id) => {
  try {
    const res = await api.get(`/mock-tests/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch mock test details." };
  }
};

export const createMockTest = async (data) => {
  try {
    const res = await api.post("/mock-tests", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to create mock test." };
  }
};

export const updateMockTest = async (id, data) => {
  try {
    const res = await api.put(`/mock-tests/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to update mock test." };
  }
};

export const deleteMockTest = async (id) => {
  try {
    const res = await api.delete(`/mock-tests/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to delete mock test." };
  }
};

export const startMockTestAttempt = async (id) => {
  try {
    const res = await api.post(`/mock-tests/${id}/attempt`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to start mock test attempt." };
  }
};

export const submitMockTestAttempt = async (attemptId, data) => {
  try {
    const res = await api.post(`/mock-tests/attempts/${attemptId}/submit`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to submit mock test." };
  }
};

export const evaluateMockTestAttempt = async (attemptId, data) => {
  try {
    const res = await api.patch(`/mock-tests/attempts/${attemptId}/evaluate`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to evaluate mock test." };
  }
};

export const getMockTestAttempts = async (params = {}) => {
  try {
    const res = await api.get("/mock-tests/attempts", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch mock attempts." };
  }
};

export const getMockTestAttemptById = async (attemptId) => {
  try {
    const res = await api.get(`/mock-tests/attempts/${attemptId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch mock attempt details." };
  }
};

export const getUnifiedStudentResults = async (params = {}) => {
  try {
    const res = await api.get("/mock-tests/unified-results", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch unified results." };
  }
};
