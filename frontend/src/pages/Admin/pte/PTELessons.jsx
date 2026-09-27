import React, {
  useEffect,
  useState,
} from "react";

import {
  FaBookOpen,
  FaSearch,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";

import {
  getStudentPTELessons,
} from "../../../services/pteLessonService";

import { useNavigate } from "react-router-dom";

import "./PTELessons.css";

const PTELessons = () => {
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [section, setSection] =
    useState("");

  // ====================================================
  // FETCH LESSONS
  // ====================================================

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPTELessons({
          section,
          search,
        });

      setLessons(
        response?.data || []
      );
    } catch (err) {
      console.error(
        "Fetch PTE Lessons Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load PTE lessons."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    fetchLessons();
  }, [section]);

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch = (e) => {
    e.preventDefault();

    fetchLessons();
  };

  // ====================================================
  // OPEN LESSON
  // ====================================================

  const handleStudyLesson = (
    lessonId
  ) => {
    navigate(
      `/student/pte/lessons/${lessonId}`
    );
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="pte-lessons-page">
        <div className="pte-lessons-loading">
          <div className="pte-spinner"></div>

          <p>
            Loading PTE lessons...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="pte-lessons-page">

      {/* ============================================== */}
      {/* HEADER */}
      {/* ============================================== */}

      <div className="pte-lessons-header">

        <div>
          <div className="pte-page-icon">
            <FaBookOpen />
          </div>

          <h1>
            PTE Lessons
          </h1>

          <p>
            Learn PTE concepts and improve
            your English skills.
          </p>
        </div>

      </div>

      {/* ============================================== */}
      {/* FILTERS */}
      {/* ============================================== */}

      <div className="pte-lesson-filters">

        <form
          className="pte-search-box"
          onSubmit={handleSearch}
        >
          <FaSearch />

          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          value={section}
          onChange={(e) =>
            setSection(e.target.value)
          }
          className="pte-section-select"
        >
          <option value="">
            All Sections
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

      {/* ============================================== */}
      {/* ERROR */}
      {/* ============================================== */}

      {error && (
        <div className="pte-error">
          {error}
        </div>
      )}

      {/* ============================================== */}
      {/* EMPTY */}
      {/* ============================================== */}

      {!error &&
        lessons.length === 0 && (
          <div className="pte-empty">

            <FaBookOpen />

            <h2>
              No lessons available
            </h2>

            <p>
              There are currently no
              published PTE lessons.
            </p>

          </div>
        )}

      {/* ============================================== */}
      {/* LESSON GRID */}
      {/* ============================================== */}

      {lessons.length > 0 && (
        <div className="pte-lessons-grid">

          {lessons.map(
            (lesson) => (
              <div
                className="pte-lesson-card"
                key={lesson._id}
              >

                {/* CARD ICON */}

                <div className="pte-card-icon">
                  <FaBookOpen />
                </div>

                {/* SECTION */}

                <span className="pte-section-badge">
                  {lesson.section}
                </span>

                {/* TITLE */}

                <h2>
                  {lesson.title}
                </h2>

                {/* DESCRIPTION */}

                <p>
                  {lesson.description ||
                    "No description available."}
                </p>

                {/* FOOTER */}

                <div className="pte-card-footer">

                  <span>
                    <FaClock />

                    {lesson.difficulty ||
                      "Medium"}
                  </span>

                  <button
                    onClick={() =>
                      handleStudyLesson(
                        lesson._id
                      )
                    }
                  >
                    Study
                    <FaArrowRight />
                  </button>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
};

export default PTELessons;