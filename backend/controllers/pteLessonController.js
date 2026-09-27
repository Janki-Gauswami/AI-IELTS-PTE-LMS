const mongoose = require("mongoose");
const PTELesson = require("../models/PTELesson");

// ======================================================
// Helper: Validate MongoDB ObjectId
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// CREATE PTE LESSON
// POST /api/v1/pte/lessons
// Admin + Teacher
// ======================================================

const createPTELesson = async (req, res) => {
  try {
    const {
      section,
      title,
      description,
      learningMaterial,
      difficulty,
      status,
    } = req.body;

    // --------------------------------------------------
    // Validate Section
    // --------------------------------------------------

    if (!section) {
      return res.status(400).json({
        success: false,
        message: "PTE section is required.",
      });
    }

    const allowedSections = [
      "Speaking",
      "Writing",
      "Reading",
      "Listening",
    ];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid PTE section. Allowed values: Speaking, Writing, Reading, Listening.",
      });
    }

    // --------------------------------------------------
    // Validate Title
    // --------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required.",
      });
    }

    // --------------------------------------------------
    // Validate Difficulty
    // --------------------------------------------------

    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
    ];

    const finalDifficulty =
      difficulty || "Medium";

    if (
      !allowedDifficulties.includes(
        finalDifficulty
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid difficulty. Allowed values: Easy, Medium, Hard.",
      });
    }

    // --------------------------------------------------
    // Validate Status
    // --------------------------------------------------

    const allowedStatuses = [
      "Draft",
      "Published",
    ];

    const finalStatus = status || "Draft";

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: Draft, Published.",
      });
    }

    // --------------------------------------------------
    // Published At
    // --------------------------------------------------

    let publishedAt = null;

    if (finalStatus === "Published") {
      publishedAt = new Date();
    }

    // --------------------------------------------------
    // Create Lesson
    // --------------------------------------------------

    const lesson = await PTELesson.create({
      section,
      title: title.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      learningMaterial:
        typeof learningMaterial === "string"
          ? learningMaterial.trim()
          : "",
      difficulty: finalDifficulty,
      status: finalStatus,
      publishedAt,
      createdBy: req.user._id,
    });

    // --------------------------------------------------
    // Populate Creator
    // --------------------------------------------------

    const populatedLesson =
      await PTELesson.findById(lesson._id).populate(
        "createdBy",
        "name email role"
      );

    return res.status(201).json({
      success: true,
      message: "PTE lesson created successfully.",
      data: populatedLesson,
    });
  } catch (error) {
    console.error(
      "Create PTE Lesson Error:",
      error
    );

    // --------------------------------------------------
    // Mongoose Validation Error
    // --------------------------------------------------

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error.",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create PTE lesson.",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL PTE LESSONS
// GET /api/v1/pte/lessons
//
// Query Parameters:
// ?section=Reading
// ?status=Published
// ?difficulty=Easy
// ?search=grammar
// ======================================================

const getAllPTELessons = async (req, res) => {
  try {
    const {
      section,
      status,
      difficulty,
      search,
    } = req.query;

    const filter = {};

    // --------------------------------------------------
    // Student Visibility
    // Students should only see Published lessons
    // --------------------------------------------------

    if (req.user.role === "student") {
      filter.status = "Published";
    } else if (status) {
      filter.status = status;
    }

    // --------------------------------------------------
    // Section Filter
    // --------------------------------------------------

    if (section) {
      const allowedSections = [
        "Speaking",
        "Writing",
        "Reading",
        "Listening",
      ];

      if (!allowedSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: "Invalid PTE section.",
        });
      }

      filter.section = section;
    }

    // --------------------------------------------------
    // Difficulty Filter
    // --------------------------------------------------

    if (difficulty) {
      const allowedDifficulties = [
        "Easy",
        "Medium",
        "Hard",
      ];

      if (
        !allowedDifficulties.includes(
          difficulty
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid difficulty.",
        });
      }

      filter.difficulty = difficulty;
    }

    // --------------------------------------------------
    // Status Validation
    // --------------------------------------------------

    if (
      status &&
      ![
        "Draft",
        "Published",
        "Archived",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson status.",
      });
    }

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    if (search && search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          learningMaterial: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // --------------------------------------------------
    // Fetch Lessons
    // --------------------------------------------------

    const lessons = await PTELesson.find(filter)
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    console.error(
      "Get PTE Lessons Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch PTE lessons.",
      error: error.message,
    });
  }
};

