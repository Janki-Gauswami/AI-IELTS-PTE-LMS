const LearningMaterial = require("../models/LearningMaterial");
const Batch = require("../models/Batch");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");


// ======================================================
// Check Teacher Batch Access
// ======================================================

const isTeacherAssignedToBatch = async (
  teacherId,
  batchId
) => {
  if (!teacherId || !batchId) {
    return false;
  }

  const Batch = require("../models/Batch");

  const batch = await Batch.findOne({
    _id: batchId,
    teachers: teacherId,
  }).select("_id");

  return !!batch;
};

// ==========================================
// Validate Resource URL
// ==========================================

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ======================================================
// Get Student's Enrolled Batch IDs
// ======================================================

const getStudentBatchIds = async (studentId) => {
  const enrollments = await Enrollment.find({
    student: studentId,
  }).select("batch");

  return enrollments
    .filter((enrollment) => enrollment.batch)
    .map((enrollment) =>
      enrollment.batch.toString()
    );
};

// ==========================================
// Create Learning Material
// ==========================================

exports.createLearningMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      materialType,
      resourceUrl,
      thumbnail,
      course,
      module,
      batch,
    } = req.body;

    // ==========================================
    // Required Field Validation
    // ==========================================

    if (
      !title ||
      !materialType ||
      !resourceUrl ||
      !course ||
      !module
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    // ==========================================
// Validate Resource URL
// ==========================================

if (!isValidUrl(resourceUrl)) {
  return res.status(400).json({
    success: false,
    message: "Please provide a valid resource URL.",
  });
}

// ======================================================
// Teacher Batch Authorization
// ======================================================

if (req.user.role === "teacher") {
  if (!batch) {
    return res.status(400).json({
      success: false,
      message:
        "Teacher must select an assigned batch.",
    });
  }

  const Batch = require("../models/Batch");

  const assignedBatch =
    await Batch.findOne({
      _id: batch,
      teachers: req.user._id,
    });

  if (!assignedBatch) {
    return res.status(403).json({
      success: false,
      message:
        "You are not assigned to this batch.",
    });
  }
}


    // ==========================================
    // Validate Course
    // ==========================================

    if (!["IELTS", "PTE"].includes(course)) {
      return res.status(400).json({
        success: false,
        message: "Course must be either IELTS or PTE.",
      });
    }

    // ==========================================
    // Validate Material Type
    // ==========================================

    const validTypes = [
      "PDF",
      "Video",
      "Audio",
      "Document",
      "Link",
    ];

    if (!validTypes.includes(materialType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material type.",
      });
    }

    // ==========================================
    // Validate Batch
    // ==========================================

    if (batch) {
      const existingBatch = await Batch.findById(batch);

      if (!existingBatch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found.",
        });
      }

      // Batch course should match material course
      if (existingBatch.course !== course) {
        return res.status(400).json({
          success: false,
          message:
            "Material course and batch course must be the same.",
        });
      }
    }

    // ======================================================
// Teacher Security
// ======================================================

