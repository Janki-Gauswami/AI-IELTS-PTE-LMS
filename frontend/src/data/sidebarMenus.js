import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBookOpen,
  FaUsers,
  FaClipboardList,
  FaChartBar,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaFileAlt,
  FaGraduationCap,
  FaHistory,
  FaBook,
} from "react-icons/fa";

export const sidebarMenus = {
  // ======================================================
  // ADMIN SIDEBAR
  // ======================================================

  admin: [
    {
      title: "Dashboard",
      icon: FaHome,
      path: "/admin",
    },

    {
      title: "Students",
      icon: FaUserGraduate,
      path: "/admin/students",
    },

    {
      title: "Teachers",
      icon: FaChalkboardTeacher,
      path: "/admin/teachers",
    },

    {
      title: "Batches",
      icon: FaUsers,
      path: "/admin/batches",
    },

    {
      title: "Learning Materials",
      path: "/admin/learning-materials",
      icon: FaBook,
    },

    {
      title: "Attendance History",
      icon: FaHistory,
      path: "/admin/attendance-history",
    },

    {
      title: "Attendance Reports",
      icon: FaFileAlt,
      path: "/admin/attendance-reports",
    },

    // ====================================================
    // IELTS
    // ====================================================

    {
      title: "IELTS Questions",
      icon: FaClipboardList,
      path: "/admin/ielts/questions",
    },

    {
      title: "IELTS Practice Tests",
      icon: FaClipboardList,
      path: "/admin/ielts/tests",
    },

    // ====================================================
    // PTE
    // ====================================================

    {
      title: "PTE Questions",
      icon: FaClipboardList,
      path: "/admin/pte/questions",
    },

    {
      title: "PTE Practice Tests",
      icon: FaClipboardList,
      path: "/admin/pte/tests",
    },

    // ====================================================
    // OTHER
    // ====================================================

    {
      title: "Mock Tests",
      icon: FaClipboardList,
      path: "/admin/mock-tests",
    },

    {
      title: "Analytics",
      icon: FaChartBar,
      path: "/admin/analytics",
    },

    {
      title: "AI Reports",
      icon: FaRobot,
      path: "/admin/ai-reports",
    },

    {
      title: "Settings",
      icon: FaCog,
      path: "/admin/settings",
    },

    {
      title: "Logout",
      icon: FaSignOutAlt,
      path: "/logout",
    },
  ],

  // ======================================================
  // TEACHER SIDEBAR
  // ======================================================

  teacher: [
    {
      title: "Dashboard",
      icon: FaHome,
      path: "/teacher/dashboard",
    },

    {
      title: "My Batches",
      icon: FaUsers,
      path: "/teacher/my-batches",
    },

    {
      title: "My Students",
      icon: FaUserGraduate,
      path: "/teacher/my-students",
    },

    {
      title: "Attendance",
      icon: FaClipboardList,
      path: "/teacher/attendance",
    },

    {
      title: "Attendance History",
      icon: FaHistory,
      path: "/teacher/attendance-history",
    },

    {
      title: "Today's Classes",
      icon: FaBookOpen,
      path: "/teacher/today-classes",
    },

    {
      title: "Learning Materials",
      path: "/teacher/learning-materials",
      icon: FaBook,
    },

    // ====================================================
    // IELTS
    // ====================================================

    {
      title: "IELTS Questions",
      icon: FaClipboardList,
      path: "/teacher/ielts/questions",
    },

    {
      title: "IELTS Practice Tests",
      icon: FaClipboardList,
      path: "/teacher/ielts/tests",
    },

    // ====================================================
    // PTE
    // ====================================================

    {
      title: "PTE Questions",
      icon: FaClipboardList,
      path: "/teacher/pte/questions",
    },

    {
      title: "PTE Practice Tests",
      icon: FaClipboardList,
      path: "/teacher/pte/tests",
    },

    // ====================================================
    // OTHER
    // ====================================================

    {
      title: "Tests",
      icon: FaFileAlt,
      path: "/teacher/tests",
    },

    {
      title: "Profile",
      icon: FaUserCircle,
      path: "/teacher/profile",
    },

    {
      title: "Logout",
      icon: FaSignOutAlt,
      path: "/logout",
    },
  ],

  // ======================================================
  // STUDENT SIDEBAR
  // ======================================================

  student: [
    {
      title: "Dashboard",
      icon: FaHome,
      path: "/student",
    },

    {
      title: "Learning Materials",
      path: "/student/learning-materials",
      icon: FaBook,
    },

    // ====================================================
    // IELTS
    // ====================================================

    {
      title: "IELTS Practice Tests",
      icon: FaClipboardList,
      path: "/student/ielts/tests",
    },

    {
      title: "IELTS Previous Attempts",
      icon: FaHistory,
      path: "/student/ielts/tests/attempts",
    },

    {
      title: "IELTS",
      icon: FaGraduationCap,
      path: "/student/ielts",
    },

    // ====================================================
    // PTE
    // ====================================================

    {
      title: "PTE Practice Tests",
      icon: FaClipboardList,
      path: "/student/pte/tests",
    },

    {
      title: "PTE Previous Attempts",
      icon: FaHistory,
      path: "/student/pte/tests/attempts",
    },

    // ====================================================
    // OTHER
    // ====================================================

    {
      title: "Mock Tests",
      icon: FaClipboardList,
      path: "/student/mock-tests",
    },

    {
      title: "Results",
      icon: FaFileAlt,
      path: "/student/results",
    },

    {
      title: "AI Reports",
      icon: FaRobot,
      path: "/student/ai-reports",
    },

    {
      title: "My Profile",
      icon: FaUserCircle,
      path: "/student/profile",
    },

    {
      title: "Settings",
      icon: FaCog,
      path: "/student/settings",
    },

    {
      title: "Logout",
      icon: FaSignOutAlt,
      path: "/logout",
    },
  ],
};