import api from "../api/axios";

// ======================================================
// IELTS PRACTICE TEST SERVICE
// ======================================================
//
// Base Axios URL:
// http://localhost:5000/api/v1
//
// Therefore:
//
// /ielts/tests
// becomes:
//
// http://localhost:5000/api/v1/ielts/tests
//
// This file intentionally contains compatibility aliases
// because different IELTS pages in the project use
// different function names.
// ======================================================


// ======================================================
// ERROR NORMALIZER
// ======================================================

const getError = (error, fallbackMessage) => {
  return (
    error?.response?.data || {
      success: false,
      message:
        error?.message || fallbackMessage,
    }
  );
};


// ======================================================
// GET ALL IELTS PRACTICE TESTS
// ======================================================
//
// GET /api/v1/ielts/tests
//
// Used by:
// - Admin IELTSPracticeTests
// - Student IELTSPracticeTests
// ======================================================

export const getPracticeTests = async (
  params = {}
) => {
  try {
    const response = await api.get(
      "/ielts/tests",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get IELTS Practice Tests Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to load IELTS practice tests."
    );
  }
};


// Modern explicit name
export const getAllIELTSPracticeTests =
  getPracticeTests;


// Compatibility alias
export const getIELTSPracticeTests =
  getPracticeTests;


// ======================================================
// GET IELTS PRACTICE TEST BY ID
// ======================================================
//
// GET /api/v1/ielts/tests/:id
//
// Used by:
// - EditPracticeTest
// - View pages
// - Admin pages
// ======================================================

