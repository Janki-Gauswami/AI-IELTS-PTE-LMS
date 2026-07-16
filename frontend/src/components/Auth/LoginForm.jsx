import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";

import AuthInput from "./AuthInput";
import { useAuth } from "../../context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    <div className="flex h-full flex-col justify-center px-8 py-10 lg:px-12">

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

        {/* Remember Me */}

        <div className="mt-2 flex items-center justify-between">

          <label className="flex cursor-pointer items-center gap-3">

            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-600"
            />

            <span className="text-slate-600">
              Remember Me
            </span>

          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot Password?
          </Link>

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

        Need an account?

        <span className="ml-2 cursor-pointer font-semibold text-blue-600 hover:text-blue-700">
          Contact Administrator
        </span>

      </p>

    </div>
  );
};

export default LoginForm;