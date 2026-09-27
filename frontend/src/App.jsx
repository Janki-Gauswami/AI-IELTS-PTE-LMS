import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";

import PrivateRoute from "./routes/PrivateRoute";

// ======================================================
// Dashboards
// ======================================================

import AdminDashboard from "./pages/Admin/AdminDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";

// ======================================================
// Teacher
// ======================================================

import AttendanceHistory from "./pages/Teacher/AttendanceHistory";

// ======================================================
// Admin
// ======================================================

import AdminAttendanceHistory from "./pages/Admin/AdminAttendanceHistory";
import AttendanceReports from "./pages/Admin/AttendanceReports";

import LearningMaterials from "./pages/Admin/LearningMaterials/LearningMaterials";
import AddMaterial from "./pages/Admin/LearningMaterials/AddMaterial";
import EditMaterial from "./pages/Admin/LearningMaterials/EditMaterial";

// ======================================================
// IELTS Questions
// ======================================================

import IELTSQuestions from "./pages/admin/IELTS/questions/IELTSQuestions";
import AddIELTSQuestion from "./pages/admin/IELTS/questions/AddIELTSQuestion";
import ViewIELTSQuestion from "./pages/admin/IELTS/questions/ViewIELTSQuestion";
import EditIELTSQuestion from "./pages/admin/IELTS/questions/EditIELTSQuestion";

// ======================================================
// IELTS Practice Tests - Admin / Teacher
// ======================================================

import IELTSPracticeTests from "./pages/Admin/IELTS/PracticeTests/IELTSPracticeTests";
import AddPracticeTest from "./pages/Admin/IELTS/PracticeTests/AddPracticeTest";
import EditPracticeTest from "./pages/Admin/IELTS/PracticeTests/EditPracticeTest";
import SelectQuestions from "./pages/Admin/IELTS/PracticeTests/SelectQuestions";

// ======================================================
// Teacher Dashboard
// ======================================================

import Dashboard from "./pages/Teacher/Dashboard";
import MyBatches from "./pages/Teacher/MyBatches";
import TodayClasses from "./pages/Teacher/TodayClasses";
import Profile from "./pages/Teacher/Profile";
import TeacherDashboardLayout from "./components/teacher/TeacherDashboardLayout";
import EditProfile from "./pages/Teacher/EditProfile";
import MyStudents from "./pages/Teacher/MyStudents";
import Attendance from "./pages/Teacher/Attendance";
import Tests from "./pages/Teacher/Tests";
import TeacherLearningMaterials from "./pages/Teacher/LearningMaterials";
import TeacherAddLearningMaterial from "./pages/Teacher/AddLearningMaterial";

// ======================================================
// Batch Management
// ======================================================

import BatchList from "./pages/BatchManagement/BatchList";
import AddBatch from "./pages/BatchManagement/AddBatch";
import EditBatch from "./pages/BatchManagement/EditBatch";
import BatchDetails from "./pages/BatchManagement/BatchDetails";

// ======================================================
// Student Management
// ======================================================

import StudentList from "./pages/Admin/StudentManagement/StudentList";
import AddStudent from "./pages/Admin/StudentManagement/AddStudent";
import EditStudent from "./pages/Admin/StudentManagement/EditStudent";
import StudentDetails from "./pages/Admin/StudentManagement/StudentDetails";

import StudentLearningMaterials from "./pages/Student/LearningMaterials";

// ======================================================
// IELTS - Student
// ======================================================

import IELTSDashboard from "./pages/Student/IELTS/IELTSDashboard";

import Listening from "./pages/Student/IELTS/Listening";
import Reading from "./pages/Student/IELTS/Reading";
import Writing from "./pages/Student/IELTS/Writing";
import Speaking from "./pages/Student/IELTS/Speaking";

import QuestionPractice from "./pages/Student/IELTS/QuestionPractice";

import ListeningTest from "./pages/Student/IELTS/ListeningTest";
import ReadingTest from "./pages/Student/IELTS/ReadingTest";
import WritingTest from "./pages/Student/IELTS/WritingTest";
import SpeakingTest from "./pages/Student/IELTS/SpeakingTest";

