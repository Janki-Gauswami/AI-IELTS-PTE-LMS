import api from "../api/axios";

// ======================================
// Assign Student to Batch
// POST /api/v1/enrollments
// ======================================

export const assignStudent = async (data) => {
  try {
    const response = await api.post("/enrollments", data);

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to assign student.",
      }
    );
  }
};

// ======================================
// Remove Student from Batch
// DELETE /api/v1/enrollments/:id
// ======================================

export const removeStudent = async (enrollmentId) => {
  try {
    const response = await api.delete(
      `/enrollments/${enrollmentId}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to remove student.",
      }
    );
  }
};

// ======================================
// Transfer Student
// PUT /api/v1/enrollments/transfer
// ======================================

export const transferStudent = async (data) => {
  try {
    const response = await api.put(
      "/enrollments/transfer",
      data
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to transfer student.",
      }
    );
  }
};

// ======================================
// Get Students By Batch
// GET /api/v1/enrollments/batch/:id/students
// ======================================

export const getStudentsByBatch = async (batchId) => {
  try {
    const response = await api.get(
      `/enrollments/batch/${batchId}/students`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch students.",
      }
    );
  }
};