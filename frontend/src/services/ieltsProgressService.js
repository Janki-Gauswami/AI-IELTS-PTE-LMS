import api from "../api/axios";

// ======================================================
// IELTS Progress Service
// ======================================================


// ======================================================
// Get My IELTS Progress
// Student
// ======================================================

export const getMyIELTSProgress = async () => {
  try {
    const response = await api.get(
      "/ielts/progress/me"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load IELTS progress.",
      }
    );
  }
};


// ======================================================
// Get Student IELTS Progress
// Admin + Teacher
// ======================================================

export const getStudentIELTSProgress =
  async (studentId) => {
    try {
      const response = await api.get(
        `/ielts/progress/student/${studentId}`
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load student IELTS progress.",
        }
      );
    }
  };


// ======================================================
// Get My IELTS Section Performance
// Student
// ======================================================

export const getMyIELTSSectionPerformance =
  async () => {
    try {
      const response = await api.get(
        "/ielts/progress/me/sections"
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load IELTS section performance.",
        }
      );
    }
  };


// ======================================================
// Get Student IELTS Section Performance
// Admin + Teacher
// ======================================================

export const getStudentIELTSSectionPerformance =
  async (studentId) => {
    try {
      const response = await api.get(
        `/ielts/progress/student/${studentId}/sections`
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load student section performance.",
        }
      );
    }
  };


// ======================================================
// Get My IELTS Score Trends
// Student
// ======================================================

export const getMyIELTSScoreTrends =
  async () => {
    try {
      const response = await api.get(
        "/ielts/progress/me/trends"
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load IELTS score trends.",
        }
      );
    }
  };


// ======================================================
// Get Student IELTS Score Trends
// Admin + Teacher
// ======================================================

export const getStudentIELTSScoreTrends =
  async (studentId) => {
    try {
      const response = await api.get(
        `/ielts/progress/student/${studentId}/trends`
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load student score trends.",
        }
      );
    }
  };


// ======================================================
// Get My IELTS Weak Areas
// Student
// ======================================================

export const getMyIELTSWeakAreas =
  async () => {
    try {
      const response = await api.get(
        "/ielts/progress/me/weak-areas"
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load IELTS weak areas.",
        }
      );
    }
  };


// ======================================================
// Get Student IELTS Weak Areas
// Admin + Teacher
// ======================================================

export const getStudentIELTSWeakAreas =
  async (studentId) => {
    try {
      const response = await api.get(
        `/ielts/progress/student/${studentId}/weak-areas`
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load student weak areas.",
        }
      );
    }
  };


// ======================================================
// Get My IELTS Performance Statistics
// Student
// ======================================================

export const getMyIELTSPerformanceStatistics =
  async () => {
    try {
      const response = await api.get(
        "/ielts/progress/me/statistics"
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load IELTS performance statistics.",
        }
      );
    }
  };


// ======================================================
// Get Student IELTS Performance Statistics
// Admin + Teacher
// ======================================================

export const getStudentIELTSPerformanceStatistics =
  async (studentId) => {
    try {
      const response = await api.get(
        `/ielts/progress/student/${studentId}/statistics`
      );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load student performance statistics.",
        }
      );
    }
  };