// ======================================================
// IELTS Practice Tests - Student
// ======================================================

import StudentIELTSPracticeTests from "./pages/Student/IELTS/PracticeTests/IELTSPracticeTests";
import TestInstructions from "./pages/Student/IELTS/PracticeTests/TestInstructions";
import TestInterface from "./pages/Student/IELTS/PracticeTests/TestInterface";
import IELTSPracticeTestResult from "./pages/Student/IELTS/PracticeTests/IELTSPracticeTestResult";

import IELTSPreviousAttempts from "./pages/Student/IELTS/IELTSPreviousAttempts";

import IELTSPracticeTestAnalysis from "./pages/Student/IELTS/PracticeTests/IELTSPracticeTestAnalysis";

// ======================================================
// IELTS Progress
// ======================================================

import IELTSStudentProgress from "./pages/Student/IELTS/Progress/IELTSStudentProgress";
import IELTSPerformanceBreakdown from "./pages/Student/IELTS/Progress/IELTSPerformanceBreakdown";
import IELTSTestHistory from "./pages/Student/IELTS/Progress/IELTSTestHistory";
import IELTSAchievements from "./pages/Student/IELTS/Achievements/IELTSAchievements";

import IELTSStudentGoals from "./pages/Student/IELTS/Goals/IELTSStudentGoals";
import IELTSStudentLearningPlan from "./pages/Student/IELTS/LearningPlan/IELTSStudentLearningPlan";

import IELTSProgressCharts from "./pages/Student/IELTS/Progress/IELTSProgressCharts";
import IELTSWeakAreas from "./pages/Student/IELTS/Progress/IELTSWeakAreas";
import IELTSImprovementTracking from "./pages/Student/IELTS/Progress/IELTSImprovementTracking";
import IELTSPerformanceComparison from "./pages/Student/IELTS/Progress/IELTSPerformanceComparison";
import IELTSGoalTracking from "./pages/Student/IELTS/Progress/IELTSGoalTracking";
import IELTSProgressSummary from "./pages/Student/IELTS/Progress/IELTSProgressSummary";
import IELTSProgressHistory from "./pages/Student/IELTS/Progress/IELTSProgressHistory";

// ======================================================
// PTE - Student
// ======================================================

import PTEPracticeTest from "./pages/Student/pte/PTEPracticeTests";
import PTEStartTest from "./pages/Student/pte/PTEStartTest";
import PTETestInterface from "./pages/Student/pte/PTETestInterface";
import PTETestResult from "./pages/Student/pte/PTETestResult";
import PTEPreviousAttempts from "./pages/Student/pte/PTEPreviousAttempts";

// ======================================================
// Mock Tests, Analytics, AI & Settings
// ======================================================

import AdminMockTests from "./pages/Admin/MockTests";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import AdminAIReports from "./pages/Admin/AdminAIReports";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminPasswordReset from "./pages/Admin/AdminPasswordReset";

import StudentMockTests from "./pages/Student/MockTests";
import StudentMockTestAttempt from "./pages/Student/MockTestAttempt";
import MockTestResult from "./pages/Student/MockTestResult";
import StudentResults from "./pages/Student/StudentResults";
import StudentAIReports from "./pages/Student/StudentAIReports";
import StudentProfile from "./pages/Student/StudentProfile";
import StudentSettings from "./pages/Student/StudentSettings";
import StudentPublicSpeaking from "./pages/Student/StudentPublicSpeaking";


// ======================================================
// PTE Questions - Admin / Teacher
// ======================================================

import PTEQuestions from "./pages/Admin/pte/PTEQuestions";
import AddPTEQuestion from "./pages/Admin/pte/AddPTEQuestion";
import EditPTEQuestion from "./pages/Admin/pte/EditPTEQuestion";

// ======================================================
// PTE Lessons - Admin / Teacher
// ======================================================

import PTELessons from "./pages/Admin/pte/PTELessons";
import AddPTELesson from "./pages/Admin/pte/AddPTELesson";
import EditPTELesson from "./pages/Admin/pte/EditPTELesson";