if (req.user.role === "teacher") {
  if (!batch) {
    return res.status(400).json({
      success: false,
      message:
        "Teachers must select an assigned batch.",
    });
  }

  const assigned =
    await isTeacherAssignedToBatch(
      req.user._id,
      batch
    );

  if (!assigned) {
    return res.status(403).json({
      success: false,
      message:
        "You are not assigned to this batch.",
    });
  }
}

    // ==========================================
    // Create Material
    // ==========================================

    const material = await LearningMaterial.create({
      title: title.trim(),
      description: description || "",
      materialType,
      resourceUrl: resourceUrl.trim(),
      thumbnail: thumbnail || "",
      course,
      module: module.trim(),
      batch: batch || null,
      uploadedBy: req.user._id,
      status: "Active",
    });

    // ==========================================
    // Populate Response
    // ==========================================

    const populatedMaterial =
      await LearningMaterial.findById(material._id)
        .populate({
          path: "batch",
          select: "batchName course batchType",
        })
        .populate({
          path: "uploadedBy",
          select: "name email role",
        });

    return res.status(201).json({
      success: true,
      message: "Learning material created successfully.",
      data: populatedMaterial,
    });
  } catch (error) {
    console.error(
      "Create Learning Material Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Get All Learning Materials
// GET /api/v1/learning-materials
// ======================================================

exports.getAllLearningMaterials = async (
  req,
  res
) => {
  try {
    const {
      search,
      course,
      module,
      materialType,
      batch,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    // ==================================================
    // Base Query
    // ==================================================

    const query = {};

    // ==================================================
    // Search
    // ==================================================

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ==================================================
    // Course Filter
    // ==================================================

    if (course) {
      query.course = course;
    }

    // ==================================================
    // Module Filter
    // ==================================================

    if (module) {
      query.module = module;
    }

    // ==================================================
    // Material Type Filter
    // ==================================================

    if (materialType) {
      query.materialType = materialType;
    }

    // ==================================================
    // Status Filter
    // ==================================================

    if (status) {
      query.status = status;
    }

    // ==================================================
    // Student Batch Access
    // ==================================================

    if (req.user.role === "student") {
      const studentBatchIds =
        await getStudentBatchIds(
          req.user._id
        );

      /*
       * Student can access:
       *
       * 1. Materials specifically assigned
       *    to their enrolled batch
       *
       * 2. Materials with no batch assigned
       *    (general course material)
       */

      query.$or = [
        {
          batch: {
            $in: studentBatchIds,
          },
        },
        {
          batch: null,
        },
        {
          batch: {
            $exists: false,
          },
        },
      ];

      // ------------------------------------------------
      // If a specific batch was requested by student,
      // verify that the student belongs to it.
      // ------------------------------------------------

      if (batch) {
        const isEnrolled =
          studentBatchIds.includes(
            batch.toString()
          );

        if (!isEnrolled) {
          return res.status(403).json({
            success: false,
            message:
              "You are not enrolled in this batch.",
          });
        }

        query.$or = [
          {
            batch: batch,
          },
          {
            batch: null,
          },
          {
            batch: {
              $exists: false,
            },
          },
        ];
      }
    }

    // ==================================================
    // Teacher Batch Access
    // ==================================================

    if (req.user.role === "teacher") {
      const Batch = require("../models/Batch");

      const assignedBatches =
        await Batch.find({
          teachers: req.user._id,
        }).select("_id");

      const assignedBatchIds =
        assignedBatches.map((item) =>
          item._id.toString()
        );

      /*
       * Teacher can see:
       *
       * 1. Materials belonging to assigned batches
       * 2. General materials
       */

      query.$or = [
        {
          batch: {
            $in: assignedBatchIds,
          },
        },
        {
          batch: null,
        },
        {
          batch: {
            $exists: false,
          },
        },
      ];

      // ------------------------------------------------
      // If teacher requests a specific batch
      // ------------------------------------------------

      if (batch) {
        const isAssigned =
          assignedBatchIds.includes(
            batch.toString()
          );

        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            message:
              "You are not assigned to this batch.",
          });
        }

        query.$or = [
          {
            batch: batch,
          },
          {
            batch: null,
          },
          {
            batch: {
              $exists: false,
            },
          },
        ];
      }
    }

    // ==================================================
    // Admin Batch Filter
    // ==================================================

    if (
      req.user.role === "admin" &&
      batch
    ) {
      query.batch = batch;
    }

    // ==================================================
    // Pagination
    // ==================================================

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const pageLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip =
      (pageNumber - 1) * pageLimit;

    // ==================================================
    // Total Records
    // ==================================================

    const totalRecords =
      await LearningMaterial.countDocuments(
        query
      );

    // ==================================================
    // Fetch Materials
    // ==================================================

    const materials =
      await LearningMaterial.find(query)
        .populate(
          "batch",
          "batchName course batchType status"
        )
        .populate(
          "uploadedBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageLimit);

    // ==================================================
    // Pagination
    // ==================================================

    const totalPages = Math.ceil(
      totalRecords / pageLimit
    );

    return res.status(200).json({
      success: true,

      data: materials,

      pagination: {
        totalRecords,
        totalPages,
        currentPage: pageNumber,
        pageSize: pageLimit,
        currentRecords:
          materials.length,
        hasNextPage:
          pageNumber < totalPages,
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get Learning Materials Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch learning materials.",
      error: error.message,
    });
  }
};

// ==========================================
// Get Learning Material By ID
// ==========================================

exports.getLearningMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const material =
      await LearningMaterial.findById(id)
        .populate({
          path: "batch",
          select:
            "batchName course batchType startDate endDate schedule",
        })
        .populate({
          path: "uploadedBy",
          select: "name email role",
        });

        // ======================================================
// Material Not Found
// ======================================================

if (!material) {
  return res.status(404).json({
    success: false,
    message:
      "Learning material not found.",
  });
}

// ======================================================
// Student Access
// ======================================================

if (req.user.role === "student") {
  const studentBatchIds =
    await getStudentBatchIds(
      req.user._id
    );

  // General material
  if (!material.batch) {
    // Allowed
  } else {
    const hasAccess =
      studentBatchIds.includes(
        material.batch.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this learning material.",
      });
    }
  }

  // Students can only see active materials
  if (material.status !== "Active") {
    return res.status(404).json({
      success: false,
      message:
        "Learning material not found.",
    });
  }
}

