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
// Upload Audio File
// ======================================================

export const uploadAudio = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "speaking-recording.webm");

    const response = await api.post(
      "/upload/audio",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to upload audio recording.",
      }
    );
  }
};


// ======================================================
// Submit Speaking Recording
// ======================================================

export const submitSpeakingAttempt = async (
  attemptId,
  audioUrl,
  questionId
) => {
  try {
    const answerData = {
      answers: [
        {
          question: questionId,
          answer: "",
          audioUrl,
        },
      ],
    };

    const response = await api.post(
      `/ielts/attempts/${attemptId}/submit`,
      answerData
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