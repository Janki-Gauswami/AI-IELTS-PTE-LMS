import api from "../api/axios";

// ======================================================
// PTE LESSON SERVICE
// Base API:
// /api/v1/pte/lessons
// ======================================================


// ======================================================
// GET ALL PTE LESSONS
// Admin + Teacher
//
// GET /api/v1/pte/lessons
//
// Optional params:
// {
//   section: "Reading",
//   status: "Published",
//   difficulty: "Easy",
//   search: "grammar"
// }
// ======================================================

export const getPTELessons = async (params = {}) => {
  try {
    const response = await api.get("/pte/lessons", {
      params,
    });

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load PTE lessons.",
      }
    );
  }
};


// ======================================================
// GET ALL PTE LESSONS
// Student
//
// IMPORTANT:
// Students should only receive Published lessons.
//
// GET /api/v1/pte/lessons
//
// The backend should handle student visibility.
// We additionally send status=Published.
// ======================================================

export const getStudentPTELessons = async (
  params = {}
) => {
  try {
    const response = await api.get("/pte/lessons", {
      params: {
        ...params,
        status: "Published",
      },
    });

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load published PTE lessons.",
      }
    );
  }
};


// ======================================================
// GET PTE LESSON BY ID
// Admin + Teacher + Student
//
// GET /api/v1/pte/lessons/:id
// ======================================================

export const getPTELessonById = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: "PTE lesson ID is required.",
      };
    }

    const response = await api.get(
      `/pte/lessons/${id}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      (error.success !== undefined
        ? error
        : {
            success: false,
            message: "Unable to load PTE lesson.",
          })
    );
  }
};


// ======================================================
// GET STUDENT PTE LESSON BY ID
//
// This is an alias of getPTELessonById.
//
// Used by:
// Student Lesson Detail / Study Page
//
// GET /api/v1/pte/lessons/:id
// ======================================================

export const getStudentPTELessonById = async (
  id
) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: "PTE lesson ID is required.",
      };
    }

    const response = await api.get(
      `/pte/lessons/${id}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      (error.success !== undefined
        ? error
        : {
            success: false,
            message: "Unable to load PTE lesson.",
          })
    );
  }
};


// ======================================================
// CREATE PTE LESSON
// Admin + Teacher
//
// POST /api/v1/pte/lessons
//
// Example:
// {
//   section: "Reading",
//   title: "Reading Fill in the Blanks",
//   description: "...",
//   learningMaterial: "...",
//   difficulty: "Medium",
//   status: "Draft"
// }
// ======================================================

export const createPTELesson = async (
  lessonData
) => {
  try {
    const response = await api.post(
      "/pte/lessons",
      lessonData
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to create PTE lesson.",
      }
    );
  }
};


// ======================================================
// UPDATE PTE LESSON
// Admin + Teacher
//
// PATCH /api/v1/pte/lessons/:id
// ======================================================

export const updatePTELesson = async (
  id,
  lessonData
) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: "PTE lesson ID is required.",
      };
    }

    const response = await api.patch(
      `/pte/lessons/${id}`,
      lessonData
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      (error.success !== undefined
        ? error
        : {
            success: false,
            message: "Unable to update PTE lesson.",
          })
    );
  }
};


// ======================================================
// DELETE / ARCHIVE PTE LESSON
// Admin + Teacher
//
// DELETE /api/v1/pte/lessons/:id
//
// Your backend is using SOFT DELETE:
// Published/Draft -> Archived
// ======================================================

export const deletePTELesson = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: "PTE lesson ID is required.",
      };
    }

    const response = await api.delete(
      `/pte/lessons/${id}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      (error.success !== undefined
        ? error
        : {
            success: false,
            message: "Unable to archive PTE lesson.",
          })
    );
  }
};


// ======================================================
// ARCHIVE PTE LESSON
// Admin + Teacher
//
// This is an explicit alias for deletePTELesson.
//
// DELETE /api/v1/pte/lessons/:id
// ======================================================

export const archivePTELesson = async (id) => {
  return deletePTELesson(id);
};


// ======================================================
// PUBLISH PTE LESSON
// Admin + Teacher
//
// PATCH /api/v1/pte/lessons/:id/publish
// ======================================================

export const publishPTELesson = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: "PTE lesson ID is required.",
      };
    }

    const response = await api.patch(
      `/pte/lessons/${id}/publish`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      (error.success !== undefined
        ? error
        : {
            success: false,
            message: "Unable to publish PTE lesson.",
          })
    );
  }
};


// ======================================================
// UNPUBLISH PTE LESSON
// Admin + Teacher
//
// PATCH /api/v1/pte/lessons/:id/unpublish
//
// Published -> Draft
// ======================================================

export const unpublishPTELesson = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: "PTE lesson ID is required.",
      };
    }

    const response = await api.patch(
      `/pte/lessons/${id}/unpublish`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      (error.success !== undefined
        ? error
        : {
            success: false,
            message: "Unable to unpublish PTE lesson.",
          })
    );
  }
};


// ======================================================
// RESTORE PTE LESSON
// Admin + Teacher
//
// PATCH /api/v1/pte/lessons/:id/restore
//
// Archived -> Draft
// ======================================================

export const restorePTELesson = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: "PTE lesson ID is required.",
      };
    }

    const response = await api.patch(
      `/pte/lessons/${id}/restore`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      (error.success !== undefined
        ? error
        : {
            success: false,
            message: "Unable to restore PTE lesson.",
          })
    );
  }
};


// ======================================================
// SEARCH PTE LESSONS
//
// Convenience function.
//
// Example:
// searchPTELessons("grammar")
// ======================================================

export const searchPTELessons = async (
  search,
  extraParams = {}
) => {
  try {
    const response = await api.get(
      "/pte/lessons",
      {
        params: {
          ...extraParams,
          search,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to search PTE lessons.",
      }
    );
  }
};


// ======================================================
// FILTER PTE LESSONS
//
// Example:
// filterPTELessons({
//   section: "Reading",
//   status: "Published",
//   difficulty: "Easy"
// })
// ======================================================

export const filterPTELessons = async (
  filters = {}
) => {
  try {
    const response = await api.get(
      "/pte/lessons",
      {
        params: filters,
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to filter PTE lessons.",
      }
    );
  }
};


// ======================================================
// DEFAULT EXPORT
// ======================================================

const pteLessonService = {
  getPTELessons,
  getStudentPTELessons,
  getPTELessonById,
  getStudentPTELessonById,
  createPTELesson,
  updatePTELesson,
  deletePTELesson,
  archivePTELesson,
  publishPTELesson,
  unpublishPTELesson,
  restorePTELesson,
  searchPTELessons,
  filterPTELessons,
};

export default pteLessonService;