// ======================================================
// PTE Lesson - Student
// ======================================================

import PTELessonStudy from "./pages/student/pte/PTELessonStudy";

// ======================================================
// PTE Practice Tests - Admin / Teacher
// ======================================================

import PTEPracticeTests from "./pages/Admin/pte/PTEPracticeTests";
import CreatePTEPracticeTest from "./pages/Admin/pte/CreatePTEPracticeTest";
import EditPTEPracticeTest from "./pages/Admin/pte/EditPTEPracticeTest";
import PTEPracticeTestDetails from "./pages/Admin/pte/PTEPracticeTestDetails";

// ======================================================
// Teacher Management
// ======================================================

import TeacherList from "./pages/Admin/TeacherManagement/TeacherList";
import AddTeacher from "./pages/Admin/TeacherManagement/AddTeacher";
import EditTeacher from "./pages/Admin/TeacherManagement/EditTeacher";
import TeacherDetails from "./pages/Admin/TeacherManagement/TeacherDetails";
import AssignBatch from "./pages/Admin/TeacherManagement/AssignBatch";

// ======================================================
// Extra Pages
// ======================================================

import Unauthorized from "./pages/Common/Unauthorized";
import NotFound from "./pages/Common/NotFound";

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC ROUTES
      ================================================== */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* ==================================================
          ADMIN DASHBOARD
      ================================================== */}

      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/attendance-reports"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AttendanceReports />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/attendance-history"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminAttendanceHistory />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          ADMIN LEARNING MATERIALS
      ================================================== */}

      <Route
        path="/admin/learning-materials"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <LearningMaterials />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/learning-materials/add"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AddMaterial />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/learning-materials/edit/:id"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <EditMaterial />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS QUESTION MANAGEMENT
      ================================================== */}

      <Route
        path="/admin/ielts/questions"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <IELTSQuestions />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/ielts/questions/add"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <AddIELTSQuestion />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/ielts/questions/:id"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <ViewIELTSQuestion />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/ielts/questions/:id/edit"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <EditIELTSQuestion />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS PRACTICE TEST MANAGEMENT
      ================================================== */}

      <Route
        path="/admin/ielts/tests"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <IELTSPracticeTests />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/ielts/tests/add"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <AddPracticeTest />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/ielts/tests/edit/:id"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <EditPracticeTest />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/ielts/tests/:id/questions"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="IELTS">
            <SelectQuestions />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          PTE PRACTICE TEST MANAGEMENT
      ================================================== */}

      <Route
        path="/admin/pte/tests"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="PTE">
            <PTEPracticeTests />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/pte/tests/create"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="PTE">
            <CreatePTEPracticeTest />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/pte/tests/:id/edit"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="PTE">
            <EditPTEPracticeTest />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/pte/tests/:id"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]} requiredExam="PTE">
            <PTEPracticeTestDetails />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          PTE STUDENT PRACTICE TESTS & TEST ENGINE
      ================================================== */}

      <Route
        path="/student/pte/tests"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <PTEPracticeTest />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/pte/tests/:id"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <PTEStartTest />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/pte/tests/:id/start"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <PTEStartTest />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/pte/tests/:id/attempt/:attemptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <PTETestInterface />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/pte/tests/:id/results/:attemptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <PTETestResult />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/pte/tests/attempts"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <PTEPreviousAttempts />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          ADMIN MOCK TESTS, ANALYTICS, AI REPORTS & SETTINGS
      ================================================== */}

      <Route
        path="/admin/mock-tests"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminMockTests />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminAnalytics />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/ai-reports"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminAIReports />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminSettings />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/password-reset"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminPasswordReset />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          STUDENT MOCK TESTS, RESULTS, AI REPORTS, PROFILE & SETTINGS
      ================================================== */}

      <Route
        path="/student/mock-tests"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentMockTests />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/mock-tests/:testId/attempt/:attemptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentMockTestAttempt />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/mock-tests/result/:attemptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <MockTestResult />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/mock-tests/:testId/result/:attemptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <MockTestResult />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/results"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentResults />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ai-reports"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentAIReports />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          STUDENT PUBLIC SPEAKING & EXTEMPORE STUDIO
      ================================================== */}
      <Route
        path="/student/public-speaking"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentPublicSpeaking />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/speech-practice"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentPublicSpeaking />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentProfile />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/settings"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentSettings />
          </PrivateRoute>
        }
      />


      {/* ==================================================
          PTE QUESTION MANAGEMENT
      ================================================== */}

      <Route
        path="/admin/pte/questions"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]}>
            <PTEQuestions />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/pte/questions/add"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]}>
            <AddPTEQuestion />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/pte/questions/:id/edit"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]}>
            <EditPTEQuestion />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          PTE LESSON MANAGEMENT
      ================================================== */}

      <Route
        path="/admin/pte/lessons"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]}>
            <PTELessons />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/pte/lessons/add"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]}>
            <AddPTELesson />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/pte/lessons/:id/edit"
        element={
          <PrivateRoute allowedRoles={["admin", "teacher"]}>
            <EditPTELesson />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          PTE STUDENT LESSON
      ================================================== */}

      <Route
        path="/student/pte/lessons/:id"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <PTELessonStudy />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          BATCH MANAGEMENT
      ================================================== */}

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

      {/* ==================================================
          STUDENT MANAGEMENT
      ================================================== */}

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

      {/* ==================================================
          TEACHER MANAGEMENT
      ================================================== */}

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

      {/* ==================================================
          TEACHER DASHBOARD
      ================================================== */}

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
          path="attendance-history"
          element={<AttendanceHistory />}
        />

        <Route
          path="tests"
          element={<Tests />}
        />

        <Route
          path="learning-materials"
          element={<TeacherLearningMaterials />}
        />

        <Route
          path="learning-materials/add"
          element={<TeacherAddLearningMaterial />}
        />
      </Route>

      {/* ==================================================
          STUDENT DASHBOARD
      ================================================== */}

      <Route
        path="/student"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/learning-materials"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentLearningMaterials />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS STUDENT DASHBOARD
      ================================================== */}

      <Route
        path="/student/ielts"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSDashboard />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS LISTENING
      ================================================== */}

      <Route
        path="/student/ielts/listening"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Listening />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/listening/test/:id"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <ListeningTest />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS READING
      ================================================== */}

      <Route
        path="/student/ielts/reading"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Reading />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/reading/test/:id"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <ReadingTest />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS WRITING
      ================================================== */}

      <Route
        path="/student/ielts/writing"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Writing />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/writing/test/:id"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <WritingTest />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS SPEAKING
      ================================================== */}

      <Route
        path="/student/ielts/speaking"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Speaking />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/speaking/test/:id"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <SpeakingTest />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS QUESTIONS
      ================================================== */}

      <Route
        path="/student/ielts/questions"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <QuestionPractice />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS PRACTICE TESTS - STUDENT
      ================================================== */}

      <Route
        path="/student/ielts/tests"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentIELTSPracticeTests />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/tests/:id"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <TestInstructions />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/tests/:id/start"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <TestInterface />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/tests/:id/results/:attemptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSPracticeTestResult />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/tests/attempts"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSPreviousAttempts />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/tests/:id/analysis/:attemptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSPracticeTestAnalysis />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          IELTS PROGRESS
      ================================================== */}

      <Route
        path="/student/ielts/progress"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSStudentProgress />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/performance"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSPerformanceBreakdown />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/history"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSTestHistory />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/achievements"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSAchievements />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/goals"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSStudentGoals />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/learning-plan"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSStudentLearningPlan />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/charts"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSProgressCharts />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/weak-areas"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSWeakAreas />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/improvement"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSImprovementTracking />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/comparison"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSPerformanceComparison />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/goal-tracking"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSGoalTracking />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/summary"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSProgressSummary />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/ielts/progress/progress-history"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <IELTSProgressHistory />
          </PrivateRoute>
        }
      />

      {/* ==================================================
          UNAUTHORIZED
      ================================================== */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* ==================================================
          404
      ================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default App;