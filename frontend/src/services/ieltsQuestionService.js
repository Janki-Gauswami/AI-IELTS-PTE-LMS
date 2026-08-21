import api from "../api/axios";

// ======================================================
// Get All Questions
// ======================================================

export const getIELTSQuestions = async (params = {}) => {
  try {
    const response = await api.get(
      "/ielts/questions",
      {
        params,
      }
    );

    return response.data;

  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load IELTS questions.",
      }
    );
  }
};


// ======================================================
// Get Question By ID
// ======================================================

export const getIELTSQuestionById = async (id) => {
  try {
    const response = await api.get(
      `/ielts/questions/${id}`
    );

    return response.data;

  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load IELTS question.",
      }
    );
  }
};


// ======================================================
// Create Question
// ======================================================

export const createIELTSQuestion = async (
  questionData
) => {
  try {
    const response = await api.post(
      "/ielts/questions",
      questionData
    );

    return response.data;

  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to create IELTS question.",
      }
    );
  }
};


// ======================================================
// Update Question
// ======================================================

export const updateIELTSQuestion = async (
  id,
  questionData
) => {
  try {
    const response = await api.put(
      `/ielts/questions/${id}`,
      questionData
    );

    return response.data;

  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to update IELTS question.",
      }
    );
  }
};


// ======================================================
// Delete Question
// ======================================================

export const deleteIELTSQuestion = async (id) => {
  try {
    const response = await api.delete(
      `/ielts/questions/${id}`
    );

    return response.data;

  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to delete IELTS question.",
      }
    );
  }
};