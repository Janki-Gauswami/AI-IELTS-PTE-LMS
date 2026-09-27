import api from "../api/axios";

// ======================================================
// Get Reading Lessons
// ======================================================

export const getReadingLessons = async () => {
  try {
    const response = await api.get(
      "/ielts/lessons?section=Reading"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Reading lessons.",
      }
    );
  }
};


// ======================================================
// Get Reading Tests
// ======================================================

export const getReadingTests = async () => {
  try {
    const response = await api.get(
      "/ielts/tests?section=Reading"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Reading tests.",
      }
    );
  }
};


// ======================================================
// Get Reading Test By ID
// ======================================================

export const getReadingTestById = async (testId) => {
  try {
    const response = await api.get(
      `/ielts/tests/${testId}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Reading test.",
      }
    );
  }
};


// ======================================================
// Start Reading Test
// ======================================================

export const startReadingTest = async (
  testId,
  batchId = null
) => {
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
        message: "Unable to start Reading test.",
      }
    );
  }
};


// ======================================================
// Submit Reading Test
// ======================================================

export const submitReadingTest = async (
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
        message: "Unable to submit Reading test.",
      }
    );
  }
};