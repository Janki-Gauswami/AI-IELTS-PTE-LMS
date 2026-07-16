import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";

import PrivateRoute from "./routes/PrivateRoute";

// Dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";

// Batch Management
import BatchList from "./pages/BatchManagement/BatchList";
import AddBatch from "./pages/BatchManagement/AddBatch";
import EditBatch from "./pages/BatchManagement/EditBatch";
import BatchDetails from "./pages/BatchManagement/BatchDetails";

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
      {/* Admin Dashboard */}
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
      {/* Batch Management */}
      {/* ========================= */}

      <Route
        path="/admin/batches"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <BatchList />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/batches/add"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AddBatch />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/batches/edit/:id"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <EditBatch />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/batches/:id"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <BatchDetails />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* Teacher Dashboard */}
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
      {/* Student Dashboard */}
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