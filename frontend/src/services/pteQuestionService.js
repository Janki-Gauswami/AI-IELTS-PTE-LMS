import api from "../api/axios";

// ======================================================
// PTE QUESTION SERVICE
// ======================================================


// ======================================================
// GET ALL PTE QUESTIONS
// ======================================================
//
// GET /api/v1/pte/questions
//
// Supports:
// search
// section
// questionType
// difficulty
// status
// ======================================================

export const getPTEQuestions = async (params = {}) => {
  try {
    const response = await api.get(
      "/pte/questions",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get PTE Questions Error:",
      error.response?.data || error.message
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load PTE questions.",
      }
    );
  }
};


// ======================================================
// GET SINGLE PTE QUESTION
// ======================================================

export const getPTEQuestionById = async (id) => {
  if (!id) {
    throw new Error("Question ID is required.");
  }

  try {
    const response = await api.get(
      `/pte/questions/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get PTE Question Error:",
      error.response?.data || error.message
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load PTE question.",
      }
    );
  }
};


// ======================================================
// CREATE PTE QUESTION
// ======================================================

export const createPTEQuestion = async (
  questionData
) => {
  try {
    const response = await api.post(
      "/pte/questions",
      questionData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create PTE Question Error:",
      error.response?.data || error.message
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to create PTE question.",
      }
    );
  }
};


// ======================================================
// UPDATE PTE QUESTION
// ======================================================

export const updatePTEQuestion = async (
  id,
  questionData
) => {
  if (!id) {
    throw new Error("Question ID is required.");
  }

  try {
    const response = await api.patch(
      `/pte/questions/${id}`,
      questionData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update PTE Question Error:",
      error.response?.data || error.message
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to update PTE question.",
      }
    );
  }
};


// ======================================================
// DELETE PTE QUESTION
// ======================================================

export const deletePTEQuestion = async (id) => {
  if (!id) {
    throw new Error("Question ID is required.");
  }

  try {
    const response = await api.delete(
      `/pte/questions/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete PTE Question Error:",
      error.response?.data || error.message
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to delete PTE question.",
      }
    );
  }
};


// ======================================================
// EXPORT
// ======================================================

export default {
  getPTEQuestions,
  getPTEQuestionById,
  createPTEQuestion,
  updatePTEQuestion,
  deletePTEQuestion,
};