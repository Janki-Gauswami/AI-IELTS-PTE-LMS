const Notification = require("../models/Notification");
const User = require("../models/User");

// ==========================================
// GET MY NOTIFICATIONS
// GET /api/v1/notifications
// ==========================================
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications.",
    });
  }
};

// ==========================================
// GET UNREAD COUNT
// GET /api/v1/notifications/unread-count
// ==========================================
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get Unread Count Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch unread count.",
    });
  }
};

// ==========================================
// MARK AS READ
// PATCH /api/v1/notifications/:id/read
// ==========================================
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark notification as read.",
    });
  }
};

// ==========================================
// MARK ALL AS READ
// PATCH /api/v1/notifications/mark-all-read
// ==========================================
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark all as read.",
    });
  }
};

// ==========================================
// DELETE NOTIFICATION
// DELETE /api/v1/notifications/:id
// ==========================================
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification removed.",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete notification.",
    });
  }
};

// ==========================================
// BROADCAST ANNOUNCEMENT
// Admin & Teacher
// POST /api/v1/notifications/broadcast
// ==========================================
exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, roleTarget, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    let userQuery = {};
    if (roleTarget && roleTarget !== "all") {
      userQuery.role = roleTarget;
    }

    const recipients = await User.find(userQuery).select("_id");
    const notificationsToInsert = recipients.map((u) => ({
      recipient: u._id,
      title,
      message,
      type: "announcement",
      link: link || "",
      isRead: false,
    }));

    await Notification.insertMany(notificationsToInsert);

    return res.status(201).json({
      success: true,
      message: `Announcement sent to ${notificationsToInsert.length} users.`,
    });
  } catch (error) {
    console.error("Broadcast Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to broadcast notification.",
    });
  }
};
