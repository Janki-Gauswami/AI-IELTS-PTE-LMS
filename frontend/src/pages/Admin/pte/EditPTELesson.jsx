import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

import {
  getPTELessonById,
  updatePTELesson,
} from "../../../services/pteLessonService";

const EditPTELesson = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    section: "",
    title: "",
    description: "",
    learningMaterial: "",
    status: "draft",
  });

  // ====================================================
  // LOAD LESSON
  // ====================================================

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPTELessonById(id);

        const lesson = response.data;

        if (!lesson) {
          throw new Error("Lesson data was not found.");
        }

        setFormData({
          section: lesson.section || "",
          title: lesson.title || "",
          description: lesson.description || "",
          learningMaterial:
            lesson.learningMaterial || "",
          status: lesson.status || "draft",
        });
      } catch (err) {
        console.error("Load PTE Lesson Error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load lesson."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadLesson();
    }
  }, [id]);

  // ====================================================
  // HANDLE INPUT
  // ====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!formData.section) {
      setError("Please select a PTE section.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    try {
      setSaving(true);

      await updatePTELesson(id, {
        section: formData.section,
        title: formData.title.trim(),
        description: formData.description,
        learningMaterial:
          formData.learningMaterial,
        status: formData.status,
      });

      // ------------------------------------------------
      // Go back to lessons page
      // ------------------------------------------------

      navigate("/admin/pte/lessons");
    } catch (err) {
      console.error("Update PTE Lesson Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update lesson."
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <FaSpinner
          size={28}
          style={{
            animation: "spin 1s linear infinite",
          }}
        />

        <p>Loading lesson...</p>
      </div>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            navigate("/admin/pte/lessons")
          }
          style={{
            border: "none",
            background: "#f1f1f1",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <FaArrowLeft />
        </button>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            Edit PTE Lesson
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#666",
            }}
          >
            Update lesson information and content.
          </p>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          style={{
            background: "#ffe8e8",
            color: "#c62828",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* ==================================================
          FORM
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow:
            "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* ==================================================
            SECTION
        ================================================== */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="section"
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            PTE Section
          </label>

          <select
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            style={inputStyle}
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
            TITLE
        ================================================== */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="title"
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
            }}
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
            style={inputStyle}
          />
        </div>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="description"
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
            }}
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
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </div>

        {/* ==================================================
            LEARNING MATERIAL
        ================================================== */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="learningMaterial"
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
            }}
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
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </div>

        {/* ==================================================
            STATUS
        ================================================== */}

        <div style={{ marginBottom: "30px" }}>
          <label
            htmlFor="status"
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="draft">
              Draft
            </option>

            <option value="published">
              Published
            </option>
          </select>
        </div>

        {/* ==================================================
            BUTTONS
        ================================================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate("/admin/pte/lessons")
            }
            disabled={saving}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 22px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {saving ? (
              <>
                <FaSpinner />
                Updating...
              </>
            ) : (
              <>
                <FaSave />
                Update Lesson
              </>
            )}
          </button>
        </div>
      </form>

      {/* ==================================================
          SPINNER ANIMATION
      ================================================== */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

// ======================================================
// INPUT STYLE
// ======================================================

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

// ======================================================
// EXPORT
// ======================================================

export default EditPTELesson;