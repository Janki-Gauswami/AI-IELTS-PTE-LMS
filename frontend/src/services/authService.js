import api from "../api/axios";

/**
 * Login User
 */
export const login = async (loginData) => {
  try {
   const response = await api.post("/auth/login", loginData);

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Something went wrong.",
      }
    );
  }
};

/**
 * Logout User
 */
export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Something went wrong.",
      }
    );
  }
};

/**
 * Get Current Logged-in User
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Something went wrong.",
      }
    );
  }
};

/**
 * Update Logged-in User Profile
 */
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put("/auth/me/profile", profileData);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update profile.",
      }
    );
  }
};