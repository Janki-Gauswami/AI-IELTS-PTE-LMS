import React, {
  useEffect,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaBookOpen,
  FaCheckCircle,
  FaGraduationCap,
} from "react-icons/fa";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getStudentPTELessonById,
} from "../../../services/pteLessonService";

import "./PTELessonStudy.css";

const PTELessonStudy = () => {
  const {
    id,
  } = useParams();

  const navigate = useNavigate();

  const [lesson, setLesson] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // FETCH LESSON
  // ====================================================

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPTELessonById(
          id
        );

      setLesson(
        response?.data || null
      );
    } catch (err) {
      console.error(
        "Fetch PTE Lesson Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load this lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOAD
  // ====================================================

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="pte-study-loading">
        <div className="pte-study-spinner"></div>

        <p>
          Loading lesson...
        </p>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div className="pte-study-page">

        <button
          className="pte-back-button"
          onClick={() =>
            navigate(
              "/student/pte/lessons"
            )
          }
        >
          <FaArrowLeft />
          Back to Lessons
        </button>

        <div className="pte-study-error">

          <FaBookOpen />

          <h2>
            Lesson unavailable
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }

  // ====================================================
  // LESSON NOT FOUND
  // ====================================================

  if (!lesson) {
    return (
      <div className="pte-study-page">

        <button
          className="pte-back-button"
          onClick={() =>
            navigate(
              "/student/pte/lessons"
            )
          }
        >
          <FaArrowLeft />
          Back to Lessons
        </button>

        <div className="pte-study-error">

          <h2>
            Lesson not found
          </h2>

        </div>

      </div>
    );
  }

  // ====================================================
  // STUDY PAGE
  // ====================================================

  return (
    <div className="pte-study-page">

      {/* ============================================== */}
      {/* BACK */}
      {/* ============================================== */}

      <button
        className="pte-back-button"
        onClick={() =>
          navigate(
            "/student/pte/lessons"
          )
        }
      >
        <FaArrowLeft />
        Back to Lessons
      </button>

      {/* ============================================== */}
      {/* HERO */}
      {/* ============================================== */}

      <div className="pte-study-hero">

        <div className="pte-study-hero-icon">
          <FaGraduationCap />
        </div>

        <div>

          <span className="pte-study-section">
            {lesson.section}
          </span>

          <h1>
            {lesson.title}
          </h1>

          <p>
            {lesson.description ||
              "Study this PTE lesson and improve your skills."}
          </p>

        </div>

      </div>

      {/* ============================================== */}
      {/* LESSON INFORMATION */}
      {/* ============================================== */}

      <div className="pte-study-info">

        <div>
          <strong>
            Section
          </strong>

          <span>
            {lesson.section}
          </span>
        </div>

        <div>
          <strong>
            Difficulty
          </strong>

          <span>
            {lesson.difficulty ||
              "Medium"}
          </span>
        </div>

        <div>
          <strong>
            Status
          </strong>

          <span className="published-status">
            <FaCheckCircle />
            Published
          </span>
        </div>

      </div>

      {/* ============================================== */}
      {/* LEARNING MATERIAL */}
      {/* ============================================== */}

      <div className="pte-study-content">

        <div className="pte-content-header">

          <FaBookOpen />

          <h2>
            Learning Material
          </h2>

        </div>

        <div className="pte-learning-material">

          {lesson.learningMaterial ? (
            <div className="pte-material-text">
              {lesson.learningMaterial}
            </div>
          ) : (
            <div className="pte-no-material">
              <FaBookOpen />

              <h3>
                Learning material
                coming soon
              </h3>

              <p>
                The teacher has not
                added learning
                material to this lesson
                yet.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ============================================== */}
      {/* COMPLETION */}
      {/* ============================================== */}

      <div className="pte-study-complete">

        <FaCheckCircle />

        <div>
          <h3>
            Lesson Completed?
          </h3>

          <p>
            Review the material carefully
            before moving to your PTE
            practice questions.
          </p>
        </div>

      </div>

    </div>
  );
};

export default PTELessonStudy;