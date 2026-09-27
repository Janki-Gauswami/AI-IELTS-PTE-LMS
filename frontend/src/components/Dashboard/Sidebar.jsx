import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { sidebarMenus } from "../../data/sidebarMenus";
import { useAuth } from "../../context/AuthContext";
import { getTeacherProfile } from "../../services/teacherDashboardService";

import {
  FaBars,
  FaSignOutAlt,
  FaClipboardList,
} from "react-icons/fa";

// Items that belong exclusively to IELTS track (student sidebar)
const IELTS_ONLY_PATHS = [
  "/student/ielts",
  "/student/ielts/tests",
  "/student/ielts/tests/attempts",
];

// Items that belong exclusively to PTE track (student sidebar)
const PTE_ONLY_PATHS = [
  "/student/pte/tests",
  "/student/pte/tests/attempts",
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const [teacherSpecialization, setTeacherSpecialization] = useState(
    user?.specialization || null
  );

  const role = user?.role || "admin";
  const targetExam = user?.targetExam || null; // "IELTS", "PTE", or null (admin/teacher always null)

  useEffect(() => {
    if (role === "teacher") {
      if (user?.specialization) {
        setTeacherSpecialization(user.specialization);
      } else {
        getTeacherProfile()
          .then((res) => {
            if (res?.data?.specialization) {
              setTeacherSpecialization(res.data.specialization);
            }
          })
          .catch(() => {});
      }
    }
  }, [role, user?.specialization]);

  const rawMenuItems = sidebarMenus[role] || [];

  // Build menu items with student filtering and teacher specialization additions
  let menuItems = rawMenuItems.filter((item) => {
    if (role !== "student" || !targetExam) return true;

    const isIeltsOnly = IELTS_ONLY_PATHS.includes(item.path);
    const isPteOnly = PTE_ONLY_PATHS.includes(item.path);

    if (isIeltsOnly && targetExam !== "IELTS") return false;
    if (isPteOnly && targetExam !== "PTE") return false;

    return true;
  });

  // Inject practice tests for teachers based on specialization
  if (role === "teacher" && teacherSpecialization) {
    const extraTeacherItems = [];

    const canIelts =
      teacherSpecialization === "IELTS" || teacherSpecialization === "Both";
    const canPte =
      teacherSpecialization === "PTE" || teacherSpecialization === "Both";

    if (canIelts) {
      extraTeacherItems.push({
        title: "IELTS Practice Tests",
        icon: FaClipboardList,
        path: "/admin/ielts/tests",
      });
      extraTeacherItems.push({
        title: "IELTS Questions",
        icon: FaClipboardList,
        path: "/admin/ielts/questions",
      });
    }

    if (canPte) {
      extraTeacherItems.push({
        title: "PTE Practice Tests",
        icon: FaClipboardList,
        path: "/admin/pte/tests",
      });
      extraTeacherItems.push({
        title: "PTE Questions",
        icon: FaClipboardList,
        path: "/admin/pte/questions",
      });
    }

    // Insert extra items right after the "Tests" item
    const testsIndex = menuItems.findIndex(
      (item) => item.path === "/teacher/tests"
    );

    if (testsIndex !== -1) {
      menuItems = [
        ...menuItems.slice(0, testsIndex + 1),
        ...extraTeacherItems,
        ...menuItems.slice(testsIndex + 1),
      ];
    } else {
      menuItems = [...menuItems, ...extraTeacherItems];
    }
  }

  const panelTitle = {
    admin: "Admin Panel",
    teacher: "Teacher Portal",
    student: "Student Portal",
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={`
        bg-slate-900
        text-white
        h-screen
        sticky
        top-0
        flex
        flex-col
        transition-all
        duration-300
        ${collapsed ? "w-24" : "w-72"}
      `}
    >
      {/* Logo */}

      <div className="flex h-20 items-center justify-between border-b border-slate-700 px-6 shrink-0">

        {!collapsed && (
          <div>
            <h1 className="text-2xl font-black">
              FlyHigh
            </h1>

            <p className="text-xs text-slate-400">
              {panelTitle[role]}
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xl hover:text-sky-400 transition"
        >
          <FaBars />
        </button>

      </div>

      {/* Navigation */}

      <nav className="mt-6 px-3 flex-1 overflow-y-auto pb-24">

        {menuItems
          .filter(item => item.title !== "Logout")
          .map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `
                  mb-2
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  px-4
                  py-4
                  transition-all
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }
                `
                }
              >
                <Icon className="text-xl" />

                {!collapsed && (
                  <span>{item.title}</span>
                )}

              </NavLink>
            );

          })}

      </nav>

      {/* Logout */}

      <div className="p-3 border-t border-slate-800 bg-slate-900 shrink-0">

        <button
          onClick={handleLogout}
          className="
          flex
          w-full
          items-center
          gap-4
          rounded-xl
          px-4
          py-4
          text-red-400
          hover:bg-red-500
          hover:text-white
          transition
          "
        >
          <FaSignOutAlt />

          {!collapsed && "Logout"}

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;