const Batch = require("../models/Batch");

// ==========================================
// Create Batch
// ==========================================

const createBatch = async (req, res) => {
  try {
    const {
      batchName,
      course,
      batchType,
      teachers,
      schedule,
      startDate,
      endDate,
      capacity,
      description,
      status,
    } = req.body;
    // ==========================================
    // Required Field Validation
    // ==========================================

    if (
      !batchName ||
      !course ||
      !batchType ||
      !schedule ||
      !startDate ||
      !endDate ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ==========================================
    // Capacity Validation
    // ==========================================

    if (capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be greater than 0.",
      });
    }

    // ==========================================
    // Date Validation
    // ==========================================

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    // ==========================================
    // Teacher Validation
    // ==========================================

    if (
      status === "Active" &&
      (!teachers || teachers.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "An active batch must have at least one assigned teacher.",
      });
    }

    // ==========================================
    // Duplicate Batch Name
    // ==========================================

    const existingBatch = await Batch.findOne({
      batchName,
    });

    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message: "Batch name already exists.",
      });
    }

    // ==========================================
    // Create Batch
    // ==========================================

    const batch = await Batch.create({
      batchName,
      course,
      batchType,
      teachers,
      schedule,
      startDate,
      endDate,
      capacity,
      description,
      status,
      createdBy: req.user._id,
    });
    return res.status(201).json({
      success: true,
      message: "Batch created successfully.",
      batch,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });

  }
};

// ==========================================
// Get All Batches
// ==========================================
const getAllBatches = async (req, res) => {
  try {

    const batches = await Batch.find()
      .populate("teachers", "name email")
      .populate("createdBy", "name");

    return res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });

  }
};

// ==========================================
// Get Batch By ID
// ==========================================
const getBatchById = async (req, res) => {
  try {

    const batch = await Batch.findById(req.params.id)
      .populate("teachers", "name email")
      .populate("createdBy", "name");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    return res.status(200).json({
      success: true,
      batch,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });

  }
};

// ==========================================
// Update Batch
// ==========================================
const updateBatch = async (req, res) => {
  try {

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully.",
      batch: updatedBatch,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });

  }
};

// ==========================================
// Delete Batch
// ==========================================
const deleteBatch = async (req, res) => {
  try {

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // Capacity/Enrollment validation will be added later
    await batch.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });

  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};