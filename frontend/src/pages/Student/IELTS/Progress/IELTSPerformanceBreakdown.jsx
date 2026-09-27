import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSPerformanceBreakdown = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load IELTS Attempts
  // ======================================================

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPreviousAttempts();

      if (!response || !response.success) {
        setError(
          response?.message ||
            "Unable to load IELTS performance."
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
        "IELTS Performance Breakdown Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS performance."
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

      return {
        ...attempt,

        _performanceId:
          attempt._id || index,

        testTitle:
          test.title ||
          attempt.testTitle ||
          "IELTS Practice Test",

        section:
          test.section ||
          attempt.section ||
          "",

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

        date:
          attempt.submittedAt ||
          attempt.completedAt ||
          attempt.createdAt ||
          null,
      };
    });
  }, [attempts]);

  // ======================================================
  // Section Statistics
  // ======================================================

  const sectionStatistics = useMemo(() => {
    const sections = {
      Listening: [],
      Reading: [],
      Writing: [],
      Speaking: [],
    };

    normalizedAttempts.forEach(
      (attempt) => {
        if (
          attempt.listeningBand !== null &&
          attempt.listeningBand !== undefined
        ) {
          sections.Listening.push(
            Number(attempt.listeningBand)
          );
        }

        if (
          attempt.readingBand !== null &&
          attempt.readingBand !== undefined
        ) {
          sections.Reading.push(
            Number(attempt.readingBand)
          );
        }

        if (
          attempt.writingBand !== null &&
          attempt.writingBand !== undefined
        ) {
          sections.Writing.push(
            Number(attempt.writingBand)
          );
        }

        if (
          attempt.speakingBand !== null &&
          attempt.speakingBand !== undefined
        ) {
          sections.Speaking.push(
            Number(attempt.speakingBand)
          );
        }
      }
    );

    return Object.entries(sections).map(
      ([name, values]) => {
        if (!values.length) {
          return {
            name,
            attempts: 0,
            average: null,
            best: null,
            latest: null,
            improvement: null,
          };
        }

        const average =
          values.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / values.length;

        const best =
          Math.max(...values);

        const latest =
          values[0];

        const improvement =
          values.length >= 2
            ? values[0] -
              values[values.length - 1]
            : null;

        return {
          name,
          attempts: values.length,
          average,
          best,
          latest,
          improvement,
        };
      }
    );
  }, [normalizedAttempts]);

  // ======================================================
  // Overall Statistics
  // ======================================================

  const overallStatistics = useMemo(() => {
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

    if (!bands.length) {
      return {
        average: null,
        best: null,
        latest: null,
        improvement: null,
      };
    }

    const average =
      bands.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / bands.length;

    const best =
      Math.max(...bands);

    const latest =
      bands[0];

    const improvement =
      bands.length >= 2
        ? bands[0] -
          bands[bands.length - 1]
        : null;

    return {
      average,
      best,
      latest,
      improvement,
    };
  }, [normalizedAttempts]);

  // ======================================================
  // Strongest / Weakest
  // ======================================================

  const sectionAnalysis = useMemo(() => {
    const available =
      sectionStatistics.filter(
        (section) =>
          section.average !== null
      );

    if (!available.length) {
      return {
        strongest: null,
        weakest: null,
      };
    }

    const sorted = [
      ...available,
    ].sort(
      (a, b) =>
        b.average - a.average
    );

    return {
      strongest: sorted[0],
      weakest:
        sorted[sorted.length - 1],
    };
  }, [sectionStatistics]);

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
  // Section Icon
  // ======================================================

  const getSectionIcon = (name) => {
    switch (name) {
      case "Listening":
        return "🎧";

      case "Reading":
        return "📖";

      case "Writing":
        return "✍️";

      case "Speaking":
        return "🎤";

      default:
        return "📚";
    }
  };

  // ======================================================
  // Band Progress Width
  // ======================================================

  const getBandWidth = (band) => {
    if (
      band === null ||
      band === undefined
    ) {
      return 0;
    }

    return Math.min(
      Math.max(
        (Number(band) / 9) * 100,
        0
      ),
      100
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
            Loading IELTS performance...
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
            Performance Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadPerformance}
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
            IELTS Performance Breakdown
          </h1>

          <p className="mt-2 text-slate-500">
            Analyze your performance across all IELTS
            sections.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📊
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No Performance Data Yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete an IELTS practice test to see your
            detailed section performance.
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

      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-sm sm:p-8">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <p className="text-sm text-blue-100">
              IELTS Student Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Performance Breakdown
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Analyze your Listening, Reading, Writing,
              and Speaking performance and identify areas
              that need improvement.
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
            View Progress
          </button>

        </div>

      </div>


      {/* ==================================================
          Overall Performance
      ================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-xl font-bold text-slate-800">
            Overall Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your overall IELTS band performance.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Latest */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Latest Band
            </p>

            <p className="mt-2 text-4xl font-bold text-blue-600">
              {overallStatistics.latest !== null
                ? overallStatistics.latest
                : "—"}
            </p>

          </div>


          {/* Average */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Average Band
            </p>

            <p className="mt-2 text-4xl font-bold text-purple-600">
              {overallStatistics.average !== null
                ? overallStatistics.average.toFixed(
                    1
                  )
                : "—"}
            </p>

          </div>


          {/* Best */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Best Band
            </p>

            <p className="mt-2 text-4xl font-bold text-green-600">
              {overallStatistics.best !== null
                ? overallStatistics.best
                : "—"}
            </p>

          </div>


          {/* Improvement */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Improvement
            </p>

            <p
              className={`mt-2 text-4xl font-bold ${
                overallStatistics.improvement ===
                null
                  ? "text-slate-400"
                  : overallStatistics.improvement >
                    0
                  ? "text-green-600"
                  : overallStatistics.improvement <
                    0
                  ? "text-red-600"
                  : "text-slate-600"
              }`}
            >
              {overallStatistics.improvement ===
              null
                ? "—"
                : overallStatistics.improvement >
                  0
                ? `+${overallStatistics.improvement.toFixed(
                    1
                  )}`
                : overallStatistics.improvement.toFixed(
                    1
                  )}
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          Section Breakdown
      ================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-xl font-bold text-slate-800">
            Section Breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed performance for each IELTS skill.
          </p>

        </div>


        <div className="grid gap-5 md:grid-cols-2">

          {sectionStatistics.map(
            (section) => (

              <div
                key={section.name}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                {/* Section Header */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                      {getSectionIcon(
                        section.name
                      )}
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-slate-800">
                        {section.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        {section.attempts} attempt
                        {section.attempts !==
                        1
                          ? "s"
                          : ""}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-3xl font-bold text-blue-600">

                      {section.latest !==
                      null
                        ? section.latest
                        : "—"}

                    </p>

                    <p className="text-xs text-slate-400">
                      Latest Band
                    </p>

                  </div>

                </div>


                {/* Average / Best */}

                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Average Band
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-800">

                      {section.average !==
                      null
                        ? section.average.toFixed(
                            1
                          )
                        : "—"}

                    </p>

                  </div>


                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Best Band
                    </p>

                    <p className="mt-1 text-xl font-bold text-green-600">

                      {section.best !==
                      null
                        ? section.best
                        : "—"}

                    </p>

                  </div>

                </div>


                {/* Band Progress */}

                <div className="mt-6">

                  <div className="mb-2 flex justify-between">

                    <span className="text-xs font-medium text-slate-500">
                      Band Progress
                    </span>

                    <span className="text-xs font-bold text-slate-600">
                      {section.average !==
                      null
                        ? `${section.average.toFixed(
                            1
                          )} / 9`
                        : "—"}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${getBandWidth(
                          section.average
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                {/* Improvement */}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="text-sm text-slate-500">
                    Improvement
                  </span>

                  <span
                    className={`font-semibold ${
                      section.improvement ===
                      null
                        ? "text-slate-400"
                        : section.improvement >
                          0
                        ? "text-green-600"
                        : section.improvement <
                          0
                        ? "text-red-600"
                        : "text-slate-600"
                    }`}
                  >

                    {section.improvement ===
                    null
                      ? "Not enough data"
                      : section.improvement >
                        0
                      ? `+${section.improvement.toFixed(
                          1
                        )}`
                      : section.improvement.toFixed(
                          1
                        )}

                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          Strongest / Weakest
      ================================================== */}

      <section className="grid gap-5 md:grid-cols-2">

        {/* Strongest */}

        <div className="rounded-2xl border border-green-100 bg-green-50 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-xl text-white">
              🏆
            </div>

            <div>

              <p className="text-sm font-medium text-green-700">
                Strongest Section
              </p>

              <h2 className="mt-1 text-2xl font-bold text-green-800">

                {sectionAnalysis.strongest
                  ? sectionAnalysis.strongest.name
                  : "Not available"}

              </h2>

              {sectionAnalysis.strongest && (
                <p className="mt-1 text-sm text-green-700">
                  Average Band:{" "}
                  {sectionAnalysis.strongest.average.toFixed(
                    1
                  )}
                </p>
              )}

            </div>

          </div>

        </div>


        {/* Weakest */}

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xl text-white">
              🎯
            </div>

            <div>

              <p className="text-sm font-medium text-orange-700">
                Focus Area
              </p>

              <h2 className="mt-1 text-2xl font-bold text-orange-800">

                {sectionAnalysis.weakest
                  ? sectionAnalysis.weakest.name
                  : "Not available"}

              </h2>

              {sectionAnalysis.weakest && (
                <p className="mt-1 text-sm text-orange-700">
                  Average Band:{" "}
                  {sectionAnalysis.weakest.average.toFixed(
                    1
                  )}
                </p>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          Attempt-wise Breakdown
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="text-xl font-bold text-slate-800">
            Attempt-wise Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare your IELTS section bands across
            previous attempts.
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>

              <tr className="border-b border-slate-100 text-left">

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Test
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Date
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Listening
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reading
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Writing
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Speaking
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Overall
                </th>

              </tr>

            </thead>

            <tbody>

              {normalizedAttempts
                .slice(0, 15)
                .map((attempt) => (

                  <tr
                    key={
                      attempt._performanceId
                    }
                    className="border-b border-slate-50 transition hover:bg-slate-50"
                  >

                    <td className="px-4 py-4">

                      <p className="font-semibold text-slate-700">
                        {attempt.testTitle}
                      </p>

                      {attempt.section && (
                        <p className="text-xs text-slate-400">
                          {attempt.section}
                        </p>
                      )}

                    </td>


                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(
                        attempt.date
                      )}
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

                      {attempt.writingBand !==
                      null ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                          {attempt.writingBand}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.speakingBand !==
                      null ? (
                        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
                          {attempt.speakingBand}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.overallBand !==
                      null ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                          {attempt.overallBand}
                        </span>
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

      </section>


      {/* ==================================================
          Performance Guidance
      ================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            💡
          </div>

          <div>

            <h2 className="text-lg font-bold text-blue-900">
              Performance Insight
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-800">

              {sectionAnalysis.weakest
                ? `Your current focus area is ${sectionAnalysis.weakest.name}. Review your practice results regularly and spend additional time practicing this section.`
                : "Continue completing IELTS practice tests to generate more performance data."}

            </p>

          </div>

        </div>

      </section>


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
              "/student/ielts/progress"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Progress
        </button>

      </div>

    </div>
  );
};

export default IELTSPerformanceBreakdown;