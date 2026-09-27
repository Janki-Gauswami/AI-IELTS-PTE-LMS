import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPracticeTests,
  deletePracticeTest,
  publishPracticeTest,
  unpublishPracticeTest,
} from "../../../../services/ieltsPracticeTestService";

import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";

const IELTSPracticeTests = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);

  const [section, setSection] = useState("");
  const [difficulty, setDifficulty] =
    useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Practice Tests
  // ======================================================

  const loadTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPracticeTests({
        section,
        difficulty,
        status,
        search,
      });

      setTests(response.data || []);

    } catch (err) {
      console.error(
        "IELTS Practice Tests Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load IELTS practice tests."
      );
    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // Load On Filter Change
  // ======================================================

  useEffect(() => {
    loadTests();
  }, [
    section,
    difficulty,
    status,
  ]);


  // ======================================================
  // Delete Test
  // ======================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this practice test?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deletePracticeTest(id);

      setTests((previous) =>
        previous.filter(
          (test) => test._id !== id
        )
      );

    } catch (err) {
      console.error(
        "Delete Practice Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete practice test."
      );
    }
  };


  // ======================================================
  // Publish Test
  // ======================================================

const handlePublish = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to publish this practice test?"
  );

  if (!confirmed) return;

  try {
    setError("");

    const response =
      await publishPracticeTest(id);

    setTests((previous) =>
      previous.map((test) =>
        test._id === id
          ? {
              ...test,
              status:
                response.data?.status ||
                "Published",
            }
          : test
      )
    );

  } catch (err) {
    console.error(
      "Publish Practice Test Error:",
      err
    );

    setError(
      err.message ||
        "Unable to publish practice test."
    );
  }
};


  // ======================================================
  // Unpublish Test
  // ======================================================

  const handleUnpublish = async (id) => {
  const confirmed = window.confirm(
    "Move this practice test back to Draft?"
  );

  if (!confirmed) return;

  try {
    setError("");

    const response =
      await unpublishPracticeTest(id);

    setTests((previous) =>
      previous.map((test) =>
        test._id === id
          ? {
              ...test,
              status:
                response.data?.status ||
                "Draft",
            }
          : test
      )
    );

  } catch (err) {
    console.error(
      "Unpublish Practice Test Error:",
      err
    );

    setError(
      err.message ||
        "Unable to unpublish practice test."
    );
  }
};


  // ======================================================
  // Search
  // ======================================================

  const handleSearch = (event) => {
    event.preventDefault();

    loadTests();
  };


  // ======================================================
  // Render
  // ======================================================

  return (
    <DashboardLayout>
    <div className="space-y-6">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            IELTS Practice Tests
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage IELTS practice tests.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/ielts/tests/add"
            )
          }
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + Create Practice Test
        </button>

      </div>


      {/* ==================================================
          Error
      ================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}


      {/* ==================================================
          Filters
      ================================================== */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <form
          onSubmit={handleSearch}
          className="grid gap-4 lg:grid-cols-4"
        >

          {/* Search */}

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search test..."
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />


          {/* Section */}

          <select
            value={section}
            onChange={(event) =>
              setSection(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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


          {/* Status */}

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >

            <option value="">
              All Status
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Published">
              Published
            </option>

          </select>

        </form>

      </div>


      {/* ==================================================
          Loading
      ================================================== */}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="text-slate-500">
            Loading IELTS practice tests...
          </p>

        </div>
      ) : tests.length === 0 ? (

        /* ==================================================
           Empty State
        ================================================== */

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            📝
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No Practice Tests Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create your first IELTS practice test.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/ielts/tests/add"
              )
            }
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create Practice Test
          </button>

        </div>

      ) : (

        /* ==================================================
           Test List
        ================================================== */

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {tests.map((test) => (

            <div
              key={test._id}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              {/* Top */}

              <div className="flex items-start justify-between gap-3">

                <div className="text-3xl">

                  {test.section ===
                  "Listening"
                    ? "🎧"
                    : test.section ===
                      "Reading"
                    ? "📖"
                    : test.section ===
                      "Writing"
                    ? "✍️"
                    : "🎤"}

                </div>


                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    test.status ===
                    "Published"
                      ? "bg-green-50 text-green-600"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {test.status}
                </span>

              </div>


              {/* Title */}

              <h2 className="mt-4 text-lg font-bold text-slate-800">
                {test.title}
              </h2>


              {/* Description */}

              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {test.description ||
                  "No description available."}
              </p>


              {/* Tags */}

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {test.section}
                </span>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                  {test.difficulty}
                </span>

              </div>


              {/* Statistics */}

              <div className="mt-5 grid grid-cols-3 gap-2">

                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-xs text-slate-500">
                    Questions
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {test.questions?.length || 0}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-xs text-slate-500">
                    Duration
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {test.duration} min
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-xs text-slate-500">
                    Marks
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {test.totalMarks}
                  </p>

                </div>

              </div>


              {/* ==================================================
                  Actions
              ================================================== */}

              <div className="mt-6 space-y-2">

                <button
  type="button"
  onClick={() =>
    navigate(
      `/admin/ielts/tests/${test._id}/questions`
    )
  }
  className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
>
  Select Questions
</button>

                {/* Edit */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/ielts/tests/edit/${test._id}`
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit Test
                </button>


                {/* Publish / Unpublish */}

                {test.status ===
                "Published" ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleUnpublish(
                        test._id
                      )
                    }
                    className="w-full rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-600"
                  >
                    Move to Draft
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handlePublish(
                        test._id
                      )
                    }
                    className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Publish Test
                  </button>
                )}


                {/* Delete */}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      test._id
                    )
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete Test
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