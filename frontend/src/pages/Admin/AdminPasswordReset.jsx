import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import {
  getUsersForPasswordReset,
  sendPasswordResetOTP,
  verifyOTPAndResetPassword,
} from "../../services/passwordResetService";
import {
  Search,
  KeyRound,
  Mail,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

const AdminPasswordReset = () => {
  // State for user searching
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // State for selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // State for OTP flow
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // State for reset form
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await getUsersForPasswordReset(roleFilter, searchQuery);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users for password reset:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle select user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
    setOtpNotice("");
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!selectedUser) return;
    try {
      setSendingOtp(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await sendPasswordResetOTP(selectedUser._id);
      setOtpSent(true);
      setOtpNotice(
        res.data?.deliveryNotice ||
          `Verification code sent to ${selectedUser.email}.`
      );
      setCooldown(60); // 60s cooldown
    } catch (err) {
      setErrorMessage(
        err.message || "Failed to send OTP to user's email. Please try again."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // Submit Password Reset
  const handleSubmitReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp.trim()) {
      setErrorMessage("Please enter the 6-digit OTP code.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    try {
      setResetting(true);
      const res = await verifyOTPAndResetPassword({
        userId: selectedUser._id,
        otp: otp.trim(),
        newPassword,
      });

      setSuccessMessage(
        res.message ||
          `Password successfully updated for ${selectedUser.name}! The user can now log in with the new password.`
      );
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(
        err.message || "Invalid or expired OTP. Please verify the code."
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Security & Access Control
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                User Password Reset Request
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Reset passwords for students or teachers upon their explicit request. A real one-time password (OTP) is dispatched to their registered email address for mandatory security verification before the password can be updated.
              </p>
            </div>
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
                <KeyRound className="w-8 h-8 text-blue-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: User Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Select Teacher or Student
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {users.length} {users.length === 1 ? "user" : "users"} found
                </span>
              </div>

              {/* Role Filters */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRoleFilter("")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    roleFilter === ""
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("student")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    roleFilter === "student"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("teacher")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    roleFilter === "teacher"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Teachers
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {loadingUsers ? (
                  <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    Loading accounts...
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No matching student or teacher accounts found.
                  </div>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedUser?._id === user._id;
                    const isTeacher = user.role === "teacher";

                    return (
                      <div
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 ${
                              isTeacher
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-800 truncate">
                                {user.name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                  isTeacher
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <ArrowRight
                          className={`w-4 h-4 shrink-0 transition ${
                            isSelected
                              ? "text-blue-600 translate-x-1"
                              : "text-slate-300"
                          }`}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Reset Workflow (7 cols) */}
          <div className="lg:col-span-7">
            {!selectedUser ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-base font-bold text-slate-800">
                    No Account Selected
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select a student or teacher from the list on the left to initiate an OTP password reset request.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                {/* Selected User Header Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center shrink-0 ${
                        selectedUser.role === "teacher"
                          ? "bg-purple-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">
                          {selectedUser.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            selectedUser.role === "teacher"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition"
                    >
                      Change User
                    </button>
                  </div>
                </div>

                {/* Notifications & Feedback */}
                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-emerald-800">
                        Password Reset Successful!
                      </p>
                      <p className="leading-relaxed">{successMessage}</p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 text-xs">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-red-800">
                        Operation Notice
                      </p>
                      <p className="leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* STEP 1: OTP Generation Card */}
                <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Step 1: Dispatch Verification OTP
                    </h4>
                    {otpSent && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-bold">
                        OTP Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click below to send a secure 6-digit OTP code to{" "}
                    <strong>{selectedUser.email}</strong>. The user must provide this code to verify their request.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={sendingOtp || cooldown > 0}
                      onClick={handleSendOTP}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Sending OTP to Email...
                        </>
                      ) : cooldown > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          Resend Code in {cooldown}s
                        </>
                      ) : otpSent ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Resend OTP to Email
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Send Verification OTP to Email
                        </>
                      )}
                    </button>

                    {otpSent && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Valid for 10 minutes
                      </span>
                    )}
                  </div>

                  {otpNotice && (
                    <div className="text-[11px] text-blue-800 bg-white/80 p-2.5 rounded-lg border border-blue-200 mt-2 font-medium">
                      ℹ️ {otpNotice}
                    </div>
                  )}
                </div>

                {/* STEP 2: Verify OTP & Enter New Password */}
                <form
                  onSubmit={handleSubmitReset}
                  className={`space-y-4 p-5 rounded-2xl border transition ${
                    otpSent
                      ? "bg-white border-slate-300"
                      : "bg-slate-50/50 border-slate-200 opacity-60 pointer-events-none"
                  }`}
                >
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    Step 2: Enter OTP & Set New Password
                  </h4>

                  {/* OTP Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      6-Digit Verification OTP *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 583920"
                      disabled={!otpSent}
                      className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-black tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Enter the 6-digit code received by the user via email.
                    </p>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          disabled={!otpSent}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm New Password *
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        disabled={!otpSent}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={resetting || !otpSent}
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resetting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying OTP & Updating Password...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Verify OTP & Reset Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPasswordReset;
