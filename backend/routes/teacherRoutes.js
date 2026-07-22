const express = require("express");

const router = express.Router();

const {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignBatch,
  removeBatch,
  getAssignedBatches,
  getTeachersByBatch,
  changeTeacher,
} = require("../controllers/teacherController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ==========================================
// Batch Routes (Keep BEFORE /:id)
// ==========================================

// Change Batch Teacher
router.put(
  "/change-batch-teacher",
  protect,
  authorize("admin"),
  changeTeacher
);

// Assign Batch
router.post(
  "/:teacherId/batches",
  protect,
  authorize("admin"),
  assignBatch
);

// Remove Batch
router.delete(
  "/:teacherId/batches/:batchId",
  protect,
  authorize("admin"),
  removeBatch
);

// Get Assigned Batches
router.get(
  "/:teacherId/batches",
  protect,
  authorize("admin", "teacher"),
  getAssignedBatches
);

// Get Teachers By Batch
router.get(
  "/batch/:batchId",
  protect,
  authorize("admin", "teacher"),
  getTeachersByBatch
);

// ==========================================
// Teacher Management
// ==========================================

// Create Teacher
router.post(
  "/",
  protect,
  authorize("admin"),
  createTeacher
);

// Get All Teachers
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllTeachers
);

// Get Teacher Details
router.get(
  "/:id",
  protect,
  authorize("admin", "teacher", "student"),
  getTeacherById
);

// Update Teacher
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateTeacher
);

// Delete Teacher
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteTeacher
);

module.exports = router;