// ======================================================
// GET PTE LESSON BY ID
// GET /api/v1/pte/lessons/:id
// ======================================================

const getPTELessonById = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID.",
      });
    }

    // --------------------------------------------------
    // Find Lesson
    // --------------------------------------------------

    const lesson = await PTELesson.findById(id)
      .populate(
        "createdBy",
        "name email role"
      )
      .populate(
        "archivedBy",
        "name email role"
      );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "PTE lesson not found.",
      });
    }

    // --------------------------------------------------
    // Students cannot access Draft/Archived lessons
    // --------------------------------------------------

    if (
      req.user.role === "student" &&
      lesson.status !== "Published"
    ) {
      return res.status(404).json({
        success: false,
        message: "PTE lesson not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error(
      "Get PTE Lesson Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch PTE lesson.",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE PTE LESSON
// PATCH /api/v1/pte/lessons/:id
// Admin + Teacher
// ======================================================

const updatePTELesson = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      section,
      title,
      description,
      learningMaterial,
      difficulty,
      status,
    } = req.body;

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID.",
      });
    }

    // --------------------------------------------------
    // Find Lesson
    // --------------------------------------------------

    const lesson = await PTELesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "PTE lesson not found.",
      });
    }

    // --------------------------------------------------
    // Update Section
    // --------------------------------------------------

    if (section !== undefined) {
      const allowedSections = [
        "Speaking",
        "Writing",
        "Reading",
        "Listening",
      ];

      if (!allowedSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: "Invalid PTE section.",
        });
      }

      lesson.section = section;
    }

    // --------------------------------------------------
    // Update Title
    // --------------------------------------------------

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Lesson title cannot be empty.",
        });
      }

      lesson.title = title.trim();
    }

    // --------------------------------------------------
    // Update Description
    // --------------------------------------------------

    if (description !== undefined) {
      lesson.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    // --------------------------------------------------
    // Update Learning Material
    // --------------------------------------------------

    if (learningMaterial !== undefined) {
      lesson.learningMaterial =
        typeof learningMaterial === "string"
          ? learningMaterial.trim()
          : "";
    }

    // --------------------------------------------------
    // Update Difficulty
    // --------------------------------------------------

    if (difficulty !== undefined) {
      const allowedDifficulties = [
        "Easy",
        "Medium",
        "Hard",
      ];

      if (
        !allowedDifficulties.includes(
          difficulty
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid difficulty.",
        });
      }

      lesson.difficulty = difficulty;
    }

    // --------------------------------------------------
    // Update Status
    // --------------------------------------------------

    if (status !== undefined) {
      const allowedStatuses = [
        "Draft",
        "Published",
        "Archived",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lesson status.",
        });
      }

      // ----------------------------------------------
      // Published
      // ----------------------------------------------

      if (status === "Published") {
        lesson.status = "Published";

        if (!lesson.publishedAt) {
          lesson.publishedAt = new Date();
        }

        lesson.archivedAt = null;
        lesson.archivedBy = null;
      }

      // ----------------------------------------------
      // Draft
      // ----------------------------------------------

      else if (status === "Draft") {
        lesson.status = "Draft";
        lesson.publishedAt = null;
      }

      // ----------------------------------------------
      // Archived
      // ----------------------------------------------

      else if (status === "Archived") {
        lesson.status = "Archived";

        if (!lesson.archivedAt) {
          lesson.archivedAt = new Date();
        }

        lesson.archivedBy = req.user._id;
      }
    }

    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    await lesson.save();

    // --------------------------------------------------
    // Return Updated Lesson
    // --------------------------------------------------

    const updatedLesson =
      await PTELesson.findById(id)
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "archivedBy",
          "name email role"
        );

    return res.status(200).json({
      success: true,
      message: "PTE lesson updated successfully.",
      data: updatedLesson,
    });
  } catch (error) {
    console.error(
      "Update PTE Lesson Error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error.",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update PTE lesson.",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE / ARCHIVE PTE LESSON
// DELETE /api/v1/pte/lessons/:id
//
// Soft Delete:
// Published/Draft → Archived
// ======================================================

const deletePTELesson = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID.",
      });
    }

    // --------------------------------------------------
    // Find Lesson
    // --------------------------------------------------

    const lesson = await PTELesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "PTE lesson not found.",
      });
    }

    // --------------------------------------------------
    // Already Archived
    // --------------------------------------------------

    if (lesson.status === "Archived") {
      return res.status(400).json({
        success: false,
        message: "Lesson is already archived.",
      });
    }

    // --------------------------------------------------
    // Soft Delete
    // --------------------------------------------------

    lesson.status = "Archived";
    lesson.archivedAt = new Date();
    lesson.archivedBy = req.user._id;

    await lesson.save();

    return res.status(200).json({
      success: true,
      message: "PTE lesson archived successfully.",
      data: lesson,
    });
  } catch (error) {
    console.error(
      "Archive PTE Lesson Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to archive PTE lesson.",
      error: error.message,
    });
  }
};

