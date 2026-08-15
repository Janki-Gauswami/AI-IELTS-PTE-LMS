const express = require("express");

const router = express.Router();

const {
  createLearningMaterial,
  getAllLearningMaterials,
  getLearningMaterialById,
  updateLearningMaterial,
  deleteLearningMaterial,
} = require("../controllers/learningMaterialController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// Learning Material Routes
// Base URL:
// /api/v1/learning-materials
// ======================================================


// ======================================================
// Create Learning Material
// Admin & Teacher
// POST /api/v1/learning-materials
// ======================================================

router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createLearningMaterial
);


// ======================================================
// Get All Learning Materials
// Admin, Teacher & Student
// GET /api/v1/learning-materials
// ======================================================

router.get(
  "/",
  protect,
  authorize("admin", "teacher", "student"),
  getAllLearningMaterials
);


// ======================================================
// Get Learning Material By ID
// Admin, Teacher & Student
// GET /api/v1/learning-materials/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("admin", "teacher", "student"),
  getLearningMaterialById
);


// ======================================================
// Update Learning Material
// Admin & Teacher
// PUT /api/v1/learning-materials/:id
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  updateLearningMaterial
);


// ======================================================
// Delete Learning Material
// Admin & Teacher
// DELETE /api/v1/learning-materials/:id
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  deleteLearningMaterial
);


module.exports = router;