import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPracticeTests,
} from "../../../../services/ieltsPracticeTestService";

import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";

const IELTSPracticeTests = () => {
  const navigate = useNavigate();

  // ======================================================
  // State
  // ======================================================

  const [tests, setTests] = useState([]);

  const [section, setSection] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Published Practice Tests
  // ======================================================

  const loadTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPracticeTests({
        status: "Published",
        section,
        difficulty,
        search,
      });

      setTests(response?.data || []);
    } catch (err) {
      console.error(
        "Student IELTS Practice Tests Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS practice tests."
      );

      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Initial Load + Filter Changes
  // ======================================================

  useEffect(() => {
    loadTests();
  }, [section, difficulty]);

  // ======================================================
  // Search
  // ======================================================

  const handleSearch = (event) => {
    event.preventDefault();

    loadTests();
  };

  // ======================================================
  // Clear Filters
  // ======================================================

  const handleClearFilters = () => {
    setSection("");
    setDifficulty("");
    setSearch("");
  };

  // ======================================================
  // Section Icon
  // ======================================================

  const getSectionIcon = (testSection) => {
    switch (testSection) {
      case "Listening":
        return "🎧";

      case "Reading":
        return "📖";

      case "Writing":
        return "✍️";

      case "Speaking":
        return "🎤";

      default:
        return "📝";
    }
  };

  // ======================================================
  // Section Color
  // ======================================================

  const getSectionColor = (testSection) => {
    switch (testSection) {
      case "Listening":
        return "bg-blue-500";

      case "Reading":
        return "bg-green-500";

      case "Writing":
        return "bg-purple-500";

      case "Speaking":
        return "bg-orange-500";

      default:
        return "bg-slate-700";
    }
  };

  // ======================================================
  // Difficulty Color
  // ======================================================

  const getDifficultyColor = (testDifficulty) => {
    switch (testDifficulty) {
      case "Easy":
        return "bg-green-50 text-green-600";

      case "Medium":
        return "bg-yellow-50 text-yellow-600";

      case "Hard":
        return "bg-red-50 text-red-600";

      default:
        return "bg-purple-50 text-purple-600";
    }
  };

  // ======================================================
  // Start / View Test
  // ======================================================

  const handleViewTest = (testId) => {
    if (!testId) {
      return;
    }

    navigate(
      `/student/ielts/tests/${testId}`
    );
  };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="text-slate-500">
            Loading IELTS practice tests...
          </p>

        </div>

      </div>
    );
  }

  // ======================================================
  // Render
  // ======================================================

  return (
    <DashboardLayout>
    <div className="space-y-6">

      {/* ==================================================
          Header
      ================================================== */}

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          IELTS Practice Tests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Practice your IELTS skills with available
          practice tests.
        </p>

      </div>


      {/* ==================================================
          Error
      ================================================== */}

      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="font-semibold text-red-700">
                Unable to load practice tests
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={loadTests}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>

          </div>

        </div>

      )}


      {/* ==================================================
          Filters
      ================================================== */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <form
          onSubmit={handleSearch}
          className="grid gap-4 md:grid-cols-4"
        >

          {/* Search */}

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search practice tests..."
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />


          {/* Section */}

          <select
            value={section}
            onChange={(event) =>
              setSection(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >

            <option value="">
              All Sections
            </option>

            <option value="Listening">
              Listening
            </option>

            <option value="Reading">
              Reading
            </option>

            <option value="Writing">
              Writing
            </option>

            <option value="Speaking">
              Speaking
            </option>

          </select>


          {/* Difficulty */}

          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >

            <option value="">
              All Difficulties
            </option>

            <option value="Easy">
              Easy
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Hard">
              Hard
            </option>

          </select>


          {/* Buttons */}

          <div className="flex gap-2">

            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>

          </div>

        </form>

      </div>


      {/* ==================================================
          Test Count
      ================================================== */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold text-slate-800">
            Available Tests
          </h2>

          <p className="text-sm text-slate-500">
            {tests.length} published test
            {tests.length !== 1 ? "s" : ""} available
          </p>

        </div>

      </div>


      {/* ==================================================
          Empty State
      ================================================== */}

      {tests.length === 0 ? (

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            📝
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No Practice Tests Available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are currently no published IELTS
            practice tests matching your filters.
          </p>

          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Clear Filters
          </button>

        </div>

      ) : (

        /* ==================================================
           Test Cards
        ================================================== */

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {tests.map((test) => (

            <div
              key={test._id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              {/* ==================================================
                  Card Header
              ================================================== */}

              <div
                className={`${getSectionColor(
                  test.section
                )} p-6 text-white`}
              >

                <div className="flex items-start justify-between">

                  <div className="text-4xl">

                    {getSectionIcon(
                      test.section
                    )}

                  </div>

                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    {test.section ||
                      "IELTS"}
                  </span>

                </div>


                <h2 className="mt-5 text-lg font-bold">
                  {test.title}
                </h2>

              </div>


              {/* ==================================================
                  Card Body
              ================================================== */}

              <div className="p-6">

                <p className="line-clamp-2 text-sm leading-6 text-slate-500">

                  {test.description ||
                    "Practice your IELTS skills with this test."}

                </p>


                {/* Difficulty */}

                {test.difficulty && (

                  <div className="mt-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyColor(
                        test.difficulty
                      )}`}
                    >
                      {test.difficulty}
                    </span>

                  </div>

                )}


                {/* ==================================================
                    Test Statistics
                ================================================== */}

                <div className="mt-5 grid grid-cols-3 gap-2">

                  {/* Questions */}

                  <div className="rounded-xl bg-slate-50 p-3 text-center">

                    <p className="text-xs text-slate-500">
                      Questions
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {test.questions?.length ||
                        test.totalQuestions ||
                        0}
                    </p>

                  </div>


                  {/* Duration */}

                  <div className="rounded-xl bg-slate-50 p-3 text-center">

                    <p className="text-xs text-slate-500">
                      Duration
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {test.duration || 0}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      minutes
                    </p>

                  </div>


                  {/* Marks */}

                  <div className="rounded-xl bg-slate-50 p-3 text-center">

                    <p className="text-xs text-slate-500">
                      Marks
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {test.totalMarks || 0}
                    </p>

                  </div>

                </div>


                {/* ==================================================
                    Start / View Test
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    handleViewTest(
                      test._id
                    )
                  }
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  View Test
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
    </DashboardLayout>
  );
};

export default IELTSPracticeTests;