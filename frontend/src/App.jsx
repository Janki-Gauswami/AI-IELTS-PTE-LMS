import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";

import PrivateRoute from "./routes/PrivateRoute";

// Dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";

// Extra Pages
import Unauthorized from "./pages/Common/Unauthorized";
import NotFound from "./pages/Common/NotFound";

function App() {
  return (
    <Routes>

      {/* ========================= */}
      {/* Public Routes */}
      {/* ========================= */}

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />

      {/* ========================= */}
      {/* Admin Routes */}
      {/* ========================= */}

      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* Teacher Routes */}
      {/* ========================= */}

      <Route
        path="/teacher"
        element={
          <PrivateRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* Student Routes */}
      {/* ========================= */}

      <Route
        path="/student"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* Unauthorized */}
      {/* ========================= */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* ========================= */}
      {/* 404 */}
      {/* ========================= */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default App;