// ======================================================
// Teacher Access
// ======================================================

if (req.user.role === "teacher") {
  if (material.batch) {
    const assigned =
      await isTeacherAssignedToBatch(
        req.user._id,
        material.batch
      );

    if (!assigned) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this material's batch.",
      });
    }
  }
}
        

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error(
      "Get Learning Material Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// Update Learning Material
// ==========================================

exports.updateLearningMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      materialType,
      resourceUrl,
      thumbnail,
      course,
      module,
      batch,
      status,
    } = req.body;

    // ==========================================
    // Find Material
    // ==========================================

    const material =
      await LearningMaterial.findById(id);

      // ======================================================
// Material Not Found
// ======================================================

if (!material) {
  return res.status(404).json({
    success: false,
    message:
      "Learning material not found.",
  });
}

// ======================================================
// Student Cannot Update
// ======================================================

if (req.user.role === "student") {
  return res.status(403).json({
    success: false,
    message:
      "Students cannot modify learning materials.",
  });
}

// ======================================================
// Teacher Security
// ======================================================

if (req.user.role === "teacher") {
  if (!material.batch) {
    return res.status(403).json({
      success: false,
      message:
        "Teachers cannot modify general materials.",
    });
  }

  const assigned =
    await isTeacherAssignedToBatch(
      req.user._id,
      material.batch
    );

  if (!assigned) {
    return res.status(403).json({
      success: false,
      message:
        "You are not assigned to this material's batch.",
    });
  }

  // -----------------------------------------------
  // Prevent moving material to another batch
  // -----------------------------------------------

  if (
    req.body.batch &&
    req.body.batch.toString() !==
      material.batch.toString()
  ) {
    const newBatchAssigned =
      await isTeacherAssignedToBatch(
        req.user._id,
        req.body.batch
      );

    if (!newBatchAssigned) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot move material to an unassigned batch.",
      });
    }
  }
}
      // ==========================================
// Validate Updated Resource URL
// ==========================================

// ======================================================
// Teacher Authorization
// ======================================================

if (req.user.role === "teacher") {
  const Batch = require("../models/Batch");

  const materialBatchId =
    material.batch
      ? material.batch.toString()
      : null;

  if (!materialBatchId) {
    return res.status(403).json({
      success: false,
      message:
        "Teachers cannot edit general materials.",
    });
  }

  const assignedBatch =
    await Batch.findOne({
      _id: materialBatchId,
      teachers: req.user._id,
    });

  if (!assignedBatch) {
    return res.status(403).json({
      success: false,
      message:
        "You are not assigned to this material's batch.",
    });
  }
}

