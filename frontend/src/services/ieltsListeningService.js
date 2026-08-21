import api from "../api/axios";

// ======================================================
// Get Listening Lessons
// ======================================================

export const getListeningLessons = async () => {
  try {
    const response = await api.get(
      "/ielts/lessons?section=Listening"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Listening lessons.",
      }
    );
  }
};


// ======================================================
// Get Listening Tests
// ======================================================

export const getListeningTests = async () => {
  try {
    const response = await api.get(
      "/ielts/tests?section=Listening"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Listening tests.",
      }
    );
  }
};


// ======================================================
// Get Listening Test By ID
// ======================================================

export const getListeningTestById = async (testId) => {
  try {
    const response = await api.get(
      `/ielts/tests/${testId}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Listening test.",
      }
    );
  }
};


// ======================================================
// Start Listening Test
// ======================================================

export const startListeningTest = async (testId, batchId = null) => {
  try {
    const response = await api.post(
      "/ielts/attempts/start",
      {
        testId,
        batchId,
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to start Listening test.",
      }
    );
  }
};


// ======================================================
// Submit Listening Test
// ======================================================

export const submitListeningTest = async (
  attemptId,
  answers
) => {
  try {
    const response = await api.post(
      `/ielts/attempts/${attemptId}/submit`,
      {
        answers,
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to submit Listening test.",
      }
    );
  }
};