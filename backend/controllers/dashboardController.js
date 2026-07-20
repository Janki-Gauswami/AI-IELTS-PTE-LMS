const Batch = require("../models/Batch");
const StudentProfile = require("../models/StudentProfile");

// ======================================
// Admin Dashboard Statistics
// ======================================

const getAdminDashboard = async (req, res) => {
  try {
    // ======================================
    // Batch Statistics
    // ======================================

    const batches = await Batch.find();

    const totalBatches = batches.length;

    const activeBatches = batches.filter(
      (batch) => batch.status === "Active"
    ).length;

    const fullBatches = batches.filter(
      (batch) =>
        batch.currentStrength >= batch.capacity
    ).length;

    const totalCapacity = batches.reduce(
      (sum, batch) => sum + batch.capacity,
      0
    );

    const occupiedSeats = batches.reduce(
      (sum, batch) => sum + batch.currentStrength,
      0
    );

    const availableSeats =
      totalCapacity - occupiedSeats;

    // ======================================
    // Student Statistics
    // ======================================

    const totalStudents =
      await StudentProfile.countDocuments();

    const activeStudents =
      await StudentProfile.countDocuments({
        status: "Active",
      });

    const inactiveStudents =
      await StudentProfile.countDocuments({
        status: "Inactive",
      });

    const ieltsStudents =
      await StudentProfile.countDocuments({
        targetExam: "IELTS",
      });

    const pteStudents =
      await StudentProfile.countDocuments({
        targetExam: "PTE",
      });

    // ======================================
    // Response
    // ======================================

    res.status(200).json({
      success: true,

      statistics: {
        // Batch Statistics
        totalBatches,
        activeBatches,
        fullBatches,
        totalCapacity,
        occupiedSeats,
        availableSeats,

        // Student Statistics
        totalStudents,
        activeStudents,
        inactiveStudents,
        ieltsStudents,
        pteStudents,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  getAdminDashboard,
};