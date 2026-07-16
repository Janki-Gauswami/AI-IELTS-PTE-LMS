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
} from "react-icons/fa";

export const sidebarMenus = {
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
      title: "Courses",
      icon: FaBookOpen,
      path: "/admin/courses",
    },
    {
      title: "Batches",
      icon: FaUsers,
      path: "/admin/batches",
    },
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

  teacher: [
    {
      title: "Dashboard",
      icon: FaHome,
      path: "/teacher",
    },
    {
      title: "Students",
      icon: FaUserGraduate,
      path: "/teacher/students",
    },
    {
      title: "Batches",
      icon: FaUsers,
      path: "/teacher/batches",
    },
    {
      title: "Learning Materials",
      icon: FaBookOpen,
      path: "/teacher/materials",
    },
    {
      title: "Mock Tests",
      icon: FaClipboardList,
      path: "/teacher/mock-tests",
    },
    {
      title: "Student Progress",
      icon: FaChartBar,
      path: "/teacher/progress",
    },
    {
      title: "AI Reports",
      icon: FaRobot,
      path: "/teacher/ai-reports",
    },
    {
      title: "My Profile",
      icon: FaUserCircle,
      path: "/teacher/profile",
    },
    {
      title: "Settings",
      icon: FaCog,
      path: "/teacher/settings",
    },
    {
      title: "Logout",
      icon: FaSignOutAlt,
      path: "/logout",
    },
  ],

  student: [
    {
      title: "Dashboard",
      icon: FaHome,
      path: "/student",
    },
    {
      title: "My Courses",
      icon: FaGraduationCap,
      path: "/student/courses",
    },
    {
      title: "Practice",
      icon: FaBookOpen,
      path: "/student/practice",
    },
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