import api from "../api/axios";

// ======================================
// Get All Students
// ======================================

export const getAllStudents = async (params = {}) => {
  try {
    const response = await api.get("/students", {
      params,
    });

    return {
      success: response.data.success,
      data: response.data.data || [],
      count: response.data.count || 0,
    };
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch students.",
      }
    );
  }
};

// ======================================
// Get Student By ID
// ======================================

export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);

    return {
      success: response.data.success,
      data: response.data.data,
    };
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch student.",
      }
    );
  }
};

// ======================================
// Create Student
// ======================================

export const createStudent = async (studentData) => {
  try {
    const response = await api.post("/students", studentData);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to create student.",
      }
    );
  }
};

// ======================================
// Update Student
// ======================================

export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.put(`/students/${id}`, studentData);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update student.",
      }
    );
  }
};

// ======================================
// Delete Student
// ======================================

export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/students/${id}`);

    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to deactivate student.",
      }
    );
  }
};