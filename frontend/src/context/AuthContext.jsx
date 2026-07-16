import { createContext, useContext, useEffect, useState } from "react";

import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
} from "../services/authService";

import {
  saveToken,
  removeToken,
  getToken,
} from "../utils/token";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ============================
  // Login
  // ============================

  const login = async (loginData) => {
    try {

      const data = await loginService(loginData);

      saveToken(data.token);

      setUser(data.user);

      return data;

    } catch (error) {

      throw error;

    }
  };

  // ============================
  // Logout
  // ============================

  const logout = async () => {

    try {

      await logoutService();

    } catch (error) {

      console.log(error);

    }

    removeToken();

    setUser(null);

  };

  // ============================
  // Load Logged-in User
  // ============================

  const loadUser = async () => {

    try {

      const token = getToken();

      if (!token) {

        setLoading(false);

        return;

      }

      const data = await getCurrentUser();

      setUser(data.user);

    } catch (error) {

      removeToken();

      setUser(null);

    } finally {

      setLoading(false);

    }

  };

  // ============================
  // Auto Login
  // ============================

  useEffect(() => {

    loadUser();

  }, []);

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loadUser,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};

// ============================
// Custom Hook
// ============================

export const useAuth = () => {

  return useContext(AuthContext);

};