const Enrollment = require("../models/Enrollment");
const Batch = require("../models/Batch");

// ==========================================
// Assign Student to Batch
// ==========================================
const assignStudent = async (req, res) => {
  try {
    const { student, batch } = req.body;

    // Required Fields
    if (!student || !batch) {
      return res.status(400).json({
        success: false,
        message: "Student and Batch are required.",
      });
    }

    // Check Batch Exists
    const existingBatch = await Batch.findById(batch);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // Check Capacity
    if (existingBatch.currentStrength >= existingBatch.capacity) {
      return res.status(400).json({
        success: false,
        message: "Batch is full.",
      });
    }

    // Prevent Duplicate Enrollment
    const alreadyEnrolled = await Enrollment.findOne({
      student,
      batch,
      status: "Active",
    });

    if (alreadyEnrolled) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in this batch.",
      });
    }

    // Create Enrollment
    const enrollment = await Enrollment.create({
      student,
      batch,
    });

    // Increase Batch Strength
    existingBatch.currentStrength += 1;
    await existingBatch.save();

    return res.status(201).json({
      success: true,
      message: "Student assigned successfully.",
      enrollment,
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
// Remove Student
// ==========================================
const removeStudent = async (req, res) => {
  try {

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    const batch = await Batch.findById(enrollment.batch);

    if (batch && batch.currentStrength > 0) {
      batch.currentStrength -= 1;
      await batch.save();
    }

    await enrollment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Student removed successfully.",
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
// Transfer Student
// ==========================================
const transferStudent = async (req, res) => {
  try {
    const { student, fromBatch, toBatch } = req.body;

    // Required Fields
    if (!student || !fromBatch || !toBatch) {
      return res.status(400).json({
        success: false,
        message: "Student, source batch and destination batch are required.",
      });
    }

    // Prevent Same Batch Transfer
    if (fromBatch === toBatch) {
      return res.status(400).json({
        success: false,
        message: "Student is already in this batch.",
      });
    }

    // Check Batches Exist
    const oldBatch = await Batch.findById(fromBatch);
    const newBatch = await Batch.findById(toBatch);

    if (!oldBatch || !newBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // Check Destination Capacity
    if (newBatch.currentStrength >= newBatch.capacity) {
      return res.status(400).json({
        success: false,
        message: "Destination batch is full.",
      });
    }

    // Check Existing Enrollment
    const enrollment = await Enrollment.findOne({
      student,
      batch: fromBatch,
      status: "Active",
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the source batch.",
      });
    }

    // Prevent Duplicate Enrollment
    const duplicate = await Enrollment.findOne({
      student,
      batch: toBatch,
      status: "Active",
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in the destination batch.",
      });
    }

    // Transfer Student
    enrollment.batch = toBatch;
    await enrollment.save();

    // Update Batch Strength
    oldBatch.currentStrength -= 1;
    newBatch.currentStrength += 1;

    await oldBatch.save();
    await newBatch.save();

    return res.status(200).json({
      success: true,
      message: "Student transferred successfully.",
      enrollment,
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
// Get Students By Batch
// ==========================================
const getStudentsByBatch = async (req, res) => {
  try {

    const students = await Enrollment.find({
      batch: req.params.id,
      status: "Active",
    })
      .populate("student", "name email")
      .populate("batch", "batchName");

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
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
  assignStudent,
  removeStudent,
  transferStudent,
  getStudentsByBatch,
};