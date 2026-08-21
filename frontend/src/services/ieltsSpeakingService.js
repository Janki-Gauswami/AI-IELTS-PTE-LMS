import api from "../api/axios";

// ======================================================
// Get Speaking Lessons
// ======================================================

export const getSpeakingLessons = async () => {
  try {
    const response = await api.get(
      "/ielts/lessons?section=Speaking"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Speaking lessons.",
      }
    );
  }
};


// ======================================================
// Get Speaking Tests
// ======================================================

export const getSpeakingTests = async () => {
  try {
    const response = await api.get(
      "/ielts/tests?section=Speaking"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Speaking tasks.",
      }
    );
  }
};


// ======================================================
// Get Speaking Test By ID
// ======================================================

export const getSpeakingTestById = async (testId) => {
  try {
    const response = await api.get(
      `/ielts/tests/${testId}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load Speaking task.",
      }
    );
  }
};


// ======================================================
// Start Speaking Attempt
// ======================================================

export const startSpeakingAttempt = async (
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
        message: "Unable to start Speaking task.",
      }
    );
  }
};


// ======================================================
// Submit Speaking Recording
// ======================================================

export const submitSpeakingAttempt = async (
  attemptId,
  audioUrl
) => {
  try {
    const response = await api.post(
      `/ielts/attempts/${attemptId}/submit`,
      {
        answers: [
          {
            audioUrl,
          },
        ],
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to submit Speaking recording.",
      }
    );
  }
};