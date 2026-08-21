import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaSave,
} from "react-icons/fa";

import { createPTELesson } from "../../../services/pteLessonService";

const AddPTELesson = () => {
  const navigate = useNavigate();

  // ======================================================
  // Form State
  // ======================================================

  const [formData, setFormData] = useState({
    section: "",
    title: "",
    description: "",
    learningMaterial: "",
    status: "Draft",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // Handle Input
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ======================================================
  // Validation
  // ======================================================

  const validateForm = () => {
    if (!formData.section) {
      return "Please select a PTE section.";
    }

    if (!formData.title.trim()) {
      return "Lesson title is required.";
    }

    if (!formData.description.trim()) {
      return "Lesson description is required.";
    }

    if (!formData.learningMaterial.trim()) {
      return "Learning material is required.";
    }

    return null;
  };

  // ======================================================
  // Submit Form
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await createPTELesson({
        section: formData.section,
        title: formData.title.trim(),
        description: formData.description.trim(),
        learningMaterial:
          formData.learningMaterial.trim(),
        status: formData.status,
      });

      console.log("PTE Lesson Created:", response);

      setSuccess("PTE lesson created successfully.");

      setFormData({
        section: "",
        title: "",
        description: "",
        learningMaterial: "",
        status: "Draft",
      });

      // Optional redirect after successful creation
      setTimeout(() => {
        navigate("/admin/pte/lessons");
      }, 1000);
    } catch (err) {
      console.error("Create PTE lesson error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create PTE lesson.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Cancel
  // ======================================================

  const handleCancel = () => {
    navigate("/admin/pte/lessons");
  };

  // ======================================================
  // JSX
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <FaBook />
              Add PTE Lesson
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new PTE learning lesson.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FaArrowLeft />
            Back
          </button>
        </div>

        {/* ==================================================
            Form Card
        ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-md">

          {/* ==================================================
              Error
          ================================================== */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ==================================================
              Success
          ================================================== */}

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ==================================================
                Section
            ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="section"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                PTE Section
              </label>

              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select Section
                </option>

                <option value="Speaking">
                  Speaking
                </option>

                <option value="Writing">
                  Writing
                </option>

                <option value="Reading">
                  Reading
                </option>

                <option value="Listening">
                  Listening
                </option>
              </select>
            </div>

            {/* ==================================================
                Title
            ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Lesson Title
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter lesson title"
                maxLength={200}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* ==================================================
                Description
            ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter lesson description"
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* ==================================================
                Learning Material
            ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="learningMaterial"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Learning Material
              </label>

              <textarea
                id="learningMaterial"
                name="learningMaterial"
                value={formData.learningMaterial}
                onChange={handleChange}
                placeholder="Enter lesson learning material..."
                rows={10}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Add the study content that students will read
                or use for this lesson.
              </p>
            </div>

            {/* ==================================================
                Status
            ================================================== */}

            <div className="mb-7">
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>
              </select>

              <p className="mt-1 text-xs text-gray-500">
                Draft lessons are not intended to be visible
                to students until published.
              </p>
            </div>

            {/* ==================================================
                Buttons
            ================================================== */}

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSave />

                {loading
                  ? "Saving..."
                  : "Save Lesson"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPTELesson;