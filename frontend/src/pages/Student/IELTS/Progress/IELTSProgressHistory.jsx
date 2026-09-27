import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSProgressHistory = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  // ======================================================
  // Load Attempts
  // ======================================================

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPreviousAttempts();

      if (
        !response ||
        !response.success
      ) {
        setError(
          response?.message ||
            "Unable to load IELTS progress history."
        );

        return;
      }

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.attempts ||
            response.data?.results ||
            [];

      const normalized = data
        .map((attempt, index) => {
          const test =
            attempt.test ||
            attempt.practiceTest ||
            {};

          return {
            ...attempt,

            _id:
              attempt._id ||
              `attempt-${index}`,

            title:
              test.title ||
              attempt.testTitle ||
              "IELTS Practice Test",

            listeningBand:
              attempt.listeningBand ??
              attempt.listening?.band ??
              null,

            readingBand:
              attempt.readingBand ??
              attempt.reading?.band ??
              null,

            writingBand:
              attempt.writingBand ??
              attempt.writing?.band ??
              null,

            speakingBand:
              attempt.speakingBand ??
              attempt.speaking?.band ??
              null,

            overallBand:
              attempt.overallBand ??
              attempt.bandScore ??
              null,

            score:
              attempt.score ??
              0,

            totalMarks:
              attempt.totalMarks ??
              0,

            percentage:
              attempt.percentage ??
              0,

            status:
              attempt.status ||
              "Unknown",

            date:
              attempt.submittedAt ||
              attempt.completedAt ||
              attempt.createdAt ||
              null,
          };
        })
        .sort((a, b) => {
          const first = a.date
            ? new Date(
                a.date
              ).getTime()
            : 0;

          const second = b.date
            ? new Date(
                b.date
              ).getTime()
            : 0;

          return second - first;
        });

      setAttempts(normalized);
    } catch (err) {
      console.error(
        "IELTS Progress History Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS progress history."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Filter Attempts
  // ======================================================

  const filteredAttempts =
    useMemo(() => {
      return attempts.filter(
        (attempt) => {
          const matchesSearch =
            !search ||
            attempt.title
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            statusFilter === "All" ||
            attempt.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      attempts,
      search,
      statusFilter,
    ]);

  // ======================================================
  // Statistics
  // ======================================================

  const statistics = useMemo(() => {
    const bands = attempts
      .map((attempt) =>
        attempt.overallBand !==
          null &&
        attempt.overallBand !==
          undefined
          ? Number(
              attempt.overallBand
            )
          : null
      )
      .filter(
        (band) =>
          band !== null &&
          !Number.isNaN(band)
      );

    const best =
      bands.length
        ? Math.max(...bands)
        : null;

    const average =
      bands.length
        ? bands.reduce(
            (sum, band) =>
              sum + band,
            0
          ) / bands.length
        : null;

    return {
      total: attempts.length,
      submitted:
        attempts.filter(
          (attempt) =>
            attempt.status ===
            "Submitted"
        ).length,
      evaluated:
        attempts.filter(
          (attempt) =>
            attempt.status ===
            "Evaluated"
        ).length,
      best,
      average,
    };
  }, [attempts]);

  // ======================================================
  // Helpers
  // ======================================================

  const formatBand = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return Number(value).toFixed(
      1
    );
  };

  const formatPercentage = (
    value
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "0.0";
    }

    return Number(value).toFixed(
      1
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Date unavailable";
    }
  };

  const getStatusClasses = (
    status
  ) => {
    if (status === "Evaluated") {
      return "bg-green-50 text-green-600";
    }

    if (status === "Submitted") {
      return "bg-blue-50 text-blue-600";
    }

    if (status === "In Progress") {
      return "bg-orange-50 text-orange-600";
    }

    return "bg-slate-100 text-slate-500";
  };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="font-semibold text-slate-700">
            Loading IELTS history...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Preparing your previous attempts.
          </p>

        </div>

      </div>
    );
  }

  // ======================================================
  // Error
  // ======================================================

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-red-700">
            Unable to Load IELTS History
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadAttempts}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Main UI
  // ======================================================

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:p-8">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <p className="text-sm text-blue-100">
              IELTS Student Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              IELTS Progress History
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              View your previous IELTS attempts and track
              your performance over time.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/progress"
              )
            }
            className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            Back to Progress
          </button>

        </div>

      </div>


      {/* ==================================================
          Statistics
      ================================================== */}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
            📝
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Total Attempts
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {statistics.total}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
            ✓
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Evaluated Attempts
          </p>

          <p className="mt-1 text-3xl font-bold text-green-600">
            {statistics.evaluated}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
            🏆
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Best Overall Band
          </p>

          <p className="mt-1 text-3xl font-bold text-indigo-600">
            {formatBand(
              statistics.best
            )}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
            📊
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Average Overall Band
          </p>

          <p className="mt-1 text-3xl font-bold text-purple-600">
            {formatBand(
              statistics.average
            )}
          </p>

        </div>

      </section>


      {/* ==================================================
          Filters
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-end">

          <div className="flex-1">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search Test
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search IELTS test..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          <div className="w-full md:w-56">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="All">
                All Status
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Submitted">
                Submitted
              </option>

              <option value="Evaluated">
                Evaluated
              </option>

            </select>

          </div>

        </div>

      </section>


      {/* ==================================================
          History Table
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Previous Attempts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed record of your IELTS practice history.
            </p>

          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {filteredAttempts.length} records
          </span>

        </div>


        {filteredAttempts.length === 0 ? (

          <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center">

            <div className="text-5xl">
              🔍
            </div>

            <h3 className="mt-4 font-bold text-slate-700">
              No Attempts Found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>

          </div>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead>

                <tr className="border-b border-slate-100">

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Test
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Date
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Listening
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Reading
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Writing
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Speaking
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Overall
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Score
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Percentage
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-400">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredAttempts.map(
                  (attempt) => (

                    <tr
                      key={attempt._id}
                      className="border-b border-slate-50 transition hover:bg-slate-50 last:border-0"
                    >

                      <td className="px-4 py-4">

                        <p className="max-w-[220px] truncate font-semibold text-slate-700">
                          {attempt.title}
                        </p>

                      </td>


                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(
                          attempt.date
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {formatBand(
                          attempt.listeningBand
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {formatBand(
                          attempt.readingBand
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {formatBand(
                          attempt.writingBand
                        )}
                      </td>


                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {formatBand(
                          attempt.speakingBand
                        )}
                      </td>


                      <td className="px-4 py-4">

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
                          {formatBand(
                            attempt.overallBand
                          )}
                        </span>

                      </td>


                      <td className="px-4 py-4 text-sm text-slate-600">
                        {attempt.score}
                        {attempt.totalMarks
                          ? ` / ${attempt.totalMarks}`
                          : ""}
                      </td>


                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatPercentage(
                          attempt.percentage
                        )}
                        %
                      </td>


                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            attempt.status
                          )}`}
                        >
                          {attempt.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ==================================================
          Navigation
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-800">
          Progress & Analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Explore your IELTS performance in more detail.
        </p>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/progress"
              )
            }
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="text-2xl">
              📊
            </div>

            <h3 className="mt-3 font-bold text-slate-800">
              Progress
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View your overall IELTS progress.
            </p>
          </button>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/progress/weak-areas"
              )
            }
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="text-2xl">
              🔎
            </div>

            <h3 className="mt-3 font-bold text-slate-800">
              Weak Areas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Find sections needing more practice.
            </p>
          </button>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/progress/comparison"
              )
            }
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="text-2xl">
              ⚖️
            </div>

            <h3 className="mt-3 font-bold text-slate-800">
              Comparison
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Compare two IELTS attempts.
            </p>
          </button>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/progress/goals"
              )
            }
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="text-2xl">
              🎯
            </div>

            <h3 className="mt-3 font-bold text-slate-800">
              Goal Tracking
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track your target IELTS band.
            </p>
          </button>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/progress/improvement"
              )
            }
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="text-2xl">
              📈
            </div>

            <h3 className="mt-3 font-bold text-slate-800">
              Improvement
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track changes in your performance.
            </p>
          </button>

        </div>

      </section>

    </div>
  );
};

export default IELTSProgressHistory;