export const getPracticeTestById = async (
  testId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  try {
    const response = await api.get(
      `/ielts/tests/${testId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get IELTS Practice Test By ID Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to load IELTS practice test."
    );
  }
};


// Compatibility aliases
export const getIELTSPracticeTestById =
  getPracticeTestById;


// ======================================================
// CREATE IELTS PRACTICE TEST
// ======================================================
//
// POST /api/v1/ielts/tests
// ======================================================

export const createPracticeTest = async (
  testData
) => {
  try {
    const response = await api.post(
      "/ielts/tests",
      testData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create IELTS Practice Test Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to create IELTS practice test."
    );
  }
};


// Compatibility alias
export const createIELTSPracticeTest =
  createPracticeTest;


// ======================================================
// UPDATE IELTS PRACTICE TEST
// ======================================================
//
// PATCH /api/v1/ielts/tests/:id
// ======================================================

export const updatePracticeTest = async (
  testId,
  testData
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  try {
    const response = await api.patch(
      `/ielts/tests/${testId}`,
      testData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update IELTS Practice Test Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to update IELTS practice test."
    );
  }
};


// Compatibility alias
export const updateIELTSPracticeTest =
  updatePracticeTest;


// ======================================================
// DELETE IELTS PRACTICE TEST
// ======================================================
//
// DELETE /api/v1/ielts/tests/:id
// ======================================================

export const deletePracticeTest = async (
  testId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  try {
    const response = await api.delete(
      `/ielts/tests/${testId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete IELTS Practice Test Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to delete IELTS practice test."
    );
  }
};


// Compatibility alias
export const deleteIELTSPracticeTest =
  deletePracticeTest;


// ======================================================
// PUBLISH IELTS PRACTICE TEST
// ======================================================
//
// PATCH /api/v1/ielts/tests/:id/publish
// ======================================================

export const publishPracticeTest = async (
  testId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  try {
    const response = await api.patch(
      `/ielts/tests/${testId}/publish`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Publish IELTS Practice Test Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to publish IELTS practice test."
    );
  }
};


// Compatibility alias
export const publishIELTSPracticeTest =
  publishPracticeTest;


// ======================================================
// UNPUBLISH IELTS PRACTICE TEST
// ======================================================
//
// PATCH /api/v1/ielts/tests/:id/unpublish
// ======================================================

export const unpublishPracticeTest = async (
  testId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  try {
    const response = await api.patch(
      `/ielts/tests/${testId}/unpublish`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unpublish IELTS Practice Test Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to move IELTS practice test to draft."
    );
  }
};


// Compatibility alias
export const unpublishIELTSPracticeTest =
  unpublishPracticeTest;


// ======================================================
// GET STUDENT IELTS PRACTICE TEST
// ======================================================
//
// IMPORTANT:
// This endpoint does NOT expose correct answers.
//
// GET /api/v1/ielts/tests/:id/start
// ======================================================

export const getStudentPracticeTest = async (
  testId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  try {
    const response = await api.get(
      `/ielts/tests/${testId}/start`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Student IELTS Practice Test Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to load IELTS practice test."
    );
  }
};


// ======================================================
// START IELTS TEST ATTEMPT
// ======================================================
//
// POST /api/v1/ielts/tests/:id/attempt/start
// ======================================================

export const startIELTSTestAttempt = async (
  testId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  try {
    const response = await api.post(
      `/ielts/tests/${testId}/attempt/start`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Start IELTS Test Attempt Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to start IELTS test attempt."
    );
  }
};


// Compatibility alias
export const startIELTSPracticeTestAttempt =
  startIELTSTestAttempt;


// Compatibility alias used by some older pages
export const startIELTSAttempt =
  startIELTSTestAttempt;


// ======================================================
// SAVE IELTS TEST ANSWERS
// ======================================================
//
// PATCH
// /api/v1/ielts/tests/:id/attempt/:attemptId/answers
//
// Payload:
//
// {
//   answers: {
//     "questionId": "answer"
//   }
// }
// ======================================================

export const saveIELTSTestAnswers = async (
  testId,
  attemptId,
  answers = {}
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  if (!attemptId) {
    throw {
      success: false,
      message:
        "IELTS attempt ID is required.",
    };
  }

  const safeAnswers =
    answers &&
    typeof answers === "object" &&
    !Array.isArray(answers)
      ? answers
      : {};

  try {
    const response = await api.patch(
      `/ielts/tests/${testId}/attempt/${attemptId}/answers`,
      {
        answers: safeAnswers,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Save IELTS Test Answers Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to save IELTS test answers."
    );
  }
};


// ======================================================
// COMPATIBILITY ALIASES
// ======================================================

export const saveIELTSAnswers =
  saveIELTSTestAnswers;

export const saveIELTSPracticeTestAnswers =
  saveIELTSTestAnswers;


// ======================================================
// SUBMIT IELTS TEST ATTEMPT
// ======================================================
//
// POST
// /api/v1/ielts/tests/:id/attempt/:attemptId/submit
// ======================================================

export const submitIELTSTestAttempt = async (
  testId,
  attemptId,
  answers = {}
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  if (!attemptId) {
    throw {
      success: false,
      message:
        "IELTS attempt ID is required.",
    };
  }

  const safeAnswers =
    answers &&
    typeof answers === "object" &&
    !Array.isArray(answers)
      ? answers
      : {};

  try {
    const response = await api.post(
      `/ielts/tests/${testId}/attempt/${attemptId}/submit`,
      {
        answers: safeAnswers,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Submit IELTS Test Attempt Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to submit IELTS test."
    );
  }
};


// Compatibility aliases
export const submitIELTSPracticeTest =
  submitIELTSTestAttempt;

export const submitIELTSPracticeTestAttempt =
  submitIELTSTestAttempt;


// ======================================================
// GET IELTS TEST RESULT
// ======================================================
//
// PRIMARY:
//
// GET
// /api/v1/ielts/tests/:id/attempt/:attemptId/result
//
// ======================================================

export const getIELTSTestResult = async (
  testId,
  attemptId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  if (!attemptId) {
    throw {
      success: false,
      message:
        "IELTS attempt ID is required.",
    };
  }

  try {
    const response = await api.get(
      `/ielts/tests/${testId}/attempt/${attemptId}/result`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get IELTS Test Result Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to load IELTS test result."
    );
  }
};


// ======================================================
// RESULT COMPATIBILITY ALIASES
// ======================================================

export const getIELTSAttemptResult =
  getIELTSTestResult;

export const getIELTSPracticeTestResult =
  getIELTSTestResult;

export const getIELTSTestAttemptResult =
  getIELTSTestResult;

export const getIELTSResult =
  getIELTSTestResult;


// ======================================================
// GET IELTS ATTEMPT
// ======================================================
//
// This is kept for older pages that call the
// attempt endpoint directly.
//
// GET
// /api/v1/ielts/tests/:id/attempt/:attemptId
// ======================================================

export const getIELTSAttempt = async (
  testId,
  attemptId
) => {
  if (!testId) {
    throw {
      success: false,
      message:
        "IELTS practice test ID is required.",
    };
  }

  if (!attemptId) {
    throw {
      success: false,
      message:
        "IELTS attempt ID is required.",
    };
  }

  try {
    const response = await api.get(
      `/ielts/tests/${testId}/attempt/${attemptId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get IELTS Attempt Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to load IELTS attempt."
    );
  }
};


// ======================================================
// GET STUDENT PREVIOUS IELTS ATTEMPTS
// ======================================================
//
// Primary endpoint:
//
// GET /api/v1/ielts/attempts/history
//
// ======================================================

export const getStudentPreviousAttempts =
  async () => {
    try {
      const response = await api.get(
        "/ielts/attempts/history"
      );

      return response.data;
    } catch (error) {
      console.error(
        "Get Previous IELTS Attempts Error:",
        error?.response?.data || error
      );

      // Compatibility fallback.
      //
      // Your practice-test controller also exposes:
      // /ielts/tests/attempts/history
      //
      try {
        const fallbackResponse =
          await api.get(
            "/ielts/tests/attempts/history"
          );

        return fallbackResponse.data;
      } catch (fallbackError) {
        throw getError(
          error,
          "Unable to load previous IELTS attempts."
        );
      }
    }
  };


// ======================================================
// COMPATIBILITY ALIASES
// ======================================================

export const getStudentPreviousIELTSAttempts =
  getStudentPreviousAttempts;

export const getIELTSPreviousAttempts =
  getStudentPreviousAttempts;

export const getPreviousIELTSAttempts =
  getStudentPreviousAttempts;


// ======================================================
// GET IELTS ATTEMPT BY ID
// ======================================================
//
// GET /api/v1/ielts/attempts/:attemptId
// ======================================================

export const getIELTSTestAttemptById = async (
  attemptId
) => {
  if (!attemptId) {
    throw {
      success: false,
      message:
        "IELTS attempt ID is required.",
    };
  }

  try {
    const response = await api.get(
      `/ielts/attempts/${attemptId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get IELTS Attempt By ID Error:",
      error?.response?.data || error
    );

    throw getError(
      error,
      "Unable to load IELTS test attempt."
    );
  }
};


// ======================================================
// LEGACY RESULT ALIASES
// ======================================================

export const getIELTSPracticeTestAttemptResult =
  getIELTSTestResult;


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default api;