import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSStudentProgress = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Student Attempts
  // ======================================================

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPreviousAttempts();

      if (!response || !response.success) {
        setError(
          response?.message ||
            "Unable to load IELTS progress."
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
        "IELTS Student Progress Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS progress."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Normalize Attempt
  // ======================================================

  const normalizedAttempts = useMemo(() => {
    return attempts.map((attempt, index) => {
      const test =
        attempt.test ||
        attempt.practiceTest ||
        {};

      const score =
        attempt.score ??
        attempt.obtainedMarks ??
        attempt.totalScore ??
        0;

      const totalMarks =
        attempt.totalMarks ??
        test.totalMarks ??
        0;

      const percentage =
        attempt.percentage ??
        (
          Number(totalMarks) > 0
            ? (
                Number(score) /
                Number(totalMarks)
              ) * 100
            : 0
        );

      const band =
        attempt.overallBand ??
        attempt.bandScore ??
        null;

      const date =
        attempt.submittedAt ||
        attempt.completedAt ||
        attempt.createdAt ||
        null;

      return {
        ...attempt,

        _progressId:
          attempt._id || index,

        testTitle:
          test.title ||
          attempt.testTitle ||
          "IELTS Practice Test",

        testSection:
          test.section ||
          attempt.section ||
          "",

        score,

        totalMarks,

        percentage,

        band,

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

        date,
      };
    });
  }, [attempts]);

  // ======================================================
  // Statistics
  // ======================================================

  const statistics = useMemo(() => {
    if (!normalizedAttempts.length) {
      return {
        tests: 0,
        averagePercentage: 0,
        bestPercentage: 0,
        averageBand: null,
        bestBand: null,
        latestBand: null,
      };
    }

    const percentages =
      normalizedAttempts.map(
        (item) =>
          Number(item.percentage) || 0
      );

    const bands =
      normalizedAttempts
        .map((item) =>
          item.band !== null &&
          item.band !== undefined
            ? Number(item.band)
            : null
        )
        .filter(
          (band) =>
            band !== null &&
            !Number.isNaN(band)
        );

    const averagePercentage =
      percentages.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / percentages.length;

    const bestPercentage =
      Math.max(...percentages);

    const averageBand =
      bands.length
        ? bands.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / bands.length
        : null;

    const bestBand =
      bands.length
        ? Math.max(...bands)
        : null;

    const latestBand =
      normalizedAttempts[0]?.band ??
      null;

    return {
      tests:
        normalizedAttempts.length,

      averagePercentage,

      bestPercentage,

      averageBand,

      bestBand,

      latestBand,
    };
  }, [normalizedAttempts]);

  // ======================================================
  // Section Progress
  // ======================================================

  const sectionProgress = useMemo(() => {
    const sections = {
      Listening: [],
      Reading: [],
      Writing: [],
      Speaking: [],
    };

    normalizedAttempts.forEach(
      (attempt) => {
        const scores =
          attempt.sectionScores ||
          attempt.scores ||
          {};

        // ----------------------------------------------
        // Listening
        // ----------------------------------------------

        const listening =
          attempt.listeningBand ??
          attempt.listening?.band ??
          scores.listeningBand ??
          scores.listening ??
          scores.Listening ??
          attempt.listeningScore;

        // ----------------------------------------------
        // Reading
        // ----------------------------------------------

        const reading =
          attempt.readingBand ??
          attempt.reading?.band ??
          scores.readingBand ??
          scores.reading ??
          scores.Reading ??
          attempt.readingScore;

        // ----------------------------------------------
        // Writing
        // ----------------------------------------------

        const writing =
          attempt.writingBand ??
          attempt.writing?.band ??
          scores.writingBand ??
          scores.writing ??
          scores.Writing ??
          attempt.writingScore;

        // ----------------------------------------------
        // Speaking
        // ----------------------------------------------

        const speaking =
          attempt.speakingBand ??
          attempt.speaking?.band ??
          scores.speakingBand ??
          scores.speaking ??
          scores.Speaking ??
          attempt.speakingScore;

        if (
          listening !== undefined &&
          listening !== null &&
          !Number.isNaN(Number(listening))
        ) {
          sections.Listening.push(
            Number(listening)
          );
        }

        if (
          reading !== undefined &&
          reading !== null &&
          !Number.isNaN(Number(reading))
        ) {
          sections.Reading.push(
            Number(reading)
          );
        }

        if (
          writing !== undefined &&
          writing !== null &&
          !Number.isNaN(Number(writing))
        ) {
          sections.Writing.push(
            Number(writing)
          );
        }

        if (
          speaking !== undefined &&
          speaking !== null &&
          !Number.isNaN(Number(speaking))
        ) {
          sections.Speaking.push(
            Number(speaking)
          );
        }
      }
    );

    return Object.entries(
      sections
    ).map(
      ([name, values]) => ({
        name,

        average:
          values.length
            ? values.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) / values.length
            : null,

        latest:
          values.length
            ? values[
                values.length - 1
              ]
            : null,

        best:
          values.length
            ? Math.max(...values)
            : null,

        attempts:
          values.length,
      })
    );
  }, [normalizedAttempts]);

  // ======================================================
  // Strongest / Weakest Section
  // ======================================================

  const sectionAnalysis = useMemo(() => {
    const availableSections =
      sectionProgress.filter(
        (section) =>
          section.average !== null
      );

    if (!availableSections.length) {
      return {
        strongest: null,
        weakest: null,
      };
    }

    const sorted = [
      ...availableSections,
    ].sort(
      (a, b) =>
        b.average - a.average
    );

    return {
      strongest: sorted[0],
      weakest:
        sorted[sorted.length - 1],
    };
  }, [sectionProgress]);

  // ======================================================
  // Improvement
  // ======================================================

  const improvement = useMemo(() => {
    const bands =
      normalizedAttempts
        .map((attempt) =>
          attempt.band !== null &&
          attempt.band !== undefined
            ? Number(attempt.band)
            : null
        )
        .filter(
          (band) =>
            band !== null &&
            !Number.isNaN(band)
        );

    if (bands.length < 2) {
      return null;
    }

    return (
      bands[0] -
      bands[bands.length - 1]
    );
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
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="font-semibold text-slate-700">
            Loading your IELTS progress...
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
            Progress Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadProgress}
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
            IELTS Progress
          </h1>

          <p className="mt-2 text-slate-500">
            Track your IELTS preparation and performance.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📈
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No Test Attempts Yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete your first IELTS practice test to
            start tracking your progress.
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
              My IELTS Progress
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Track your practice tests, scores, band
              performance, and improvement over time.
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
          Statistics Cards
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Tests */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Tests Attempted
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {statistics.tests}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📝
            </div>

          </div>

        </div>


        {/* Average Percentage */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Average Score
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {statistics.averagePercentage.toFixed(
                  1
                )}
                %
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📊
            </div>

          </div>

        </div>


        {/* Best Percentage */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Best Score
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {statistics.bestPercentage.toFixed(
                  1
                )}
                %
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
              🏆
            </div>

          </div>

        </div>


        {/* Latest / Average Band */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Latest Band
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-600">
                {statistics.latestBand !== null
                  ? statistics.latestBand
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
          Band Overview
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Average Band
          </p>

          <p className="mt-2 text-2xl font-bold text-purple-600">
            {statistics.averageBand !== null
              ? statistics.averageBand.toFixed(1)
              : "—"}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Best Band
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {statistics.bestBand !== null
              ? statistics.bestBand
              : "—"}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Improvement
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              improvement === null
                ? "text-slate-400"
                : improvement > 0
                ? "text-green-600"
                : improvement < 0
                ? "text-red-600"
                : "text-slate-600"
            }`}
          >
            {improvement === null
              ? "—"
              : improvement > 0
              ? `+${improvement.toFixed(1)}`
              : improvement.toFixed(1)}
          </p>

        </div>

      </div>


      {/* ==================================================
          Progress Overview
      ================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Score Progress */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Score Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your recent test performance.
              </p>

            </div>

            <span className="text-xl">
              📈
            </span>

          </div>

          <div className="mt-6 space-y-5">

            {normalizedAttempts
              .slice(0, 6)
              .map((attempt, index) => (

                <div
                  key={
                    attempt._progressId
                  }
                >

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex min-w-0 items-center gap-3">

                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {index + 1}
                      </span>

                      <span className="truncate text-sm font-medium text-slate-700">
                        {attempt.testTitle}
                      </span>

                    </div>

                    <span className="ml-3 text-sm font-bold text-blue-600">
                      {Number(
                        attempt.percentage
                      ).toFixed(1)}
                      %
                    </span>

                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            Number(
                              attempt.percentage
                            ) || 0,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

          </div>

        </div>


        {/* Section Performance */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Section Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your average IELTS band by skill.
              </p>

            </div>

            <span className="text-xl">
              📚
            </span>

          </div>

          <div className="mt-6 space-y-5">

            {sectionProgress.map(
              (section) => {

                const value =
                  section.average !== null
                    ? Math.min(
                        Math.max(
                          (section.average /
                            9) *
                            100,
                          0
                        ),
                        100
                      )
                    : 0;

                return (
                  <div
                    key={
                      section.name
                    }
                  >

                    <div className="mb-2 flex items-center justify-between">

                      <div>

                        <span className="text-sm font-semibold text-slate-700">
                          {section.name}
                        </span>

                        {section.attempts >
                          0 && (
                          <span className="ml-2 text-xs text-slate-400">
                            {section.attempts}{" "}
                            attempt
                            {section.attempts !==
                            1
                              ? "s"
                              : ""}
                          </span>
                        )}

                      </div>

                      <span className="text-sm font-bold text-slate-700">

                        {section.average !==
                        null
                          ? section.average.toFixed(
                              1
                            )
                          : "—"}

                      </span>

                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{
                          width: `${value}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>


      {/* ==================================================
          Strongest / Weakest Section
      ================================================== */}

      <div className="grid gap-5 md:grid-cols-2">

        {/* Strongest */}

        <div className="rounded-2xl border border-green-100 bg-green-50 p-6">

          <p className="text-sm font-medium text-green-700">
            Strongest Section
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-800">

            {sectionAnalysis.strongest
              ? sectionAnalysis.strongest.name
              : "Not available"}

          </h2>

          {sectionAnalysis.strongest && (
            <p className="mt-2 text-sm text-green-700">
              Average Band:{" "}
              {sectionAnalysis.strongest.average.toFixed(
                1
              )}
            </p>
          )}

        </div>


        {/* Weakest */}

        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">

          <p className="text-sm font-medium text-red-700">
            Section That Needs Improvement
          </p>

          <h2 className="mt-2 text-2xl font-bold text-red-800">

            {sectionAnalysis.weakest
              ? sectionAnalysis.weakest.name
              : "Not available"}

          </h2>

          {sectionAnalysis.weakest && (
            <p className="mt-2 text-sm text-red-700">
              Average Band:{" "}
              {sectionAnalysis.weakest.average.toFixed(
                1
              )}
            </p>
          )}

        </div>

      </div>


      {/* ==================================================
          Recent Attempts
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Recent Test Attempts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review your previous IELTS practice tests.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/tests"
              )
            }
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Take New Test →
          </button>

        </div>


        <div className="mt-6 overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="border-b border-slate-100 text-left">

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Test
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Date
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Score
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Percentage
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Listening
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reading
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Overall
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {normalizedAttempts
                .slice(0, 10)
                .map((attempt) => (

                  <tr
                    key={
                      attempt._progressId
                    }
                    className="border-b border-slate-50 transition hover:bg-slate-50"
                  >

                    <td className="px-4 py-4">

                      <p className="font-semibold text-slate-700">
                        {attempt.testTitle}
                      </p>

                      {attempt.testSection && (
                        <p className="text-xs text-slate-400">
                          {attempt.testSection}
                        </p>
                      )}

                    </td>


                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(
                        attempt.date
                      )}
                    </td>


                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">

                      {attempt.score}

                      {attempt.totalMarks
                        ? ` / ${attempt.totalMarks}`
                        : ""}

                    </td>


                    <td className="px-4 py-4">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">

                        {Number(
                          attempt.percentage
                        ).toFixed(1)}
                        %

                      </span>

                    </td>


                    <td className="px-4 py-4">

                      {attempt.listeningBand !==
                      null ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          {attempt.listeningBand}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.readingBand !==
                      null ? (
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {attempt.readingBand}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.band !==
                      null ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                          {attempt.band}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt._id ? (

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/student/ielts/tests/${
                                attempt.test?._id ||
                                attempt.test
                              }/results/${
                                attempt._id
                              }`
                            )
                          }
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View Result
                        </button>

                      ) : (

                        <span className="text-sm text-slate-400">
                          —
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* ==================================================
          Improvement Section
      ================================================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            💡
          </div>

          <div>

            <h2 className="text-lg font-bold text-blue-900">
              Keep Improving
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Continue taking practice tests and review
              your detailed results after every attempt.
              Focus especially on sections where your
              performance is lower.
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          Bottom Actions
      ================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

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

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          IELTS Dashboard
        </button>

      </div>

    </div>
  );
};

export default IELTSStudentProgress;