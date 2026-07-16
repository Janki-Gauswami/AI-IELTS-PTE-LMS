import api from "../api/axios";

// ======================================
// Get All Batches
// ======================================
export const getAllBatches = async () => {
  try {
    const response = await api.get("/batches");

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch batches.",
      }
    );
  }
};

// ======================================
// Get Batch By ID
// ======================================
export const getBatchById = async (id) => {
  try {
    const response = await api.get(`/batches/${id}`);

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch batch.",
      }
    );
  }
};

// ======================================
// Create Batch
// ======================================
export const createBatch = async (batchData) => {
  try {
    const response = await api.post("/batches", batchData);

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to create batch.",
      }
    );
  }
};

// ======================================
// Update Batch
// ======================================
export const updateBatch = async (id, batchData) => {
  try {
    const response = await api.put(`/batches/${id}`, batchData);

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update batch.",
      }
    );
  }
};

// ======================================
// Delete Batch
// ======================================
export const deleteBatch = async (id) => {
  try {
    const response = await api.delete(`/batches/${id}`);

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to delete batch.",
      }
    );
  }
};