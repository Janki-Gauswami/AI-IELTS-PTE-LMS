const express = require("express");

const {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
} = require("../controllers/batchController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// Admin Only Routes
// ==========================================

// Create Batch
router.post(
  "/",
  protect,
  authorize("admin"),
  createBatch
);

// Get All Batches
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllBatches
);

// Get Batch By ID
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getBatchById
);

// Update Batch
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateBatch
);

// Delete Batch
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteBatch
);

module.exports = router;