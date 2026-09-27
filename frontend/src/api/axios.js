import axios from "axios";
import { getToken } from "../utils/token";

// ======================================================
// CENTRALIZED AXIOS INSTANCE
// ======================================================

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ======================================================
// REQUEST INTERCEPTOR
// Automatically attaches JWT
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    console.log(
      "[API] JWT attached:",
      Boolean(token)
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "[API] 401 Unauthorized",
        error.response?.data
      );

      console.error(
        "[API] Token exists:",
        Boolean(getToken())
      );
    }

    return Promise.reject(error);
  }
);

export default api;