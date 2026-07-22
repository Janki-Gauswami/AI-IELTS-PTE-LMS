import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";

import PrivateRoute from "./routes/PrivateRoute";

// Dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";

// Teacher Dashboard
import Dashboard from "./pages/Teacher/Dashboard";
import MyBatches from "./pages/Teacher/MyBatches";
import TodayClasses from "./pages/Teacher/TodayClasses";
import Profile from "./pages/Teacher/Profile";
import TeacherDashboardLayout from "./components/teacher/TeacherDashboardLayout";
import EditProfile from "./pages/Teacher/EditProfile";
import MyStudents from "./pages/Teacher/MyStudents";
import Attendance from "./pages/Teacher/Attendance";
import Tests from "./pages/Teacher/Tests";

// Batch Management
import BatchList from "./pages/BatchManagement/BatchList";
import AddBatch from "./pages/BatchManagement/AddBatch";
import EditBatch from "./pages/BatchManagement/EditBatch";
import BatchDetails from "./pages/BatchManagement/BatchDetails";

// Student Management
import StudentList from "./pages/Admin/StudentManagement/StudentList";
import AddStudent from "./pages/Admin/StudentManagement/AddStudent";
import EditStudent from "./pages/Admin/StudentManagement/EditStudent";
import StudentDetails from "./pages/Admin/StudentManagement/StudentDetails";

// Teacher Management
import TeacherList from "./pages/Admin/TeacherManagement/TeacherList";
import AddTeacher from "./pages/Admin/TeacherManagement/AddTeacher";
import EditTeacher from "./pages/Admin/TeacherManagement/EditTeacher";
import TeacherDetails from "./pages/Admin/TeacherManagement/TeacherDetails";
import AssignBatch from "./pages/Admin/TeacherManagement/AssignBatch";


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
      {/* Student Management */}
      {/* ========================= */}
    

<Route
  path="/admin/students"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <StudentList />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/students/add"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <AddStudent />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/students/edit/:id"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <EditStudent />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/students/:id"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <StudentDetails />
    </PrivateRoute>
  }
/>

{/* ============================
    Teacher Management Routes
============================= */}
<Route
  path="/admin/teachers"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <TeacherList />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/teachers/add"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <AddTeacher />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/teachers/edit/:id"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <EditTeacher />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/teachers/:id"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <TeacherDetails />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/teachers/assign-batch"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <AssignBatch />
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
        <TeacherDashboardLayout />
      </PrivateRoute>
    }
  >
    <Route
      index
      element={<Dashboard />}
    />

    <Route
      path="dashboard"
      element={<Dashboard />}
    />

    <Route
      path="my-batches"
      element={<MyBatches />}
    />

    <Route
      path="today-classes"
      element={<TodayClasses />}
    />

    <Route
      path="profile"
      element={<Profile />}
    />

      <Route
  path="edit-profile"
  element={<EditProfile />}
/>

<Route
  path="my-students"
  element={<MyStudents />}
/>

<Route
  path="attendance"
  element={<Attendance />}
/>

<Route
  path="tests"
  element={<Tests />}
/>

  </Route>


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