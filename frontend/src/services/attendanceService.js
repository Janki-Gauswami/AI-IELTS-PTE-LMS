import api from "../api/axios";

// ==============================================
// Mark Attendance
// POST /attendance
// ==============================================

export const markAttendance = async (attendanceData) => {
  try {
    const response = await api.post(
      "/attendance",
      attendanceData
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      "Failed to mark attendance."
    );
  }
};

// ==============================================
// Get Attendance History
// GET /attendance
// ==============================================

export const getAttendance = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.date)
      params.append("date", filters.date);

    if (filters.batch)
      params.append("batch", filters.batch);

    if (filters.teacher)
      params.append("teacher", filters.teacher);

    if (filters.student)
      params.append("student", filters.student);

    if (filters.status)
      params.append("status", filters.status);

    if (filters.page)
      params.append("page", filters.page);

    if (filters.limit)
      params.append("limit", filters.limit);

    const response = await api.get(
      `/attendance?${params.toString()}`
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      "Failed to fetch attendance history."
    );
  }
};

// ==============================================
// Get Attendance By ID
// GET /attendance/:id
// ==============================================

export const getAttendanceById = async (id) => {
  try {
    const response = await api.get(
      `/attendance/${id}`
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      "Failed to fetch attendance record."
    );
  }
};

// ==============================================
// Update Attendance
// PUT /attendance/:id
// ==============================================

export const updateAttendance = async (
  id,
  attendanceData
) => {
  try {
    const response = await api.put(
      `/attendance/${id}`,
      attendanceData
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      "Failed to update attendance."
    );
  }
};

// ==============================================
// Delete Attendance
// DELETE /attendance/:id
// ==============================================

export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(
      `/attendance/${id}`
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      "Failed to delete attendance."
    );
  }
};