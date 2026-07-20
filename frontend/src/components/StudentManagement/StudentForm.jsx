import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as studentService from "../../services/studentService";
import * as batchService from "../../services/batchService";

const StudentForm = ({
  mode = "add",
  studentId = null,
}) => {
  const navigate = useNavigate();

  // =====================================
  // State
  // =====================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    // ======================
    // User
    // ======================
    name: "",
    email: "",
    password: "",
    phone: "",
    profilePicture: "",

    // ======================
    // Student Profile
    // ======================
    enrollmentNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",

    targetExam: "",
    targetBand: "",
    targetCountry: "",
    goal: "",

    // ======================
    // Enrollment
    // ======================
    batchId: "",
  });

  // =====================================
  // Handle Input Change
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    // =====================================
  // Validate Form
  // =====================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Full Name is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (mode === "add" && !formData.password.trim()) {
      return "Password is required.";
    }

    if (mode === "add" && formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!formData.phone.trim()) {
      return "Phone number is required.";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (!formData.enrollmentNumber.trim()) {
      return "Enrollment Number is required.";
    }

    if (!formData.dateOfBirth) {
      return "Date of Birth is required.";
    }

    if (!formData.gender) {
      return "Gender is required.";
    }

    if (!formData.emergencyContact.trim()) {
      return "Emergency Contact is required.";
    }

    if (!/^[0-9]{10}$/.test(formData.emergencyContact)) {
      return "Emergency Contact must contain exactly 10 digits.";
    }

    if (!formData.batchId) {
      return "Please select a batch.";
    }

    if (!formData.targetExam) {
      return "Please select Target Exam.";
    }

    if (formData.targetBand === "") {
      return "Target Band / Score is required.";
    }

    const targetBand = Number(formData.targetBand);

    if (
      formData.targetExam === "IELTS" &&
      (targetBand < 1 || targetBand > 9)
    ) {
      return "IELTS target band must be between 1 and 9.";
    }

    if (
      formData.targetExam === "PTE" &&
      (targetBand < 10 || targetBand > 90)
    ) {
      return "PTE target score must be between 10 and 90.";
    }

    if (!formData.targetCountry) {
      return "Please select Target Country.";
    }

    return null;
  };

  // =====================================
  // Handle Submit
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      if (mode === "add") {
        await studentService.createStudent(formData);
      } else {
        await studentService.updateStudent(
          studentId,
          formData
        );
      }

      navigate("/admin/students");
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Fetch Batches
  // =====================================

  const fetchBatches = async () => {
    try {
      const response = await batchService.getAllBatches();

      setBatches(response.batches || []);
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================
  // Fetch Student (Edit Mode)
  // =====================================

  const fetchStudent = async () => {
    if (mode !== "edit" || !studentId) return;

    try {
      setLoading(true);

      const response = await studentService.getStudentById(studentId);

      const { user, profile, enrollment } = response.data;

      setFormData({
        // User
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        phone: user?.phone || "",
        profilePicture: user?.profilePicture || "",

        // Student Profile
        enrollmentNumber: profile?.enrollmentNumber || "",
        dateOfBirth: profile?.dateOfBirth
          ? profile.dateOfBirth.substring(0, 10)
          : "",
        gender: profile?.gender || "",
        address: profile?.address || "",
        emergencyContact: profile?.emergencyContact || "",

        targetExam: profile?.targetExam || "",
        targetBand: profile?.targetBand || "",
        targetCountry: profile?.targetCountry || "",
        goal: profile?.goal || "",

        // Enrollment
        batchId: enrollment?.batch?._id || "",
      });
    } catch (err) {
      setError(err.message || "Failed to fetch student.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Initial Load
  // =====================================

  useEffect(() => {
    fetchBatches();

    if (mode === "edit") {
      fetchStudent();
    }
  }, []);
    // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">
        Loading Student...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">

      {/* ===================================== */}
      {/* Header */}
      {/* ===================================== */}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {mode === "add" ? "Add Student" : "Edit Student"}
        </h2>

        <p className="text-gray-500 mt-2">
          {mode === "add"
            ? "Register a new student."
            : "Update student information."}
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <form>

        {/* ===================================== */}
        {/* Student Information */}
        {/* ===================================== */}

        <div className="border rounded-xl p-6 mb-8">

          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Student Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Full Name */}

            <div>
              <label className="block mb-2 font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Email */}

            <div>
              <label className="block mb-2 font-medium">
                Email <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={mode === "edit"}
                placeholder="Enter email"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Password */}

            {mode === "add" && (
              <div>
                <label className="block mb-2 font-medium">
                  Password <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {/* Phone */}

            <div>
              <label className="block mb-2 font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Profile Picture */}

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">
                Profile Picture URL
              </label>

              <input
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="Paste image URL (optional)"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

          </div>

        </div>
                {/* ===================================== */}
        {/* Academic Information */}
        {/* ===================================== */}

        <div className="border rounded-xl p-6 mb-8">

          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Academic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Enrollment Number */}

            <div>
              <label className="block mb-2 font-medium">
                Enrollment Number <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="enrollmentNumber"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                disabled={mode === "edit"}
                placeholder="Enter enrollment number"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Batch */}

            <div>
              <label className="block mb-2 font-medium">
                Batch <span className="text-red-500">*</span>
              </label>

              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Batch</option>

                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.batchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Exam */}

            <div>
              <label className="block mb-2 font-medium">
                Target Exam <span className="text-red-500">*</span>
              </label>

              <select
                name="targetExam"
                value={formData.targetExam}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Exam</option>
                <option value="IELTS">IELTS</option>
                <option value="PTE">PTE</option>
              </select>
            </div>

            {/* Target Band */}

            <div>
              <label className="block mb-2 font-medium">
                Target Band / Score <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                name="targetBand"
                value={formData.targetBand}
                onChange={handleChange}
                placeholder={
                  formData.targetExam === "PTE"
                    ? "10 - 90"
                    : "1 - 9"
                }
                min={formData.targetExam === "PTE" ? 10 : 1}
                max={formData.targetExam === "PTE" ? 90 : 9}
                step={formData.targetExam === "PTE" ? 1 : 0.5}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Target Country */}

            <div>
              <label className="block mb-2 font-medium">
                Target Country <span className="text-red-500">*</span>
              </label>

              <select
                name="targetCountry"
                value={formData.targetCountry}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Country</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="New Zealand">New Zealand</option>
              </select>
            </div>

            {/* Goal */}

            <div>
              <label className="block mb-2 font-medium">
                Goal
              </label>

              <input
                type="text"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="Example: PR, Higher Studies, Work Visa"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

          </div>

        </div>
                {/* ===================================== */}
        {/* Personal Information */}
        {/* ===================================== */}

        <div className="border rounded-xl p-6 mb-8">

          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Gender */}

            <div>
              <label className="block mb-2 font-medium">
                Gender <span className="text-red-500">*</span>
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}

            <div>
              <label className="block mb-2 font-medium">
                Date of Birth <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Emergency Contact */}

            <div>
              <label className="block mb-2 font-medium">
                Emergency Contact <span className="text-red-500">*</span>
              </label>

              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Enter emergency contact number"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Address */}

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={4}
                placeholder="Enter student's address"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

          </div>

        </div>
                {/* ===================================== */}
        {/* Form Actions */}
        {/* ===================================== */}

        <div className="flex justify-end gap-4 mt-8">

          {/* Cancel Button */}

          <button
            type="button"
            onClick={() => navigate("/admin/students")}
            disabled={loading}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Submit Button */}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "add"
                ? "Creating..."
                : "Updating..."
              : mode === "add"
              ? "Create Student"
              : "Update Student"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default StudentForm;