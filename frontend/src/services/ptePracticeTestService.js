import api from "../api/axios";

// ======================================================
// PTE PRACTICE TEST SERVICE
// ======================================================


// ======================================================
// GET ALL PTE PRACTICE TESTS
// ======================================================
// Admin + Teacher + Student
//
// GET /api/v1/pte/tests
//
// Optional params:
// search
// section
// status
// difficulty
// ======================================================

export const getPTEPracticeTests = async (params = {}) => {
  try {
    const response = await api.get("/pte/tests", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Get PTE Practice Tests Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load PTE practice tests.",
      }
    );
  }
};


// ======================================================
// BACKWARD-COMPATIBLE ALIAS
// ======================================================
// Some existing student pages may use:
//
// getPracticeTests()
//
// Keep this alias so those pages do not break.
// ======================================================

export const getPracticeTests = getPTEPracticeTests;


// ======================================================
// GET PTE PRACTICE TEST BY ID
// ======================================================
// Admin + Teacher + Student
//
// GET /api/v1/pte/tests/:id
// ======================================================

export const getPTEPracticeTestById = async (id) => {
  try {
    if (!id) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    const response = await api.get(
      `/pte/tests/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get PTE Practice Test By ID Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load PTE practice test.",
      }
    );
  }
};


// ======================================================
// BACKWARD-COMPATIBLE ALIAS
// ======================================================

export const getPracticeTestById =
  getPTEPracticeTestById;


// ======================================================
// CREATE PTE PRACTICE TEST
// ======================================================
// Admin + Teacher
//
// POST /api/v1/pte/tests
// ======================================================

export const createPTEPracticeTest = async (
  testData
) => {
  try {
    if (!testData) {
      throw new Error(
        "Practice test data is required."
      );
    }

    const response = await api.post(
      "/pte/tests",
      testData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create PTE Practice Test Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to create PTE practice test.",
      }
    );
  }
};


// ======================================================
// UPDATE PTE PRACTICE TEST
// ======================================================
// Admin + Teacher
//
// PATCH /api/v1/pte/tests/:id
//
// IMPORTANT:
// PATCH is used instead of PUT so it matches the
// backend route we have been using.
// ======================================================

export const updatePTEPracticeTest = async (
  id,
  testData
) => {
  try {
    if (!id) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    if (!testData) {
      throw new Error(
        "Practice test data is required."
      );
    }

    const response = await api.patch(
      `/pte/tests/${id}`,
      testData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update PTE Practice Test Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to update PTE practice test.",
      }
    );
  }
};


// ======================================================
// DELETE / ARCHIVE PTE PRACTICE TEST
// ======================================================
// Admin + Teacher
//
// DELETE /api/v1/pte/tests/:id
//
// If backend implements soft-delete/archive,
// this endpoint should archive the test.
// ======================================================

export const deletePTEPracticeTest = async (id) => {
  try {
    if (!id) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    const response = await api.delete(
      `/pte/tests/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete PTE Practice Test Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to delete/archive PTE practice test.",
      }
    );
  }
};


// ======================================================
// PUBLISH PTE PRACTICE TEST
// ======================================================
// Admin + Teacher
//
// PATCH /api/v1/pte/tests/:id/publish
// ======================================================

export const publishPTEPracticeTest = async (id) => {
  try {
    if (!id) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    const response = await api.patch(
      `/pte/tests/${id}/publish`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Publish PTE Practice Test Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to publish PTE practice test.",
      }
    );
  }
};


// ======================================================
// UNPUBLISH PTE PRACTICE TEST
// ======================================================
// Admin + Teacher
//
// PATCH /api/v1/pte/tests/:id/unpublish
// ======================================================

export const unpublishPTEPracticeTest = async (
  id
) => {
  try {
    if (!id) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    const response = await api.patch(
      `/pte/tests/${id}/unpublish`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unpublish PTE Practice Test Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to unpublish PTE practice test.",
      }
    );
  }
};


// ======================================================
// RESTORE PTE PRACTICE TEST
// ======================================================
// Admin + Teacher
//
// PATCH /api/v1/pte/tests/:id/restore
// ======================================================

export const restorePTEPracticeTest = async (id) => {
  try {
    if (!id) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    const response = await api.patch(
      `/pte/tests/${id}/restore`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Restore PTE Practice Test Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to restore PTE practice test.",
      }
    );
  }
};


// ======================================================
// GET PTE PRACTICE TEST FOR STUDENT
// ======================================================
// Correct answers must NOT be exposed.
//
// GET /api/v1/pte/tests/:id/start
// ======================================================