// ======================================================
// PUBLISH PTE LESSON
// PATCH /api/v1/pte/lessons/:id/publish
// Draft → Published
// ======================================================

const publishPTELesson = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID.",
      });
    }

    const lesson = await PTELesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "PTE lesson not found.",
      });
    }

    // --------------------------------------------------
    // Archived Lesson Cannot Be Published Directly
    // --------------------------------------------------

    if (lesson.status === "Archived") {
      return res.status(400).json({
        success: false,
        message:
          "Archived lesson must be restored before publishing.",
      });
    }

    // --------------------------------------------------
    // Publish
    // --------------------------------------------------

    lesson.status = "Published";
    lesson.publishedAt = new Date();
    lesson.archivedAt = null;
    lesson.archivedBy = null;

    await lesson.save();

    const updatedLesson =
      await PTELesson.findById(id).populate(
        "createdBy",
        "name email role"
      );

    return res.status(200).json({
      success: true,
      message: "PTE lesson published successfully.",
      data: updatedLesson,
    });
  } catch (error) {
    console.error(
      "Publish PTE Lesson Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to publish PTE lesson.",
      error: error.message,
    });
  }
};

// ======================================================
// UNPUBLISH PTE LESSON
// PATCH /api/v1/pte/lessons/:id/unpublish
// Published → Draft
// ======================================================

const unpublishPTELesson = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID.",
      });
    }

    const lesson = await PTELesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "PTE lesson not found.",
      });
    }

    if (lesson.status !== "Published") {
      return res.status(400).json({
        success: false,
        message:
          "Only published lessons can be unpublished.",
      });
    }

    // --------------------------------------------------
    // Move Back To Draft
    // --------------------------------------------------

    lesson.status = "Draft";
    lesson.publishedAt = null;

    await lesson.save();

    const updatedLesson =
      await PTELesson.findById(id).populate(
        "createdBy",
        "name email role"
      );

    return res.status(200).json({
      success: true,
      message:
        "PTE lesson moved back to draft successfully.",
      data: updatedLesson,
    });
  } catch (error) {
    console.error(
      "Unpublish PTE Lesson Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to unpublish PTE lesson.",
      error: error.message,
    });
  }
};

// ======================================================
// RESTORE PTE LESSON
// PATCH /api/v1/pte/lessons/:id/restore
// Archived → Draft
// ======================================================

const restorePTELesson = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID.",
      });
    }

    // --------------------------------------------------
    // Find Lesson
    // --------------------------------------------------

    const lesson = await PTELesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "PTE lesson not found.",
      });
    }

    // --------------------------------------------------
    // Check Archived
    // --------------------------------------------------

    if (lesson.status !== "Archived") {
      return res.status(400).json({
        success: false,
        message:
          "Only archived lessons can be restored.",
      });
    }

    // --------------------------------------------------
    // Restore As Draft
    // --------------------------------------------------

    lesson.status = "Draft";
    lesson.publishedAt = null;
    lesson.archivedAt = null;
    lesson.archivedBy = null;

    await lesson.save();

    const restoredLesson =
      await PTELesson.findById(id)
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "archivedBy",
          "name email role"
        );

    return res.status(200).json({
      success: true,
      message:
        "PTE lesson restored successfully as draft.",
      data: restoredLesson,
    });
  } catch (error) {
    console.error(
      "Restore PTE Lesson Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to restore PTE lesson.",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createPTELesson,
  getAllPTELessons,
  getPTELessonById,
  updatePTELesson,
  deletePTELesson,
  publishPTELesson,
  unpublishPTELesson,
  restorePTELesson,
};