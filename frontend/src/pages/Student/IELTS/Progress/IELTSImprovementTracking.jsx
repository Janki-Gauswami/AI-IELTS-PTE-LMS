import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSImprovementTracking = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Attempts
  // ======================================================

  useEffect(() => {
    loadImprovementData();
  }, []);

  const loadImprovementData = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPreviousAttempts();

      if (!response || !response.success) {
        setError(
          response?.message ||
            "Unable to load IELTS improvement data."
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
        "IELTS Improvement Tracking Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS improvement data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Normalize Attempts
  // ======================================================

  const normalizedAttempts = useMemo(() => {
    return [...attempts]
      .map((attempt, index) => {
        const test =
          attempt.test ||
          attempt.practiceTest ||
          {};

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

        return {
          ...attempt,

          _id:
            attempt._id || index,

          title:
            test.title ||
            attempt.testTitle ||
            "IELTS Practice Test",

          score: Number(score),

          totalMarks: Number(
            totalMarks
          ),

          percentage: Number(
            percentage
          ),

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
      })
      .sort((a, b) => {
        const first = a.date
          ? new Date(a.date).getTime()
          : 0;

        const second = b.date
          ? new Date(b.date).getTime()
          : 0;

        return first - second;
      });
  }, [attempts]);

  // ======================================================
  // Improvement Calculation
  // ======================================================

  const improvement = useMemo(() => {
    if (
      normalizedAttempts.length < 2
    ) {
      return {
        scoreChange: 0,
        percentageChange: 0,
        bandChange: 0,
        firstScore: null,
        latestScore: null,
        firstPercentage: null,
        latestPercentage: null,
        firstBand: null,
        latestBand: null,
      };
    }

    const first =
      normalizedAttempts[0];

    const latest =
      normalizedAttempts[
        normalizedAttempts.length - 1
      ];

    const firstBand =
      first.overallBand !== null
        ? Number(first.overallBand)
        : null;

    const latestBand =
      latest.overallBand !== null
        ? Number(latest.overallBand)
        : null;

    return {
      scoreChange:
        latest.score -
        first.score,

      percentageChange:
        latest.percentage -
        first.percentage,

      bandChange:
        firstBand !== null &&
        latestBand !== null
          ? latestBand - firstBand
          : 0,

      firstScore:
        first.score,

      latestScore:
        latest.score,

      firstPercentage:
        first.percentage,

      latestPercentage:
        latest.percentage,

      firstBand,

      latestBand,
    };
  }, [normalizedAttempts]);

  // ======================================================
  // Section Improvement
  // ======================================================

  const sectionImprovement =
    useMemo(() => {
      const sections = [
        "Listening",
        "Reading",
        "Writing",
        "Speaking",
      ];

      if (
        normalizedAttempts.length < 2
      ) {
        return sections.map(
          (name) => ({
            name,
            first: null,
            latest: null,
            change: null,
          })
        );
      }

      const first =
        normalizedAttempts[0];

      const latest =
        normalizedAttempts[
          normalizedAttempts.length - 1
        ];

      return sections.map(
        (name) => {
          const key =
            `${name
              .charAt(0)
              .toLowerCase()}${name.slice(
              1
            )}Band`;

          const firstValue =
            first[key] !== null &&
            first[key] !== undefined
              ? Number(first[key])
              : null;

          const latestValue =
            latest[key] !== null &&
            latest[key] !== undefined
              ? Number(latest[key])
              : null;

          return {
            name,

            first: firstValue,

            latest: latestValue,

            change:
              firstValue !== null &&
              latestValue !== null
                ? latestValue -
                  firstValue
                : null,
          };
        }
      );
    }, [normalizedAttempts]);

  // ======================================================
  // Best Improvement
  // ======================================================

  const bestImprovement =
    useMemo(() => {
      const valid =
        sectionImprovement.filter(
          (section) =>
            section.change !==
              null
        );

      if (!valid.length) {
        return null;
      }

      return [...valid].sort(
        (a, b) =>
          b.change - a.change
      )[0];
    }, [sectionImprovement]);

  // ======================================================
  // Most Improved Attempt
  // ======================================================

  const attemptImprovements =
    useMemo(() => {
      if (
        normalizedAttempts.length <
        2
      ) {
        return [];
      }

      return normalizedAttempts
        .map(
          (attempt, index) => {
            if (index === 0) {
              return {
                ...attempt,
                improvement: 0,
              };
            }

            const previous =
              normalizedAttempts[
                index - 1
              ];

            const currentBand =
              attempt.overallBand !==
              null
                ? Number(
                    attempt.overallBand
                  )
                : null;

            const previousBand =
              previous.overallBand !==
              null
                ? Number(
                    previous.overallBand
                  )
                : null;

            return {
              ...attempt,

              improvement:
                currentBand !== null &&
                previousBand !== null
                  ? currentBand -
                    previousBand
                  : 0,
            };
          }
        )
        .slice(1);
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
  // Format Change
  // ======================================================

  const formatChange = (
    value,
    decimals = 1
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    const number =
      Number(value);

    if (number > 0) {
      return `+${number.toFixed(
        decimals
      )}`;
    }

    return number.toFixed(
      decimals
    );
  };

  // ======================================================
  // Change Color
  // ======================================================

  const getChangeClasses = (
    value
  ) => {
    if (value > 0) {
      return "text-green-600 bg-green-50";
    }

    if (value < 0) {
      return "text-red-600 bg-red-50";
    }

    return "text-slate-500 bg-slate-100";
  };

  // ======================================================
  // Section Icon
  // ======================================================

  const getSectionIcon = (
    section
  ) => {
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
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="font-semibold text-slate-700">
            Calculating your improvement...
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
            Improvement Data Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadImprovementData
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Not Enough Attempts
  // ======================================================

  if (
    normalizedAttempts.length <
    2
  ) {
    return (
      <div className="space-y-6">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            IELTS Improvement Tracking
          </h1>

          <p className="mt-2 text-slate-500">
            Track how your IELTS performance improves
            over time.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📈
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Complete More Tests
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete at least two IELTS tests to compare
            your first and latest performance.
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
              Improvement Tracking
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Compare your first and latest IELTS
              performance and measure your improvement.
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
          Improvement Summary
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Score */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Score Improvement
          </p>

          <div className="mt-2 flex items-center gap-3">

            <p
              className={`text-3xl font-bold ${
                improvement.scoreChange >
                0
                  ? "text-green-600"
                  : improvement.scoreChange <
                    0
                  ? "text-red-600"
                  : "text-slate-700"
              }`}
            >
              {formatChange(
                improvement.scoreChange,
                0
              )}
            </p>

            <span className="text-2xl">
              📊
            </span>

          </div>

          <p className="mt-1 text-xs text-slate-400">
            First vs latest attempt
          </p>

        </div>


        {/* Percentage */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Percentage Improvement
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              improvement.percentageChange >
              0
                ? "text-green-600"
                : improvement.percentageChange <
                  0
                ? "text-red-600"
                : "text-slate-700"
            }`}
          >
            {formatChange(
              improvement.percentageChange
            )}
            %
          </p>

          <p className="mt-1 text-xs text-slate-400">
            First vs latest attempt
          </p>

        </div>


        {/* Band */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Band Improvement
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              improvement.bandChange >
              0
                ? "text-green-600"
                : improvement.bandChange <
                  0
                ? "text-red-600"
                : "text-slate-700"
            }`}
          >
            {formatChange(
              improvement.bandChange
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Overall IELTS band
          </p>

        </div>


        {/* Best Section */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Most Improved Section
          </p>

          <div className="mt-2 flex items-center gap-2">

            <span className="text-2xl">
              {bestImprovement
                ? getSectionIcon(
                    bestImprovement.name
                  )
                : "📈"}
            </span>

            <p className="text-xl font-bold text-purple-600">
              {bestImprovement
                ? bestImprovement.name
                : "—"}
            </p>

          </div>

          {bestImprovement &&
            bestImprovement.change !==
              null && (
              <p className="mt-1 text-xs text-green-600">
                {formatChange(
                  bestImprovement.change
                )}{" "}
                band improvement
              </p>
            )}

        </div>

      </div>


      {/* ==================================================
          First vs Latest
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            First vs Latest Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            See how your performance has changed since
            your first recorded attempt.
          </p>

        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* First */}

          <div className="rounded-2xl border border-slate-100 p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-400">
                  FIRST ATTEMPT
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-800">
                  {normalizedAttempts[0].title}
                </h3>

              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {formatDate(
                  normalizedAttempts[0].date
                )}
              </span>

            </div>


            <div className="mt-6 grid grid-cols-3 gap-3">

              <div className="rounded-xl bg-slate-50 p-4 text-center">

                <p className="text-xs text-slate-400">
                  Score
                </p>

                <p className="mt-1 text-xl font-bold text-slate-700">
                  {
                    normalizedAttempts[0]
                      .score
                  }
                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-4 text-center">

                <p className="text-xs text-slate-400">
                  Percentage
                </p>

                <p className="mt-1 text-xl font-bold text-slate-700">
                  {normalizedAttempts[0].percentage.toFixed(
                    1
                  )}
                  %
                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-4 text-center">

                <p className="text-xs text-slate-400">
                  Band
                </p>

                <p className="mt-1 text-xl font-bold text-slate-700">
                  {improvement.firstBand ??
                    "—"}
                </p>

              </div>

            </div>

          </div>


          {/* Latest */}

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-blue-400">
                  LATEST ATTEMPT
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-800">
                  {
                    normalizedAttempts[
                      normalizedAttempts.length -
                        1
                    ].title
                  }
                </h3>

              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-500">
                {formatDate(
                  normalizedAttempts[
                    normalizedAttempts.length -
                      1
                  ].date
                )}
              </span>

            </div>


            <div className="mt-6 grid grid-cols-3 gap-3">

              <div className="rounded-xl bg-white p-4 text-center">

                <p className="text-xs text-slate-400">
                  Score
                </p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  {
                    normalizedAttempts[
                      normalizedAttempts.length -
                        1
                    ].score
                  }
                </p>

              </div>


              <div className="rounded-xl bg-white p-4 text-center">

                <p className="text-xs text-slate-400">
                  Percentage
                </p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  {normalizedAttempts[
                    normalizedAttempts.length -
                      1
                  ].percentage.toFixed(
                    1
                  )}
                  %
                </p>

              </div>


              <div className="rounded-xl bg-white p-4 text-center">

                <p className="text-xs text-slate-400">
                  Band
                </p>

                <p className="mt-1 text-xl font-bold text-purple-600">
                  {improvement.latestBand ??
                    "—"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          Section Improvement
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Section-wise Improvement
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare your first and latest band in each
            IELTS section.
          </p>

        </div>


        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {sectionImprovement.map(
            (section) => (

              <div
                key={section.name}
                className="rounded-2xl border border-slate-100 p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      {getSectionIcon(
                        section.name
                      )}
                    </div>

                    <div>

                      <h3 className="font-bold text-slate-800">
                        {section.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        First → Latest
                      </p>

                    </div>

                  </div>


                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getChangeClasses(
                      section.change
                    )}`}
                  >
                    {formatChange(
                      section.change
                    )}
                  </span>

                </div>


                <div className="mt-5 flex items-center gap-4">

                  <div className="flex-1">

                    <div className="mb-2 flex justify-between text-xs">

                      <span className="text-slate-400">
                        First
                      </span>

                      <span className="font-semibold text-slate-700">
                        {section.first ??
                          "—"}
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-slate-400"
                        style={{
                          width: `${
                            section.first !==
                            null
                              ? Math.min(
                                  (section.first /
                                    9) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                  </div>


                  <div className="flex-1">

                    <div className="mb-2 flex justify-between text-xs">

                      <span className="text-slate-400">
                        Latest
                      </span>

                      <span className="font-semibold text-blue-600">
                        {section.latest ??
                          "—"}
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${
                            section.latest !==
                            null
                              ? Math.min(
                                  (section.latest /
                                    9) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          Attempt-by-Attempt Improvement
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Attempt-by-Attempt Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            See how your overall band changes between
            consecutive attempts.
          </p>

        </div>


        <div className="mt-6 space-y-3">

          {attemptImprovements.map(
            (attempt, index) => (

              <div
                key={`${attempt._id}-${index}`}
                className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-600 shadow-sm">
                    {index + 2}
                  </div>

                  <div>

                    <p className="font-semibold text-slate-700">
                      {attempt.title}
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatDate(
                        attempt.date
                      )}
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-4">

                  <span className="text-sm text-slate-500">
                    Overall Band
                  </span>

                  <span className="font-bold text-purple-600">
                    {attempt.overallBand ??
                      "—"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getChangeClasses(
                      attempt.improvement
                    )}`}
                  >
                    {formatChange(
                      attempt.improvement
                    )}
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          Improvement Message
      ================================================== */}

      <section
        className={`rounded-2xl p-6 ${
          improvement.bandChange > 0
            ? "border border-green-100 bg-green-50"
            : improvement.bandChange < 0
            ? "border border-orange-100 bg-orange-50"
            : "border border-blue-100 bg-blue-50"
        }`}
      >

        <div className="flex gap-4">

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl text-white ${
              improvement.bandChange > 0
                ? "bg-green-600"
                : improvement.bandChange <
                  0
                ? "bg-orange-500"
                : "bg-blue-600"
            }`}
          >
            {improvement.bandChange > 0
              ? "🎉"
              : improvement.bandChange < 0
              ? "💪"
              : "📈"}
          </div>

          <div>

            <h2
              className={`text-lg font-bold ${
                improvement.bandChange >
                0
                  ? "text-green-900"
                  : improvement.bandChange <
                    0
                  ? "text-orange-900"
                  : "text-blue-900"
              }`}
            >
              {improvement.bandChange >
              0
                ? "Your IELTS Performance Is Improving!"
                : improvement.bandChange <
                  0
                ? "Keep Working on Your IELTS Skills"
                : "Keep Building Your IELTS Performance"}
            </h2>

            <p
              className={`mt-2 text-sm leading-6 ${
                improvement.bandChange >
                0
                  ? "text-green-800"
                  : improvement.bandChange <
                    0
                  ? "text-orange-800"
                  : "text-blue-800"
              }`}
            >

              {improvement.bandChange >
              0
                ? `Your overall band has improved by ${improvement.bandChange.toFixed(
                    1
                  )} band compared with your first recorded attempt. Continue practising consistently.`
                : improvement.bandChange <
                  0
                ? "Your latest overall band is lower than your first recorded attempt. Review your weak areas and continue practising."
                : "Your overall band has not changed between your first and latest recorded attempts. Use your weak-area analysis to focus your preparation."}

            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          Navigation
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
              "/student/ielts/progress/weak-areas"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Weak Areas
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/progress/charts"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Visual Analytics
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/progress/history"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Test History
        </button>

      </div>

    </div>
  );
};

export default IELTSImprovementTracking;