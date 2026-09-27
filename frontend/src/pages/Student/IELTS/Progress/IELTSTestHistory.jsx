import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSTestHistory = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // ======================================================
  // Load Test History
  // ======================================================

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPreviousAttempts();

      if (!response || !response.success) {
        setError(
          response?.message ||
            "Unable to load IELTS test history."
        );

        return;
      }

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.attempts ||
            response.data?.results ||
            [];

      setAttempts(data);
    } catch (err) {
      console.error(
        "IELTS Test History Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS test history."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Normalize Attempts
  // ======================================================

  const normalizedAttempts = useMemo(() => {
    return attempts.map((attempt, index) => {
      const test =
        attempt.test ||
        attempt.practiceTest ||
        {};

      const testId =
        typeof attempt.test === "object"
          ? attempt.test?._id
          : attempt.test ||
            (
              typeof attempt.practiceTest ===
              "object"
                ? attempt.practiceTest?._id
                : attempt.practiceTest
            );

      const testTitle =
        test.title ||
        attempt.testTitle ||
        "IELTS Practice Test";

      const section =
        test.section ||
        attempt.section ||
        "";

      const totalMarks =
        attempt.totalMarks ??
        test.totalMarks ??
        0;

      const score =
        attempt.score ??
        attempt.obtainedMarks ??
        0;

      const percentage =
        attempt.percentage ??
        (
          Number(totalMarks) > 0
            ? (
                Number(score) /
                Number(totalMarks)
              ) *
              100
            : 0
        );

      const status =
        attempt.status ||
        "Submitted";

      const date =
        attempt.submittedAt ||
        attempt.completedAt ||
        attempt.createdAt ||
        attempt.updatedAt ||
        null;

      return {
        ...attempt,

        _historyId:
          attempt._id || index,

        testId,

        testTitle,

        section,

        totalMarks,

        score,

        percentage,

        status,

        date,

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
          attempt.readingBand ??
          attempt.listeningBand ??
          attempt.writingBand ??
          attempt.speakingBand ??
          attempt.bandScore ??
          (Number(totalMarks) > 0
            ? Number(((Number(score) / Number(totalMarks)) * 9).toFixed(1))
            : (Number(score) > 0 ? Number(((Number(score) / 40) * 9).toFixed(1)) : null)),
      };
    });
  }, [attempts]);

  // ======================================================
  // Filter History
  // ======================================================

  const filteredAttempts = useMemo(() => {
    let result = [
      ...normalizedAttempts,
    ];

    // ----------------------------------------------------
    // Section Filter
    // ----------------------------------------------------

    if (filter !== "All") {
      result = result.filter(
        (attempt) =>
          attempt.section === filter
      );
    }

    // ----------------------------------------------------
    // Search
    // ----------------------------------------------------

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter(
        (attempt) =>
          attempt.testTitle
            .toLowerCase()
            .includes(searchValue) ||
          attempt.section
            .toLowerCase()
            .includes(searchValue)
      );
    }

    return result;
  }, [
    normalizedAttempts,
    filter,
    search,
  ]);

  // ======================================================
  // Statistics
  // ======================================================

  const statistics = useMemo(() => {
    const total =
      normalizedAttempts.length;

    const submitted =
      normalizedAttempts.filter(
        (attempt) =>
          attempt.status ===
            "Submitted" ||
          attempt.status ===
            "Evaluated"
      ).length;

    const evaluated =
      normalizedAttempts.filter(
        (attempt) =>
          attempt.status ===
          "Evaluated"
      ).length;

    const bands =
      normalizedAttempts
        .map(
          (attempt) =>
            attempt.overallBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined &&
            !Number.isNaN(
              Number(band)
            )
        )
        .map(Number);

    const averageBand =
      bands.length
        ? bands.reduce(
            (sum, band) =>
              sum + band,
            0
          ) / bands.length
        : null;

    const bestBand =
      bands.length
        ? Math.max(...bands)
        : null;

    return {
      total,
      submitted,
      evaluated,
      averageBand,
      bestBand,
    };
  }, [normalizedAttempts]);

  // ======================================================
  // Format Date
  // ======================================================

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

  // ======================================================
  // Format Time
  // ======================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // ======================================================
  // Status Badge
  // ======================================================

  const getStatusClasses = (status) => {
    switch (status) {
      case "Evaluated":
        return "bg-green-50 text-green-700";

      case "Submitted":
        return "bg-blue-50 text-blue-700";

      case "In Progress":
        return "bg-yellow-50 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ======================================================
  // Section Badge
  // ======================================================

  const getSectionClasses = (section) => {
    switch (section) {
      case "Listening":
        return "bg-blue-50 text-blue-600";

      case "Reading":
        return "bg-indigo-50 text-indigo-600";

      case "Writing":
        return "bg-purple-50 text-purple-600";

      case "Speaking":
        return "bg-pink-50 text-pink-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ======================================================
  // Section Icon
  // ======================================================

  const getSectionIcon = (section) => {
    switch (section) {
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
  // View Result
  // ======================================================

  const handleViewResult = (
    attempt
  ) => {
    if (
      !attempt.testId ||
      !attempt._id
    ) {
      return;
    }

    navigate(
      `/student/ielts/tests/${attempt.testId}/results/${attempt._id}`
    );
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
            Loading IELTS test history...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Please wait.
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
            Test History Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadTestHistory}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Empty State
  // ======================================================

  if (!normalizedAttempts.length) {
    return (
      <div className="space-y-6">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            IELTS Test History
          </h1>

          <p className="mt-2 text-slate-500">
            View all your previous IELTS practice test
            attempts.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📝
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No Tests Attempted Yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your completed IELTS practice tests will
            appear here.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/tests"
              )
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Start IELTS Practice
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Render
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
              IELTS Test History
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              View your previous practice tests, scores,
              bands, and evaluation status.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/tests"
              )
            }
            className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            Take New Test
          </button>

        </div>

      </div>


      {/* ==================================================
          Statistics
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Total Attempts
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {statistics.total}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📝
            </div>

          </div>

        </div>


        {/* Submitted */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Submitted
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {statistics.submitted}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              ✓
            </div>

          </div>

        </div>


        {/* Evaluated */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Evaluated
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {statistics.evaluated}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
              🏆
            </div>

          </div>

        </div>


        {/* Average Band */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Average Band
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-600">
                {statistics.averageBand !==
                null
                  ? statistics.averageBand.toFixed(
                      1
                    )
                  : "—"}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
              🎯
            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          Search + Filters
      ================================================== */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}

          <div className="relative w-full lg:max-w-md">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search test name or section..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />

          </div>


          {/* Section Filters */}

          <div className="flex flex-wrap gap-2">

            {[
              "All",
              "Listening",
              "Reading",
              "Writing",
              "Speaking",
            ].map(
              (item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === item
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>

              )
            )}

          </div>

        </div>

      </div>


      {/* ==================================================
          Result Count
      ================================================== */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Previous Attempts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredAttempts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {normalizedAttempts.length}
            </span>{" "}
            attempts.
          </p>

        </div>

      </div>


      {/* ==================================================
          No Filter Results
      ================================================== */}

      {!filteredAttempts.length ? (

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            🔎
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-800">
            No Matching Attempts
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try changing the search text or section
            filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("All");
            }}
            className="mt-5 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear Filters
          </button>

        </div>

      ) : (

        <>

          {/* ==================================================
              Desktop Table
          ================================================== */}

          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm lg:block">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50 text-left">

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Test
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Section
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Score
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Percentage
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Overall Band
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAttempts.map(
                    (attempt) => (

                      <tr
                        key={
                          attempt._historyId
                        }
                        className="border-b border-slate-50 transition hover:bg-slate-50"
                      >

                        {/* Test */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                              {getSectionIcon(
                                attempt.section
                              )}
                            </div>

                            <div>

                              <p className="font-semibold text-slate-700">
                                {
                                  attempt.testTitle
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                IELTS Practice
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Section */}

                        <td className="px-5 py-5">

                          {attempt.section ? (

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getSectionClasses(
                                attempt.section
                              )}`}
                            >
                              {
                                attempt.section
                              }
                            </span>

                          ) : (

                            <span className="text-sm text-slate-400">
                              —
                            </span>

                          )}

                        </td>


                        {/* Date */}

                        <td className="px-5 py-5">

                          <p className="text-sm font-medium text-slate-700">
                            {formatDate(
                              attempt.date
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatTime(
                              attempt.date
                            )}
                          </p>

                        </td>


                        {/* Score */}

                        <td className="px-5 py-5">

                          <span className="text-sm font-semibold text-slate-700">

                            {attempt.score}

                            {attempt.totalMarks
                              ? ` / ${attempt.totalMarks}`
                              : ""}

                          </span>

                        </td>


                        {/* Percentage */}

                        <td className="px-5 py-5">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">

                            {Number(
                              attempt.percentage
                            ).toFixed(
                              1
                            )}
                            %

                          </span>

                        </td>


                        {/* Overall Band */}

                        <td className="px-5 py-5">

                          {attempt.overallBand !==
                          null ? (

                            <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-600">
                              {
                                attempt.overallBand
                              }
                            </span>

                          ) : (

                            <span className="text-sm text-slate-400">
                              —
                            </span>

                          )}

                        </td>


                        {/* Status */}

                        <td className="px-5 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              attempt.status
                            )}`}
                          >
                            {
                              attempt.status
                            }
                          </span>

                        </td>


                        {/* Action */}

                        <td className="px-5 py-5">

                          {attempt.testId &&
                          attempt._id ? (

                            <button
                              type="button"
                              onClick={() =>
                                handleViewResult(
                                  attempt
                                )
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                            >
                              View Result
                            </button>

                          ) : (

                            <span className="text-xs text-slate-400">
                              Unavailable
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>


          {/* ==================================================
              Mobile Cards
          ================================================== */}

          <div className="space-y-4 lg:hidden">

            {filteredAttempts.map(
              (attempt) => (

                <div
                  key={
                    attempt._historyId
                  }
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >

                  {/* Header */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        {getSectionIcon(
                          attempt.section
                        )}
                      </div>

                      <div>

                        <h3 className="font-bold text-slate-800">
                          {
                            attempt.testTitle
                          }
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            attempt.date
                          )}
                        </p>

                      </div>

                    </div>


                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        attempt.status
                      )}`}
                    >
                      {
                        attempt.status
                      }
                    </span>

                  </div>


                  {/* Section */}

                  {attempt.section && (
                    <div className="mt-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getSectionClasses(
                          attempt.section
                        )}`}
                      >
                        {
                          attempt.section
                        }
                      </span>

                    </div>
                  )}


                  {/* Score Grid */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs text-slate-400">
                        Score
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-800">

                        {attempt.score}

                        {attempt.totalMarks
                          ? ` / ${attempt.totalMarks}`
                          : ""}

                      </p>

                    </div>


                    <div className="rounded-xl bg-blue-50 p-4">

                      <p className="text-xs text-blue-400">
                        Percentage
                      </p>

                      <p className="mt-1 text-lg font-bold text-blue-600">

                        {Number(
                          attempt.percentage
                        ).toFixed(
                          1
                        )}
                        %

                      </p>

                    </div>


                    <div className="rounded-xl bg-purple-50 p-4">

                      <p className="text-xs text-purple-400">
                        Overall Band
                      </p>

                      <p className="mt-1 text-lg font-bold text-purple-600">

                        {attempt.overallBand !==
                        null
                          ? attempt.overallBand
                          : "—"}

                      </p>

                    </div>


                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs text-slate-400">
                        Submitted
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatTime(
                          attempt.date
                        )}
                      </p>

                    </div>

                  </div>


                  {/* Section Bands */}

                  {(attempt.listeningBand !==
                    null ||
                    attempt.readingBand !==
                      null ||
                    attempt.writingBand !==
                      null ||
                    attempt.speakingBand !==
                      null) && (

                    <div className="mt-5 border-t border-slate-100 pt-4">

                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Section Bands
                      </p>

                      <div className="grid grid-cols-2 gap-2">

                        <div className="flex justify-between rounded-lg bg-blue-50 px-3 py-2">

                          <span className="text-xs text-blue-600">
                            Listening
                          </span>

                          <span className="text-xs font-bold text-blue-700">
                            {attempt.listeningBand ??
                              "—"}
                          </span>

                        </div>

                        <div className="flex justify-between rounded-lg bg-indigo-50 px-3 py-2">

                          <span className="text-xs text-indigo-600">
                            Reading
                          </span>

                          <span className="text-xs font-bold text-indigo-700">
                            {attempt.readingBand ??
                              "—"}
                          </span>

                        </div>

                        <div className="flex justify-between rounded-lg bg-purple-50 px-3 py-2">

                          <span className="text-xs text-purple-600">
                            Writing
                          </span>

                          <span className="text-xs font-bold text-purple-700">
                            {attempt.writingBand ??
                              "—"}
                          </span>

                        </div>

                        <div className="flex justify-between rounded-lg bg-pink-50 px-3 py-2">

                          <span className="text-xs text-pink-600">
                            Speaking
                          </span>

                          <span className="text-xs font-bold text-pink-700">
                            {attempt.speakingBand ??
                              "—"}
                          </span>

                        </div>

                      </div>

                    </div>

                  )}


                  {/* Action */}

                  {attempt.testId &&
                  attempt._id && (

                    <button
                      type="button"
                      onClick={() =>
                        handleViewResult(
                          attempt
                        )
                      }
                      className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      View Result
                    </button>

                  )}

                </div>

              )
            )}

          </div>

        </>

      )}


      {/* ==================================================
          Bottom Navigation
      ================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/progress"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          IELTS Progress
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/progress/performance"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Performance Breakdown
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/tests"
            )
          }
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Practice Again
        </button>

      </div>

    </div>
  );
};

export default IELTSTestHistory;