import api from "../api/axios";

// ======================================================
// PTE Test Attempt Service
// Base URL:
// /api/v1/pte/attempts
// ======================================================


// ======================================================
// Start PTE Test Attempt
// Student Only
// POST /api/v1/pte/attempts/start
// ======================================================

export const startPTEAttempt = async (testId, batchId = null) => {
  try {
    const response = await api.post(
      "/pte/attempts/start",
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
        message: "Unable to start PTE test.",
      }
    );
  }
};


// ======================================================
// Save PTE Answers
// Student Only
// PATCH /api/v1/pte/attempts/:id/answers
// ======================================================

export const savePTEAnswers = async (
  attemptId,
  answers
) => {
  try {
    const response = await api.patch(
      `/pte/attempts/${attemptId}/answers`,
      {
        answers,
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to save PTE answers.",
      }
    );
  }
};


// ======================================================
// Submit PTE Test Attempt
// Student Only
// POST /api/v1/pte/attempts/:id/submit
// ======================================================

export const submitPTEAttempt = async (
  attemptId,
  answers
) => {
  try {
    const response = await api.post(
      `/pte/attempts/${attemptId}/submit`,
      {
        answers,
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to submit PTE test.",
      }
    );
  }
};


// ======================================================
// Get My PTE Attempts
// Student Only
// GET /api/v1/pte/attempts/my
// ======================================================

export const getMyPTEAttempts = async () => {
  try {
    const response = await api.get(
      "/pte/attempts/my"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load previous PTE attempts.",
      }
    );
  }
};


// ======================================================
// Get PTE Attempt By ID
// Student Only
// GET /api/v1/pte/attempts/:id
// ======================================================

export const getPTEAttemptById = async (attemptId) => {
  try {
    const response = await api.get(
      `/pte/attempts/${attemptId}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load PTE attempt.",
      }
    );
  }
};


// ======================================================
// Export
// ======================================================

export default {
  startPTEAttempt,
  savePTEAnswers,
  submitPTEAttempt,
  getMyPTEAttempts,
  getPTEAttemptById,
};