import api from "../api/axios";

// ======================================================
// Learning Material Service
// ======================================================


// ======================================================
// Create Learning Material
// POST /learning-materials
// Admin & Teacher
// ======================================================

export const createLearningMaterial = async (
  materialData
) => {
  try {
    const response = await api.post(
      "/learning-materials",
      materialData
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to create learning material."
    );
  }
};


// ======================================================
// Get All Learning Materials
// GET /learning-materials
// Admin / Teacher / Student
// ======================================================

export const getLearningMaterials = async (
  filters = {}
) => {
  try {
    const params = new URLSearchParams();

    // Search
    if (filters.search) {
      params.append(
        "search",
        filters.search
      );
    }

    // Course
    if (filters.course) {
      params.append(
        "course",
        filters.course
      );
    }

    // Module
    if (filters.module) {
      params.append(
        "module",
        filters.module
      );
    }

    // Material Type
    if (filters.materialType) {
      params.append(
        "materialType",
        filters.materialType
      );
    }

    // Batch
    if (filters.batch) {
      params.append(
        "batch",
        filters.batch
      );
    }

    // Status
    if (filters.status) {
      params.append(
        "status",
        filters.status
      );
    }

    // Page
    if (filters.page) {
      params.append(
        "page",
        filters.page
      );
    }

    // Limit
    if (filters.limit) {
      params.append(
        "limit",
        filters.limit
      );
    }

    const queryString =
      params.toString();

    const url = queryString
      ? `/learning-materials?${queryString}`
      : "/learning-materials";

    const response =
      await api.get(url);

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch learning materials."
    );
  }
};


// ======================================================
// Get Learning Material By ID
// GET /learning-materials/:id
// ======================================================

export const getLearningMaterialById =
  async (id) => {
    try {
      if (!id) {
        throw new Error(
          "Learning material ID is required."
        );
      }

      const response =
        await api.get(
          `/learning-materials/${id}`
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch learning material."
      );
    }
  };


// ======================================================
// Update Learning Material
// PUT /learning-materials/:id
// Admin & Teacher
// ======================================================

export const updateLearningMaterial =
  async (
    id,
    materialData
  ) => {
    try {
      if (!id) {
        throw new Error(
          "Learning material ID is required."
        );
      }

      const response =
        await api.put(
          `/learning-materials/${id}`,
          materialData
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update learning material."
      );
    }
  };


// ======================================================
// Delete Learning Material
// DELETE /learning-materials/:id
// Admin & Teacher
// ======================================================

export const deleteLearningMaterial =
  async (id) => {
    try {
      if (!id) {
        throw new Error(
          "Learning material ID is required."
        );
      }

      const response =
        await api.delete(
          `/learning-materials/${id}`
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete learning material."
      );
    }
  };