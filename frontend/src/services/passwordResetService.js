import api from "../api/axios";

/**
 * Fetch students and teachers for password reset
 */
export const getUsersForPasswordReset = async (role = "", query = "") => {
  try {
    const params = {};
    if (role) params.role = role;
    if (query) params.query = query;

    const response = await api.get("/admin/password-reset/users", { params });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to load users for password reset.",
      }
    );
  }
};

/**
 * Request verification OTP to be sent to user's registered email
 */
export const sendPasswordResetOTP = async (userId) => {
  try {
    const response = await api.post("/admin/password-reset/send-otp", { userId });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to send OTP to user's email.",
      }
    );
  }
};

/**
 * Verify OTP and reset the user's password
 */
export const verifyOTPAndResetPassword = async ({ userId, otp, newPassword }) => {
  try {
    const response = await api.post("/admin/password-reset/verify-and-reset", {
      userId,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to verify OTP and reset password.",
      }
    );
  }
};
