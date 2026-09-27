import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSPerformanceComparison = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [firstAttemptId, setFirstAttemptId] =
    useState("");
  const [secondAttemptId, setSecondAttemptId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      if (!response || !response.success) {
        setError(
          response?.message ||
            "Unable to load IELTS attempts."
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

      setAttempts(normalized);

      if (normalized.length >= 2) {
        setFirstAttemptId(
          normalized[0]._id
        );

        setSecondAttemptId(
          normalized[
            normalized.length - 1
          ]._id
        );
      }
    } catch (err) {
      console.error(
        "IELTS Performance Comparison Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS attempts."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Selected Attempts
  // ======================================================

  const firstAttempt = useMemo(() => {
    return attempts.find(
      (attempt) =>
        String(attempt._id) ===
        String(firstAttemptId)
    );
  }, [
    attempts,
    firstAttemptId,
  ]);

  const secondAttempt = useMemo(() => {
    return attempts.find(
      (attempt) =>
        String(attempt._id) ===
        String(secondAttemptId)
    );
  }, [
    attempts,
    secondAttemptId,
  ]);

  // ======================================================
  // Section Comparison
  // ======================================================

  const comparison = useMemo(() => {
    if (
      !firstAttempt ||
      !secondAttempt
    ) {
      return [];
    }

    const sections = [
      {
        name: "Listening",
        key: "listeningBand",
        icon: "🎧",
      },
      {
        name: "Reading",
        key: "readingBand",
        icon: "📖",
      },
      {
        name: "Writing",
        key: "writingBand",
        icon: "✍️",
      },
      {
        name: "Speaking",
        key: "speakingBand",
        icon: "🎤",
      },
    ];

    return sections.map(
      (section) => {
        const first =
          firstAttempt[
            section.key
          ] !== null &&
          firstAttempt[
            section.key
          ] !== undefined
            ? Number(
                firstAttempt[
                  section.key
                ]
              )
            : null;

        const second =
          secondAttempt[
            section.key
          ] !== null &&
          secondAttempt[
            section.key
          ] !== undefined
            ? Number(
                secondAttempt[
                  section.key
                ]
              )
            : null;

        return {
          ...section,
          first,
          second,
          change:
            first !== null &&
            second !== null
              ? second - first
              : null,
        };
      }
    );
  }, [
    firstAttempt,
    secondAttempt,
  ]);

  // ======================================================
  // Overall Comparison
  // ======================================================

  const overallComparison = useMemo(() => {
    if (
      !firstAttempt ||
      !secondAttempt
    ) {
      return null;
    }

    const firstBand =
      firstAttempt.overallBand !==
        null &&
      firstAttempt.overallBand !==
        undefined
        ? Number(
            firstAttempt.overallBand
          )
        : null;

    const secondBand =
      secondAttempt.overallBand !==
        null &&
      secondAttempt.overallBand !==
        undefined
        ? Number(
            secondAttempt.overallBand
          )
        : null;

    return {
      firstBand,
      secondBand,

      change:
        firstBand !== null &&
        secondBand !== null
          ? secondBand -
            firstBand
          : null,

      scoreChange:
        Number(
          secondAttempt.score || 0
        ) -
        Number(
          firstAttempt.score || 0
        ),

      percentageChange:
        Number(
          secondAttempt.percentage ||
            0
        ) -
        Number(
          firstAttempt.percentage ||
            0
        ),
    };
  }, [
    firstAttempt,
    secondAttempt,
  ]);

  // ======================================================
  // Helpers
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

  const getChangeClasses = (
    value
  ) => {
    if (value > 0) {
      return "bg-green-50 text-green-600";
    }

    if (value < 0) {
      return "bg-red-50 text-red-600";
    }

    return "bg-slate-100 text-slate-500";
  };

  const getBarWidth = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return 0;
    }

    return Math.min(
      Math.max(
        (Number(value) / 9) *
          100,
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
            Loading IELTS attempts...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Preparing performance comparison.
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
            Unable to Load Comparison
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
  // Not Enough Data
  // ======================================================

  if (attempts.length < 2) {
    return (
      <div className="space-y-6">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            IELTS Performance Comparison
          </h1>

          <p className="mt-2 text-slate-500">
            Compare two IELTS attempts to understand your
            improvement.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📊
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Not Enough Attempts
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete at least two IELTS practice tests
            before comparing your performance.
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
              Performance Comparison
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Compare two IELTS attempts section by section
              and understand how your performance has changed.
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
          Attempt Selection
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Select Attempts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose two attempts that you want to compare.
          </p>

        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* First Attempt */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              First Attempt
            </label>

            <select
              value={firstAttemptId}
              onChange={(event) =>
                setFirstAttemptId(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="">
                Select first attempt
              </option>

              {attempts.map(
                (attempt) => (
                  <option
                    key={`first-${attempt._id}`}
                    value={
                      attempt._id
                    }
                  >
                    {attempt.title} —{" "}
                    {formatDate(
                      attempt.date
                    )}
                  </option>
                )
              )}

            </select>

          </div>


          {/* Second Attempt */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Second Attempt
            </label>

            <select
              value={secondAttemptId}
              onChange={(event) =>
                setSecondAttemptId(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="">
                Select second attempt
              </option>

              {attempts.map(
                (attempt) => (
                  <option
                    key={`second-${attempt._id}`}
                    value={
                      attempt._id
                    }
                  >
                    {attempt.title} —{" "}
                    {formatDate(
                      attempt.date
                    )}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </section>


      {/* ==================================================
          Comparison
      ================================================== */}

      {firstAttempt &&
        secondAttempt &&
        overallComparison && (

        <>
          {/* ==================================================
              Overall Summary
          ================================================== */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-800">
                Overall Comparison
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Overall performance between the selected
                attempts.
              </p>

            </div>


            <div className="grid gap-5 sm:grid-cols-3">

              {/* First Band */}

              <div className="rounded-2xl bg-slate-50 p-6 text-center">

                <p className="text-xs font-semibold text-slate-400">
                  FIRST ATTEMPT
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-700">
                  {overallComparison.firstBand ??
                    "—"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(
                    firstAttempt.date
                  )}
                </p>

              </div>


              {/* Change */}

              <div className="rounded-2xl bg-blue-50 p-6 text-center">

                <p className="text-xs font-semibold text-blue-400">
                  CHANGE
                </p>

                <p
                  className={`mt-2 text-4xl font-bold ${
                    overallComparison.change >
                    0
                      ? "text-green-600"
                      : overallComparison.change <
                        0
                      ? "text-red-600"
                      : "text-slate-600"
                  }`}
                >
                  {formatChange(
                    overallComparison.change
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Overall band
                </p>

              </div>


              {/* Second Band */}

              <div className="rounded-2xl bg-indigo-50 p-6 text-center">

                <p className="text-xs font-semibold text-indigo-400">
                  SECOND ATTEMPT
                </p>

                <p className="mt-2 text-4xl font-bold text-indigo-600">
                  {overallComparison.secondBand ??
                    "—"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(
                    secondAttempt.date
                  )}
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              Section Comparison
          ================================================== */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-800">
                Section-wise Comparison
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Compare Listening, Reading, Writing and
                Speaking scores.
              </p>

            </div>


            <div className="space-y-5">

              {comparison.map(
                (section) => (

                  <div
                    key={section.name}
                    className="rounded-2xl border border-slate-100 p-5"
                  >

                    {/* Header */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                          {section.icon}
                        </div>

                        <div>

                          <h3 className="font-bold text-slate-800">
                            {section.name}
                          </h3>

                          <p className="text-xs text-slate-400">
                            First vs second attempt
                          </p>

                        </div>

                      </div>


                      <span
                        className={`rounded-full px-4 py-2 text-sm font-bold ${getChangeClasses(
                          section.change
                        )}`}
                      >
                        {formatChange(
                          section.change
                        )}
                      </span>

                    </div>


                    {/* Values */}

                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                      {/* First */}

                      <div>

                        <div className="mb-2 flex justify-between text-sm">

                          <span className="text-slate-500">
                            First Attempt
                          </span>

                          <span className="font-bold text-slate-700">
                            {section.first ??
                              "—"}
                          </span>

                        </div>

                        <div className="h-4 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-slate-400"
                            style={{
                              width: `${getBarWidth(
                                section.first
                              )}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* Second */}

                      <div>

                        <div className="mb-2 flex justify-between text-sm">

                          <span className="text-slate-500">
                            Second Attempt
                          </span>

                          <span className="font-bold text-blue-600">
                            {section.second ??
                              "—"}
                          </span>

                        </div>

                        <div className="h-4 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${getBarWidth(
                                section.second
                              )}%`,
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
              Test Details
          ================================================== */}

          <section className="grid gap-5 md:grid-cols-2">

            {/* First */}

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-xs font-semibold text-slate-400">
                FIRST ATTEMPT
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-800">
                {firstAttempt.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {formatDate(
                  firstAttempt.date
                )}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-700">
                    {firstAttempt.score}
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Percentage
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-700">
                    {Number(
                      firstAttempt.percentage
                    ).toFixed(1)}
                    %
                  </p>

                </div>

              </div>

            </div>


            {/* Second */}

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-xs font-semibold text-blue-500">
                SECOND ATTEMPT
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-800">
                {secondAttempt.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {formatDate(
                  secondAttempt.date
                )}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-blue-50 p-4">

                  <p className="text-xs text-slate-400">
                    Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-600">
                    {secondAttempt.score}
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-4">

                  <p className="text-xs text-slate-400">
                    Percentage
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-600">
                    {Number(
                      secondAttempt.percentage
                    ).toFixed(1)}
                    %
                  </p>

                </div>

              </div>

            </div>

          </section>

        </>
      )}


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
              "/student/ielts/progress/improvement"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Improvement
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

      </div>

    </div>
  );
};

export default IELTSPerformanceComparison;