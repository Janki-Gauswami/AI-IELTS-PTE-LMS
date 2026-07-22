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
    title: "Today's Classes",
    icon: FaBookOpen,
    path: "/teacher/today-classes",
  },
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