const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
} = require("../controllers/notificationController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/mark-all-read", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);
router.post("/broadcast", protect, authorize("admin", "teacher"), broadcastNotification);

module.exports = router;
