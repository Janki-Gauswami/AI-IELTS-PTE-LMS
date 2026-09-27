import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaPhoneAlt,
  FaTimes,
  FaHeadset,
} from "react-icons/fa";

import AuthInput from "./AuthInput";
import { useAuth } from "../../context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = {};

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      validationErrors.password = "Password is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        email: formData.email,
        password: formData.password,
      });

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } catch (error) {
      setServerError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col justify-center px-8 py-10 lg:px-12 relative">

      {/* Back Button */}

      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
      >
        <FaArrowLeft />
        Back to Home
      </Link>

      {/* Logo */}

      <div>

        <h1 className="text-4xl font-black text-slate-900">
          FlyHigh
        </h1>

        <p className="mt-2 text-slate-500">
          AI IELTS & PTE LMS
        </p>

      </div>

      {/* Heading */}

      <div className="mt-10">

        <h2 className="text-4xl font-bold text-slate-900">
          Welcome Back 👋
        </h2>

        <p className="mt-3 leading-7 text-slate-500">
          Sign in to continue your AI-powered IELTS & PTE learning journey.
        </p>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="mt-10"
      >

        {/* Server Error */}

        {serverError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {serverError}
          </div>
        )}

        {/* Email */}

        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          icon={FaEnvelope}
          error={errors.email}
        />

        {/* Password */}

        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          icon={FaLock}
          error={errors.password}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        {/* Forgot Password Link */}

        <div className="mt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Forgot Password?
          </button>
        </div>

        {/* Button */}

        <button
          type="submit"
          disabled={loading}
          className="
            mt-8
            w-full
            rounded-xl
            bg-gradient-to-r
            from-blue-600
            to-sky-500
            py-4
            text-lg
            font-semibold
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-blue-400/40
            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >
          {loading ? "Signing In..." : "Sign In →"}
        </button>

      </form>

      {/* Footer */}

      <p className="mt-8 text-center text-slate-500">

        Need an account or help?

        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="ml-2 font-semibold text-blue-600 hover:text-blue-700 underline"
        >
          Contact Administrator
        </button>

      </p>

      {/* Administrator Contact Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-slate-100">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
            >
              <FaTimes />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <FaHeadset className="text-2xl" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Contact Administrator
            </h3>

            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              To reset your password or activate your LMS student/teacher credentials, please get in touch with the academy administration:
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Email</p>
                  <a
                    href="mailto:admin@flyhigh.com"
                    className="text-sm font-bold text-slate-800 hover:text-blue-600 transition"
                  >
                    admin@flyhigh.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <FaPhoneAlt />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Help Desk & Phone</p>
                  <a
                    href="tel:+919876543210"
                    className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginForm;