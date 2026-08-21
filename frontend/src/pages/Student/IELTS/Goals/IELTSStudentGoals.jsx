import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const STORAGE_KEY =
  "ielts_student_goals";

const IELTSStudentGoals = () => {
  const navigate = useNavigate();

  // ======================================================
  // Goal State
  // ======================================================

  const [targetBand, setTargetBand] =
    useState("7.0");

  const [examDate, setExamDate] =
    useState("");

  const [weeklyTests, setWeeklyTests] =
    useState("3");

  const [weeklyStudyHours, setWeeklyStudyHours] =
    useState("10");

  const [saved, setSaved] =
    useState(false);

  // ======================================================
  // Performance State
  // ======================================================

  const [attempts, setAttempts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================================
  // Load Saved Goals
  // ======================================================

  useEffect(() => {
    try {
      const savedGoals =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (savedGoals) {
        const goals =
          JSON.parse(savedGoals);

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
      }
    } catch (error) {
      console.error(
        "Load IELTS Goals Error:",
        error
      );
    }
  }, []);

  // ======================================================
  // Load Student Performance
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

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setAttempts(data);
    } catch (err) {
      console.error(
        "IELTS Goal Performance Error:",
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
  // Normalize Performance
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

            testTitle:
              test.title ||
              attempt.testTitle ||
              "IELTS Practice Test",

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

  const performance = useMemo(() => {
    if (!normalizedAttempts.length) {
      return {
        average: 0,
        best: 0,
        tests: 0,
      };
    }

    const percentages =
      normalizedAttempts.map(
        (attempt) =>
          attempt.percentage
      );

    return {
      average:
        percentages.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / percentages.length,

      best:
        Math.max(...percentages),

      tests:
        percentages.length,
    };
  }, [normalizedAttempts]);

  // ======================================================
  // Convert Percentage to Estimated Band
  // ======================================================
  //
  // This is only a rough progress indicator.
  // It is NOT an official IELTS band calculation.
  // ======================================================

  const estimatedBand =
    useMemo(() => {
      const percentage =
        performance.average;

      if (percentage >= 90) {
        return 8.5;
      }

      if (percentage >= 85) {
        return 8.0;
      }

      if (percentage >= 80) {
        return 7.5;
      }

      if (percentage >= 75) {
        return 7.0;
      }

      if (percentage >= 70) {
        return 6.5;
      }

      if (percentage >= 65) {
        return 6.0;
      }

      if (percentage >= 60) {
        return 5.5;
      }

      if (percentage >= 50) {
        return 5.0;
      }

      return 4.5;
    }, [performance.average]);

  // ======================================================
  // Target Gap
  // ======================================================

  const targetGap =
    Math.max(
      Number(targetBand) -
        estimatedBand,
      0
    );

  // ======================================================
  // Goal Progress
  // ======================================================

  const goalProgress =
    Number(targetBand) > 0
      ? Math.min(
          (
            estimatedBand /
            Number(targetBand)
          ) * 100,
          100
        )
      : 0;

  // ======================================================
  // Days Until Exam
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
  // Save Goals
  // ======================================================

  const handleSaveGoals = () => {
    try {
      const goals = {
        targetBand,
        examDate,
        weeklyTests,
        weeklyStudyHours,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(goals)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Save IELTS Goals Error:",
        error
      );
    }
  };

  // ======================================================
  // Reset Goals
  // ======================================================

  const handleReset = () => {
    const defaultGoals = {
      targetBand: "7.0",
      examDate: "",
      weeklyTests: "3",
      weeklyStudyHours: "10",
    };

    setTargetBand(
      defaultGoals.targetBand
    );

    setExamDate(
      defaultGoals.examDate
    );

    setWeeklyTests(
      defaultGoals.weeklyTests
    );

    setWeeklyStudyHours(
      defaultGoals.weeklyStudyHours
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultGoals)
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
            Loading your IELTS goals...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Please wait.
          </p>

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

      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:p-8">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <p className="text-sm text-blue-100">
              IELTS Student Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              My IELTS Goals
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Set your target band, exam date, and
              weekly preparation goals.
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-6 py-4 text-center">

            <p className="text-3xl font-bold">
              {targetBand}
            </p>

            <p className="mt-1 text-xs text-blue-100">
              Target Band
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          Current vs Target
      ================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Current Estimated Band
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {performance.tests
              ? estimatedBand.toFixed(1)
              : "—"}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Based on practice performance
          </p>

        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Target Band
          </p>

          <p className="mt-2 text-3xl font-bold text-purple-600">
            {Number(targetBand).toFixed(
              1
            )}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Your desired IELTS band
          </p>

        </div>


        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Band Gap
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            {performance.tests
              ? targetGap.toFixed(1)
              : "—"}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Remaining estimated gap
          </p>

        </div>

      </div>


      {/* ==================================================
          Goal Progress
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Target Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your current estimated band compared with
              your target.
            </p>

          </div>

          <span className="text-lg font-bold text-blue-600">
            {goalProgress.toFixed(0)}%
          </span>

        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${goalProgress}%`,
            }}
          />

        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-400">

          <span>
            Current:{" "}
            {performance.tests
              ? estimatedBand.toFixed(1)
              : "—"}
          </span>

          <span>
            Target:{" "}
            {Number(targetBand).toFixed(1)}
          </span>

        </div>

      </div>


      {/* ==================================================
          Goal Settings
      ================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Goal Form */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-800">
              Set Your Goals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customize your IELTS preparation targets.
            </p>

          </div>


          {/* Target Band */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Target IELTS Band
            </label>

            <select
              value={targetBand}
              onChange={(e) =>
                setTargetBand(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="5.0">
                5.0
              </option>

              <option value="5.5">
                5.5
              </option>

              <option value="6.0">
                6.0
              </option>

              <option value="6.5">
                6.5
              </option>

              <option value="7.0">
                7.0
              </option>

              <option value="7.5">
                7.5
              </option>

              <option value="8.0">
                8.0
              </option>

              <option value="8.5">
                8.5
              </option>

              <option value="9.0">
                9.0
              </option>

            </select>

          </div>


          {/* Exam Date */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Target Exam Date
            </label>

            <input
              type="date"
              value={examDate}
              onChange={(e) =>
                setExamDate(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* Weekly Tests */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Practice Tests Per Week
            </label>

            <select
              value={weeklyTests}
              onChange={(e) =>
                setWeeklyTests(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >

              <option value="1">
                1 test
              </option>

              <option value="2">
                2 tests
              </option>

              <option value="3">
                3 tests
              </option>

              <option value="4">
                4 tests
              </option>

              <option value="5">
                5 tests
              </option>

              <option value="6">
                6 tests
              </option>

              <option value="7">
                7 tests
              </option>

            </select>

          </div>


          {/* Study Hours */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Study Hours Per Week
            </label>

            <select
              value={weeklyStudyHours}
              onChange={(e) =>
                setWeeklyStudyHours(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >

              <option value="5">
                5 hours
              </option>

              <option value="10">
                10 hours
              </option>

              <option value="15">
                15 hours
              </option>

              <option value="20">
                20 hours
              </option>

              <option value="25">
                25 hours
              </option>

              <option value="30">
                30 hours
              </option>

            </select>

          </div>


          {/* Save */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={
                handleSaveGoals
              }
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Goals
            </button>

            <button
              type="button"
              onClick={
                handleReset
              }
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>

          </div>


          {saved && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
              ✓ Your IELTS goals have been saved.
            </div>
          )}

        </div>


        {/* Preparation Summary */}

        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

          <h2 className="text-xl font-bold">
            Your Preparation Plan
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Your current goal settings.
          </p>


          <div className="mt-6 space-y-4">

            <div className="rounded-xl bg-white/5 p-4">

              <p className="text-xs text-slate-400">
                Target Band
              </p>

              <p className="mt-1 text-2xl font-bold">
                {Number(
                  targetBand
                ).toFixed(1)}
              </p>

            </div>


            <div className="rounded-xl bg-white/5 p-4">

              <p className="text-xs text-slate-400">
                Weekly Practice
              </p>

              <p className="mt-1 text-2xl font-bold">
                {weeklyTests}{" "}
                <span className="text-sm font-normal text-slate-400">
                  tests/week
                </span>
              </p>

            </div>


            <div className="rounded-xl bg-white/5 p-4">

              <p className="text-xs text-slate-400">
                Weekly Study
              </p>

              <p className="mt-1 text-2xl font-bold">
                {weeklyStudyHours}{" "}
                <span className="text-sm font-normal text-slate-400">
                  hours/week
                </span>
              </p>

            </div>


            <div className="rounded-xl bg-white/5 p-4">

              <p className="text-xs text-slate-400">
                Exam Date
              </p>

              <p className="mt-1 text-lg font-bold">

                {examDate
                  ? new Date(
                      `${examDate}T00:00:00`
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "Not set"}

              </p>

              {daysRemaining !== null && (
                <p className="mt-1 text-xs text-slate-400">

                  {daysRemaining > 0
                    ? `${daysRemaining} days remaining`
                    : daysRemaining ===
                      0
                    ? "Exam is today"
                    : "Exam date has passed"}

                </p>
              )}

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          Preparation Suggestions
      ================================================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            💡
          </div>

          <div>

            <h2 className="text-lg font-bold text-blue-900">
              Preparation Recommendation
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-800">

              {performance.tests === 0
                ? "Start taking IELTS practice tests to establish your baseline performance."
                : targetGap > 0
                ? `Your current estimated band is ${estimatedBand.toFixed(
                    1
                  )}. Focus on regular practice and review your mistakes to work toward your target band of ${Number(
                    targetBand
                  ).toFixed(1)}.`
                : `You are currently at or above your target band of ${Number(
                    targetBand
                  ).toFixed(
                    1
                  )}. Keep practicing to maintain your performance.`}

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
          Practice Again
        </button>

        <button
  type="button"
  onClick={() =>
    navigate(
      "/student/ielts/progress/learning-plan"
    )
  }
  className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-100"
>
  📚 Learning Plan
</button>

      </div>

    </div>
  );
};

export default IELTSStudentGoals;