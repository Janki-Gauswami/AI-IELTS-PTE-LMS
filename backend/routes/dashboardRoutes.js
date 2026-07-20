const express = require("express");

const router = express.Router();

const {
  getAdminDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================
// Admin Dashboard
// ======================================

router.get(
  "/stats",
  protect,
  authorize("admin"),
  getAdminDashboard
);

module.exports = router;