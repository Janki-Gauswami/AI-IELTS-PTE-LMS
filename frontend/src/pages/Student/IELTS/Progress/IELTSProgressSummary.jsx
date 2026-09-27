import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSProgressSummary = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Student Attempts
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

            percentage:
              attempt.percentage ??
              0,

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

          return first - second;
        });

      setAttempts(normalized);
    } catch (err) {
      console.error(
        "IELTS Progress Summary Error:",
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
  // Latest Attempt
  // ======================================================

  const latestAttempt = useMemo(() => {
    if (!attempts.length) {
      return null;
    }

    return attempts[
      attempts.length - 1
    ];
  }, [attempts]);

  // ======================================================
  // First Attempt
  // ======================================================

  const firstAttempt = useMemo(() => {
    if (!attempts.length) {
      return null;
    }

    return attempts[0];
  }, [attempts]);

  // ======================================================
  // Best Overall Band
  // ======================================================

  const bestOverallBand = useMemo(() => {
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

    if (!bands.length) {
      return null;
    }

    return Math.max(...bands);
  }, [attempts]);

  // ======================================================
  // Average Overall Band
  // ======================================================

  const averageOverallBand =
    useMemo(() => {
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

      if (!bands.length) {
        return null;
      }

      const total = bands.reduce(
        (sum, band) =>
          sum + band,
        0
      );

      return total / bands.length;
    }, [attempts]);

  // ======================================================
  // Improvement
  // ======================================================

  const improvement = useMemo(() => {
    if (
      !firstAttempt ||
      !latestAttempt
    ) {
      return null;
    }

    if (
      firstAttempt.overallBand ===
        null ||
      latestAttempt.overallBand ===
        null ||
      firstAttempt.overallBand ===
        undefined ||
      latestAttempt.overallBand ===
        undefined
    ) {
      return null;
    }

    return (
      Number(
        latestAttempt.overallBand
      ) -
      Number(
        firstAttempt.overallBand
      )
    );
  }, [
    firstAttempt,
    latestAttempt,
  ]);

  // ======================================================
  // Section Summary
  // ======================================================

  const sectionSummary =
    useMemo(() => {
      if (!latestAttempt) {
        return [];
      }

      return [
        {
          name: "Listening",
          key: "listeningBand",
          icon: "🎧",
          value:
            latestAttempt.listeningBand,
        },
        {
          name: "Reading",
          key: "readingBand",
          icon: "📖",
          value:
            latestAttempt.readingBand,
        },
        {
          name: "Writing",
          key: "writingBand",
          icon: "✍️",
          value:
            latestAttempt.writingBand,
        },
        {
          name: "Speaking",
          key: "speakingBand",
          icon: "🎤",
          value:
            latestAttempt.speakingBand,
        },
      ];
    }, [latestAttempt]);

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

  const getBandStatus = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "Not available";
    }

    const band = Number(value);

    if (band >= 8) {
      return "Excellent";
    }

    if (band >= 7) {
      return "Strong";
    }

    if (band >= 6) {
      return "Good";
    }

    if (band >= 5) {
      return "Developing";
    }

    return "Needs Practice";
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
            Loading IELTS progress...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Preparing your performance summary.
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
            Unable to Load IELTS Progress
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
  // No Attempts
  // ======================================================

  if (!attempts.length) {
    return (
      <div className="space-y-6">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            IELTS Progress Summary
          </h1>

          <p className="mt-2 text-slate-500">
            View your IELTS performance and progress.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📊
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No IELTS Attempts Yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete an IELTS practice test to start
            tracking your progress.
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
              IELTS Progress Summary
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Track your IELTS performance, latest band,
              best score and improvement over time.
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
            Practice IELTS
          </button>

        </div>

      </div>


      {/* ==================================================
          Main Statistics
      ================================================== */}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* Attempts */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              📝
            </div>

            <span className="text-xs font-semibold text-slate-400">
              TOTAL
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            IELTS Attempts
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {attempts.length}
          </p>

        </div>


        {/* Latest */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              🎯
            </div>

            <span className="text-xs font-semibold text-slate-400">
              LATEST
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Latest Overall Band
          </p>

          <p className="mt-1 text-3xl font-bold text-indigo-600">
            {formatBand(
              latestAttempt?.overallBand
            )}
          </p>

        </div>


        {/* Best */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
              🏆
            </div>

            <span className="text-xs font-semibold text-slate-400">
              BEST
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Best Overall Band
          </p>

          <p className="mt-1 text-3xl font-bold text-green-600">
            {formatBand(
              bestOverallBand
            )}
          </p>

        </div>


        {/* Average */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              📈
            </div>

            <span className="text-xs font-semibold text-slate-400">
              AVERAGE
            </span>

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Average Overall Band
          </p>

          <p className="mt-1 text-3xl font-bold text-purple-600">
            {formatBand(
              averageOverallBand
            )}
          </p>

        </div>

      </section>


      {/* ==================================================
          Latest Performance
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Latest Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {latestAttempt?.title}
            </p>

          </div>

          <p className="text-sm text-slate-400">
            {formatDate(
              latestAttempt?.date
            )}
          </p>

        </div>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {sectionSummary.map(
            (section) => (

              <div
                key={section.name}
                className="rounded-2xl border border-slate-100 p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                    {section.icon}
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    {getBandStatus(
                      section.value
                    )}
                  </span>

                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {section.name}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {formatBand(
                    section.value
                  )}
                </p>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          Improvement
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Overall Improvement
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Difference between your first and latest
            recorded overall band.
          </p>

        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-slate-50 p-6 text-center">

            <p className="text-xs font-semibold text-slate-400">
              FIRST ATTEMPT
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-700">
              {formatBand(
                firstAttempt?.overallBand
              )}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {formatDate(
                firstAttempt?.date
              )}
            </p>

          </div>


          <div className="rounded-2xl bg-blue-50 p-6 text-center">

            <p className="text-xs font-semibold text-blue-400">
              CHANGE
            </p>

            <p
              className={`mt-2 text-4xl font-bold ${
                improvement > 0
                  ? "text-green-600"
                  : improvement < 0
                  ? "text-red-600"
                  : "text-slate-600"
              }`}
            >
              {improvement ===
              null
                ? "—"
                : improvement > 0
                ? `+${improvement.toFixed(
                    1
                  )}`
                : improvement.toFixed(
                    1
                  )}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Band change
            </p>

          </div>


          <div className="rounded-2xl bg-indigo-50 p-6 text-center">

            <p className="text-xs font-semibold text-indigo-400">
              LATEST ATTEMPT
            </p>

            <p className="mt-2 text-4xl font-bold text-indigo-600">
              {formatBand(
                latestAttempt?.overallBand
              )}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {formatDate(
                latestAttempt?.date
              )}
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          Recent Attempts
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Recent IELTS Attempts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your recorded IELTS practice performance.
            </p>

          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {attempts.length} attempts
          </span>

        </div>


        <div className="mt-6 overflow-x-auto">

          <table className="w-full min-w-[700px] text-left">

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

              </tr>

            </thead>


            <tbody>

              {[
                ...attempts,
              ]
                .reverse()
                .slice(0, 10)
                .map((attempt) => (

                  <tr
                    key={attempt._id}
                    className="border-b border-slate-50 last:border-0"
                  >

                    <td className="px-4 py-4">

                      <p className="font-semibold text-slate-700">
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

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </section>


      {/* ==================================================
          Analytics Navigation
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-800">
          Progress & Analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Explore detailed information about your IELTS
          performance.
        </p>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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
              Identify sections that need more practice.
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
              Track your performance improvement.
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

        </div>

      </section>

    </div>
  );
};

export default IELTSProgressSummary;