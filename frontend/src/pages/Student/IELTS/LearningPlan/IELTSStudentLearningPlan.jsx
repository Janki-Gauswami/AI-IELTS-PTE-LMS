import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const STORAGE_KEY = "ielts_student_goals";

const IELTSStudentLearningPlan = () => {
  const navigate = useNavigate();

  // ======================================================
  // Goals
  // ======================================================

  const [targetBand, setTargetBand] =
    useState("7.0");

  const [examDate, setExamDate] =
    useState("");

  const [weeklyTests, setWeeklyTests] =
    useState("3");

  const [weeklyStudyHours, setWeeklyStudyHours] =
    useState("10");

  // ======================================================
  // Performance
  // ======================================================

  const [attempts, setAttempts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================================
  // Weekly Task Completion
  // ======================================================

  const [completedTasks, setCompletedTasks] =
    useState({});

  // ======================================================
  // Load Goals
  // ======================================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const goals =
        JSON.parse(saved);

      if (
        goals.targetBand !==
        undefined
      ) {
        setTargetBand(
          String(
            goals.targetBand
          )
        );
      }

      if (goals.examDate) {
        setExamDate(
          goals.examDate
        );
      }

      if (
        goals.weeklyTests !==
        undefined
      ) {
        setWeeklyTests(
          String(
            goals.weeklyTests
          )
        );
      }

      if (
        goals.weeklyStudyHours !==
        undefined
      ) {
        setWeeklyStudyHours(
          String(
            goals.weeklyStudyHours
          )
        );
      }
    } catch (err) {
      console.error(
        "Load IELTS Goals Error:",
        err
      );
    }
  }, []);

  // ======================================================
  // Load Attempts
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
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      setAttempts(data);
    } catch (err) {
      console.error(
        "Learning Plan Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load learning plan."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Normalize Attempts
  // ======================================================

  const normalizedAttempts =
    useMemo(() => {
      return attempts.map(
        (attempt) => {
          const test =
            attempt.test || {};

          const score =
            Number(
              attempt.score
            ) || 0;

          const totalMarks =
            Number(
              attempt.totalMarks ||
                test.totalMarks ||
                0
            );

          const percentage =
            Number(
              attempt.percentage ??
                (
                  totalMarks > 0
                    ? (
                        score /
                        totalMarks
                      ) * 100
                    : 0
                )
            ) || 0;

          return {
            ...attempt,

            section:
              test.section ||
              attempt.section ||
              "Unknown",

            percentage,
          };
        }
      );
    }, [attempts]);

  // ======================================================
  // Current Performance
  // ======================================================

  const averagePercentage =
    useMemo(() => {
      if (
        !normalizedAttempts.length
      ) {
        return 0;
      }

      const total =
        normalizedAttempts.reduce(
          (sum, attempt) =>
            sum +
            attempt.percentage,
          0
        );

      return (
        total /
        normalizedAttempts.length
      );
    }, [normalizedAttempts]);

  // ======================================================
  // Estimated Band
  // ======================================================

  const estimatedBand =
    useMemo(() => {
      if (
        averagePercentage >=
        90
      ) {
        return 8.5;
      }

      if (
        averagePercentage >=
        85
      ) {
        return 8.0;
      }

      if (
        averagePercentage >=
        80
      ) {
        return 7.5;
      }

      if (
        averagePercentage >=
        75
      ) {
        return 7.0;
      }

      if (
        averagePercentage >=
        70
      ) {
        return 6.5;
      }

      if (
        averagePercentage >=
        65
      ) {
        return 6.0;
      }

      if (
        averagePercentage >=
        60
      ) {
        return 5.5;
      }

      if (
        averagePercentage >=
        50
      ) {
        return 5.0;
      }

      return 4.5;
    }, [averagePercentage]);

  // ======================================================
  // Exam Days
  // ======================================================

  const daysRemaining =
    useMemo(() => {
      if (!examDate) {
        return null;
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const exam =
        new Date(
          `${examDate}T00:00:00`
        );

      const difference =
        exam.getTime() -
        today.getTime();

      return Math.ceil(
        difference /
          (1000 *
            60 *
            60 *
            24)
      );
    }, [examDate]);

  // ======================================================
  // Weak Section
  // ======================================================

  const sectionPerformance =
    useMemo(() => {
      const sections = {};

      normalizedAttempts.forEach(
        (attempt) => {
          if (
            ![
              "Listening",
              "Reading",
              "Writing",
              "Speaking",
            ].includes(
              attempt.section
            )
          ) {
            return;
          }

          if (
            !sections[
              attempt.section
            ]
          ) {
            sections[
              attempt.section
            ] = [];
          }

          sections[
            attempt.section
          ].push(
            attempt.percentage
          );
        }
      );

      return Object.entries(
        sections
      ).map(
        ([
          section,
          values,
        ]) => ({
          section,

          average:
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            values.length,
        })
      );
    }, [normalizedAttempts]);

  const weakestSection =
    useMemo(() => {
      if (
        !sectionPerformance.length
      ) {
        return null;
      }

      return [
        ...sectionPerformance,
      ].sort(
        (a, b) =>
          a.average -
          b.average
      )[0];
    }, [sectionPerformance]);

  // ======================================================
  // Learning Tasks
  // ======================================================

  const tasks = useMemo(() => {
    const baseTasks = [
      {
        id: "listening",
        icon: "🎧",
        section: "Listening",
        title:
          "Listening Practice",
        description:
          "Practice IELTS Listening questions and review your mistakes.",
        duration:
          "30 minutes",
      },

      {
        id: "reading",
        icon: "📖",
        section: "Reading",
        title:
          "Reading Practice",
        description:
          "Practice passages, skimming, scanning, and question types.",
        duration:
          "40 minutes",
      },

      {
        id: "writing",
        icon: "✍️",
        section: "Writing",
        title:
          "Writing Practice",
        description:
          "Practice Task 1 or Task 2 and review your structure and vocabulary.",
        duration:
          "45 minutes",
      },

      {
        id: "speaking",
        icon: "🎤",
        section: "Speaking",
        title:
          "Speaking Practice",
        description:
          "Practice Part 1, Part 2, and Part 3 speaking responses.",
        duration:
          "30 minutes",
      },

      {
        id: "vocabulary",
        icon: "📚",
        section: "Vocabulary",
        title:
          "Vocabulary Review",
        description:
          "Learn useful IELTS vocabulary and use it in your own sentences.",
        duration:
          "20 minutes",
      },

      {
        id: "mock-test",
        icon: "📝",
        section: "Practice Test",
        title:
          "IELTS Practice Test",
        description:
          "Complete a timed IELTS practice test.",
        duration:
          "60 minutes",
      },
    ];

    if (
      weakestSection
    ) {
      return baseTasks.sort(
        (a, b) => {
          if (
            a.section ===
            weakestSection.section
          ) {
            return -1;
          }

          if (
            b.section ===
            weakestSection.section
          ) {
            return 1;
          }

          return 0;
        }
      );
    }

    return baseTasks;
  }, [weakestSection]);

  // ======================================================
  // Task Completion
  // ======================================================

  const toggleTask = (taskId) => {
    setCompletedTasks(
      (previous) => ({
        ...previous,

        [taskId]:
          !previous[
            taskId
          ],
      })
    );
  };

  const completedCount =
    tasks.filter(
      (task) =>
        completedTasks[
          task.id
        ]
    ).length;

  const taskProgress =
    tasks.length
      ? (
          completedCount /
          tasks.length
        ) *
        100
      : 0;

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="font-semibold text-slate-700">
            Preparing your learning plan...
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
            Learning Plan Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadPerformance
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
  // Main
  // ======================================================

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-sm sm:p-8">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div>

            <p className="text-sm text-indigo-100">
              IELTS Student Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              My Learning Plan
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
              Follow your personalized IELTS preparation
              plan and work toward your target band.
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-6 py-5 text-center">

            <p className="text-3xl font-bold">
              {targetBand}
            </p>

            <p className="mt-1 text-xs text-indigo-100">
              Target Band
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          Overview
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Current Estimate
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {normalizedAttempts.length
              ? estimatedBand.toFixed(1)
              : "—"}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Target Band
          </p>

          <p className="mt-2 text-3xl font-bold text-purple-600">
            {Number(
              targetBand
            ).toFixed(1)}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Weekly Study
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {weeklyStudyHours}
          </p>

          <p className="text-xs text-slate-400">
            hours
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Exam Countdown
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500">

            {daysRemaining === null
              ? "—"
              : daysRemaining > 0
              ? daysRemaining
              : daysRemaining === 0
              ? "Today"
              : "Passed"}

          </p>

          {daysRemaining !==
            null &&
            daysRemaining > 0 && (
              <p className="text-xs text-slate-400">
                days remaining
              </p>
            )}

        </div>

      </div>


      {/* ==================================================
          Weekly Progress
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              This Week's Plan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete the activities below to stay on
              track.
            </p>

          </div>

          <span className="font-bold text-blue-600">
            {completedCount}/
            {tasks.length} completed
          </span>

        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${taskProgress}%`,
            }}
          />

        </div>

        <p className="mt-2 text-right text-xs text-slate-400">
          {taskProgress.toFixed(0)}% complete
        </p>

      </div>


      {/* ==================================================
          Main Content
      ================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ==================================================
            Tasks
        ================================================== */}

        <div className="lg:col-span-2">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-slate-800">
              Recommended Activities
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Focus on these activities during your IELTS
              preparation.
            </p>

          </div>


          <div className="space-y-4">

            {tasks.map(
              (task) => {

                const completed =
                  Boolean(
                    completedTasks[
                      task.id
                    ]
                  );

                const isWeakSection =
                  weakestSection &&
                  task.section ===
                    weakestSection.section;

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                      completed
                        ? "border-green-200 bg-green-50/30"
                        : isWeakSection
                        ? "border-orange-200"
                        : "border-slate-100"
                    }`}
                  >

                    <div className="flex gap-4">

                      <button
                        type="button"
                        onClick={() =>
                          toggleTask(
                            task.id
                          )
                        }
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                          completed
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-50"
                        }`}
                      >
                        {completed
                          ? "✓"
                          : task.icon}
                      </button>


                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col justify-between gap-2 sm:flex-row">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3
                                className={`font-bold ${
                                  completed
                                    ? "text-green-700 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {task.title}
                              </h3>

                              {isWeakSection && (
                                <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">
                                  WEAK AREA
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {task.description}
                            </p>

                          </div>

                          <span className="shrink-0 text-xs font-medium text-slate-400">
                            {task.duration}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>


        {/* ==================================================
            Plan Summary
        ================================================== */}

        <div className="space-y-5">

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

            <h2 className="text-lg font-bold">
              Your Weekly Target
            </h2>

            <div className="mt-5 space-y-4">

              <div className="rounded-xl bg-white/5 p-4">

                <p className="text-xs text-slate-400">
                  Practice Tests
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {weeklyTests}
                </p>

                <p className="text-xs text-slate-400">
                  tests per week
                </p>

              </div>


              <div className="rounded-xl bg-white/5 p-4">

                <p className="text-xs text-slate-400">
                  Study Time
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {weeklyStudyHours}
                </p>

                <p className="text-xs text-slate-400">
                  hours per week
                </p>

              </div>


              <div className="rounded-xl bg-white/5 p-4">

                <p className="text-xs text-slate-400">
                  Target
                </p>

                <p className="mt-1 text-2xl font-bold">
                  Band{" "}
                  {Number(
                    targetBand
                  ).toFixed(1)}
                </p>

              </div>

            </div>

          </div>


          {/* Weak Area */}

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                🎯
              </div>

              <div>

                <h3 className="font-bold text-orange-900">
                  Focus Area
                </h3>

                {weakestSection ? (
                  <>
                    <p className="mt-1 text-sm font-semibold text-orange-800">
                      {weakestSection.section}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-700">
                      Average performance:{" "}
                      {weakestSection.average.toFixed(
                        1
                      )}
                      %
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-xs leading-5 text-orange-700">
                    Complete more tests to identify
                    your weakest IELTS section.
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          Motivation
      ================================================== */}

      <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-xl text-white">
            🌟
          </div>

          <div>

            <h2 className="text-lg font-bold text-purple-900">
              Stay Consistent
            </h2>

            <p className="mt-2 text-sm leading-6 text-purple-800">

              {daysRemaining !== null &&
              daysRemaining > 0
                ? `You have ${daysRemaining} days remaining until your target exam date. Use your weekly study target of ${weeklyStudyHours} hours to stay consistent.`
                : `Keep following your weekly target of ${weeklyStudyHours} study hours and ${weeklyTests} practice tests.`}

            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          Navigation
      ================================================== */}

      <div className="flex flex-col justify-center gap-3 sm:flex-row">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/progress"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← IELTS Progress
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/progress/goals"
            )
          }
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          🎯 My Goals
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/progress/achievements"
            )
          }
          className="rounded-xl border border-purple-200 bg-purple-50 px-6 py-3 font-semibold text-purple-700 hover:bg-purple-100"
        >
          🏆 Achievements
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
          Practice Now
        </button>

      </div>

    </div>
  );
};

export default IELTSStudentLearningPlan;