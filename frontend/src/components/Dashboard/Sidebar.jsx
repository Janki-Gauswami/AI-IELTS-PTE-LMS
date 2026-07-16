import { NavLink } from "react-router-dom";
import { sidebarMenus } from "../../data/sidebarMenus";
import { useAuth } from "../../context/AuthContext";

import {
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const role = user?.role || "admin";

  const menuItems = sidebarMenus[role] || [];

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
        transition-all
        duration-300
        ${collapsed ? "w-24" : "w-72"}
      `}
    >
      {/* Logo */}

      <div className="flex h-20 items-center justify-between border-b border-slate-700 px-6">

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

      <nav className="mt-6 px-3">

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

      <div className="absolute bottom-6 w-full px-3">

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