if (
  resourceUrl &&
  !isValidUrl(resourceUrl)
) {
  return res.status(400).json({
    success: false,
    message: "Please provide a valid resource URL.",
  });
}

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    // ==========================================
    // Validate Material Type
    // ==========================================

    if (
      materialType &&
      ![
        "PDF",
        "Video",
        "Audio",
        "Document",
        "Link",
      ].includes(materialType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid material type.",
      });
    }

    // ==========================================
    // Validate Course
    // ==========================================

    if (
      course &&
      !["IELTS", "PTE"].includes(course)
    ) {
      return res.status(400).json({
        success: false,
        message: "Course must be either IELTS or PTE.",
      });
    }

    // ==========================================
    // Validate Batch
    // ==========================================

    if (batch) {
      const existingBatch =
        await Batch.findById(batch);

      if (!existingBatch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found.",
        });
      }

      const finalCourse =
        course || material.course;

      if (existingBatch.course !== finalCourse) {
        return res.status(400).json({
          success: false,
          message:
            "Material course and batch course must be the same.",
        });
      }
    }

    // ==========================================
    // Update Fields
    // ==========================================

    material.title =
      title?.trim() || material.title;

    material.description =
      description ?? material.description;

    material.materialType =
      materialType || material.materialType;

    material.resourceUrl =
      resourceUrl?.trim() ||
      material.resourceUrl;

    material.thumbnail =
      thumbnail ?? material.thumbnail;

    material.course =
      course || material.course;

    material.module =
      module?.trim() || material.module;

    material.batch =
      batch !== undefined
        ? batch || null
        : material.batch;

    material.status =
      status || material.status;

    await material.save();

    // ==========================================
    // Populate Updated Material
    // ==========================================

    const updatedMaterial =
      await LearningMaterial.findById(material._id)
        .populate({
          path: "batch",
          select: "batchName course batchType",
        })
        .populate({
          path: "uploadedBy",
          select: "name email role",
        });

    return res.status(200).json({
      success: true,
      message: "Learning material updated successfully.",
      data: updatedMaterial,
    });
  } catch (error) {
    console.error(
      "Update Learning Material Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// Delete Learning Material
// ==========================================

exports.deleteLearningMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material =
      await LearningMaterial.findById(id);
      // ======================================================
// Material Not Found
// ======================================================

if (!material) {
  return res.status(404).json({
    success: false,
    message:
      "Learning material not found.",
  });
}

// ======================================================
// Student Cannot Delete
// ======================================================

if (req.user.role === "student") {
  return res.status(403).json({
    success: false,
    message:
      "Students cannot delete learning materials.",
  });
}

// ======================================================
// Teacher Security
// ======================================================

if (req.user.role === "teacher") {
  if (!material.batch) {
    return res.status(403).json({
      success: false,
      message:
        "Teachers cannot delete general materials.",
    });
  }

  const assigned =
    await isTeacherAssignedToBatch(
      req.user._id,
      material.batch
    );

  if (!assigned) {
    return res.status(403).json({
      success: false,
      message:
        "You are not assigned to this material's batch.",
    });
  }
}

      if (req.user.role === "teacher") {
  const Batch = require("../models/Batch");

  if (!material.batch) {
    return res.status(403).json({
      success: false,
      message:
        "Teachers cannot delete general materials.",
    });
  }

  const assignedBatch =
    await Batch.findOne({
      _id: material.batch,
      teachers: req.user._id,
    });

  if (!assignedBatch) {
    return res.status(403).json({
      success: false,
      message:
        "You are not assigned to this material's batch.",
    });
  }
}

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    material.status = "Inactive";

    await material.save();

    return res.status(200).json({
      success: true,
      message: "Learning material deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Learning Material Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
