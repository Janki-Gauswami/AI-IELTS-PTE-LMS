import api from "../api/axios";

export const getMyNotifications = async () => {
  try {
    const res = await api.get("/notifications");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch notifications." };
  }
};

export const getUnreadCount = async () => {
  try {
    const res = await api.get("/notifications/unread-count");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch unread count." };
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to mark as read." };
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await api.patch("/notifications/mark-all-read");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to mark all as read." };
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to delete notification." };
  }
};

export const broadcastNotification = async (data) => {
  try {
    const res = await api.post("/notifications/broadcast", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to broadcast notification." };
  }
};
