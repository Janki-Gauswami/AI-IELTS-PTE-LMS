import {
  FaBell,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

const TopNavbar = () => {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const roleName = {
    admin: "Super Administrator",
    teacher: "Teacher",
    student: "Student",
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">

      {/* Left */}

      <div>

        <h2 className="text-2xl font-bold text-slate-900">
          Welcome Back 👋
        </h2>

        <p className="text-sm text-slate-500">
          {today}
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-6">

        <div className="relative hidden md:block">

          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="
            w-72
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            py-3
            pl-11
            pr-4
            outline-none
            focus:border-blue-600
            "
          />

        </div>

        <button className="relative rounded-xl bg-slate-100 p-3 hover:bg-blue-600 hover:text-white">

          <FaBell />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:shadow-md">

          <img
            src={
              user?.profilePicture ||
              `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=2563eb&color=fff`
            }
            alt={user?.name}
            className="h-11 w-11 rounded-full"
          />

          <div className="hidden text-left lg:block">

            <h4 className="font-semibold">

              {user?.name}

            </h4>

            <p className="text-sm text-slate-500">

              {roleName[user?.role]}

            </p>

          </div>

          <FaChevronDown />

        </button>

      </div>

    </header>
  );
};

export default TopNavbar;