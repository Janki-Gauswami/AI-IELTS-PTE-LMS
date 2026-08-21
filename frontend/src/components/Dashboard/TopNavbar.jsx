import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaChevronDown, FaSearch, FaCheck, FaTrash, FaCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";

const TopNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

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

  const fetchNotifs = async () => {
    try {
      const res = await getMyNotifications();
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Notifications fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 45000); // 45s polling
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setShowDropdown(false);
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      {/* Left */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome Back {user?.name ? `, ${user.name}` : ""} 👋
        </h2>
        <p className="text-sm text-slate-500">{today}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search LMS..."
            className="w-72 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-600 text-sm"
          />
        </div>

        {/* Notifications Bell & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative rounded-xl p-3 transition ${
              showDropdown
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleItemClick(notif)}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                        !notif.isRead ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="mt-1">
                        {!notif.isRead ? (
                          <span className="w-2 h-2 rounded-full bg-blue-600 block" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 block" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-xs font-bold text-slate-800">{notif.title}</h5>
                        <p className="text-xs text-slate-600 mt-0.5 leading-tight">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <button
          onClick={() => {
            if (user?.role === "student") navigate("/student/profile");
            else if (user?.role === "teacher") navigate("/teacher/profile");
          }}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:shadow-md transition"
        >
          <img
            src={
              user?.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
              )}&background=2563eb&color=fff`
            }
            alt={user?.name}
            className="h-11 w-11 rounded-full"
          />

          <div className="hidden text-left lg:block">
            <h4 className="font-semibold text-sm">{user?.name}</h4>
            <p className="text-xs text-slate-500">{roleName[user?.role] || "User"}</p>
          </div>

          <FaChevronDown className="text-xs text-slate-400" />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;