export const getStudentPTEPracticeTest = async (
  id
) => {
  try {
    if (!id) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    const response = await api.get(
      `/pte/tests/${id}/start`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Student PTE Practice Test Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load PTE practice test.",
      }
    );
  }
};


// ======================================================
// START PTE TEST ATTEMPT
// ======================================================
// Student
//
// POST /api/v1/pte/tests/:id/attempt/start
// ======================================================

export const startPTETestAttempt = async (
  testId
) => {
  try {
    if (!testId) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    const response = await api.post(
      `/pte/tests/${testId}/attempt/start`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Start PTE Test Attempt Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to start PTE test.",
      }
    );
  }
};


// ======================================================
// SAVE PTE TEST ANSWERS
// ======================================================
// PATCH
//
// /api/v1/pte/tests/:id/attempt/:attemptId/answers
// ======================================================

export const savePTETestAnswers = async (
  testId,
  attemptId,
  answers
) => {
  try {
    if (!testId) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    if (!attemptId) {
      throw new Error(
        "Attempt ID is required."
      );
    }

    const response = await api.patch(
      `/pte/tests/${testId}/attempt/${attemptId}/answers`,
      {
        answers,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Save PTE Test Answers Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to save PTE answers.",
      }
    );
  }
};


// ======================================================
// SUBMIT PTE TEST ATTEMPT
// ======================================================
// POST
//
// /api/v1/pte/tests/:id/attempt/:attemptId/submit
// ======================================================

export const submitPTETestAttempt = async (
  testId,
  attemptId,
  answers
) => {
  try {
    if (!testId) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    if (!attemptId) {
      throw new Error(
        "Attempt ID is required."
      );
    }

    const response = await api.post(
      `/pte/tests/${testId}/attempt/${attemptId}/submit`,
      {
        answers,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Submit PTE Test Attempt Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to submit PTE test.",
      }
    );
  }
};


// ======================================================
// GET PTE TEST RESULT
// ======================================================
// GET
//
// /api/v1/pte/tests/:id/attempt/:attemptId/result
// ======================================================

export const getPTETestResult = async (
  testId,
  attemptId
) => {
  try {
    if (!testId) {
      throw new Error(
        "Practice test ID is required."
      );
    }

    if (!attemptId) {
      throw new Error(
        "Attempt ID is required."
      );
    }

    const response = await api.get(
      `/pte/tests/${testId}/attempt/${attemptId}/result`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get PTE Test Result Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load PTE test result.",
      }
    );
  }
};


// ======================================================
// GET STUDENT PREVIOUS PTE ATTEMPTS
// ======================================================
//
// GET /api/v1/pte/tests/attempts/history
// ======================================================

export const getStudentPreviousAttempts =
  async () => {
    try {
      const response = await api.get(
        "/pte/tests/attempts/history"
      );

      return response.data;
    } catch (error) {
      console.error(
        "Get Student Previous Attempts Error:",
        error
      );

      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load PTE previous attempts.",
        }
      );
    }
  };


// ======================================================
// TEACHER / ADMIN: PTE EVALUATION SERVICES
// ======================================================

export const getPTETestAttemptsForReview = async (params = {}) => {
  try {
    const response = await api.get("/pte/tests/attempts/review-list", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Get PTE Test Attempts For Review Error:",
      error?.response?.data || error
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load PTE test attempts for evaluation.",
      }
    );
  }
};

export const getPTETestAttemptForReview = async (attemptId) => {
  try {
    const response = await api.get(
      `/pte/tests/attempts/${attemptId}/review`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Get PTE Test Attempt For Review Error:",
      error?.response?.data || error
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load PTE attempt details for evaluation.",
      }
    );
  }
};

export const evaluatePTETestAttempt = async (attemptId, evalData) => {
  try {
    const response = await api.post(
      `/pte/tests/attempts/${attemptId}/evaluate`,
      evalData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Evaluate PTE Test Attempt Error:",
      error?.response?.data || error
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to submit PTE evaluation.",
      }
    );
  }
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default {
  getPTEPracticeTests,
  getPracticeTests,

  getPTEPracticeTestById,
  getPracticeTestById,

  createPTEPracticeTest,
  updatePTEPracticeTest,
  deletePTEPracticeTest,

  publishPTEPracticeTest,
  unpublishPTEPracticeTest,
  restorePTEPracticeTest,

  getStudentPTEPracticeTest,

  startPTETestAttempt,
  savePTETestAnswers,
  submitPTETestAttempt,
  getPTETestResult,

  getStudentPreviousAttempts,
  getPTETestAttemptsForReview,
  getPTETestAttemptForReview,
  evaluatePTETestAttempt,
};