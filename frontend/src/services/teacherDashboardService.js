import api from "../api/axios";

// ==========================================
// Dashboard Summary
// ==========================================

export const getDashboardSummary = async () => {
  const response = await api.get("/teacher/dashboard");
  return response.data;
};

// ==========================================
// My Batches
// ==========================================

export const getMyBatches = async () => {
  const response = await api.get("/teacher/my-batches");
  return response.data;
};

// ==========================================
// Today's Classes
// ==========================================

export const getTodayClasses = async () => {
  const response = await api.get("/teacher/today-classes");
  return response.data;
};


// ==========================================
// Teacher Profile
// ==========================================

export const getTeacherProfile = async () => {
  try {
    const response = await api.get("/teacher/profile");

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch teacher profile.",
      }
    );
  }
};

// ==========================================
// Update Teacher Profile
// ==========================================

export const updateTeacherProfile = async (data) => {
  try {
    const response = await api.put(
      "/teacher/profile",
      data
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update profile.",
      }
    );
  }
};


// ==========================================
// My Students
// ========================================== 

export const getMyStudents = async (batchId) => {
  try {
    const response = await api.get(
      `/teacher/my-students?batch=${batchId}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch students.",
      }
    );
  }
};