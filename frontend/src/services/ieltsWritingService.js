import api from "../api/axios";

// ======================================================
// Get Writing Lessons
// ======================================================

export const getWritingLessons = async () => {
  try {
    const response = await api.get(
      "/ielts/lessons?section=Writing"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Writing lessons.",
      }
    );
  }
};


// ======================================================
// Get Writing Tests / Tasks
// ======================================================

export const getWritingTests = async () => {
  try {
    const response = await api.get(
      "/ielts/tests?section=Writing"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Writing tasks.",
      }
    );
  }
};


// ======================================================
// Get Writing Test By ID
// ======================================================

export const getWritingTestById = async (testId) => {
  try {
    const response = await api.get(
      `/ielts/tests/${testId}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Writing task.",
      }
    );
  }
};


// ======================================================
// Start Writing Attempt
// ======================================================

export const startWritingAttempt = async (
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
        message: "Unable to start Writing task.",
      }
    );
  }
};


// ======================================================
// Submit Writing Answer
// ======================================================

export const submitWritingAttempt = async (
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
        message: "Unable to submit Writing answer.",
      }
    );
  }
};