import api from "../api/axios";

// ==========================================
// Get All Teachers
// ==========================================

export const getAllTeachers = async (params = {}) => {
  const response = await api.get("/teachers", {
    params,
  });

  return response.data;
};

// ==========================================
// Get Teacher By ID
// ==========================================

export const getTeacherById = async (teacherId) => {
  const response = await api.get(`/teachers/${teacherId}`);

  return response.data;
};

// ==========================================
// Create Teacher
// ==========================================

export const createTeacher = async (teacherData) => {
  const response = await api.post("/teachers", teacherData);

  return response.data;
};

// ==========================================
// Update Teacher
// ==========================================

export const updateTeacher = async (teacherId, teacherData) => {
  const response = await api.put(
    `/teachers/${teacherId}`,
    teacherData
  );

  return response.data;
};

// ==========================================
// Delete Teacher
// ==========================================

export const deleteTeacher = async (teacherId) => {
  const response = await api.delete(`/teachers/${teacherId}`);

  return response.data;
};

// ==========================================
// Assign Batch
// ==========================================

export const assignBatch = async (teacherId, batchId) => {
  const response = await api.post(
    `/teachers/${teacherId}/batches`,
    {
      batchId,
    }
  );

  return response.data;
};

// ==========================================
// Remove Batch
// ==========================================

export const removeBatch = async (teacherId, batchId) => {
  const response = await api.delete(
    `/teachers/${teacherId}/batches/${batchId}`
  );

  return response.data;
};

// ==========================================
// Change Teacher
// ==========================================

export const changeTeacher = async (data) => {
  const response = await api.put(
    "/teachers/change-batch-teacher",
    data
  );

  return response.data;
};

// ==========================================
// Get Assigned Batches
// ==========================================

export const getAssignedBatches = async (teacherId) => {
  const response = await api.get(
    `/teachers/${teacherId}/batches`
  );

  return response.data;
};

// ==========================================
// Get Teachers By Batch
// ==========================================

export const getTeachersByBatch = async (batchId) => {
  const response = await api.get(
    `/teachers/batch/${batchId}`
  );

  return response.data;
};