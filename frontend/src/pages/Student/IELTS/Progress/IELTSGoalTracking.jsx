import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSGoalTracking = () => {
  const navigate = useNavigate();

  // ======================================================
  // State
  // ======================================================

  const [attempts, setAttempts] = useState([]);

  const [targetOverall, setTargetOverall] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "ieltsTargetOverall"
        );

      return saved || "7";
    });

  const [targetListening, setTargetListening] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "ieltsTargetListening"
        );

      return saved || "7";
    });

  const [targetReading, setTargetReading] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "ieltsTargetReading"
        );

      return saved || "7";
    });

  const [targetWriting, setTargetWriting] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "ieltsTargetWriting"
        );

      return saved || "7";
    });

  const [targetSpeaking, setTargetSpeaking] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "ieltsTargetSpeaking"
        );

      return saved || "7";
    });

  const [saved, setSaved] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
        "IELTS Goal Tracking Error:",
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
    return [...attempts]
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

        return (
          first - second
        );
      });
  }, [attempts]);

  // ======================================================
  // Latest Attempt
  // ======================================================

  const latestAttempt =
    useMemo(() => {
      if (
        !normalizedAttempts.length
      ) {
        return null;
      }

      return normalizedAttempts[
        normalizedAttempts.length - 1
      ];
    }, [normalizedAttempts]);

  // ======================================================
  // Current Performance
  // ======================================================

  const currentPerformance =
    useMemo(() => {
      if (!latestAttempt) {
        return {
          overall: null,
          listening: null,
          reading: null,
          writing: null,
          speaking: null,
        };
      }

      return {
        overall:
          latestAttempt.overallBand !==
          null
            ? Number(
                latestAttempt.overallBand
              )
            : null,

        listening:
          latestAttempt.listeningBand !==
          null
            ? Number(
                latestAttempt.listeningBand
              )
            : null,

        reading:
          latestAttempt.readingBand !==
          null
            ? Number(
                latestAttempt.readingBand
              )
            : null,

        writing:
          latestAttempt.writingBand !==
          null
            ? Number(
                latestAttempt.writingBand
              )
            : null,

        speaking:
          latestAttempt.speakingBand !==
          null
            ? Number(
                latestAttempt.speakingBand
              )
            : null,
      };
    }, [latestAttempt]);

  // ======================================================
  // Target Values
  // ======================================================

  const targets = useMemo(() => {
    return {
      overall: Number(
        targetOverall
      ),
      listening: Number(
        targetListening
      ),
      reading: Number(
        targetReading
      ),
      writing: Number(
        targetWriting
      ),
      speaking: Number(
        targetSpeaking
      ),
    };
  }, [
    targetOverall,
    targetListening,
    targetReading,
    targetWriting,
    targetSpeaking,
  ]);

  // ======================================================
  // Overall Goal Progress
  // ======================================================

  const overallGoal = useMemo(() => {
    const current =
      currentPerformance.overall;

    const target =
      targets.overall;

    if (
      current === null ||
      !target
    ) {
      return {
        current,
        target,
        gap: null,
        percentage: 0,
        achieved: false,
      };
    }

    const gap = Math.max(
      0,
      target - current
    );

    const percentage =
      Math.min(
        100,
        Math.max(
          0,
          (current / target) *
            100
        )
      );

    return {
      current,
      target,
      gap,
      percentage,
      achieved:
        current >= target,
    };
  }, [
    currentPerformance.overall,
    targets.overall,
  ]);

  // ======================================================
  // Section Goals
  // ======================================================

  const sectionGoals = useMemo(() => {
    const sections = [
      {
        name: "Listening",
        key: "listening",
        icon: "🎧",
      },
      {
        name: "Reading",
        key: "reading",
        icon: "📖",
      },
      {
        name: "Writing",
        key: "writing",
        icon: "✍️",
      },
      {
        name: "Speaking",
        key: "speaking",
        icon: "🎤",
      },
    ];

    return sections.map(
      (section) => {
        const current =
          currentPerformance[
            section.key
          ];

        const target =
          targets[
            section.key
          ];

        const gap =
          current !== null
            ? Math.max(
                0,
                target - current
              )
            : null;

        const percentage =
          current !== null &&
          target > 0
            ? Math.min(
                100,
                Math.max(
                  0,
                  (current /
                    target) *
                    100
                )
              )
            : 0;

        return {
          ...section,
          current,
          target,
          gap,
          percentage,
          achieved:
            current !== null &&
            current >= target,
        };
      }
    );
  }, [
    currentPerformance,
    targets,
  ]);

  // ======================================================
  // Goals Achieved
  // ======================================================

  const achievedSections =
    sectionGoals.filter(
      (section) =>
        section.achieved
    ).length;

  // ======================================================
  // Overall Goal Status
  // ======================================================

  const goalStatus =
    overallGoal.achieved
      ? "Achieved"
      : overallGoal.current ===
          null
        ? "Not Available"
        : overallGoal.current >=
          overallGoal.target - 0.5
        ? "Almost There"
        : "In Progress";

  // ======================================================
  // Save Goals
  // ======================================================

  const saveGoals = () => {
    localStorage.setItem(
      "ieltsTargetOverall",
      targetOverall
    );

    localStorage.setItem(
      "ieltsTargetListening",
      targetListening
    );

    localStorage.setItem(
      "ieltsTargetReading",
      targetReading
    );

    localStorage.setItem(
      "ieltsTargetWriting",
      targetWriting
    );

    localStorage.setItem(
      "ieltsTargetSpeaking",
      targetSpeaking
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  // ======================================================
  // Reset Goals
  // ======================================================

  const resetGoals = () => {
    setTargetOverall("7");
    setTargetListening("7");
    setTargetReading("7");
    setTargetWriting("7");
    setTargetSpeaking("7");

    localStorage.setItem(
      "ieltsTargetOverall",
      "7"
    );

    localStorage.setItem(
      "ieltsTargetListening",
      "7"
    );

    localStorage.setItem(
      "ieltsTargetReading",
      "7"
    );

    localStorage.setItem(
      "ieltsTargetWriting",
      "7"
    );

    localStorage.setItem(
      "ieltsTargetSpeaking",
      "7"
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

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
            Loading goal tracking...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Checking your latest IELTS performance.
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
            Unable to Load Goal Tracking
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
              IELTS Goal Tracking
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Set your IELTS target band and track how close
              you are to achieving it.
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
          Overall Goal
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-medium text-blue-600">
              Overall IELTS Goal
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Target Band{" "}
              {targets.overall.toFixed(1)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {latestAttempt
                ? `Based on your latest attempt on ${formatDate(
                    latestAttempt.date
                  )}.`
                : "Complete an IELTS test to see your current performance."}
            </p>

          </div>


          <div
            className={`rounded-xl px-5 py-3 text-center ${
              overallGoal.achieved
                ? "bg-green-50"
                : "bg-blue-50"
            }`}
          >

            <p className="text-xs text-slate-400">
              STATUS
            </p>

            <p
              className={`mt-1 font-bold ${
                overallGoal.achieved
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {goalStatus}
            </p>

          </div>

        </div>


        <div className="mt-7">

          <div className="mb-2 flex justify-between text-sm">

            <span className="text-slate-500">
              Current:{" "}
              <strong className="text-slate-700">
                {overallGoal.current ??
                  "—"}
              </strong>
            </span>

            <span className="text-slate-500">
              Target:{" "}
              <strong className="text-blue-600">
                {overallGoal.target}
              </strong>
            </span>

          </div>


          <div className="h-5 overflow-hidden rounded-full bg-slate-100">

            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallGoal.achieved
                  ? "bg-green-500"
                  : "bg-blue-600"
              }`}
              style={{
                width: `${overallGoal.percentage}%`,
              }}
            />

          </div>


          <div className="mt-3 flex justify-between text-xs text-slate-400">

            <span>
              {overallGoal.percentage.toFixed(
                0
              )}% of target
            </span>

            <span>
              {overallGoal.achieved
                ? "Target achieved 🎉"
                : overallGoal.gap !== null
                ? `${overallGoal.gap.toFixed(
                    1
                  )} band remaining`
                : "Complete a test to calculate your gap"}
            </span>

          </div>

        </div>

      </section>


      {/* ==================================================
          Target Settings
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Set Your IELTS Targets
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Set your desired overall and section band
            scores.
          </p>

        </div>


        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {/* Overall */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Overall
            </label>

            <select
              value={targetOverall}
              onChange={(event) =>
                setTargetOverall(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from(
                {
                  length: 17,
                },
                (_, index) =>
                  (
                    1 +
                    index * 0.5
                  ).toFixed(1)
              ).map((value) => (
                <option
                  key={`overall-${value}`}
                  value={value}
                >
                  Band {value}
                </option>
              ))}
            </select>

          </div>


          {/* Listening */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Listening
            </label>

            <select
              value={targetListening}
              onChange={(event) =>
                setTargetListening(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from(
                {
                  length: 17,
                },
                (_, index) =>
                  (
                    1 +
                    index * 0.5
                  ).toFixed(1)
              ).map((value) => (
                <option
                  key={`listening-${value}`}
                  value={value}
                >
                  Band {value}
                </option>
              ))}
            </select>

          </div>


          {/* Reading */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Reading
            </label>

            <select
              value={targetReading}
              onChange={(event) =>
                setTargetReading(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from(
                {
                  length: 17,
                },
                (_, index) =>
                  (
                    1 +
                    index * 0.5
                  ).toFixed(1)
              ).map((value) => (
                <option
                  key={`reading-${value}`}
                  value={value}
                >
                  Band {value}
                </option>
              ))}
            </select>

          </div>


          {/* Writing */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Writing
            </label>

            <select
              value={targetWriting}
              onChange={(event) =>
                setTargetWriting(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from(
                {
                  length: 17,
                },
                (_, index) =>
                  (
                    1 +
                    index * 0.5
                  ).toFixed(1)
              ).map((value) => (
                <option
                  key={`writing-${value}`}
                  value={value}
                >
                  Band {value}
                </option>
              ))}
            </select>

          </div>


          {/* Speaking */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Speaking
            </label>

            <select
              value={targetSpeaking}
              onChange={(event) =>
                setTargetSpeaking(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from(
                {
                  length: 17,
                },
                (_, index) =>
                  (
                    1 +
                    index * 0.5
                  ).toFixed(1)
              ).map((value) => (
                <option
                  key={`speaking-${value}`}
                  value={value}
                >
                  Band {value}
                </option>
              ))}
            </select>

          </div>

        </div>


        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={saveGoals}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Save Targets
          </button>

          <button
            type="button"
            onClick={resetGoals}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset to Band 7
          </button>

          {saved && (
            <span className="flex items-center px-2 text-sm font-semibold text-green-600">
              ✓ Targets saved successfully
            </span>
          )}

        </div>

      </section>


      {/* ==================================================
          Section Goal Tracking
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Section Goal Tracking
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your current performance against each
            section target.
          </p>

        </div>


        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {sectionGoals.map(
            (section) => (

              <div
                key={section.name}
                className="rounded-2xl border border-slate-100 p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      {section.icon}
                    </div>

                    <div>

                      <h3 className="font-bold text-slate-800">
                        {section.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        Target Band{" "}
                        {section.target}
                      </p>

                    </div>

                  </div>


                  {section.achieved ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                      Achieved
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                      In Progress
                    </span>
                  )}

                </div>


                <div className="mt-5">

                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-slate-500">
                      Current Band
                    </span>

                    <span className="font-bold text-slate-700">
                      {section.current ??
                        "—"}
                    </span>

                  </div>


                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full ${
                        section.achieved
                          ? "bg-green-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${section.percentage}%`,
                      }}
                    />

                  </div>


                  <div className="mt-3 flex justify-between text-xs">

                    <span className="text-slate-400">
                      {section.percentage.toFixed(
                        0
                      )}% of target
                    </span>

                    <span className="font-medium text-slate-500">

                      {section.achieved
                        ? "Target achieved 🎉"
                        : section.gap !==
                            null
                        ? `${section.gap.toFixed(
                            1
                          )} band remaining`
                        : "No score available"}

                    </span>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          Goal Summary
      ================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
              🎯
            </div>

            <div>

              <p className="text-sm font-medium text-blue-600">
                Goal Progress
              </p>

              <h2 className="mt-1 text-xl font-bold text-blue-900">
                {achievedSections} of 4 section targets
                achieved
              </h2>

              <p className="mt-1 text-sm text-blue-700">
                Keep focusing on the sections that are
                still below your target.
              </p>

            </div>

          </div>


          <div className="text-left md:text-right">

            <p className="text-sm text-blue-600">
              Overall Target
            </p>

            <p className="text-3xl font-bold text-blue-900">
              Band{" "}
              {targets.overall.toFixed(1)}
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
              "/student/ielts/progress/comparison"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Comparison
        </button>

      </div>

    </div>
  );
};

export default IELTSGoalTracking;