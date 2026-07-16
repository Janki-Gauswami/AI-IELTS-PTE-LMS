const Batch = require("../models/Batch");

// ======================================
// Admin Dashboard Statistics
// ======================================

const getAdminDashboard = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,

      statistics: {
        totalBatches,
        activeBatches,
        fullBatches,
        totalCapacity,
        occupiedSeats,
        availableSeats,
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