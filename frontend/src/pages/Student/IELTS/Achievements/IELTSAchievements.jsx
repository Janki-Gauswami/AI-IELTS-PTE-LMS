import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSAchievements = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Attempts
  // ======================================================

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
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
            "Unable to load achievements."
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
        "IELTS Achievements Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load achievements."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Normalize Attempts
  // ======================================================

  const normalizedAttempts = useMemo(() => {
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

          score,

          totalMarks,

          percentage,

          date:
            attempt.submittedAt ||
            attempt.completedAt ||
            attempt.createdAt ||
            null,
        };
      }
    );
  }, [attempts]);

  // ======================================================
  // Achievement Statistics
  // ======================================================

  const statistics = useMemo(() => {
    const percentages =
      normalizedAttempts.map(
        (attempt) =>
          attempt.percentage
      );

    const sections =
      new Set(
        normalizedAttempts
          .map(
            (attempt) =>
              attempt.section
          )
          .filter(
            (section) =>
              [
                "Listening",
                "Reading",
                "Writing",
                "Speaking",
              ].includes(section)
          )
      );

    const bestScore =
      percentages.length
        ? Math.max(
            ...percentages
          )
        : 0;

    return {
      totalTests:
        normalizedAttempts.length,

      bestScore,

      sections:
        sections.size,

      highScores:
        percentages.filter(
          (score) =>
            score >= 80
        ).length,
    };
  }, [normalizedAttempts]);

  // ======================================================
  // Achievement List
  // ======================================================

  const achievements = useMemo(() => {
    const totalTests =
      statistics.totalTests;

    const bestScore =
      statistics.bestScore;

    const sections =
      statistics.sections;

    return [
      {
        id: "first-test",
        icon: "🎯",
        title: "First Step",
        description:
          "Complete your first IELTS practice test.",
        requirement:
          "1 completed test",
        unlocked:
          totalTests >= 1,
        progress:
          Math.min(
            totalTests,
            1
          ),
        target: 1,
      },

      {
        id: "five-tests",
        icon: "🔥",
        title: "Getting Consistent",
        description:
          "Complete 5 IELTS practice tests.",
        requirement:
          "5 completed tests",
        unlocked:
          totalTests >= 5,
        progress:
          Math.min(
            totalTests,
            5
          ),
        target: 5,
      },

      {
        id: "ten-tests",
        icon: "📚",
        title: "Dedicated Learner",
        description:
          "Complete 10 IELTS practice tests.",
        requirement:
          "10 completed tests",
        unlocked:
          totalTests >= 10,
        progress:
          Math.min(
            totalTests,
            10
          ),
        target: 10,
      },

      {
        id: "high-score",
        icon: "🏆",
        title: "High Performer",
        description:
          "Achieve a score of 80% or above.",
        requirement:
          "Best score ≥ 80%",
        unlocked:
          bestScore >= 80,
        progress:
          Math.min(
            bestScore,
            80
          ),
        target: 80,
      },

      {
        id: "all-sections",
        icon: "🌟",
        title: "All Rounder",
        description:
          "Practice all four IELTS sections.",
        requirement:
          "Listening + Reading + Writing + Speaking",
        unlocked:
          sections >= 4,
        progress:
          Math.min(
            sections,
            4
          ),
        target: 4,
      },
    ];
  }, [
    statistics,
  ]);

  // ======================================================
  // Unlocked Count
  // ======================================================

  const unlockedCount =
    achievements.filter(
      (achievement) =>
        achievement.unlocked
    ).length;

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
            Loading your achievements...
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
            Achievements Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadAchievements}
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
              My Achievements
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Track your IELTS milestones and celebrate
              your learning progress.
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-6 py-4 text-center backdrop-blur">

            <p className="text-3xl font-bold">
              {unlockedCount}
              <span className="text-lg font-normal text-indigo-200">
                /{achievements.length}
              </span>
            </p>

            <p className="mt-1 text-xs text-indigo-100">
              Achievements Unlocked
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          Statistics
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📝
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Tests Completed
              </p>

              <p className="text-2xl font-bold text-slate-800">
                {statistics.totalTests}
              </p>

            </div>

          </div>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
              🏆
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Best Score
              </p>

              <p className="text-2xl font-bold text-green-600">
                {statistics.bestScore.toFixed(
                  1
                )}
                %
              </p>

            </div>

          </div>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
              📚
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Sections Practiced
              </p>

              <p className="text-2xl font-bold text-purple-600">
                {statistics.sections}/4
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          Achievement Cards
      ================================================== */}

      <div>

        <div className="mb-5">

          <h2 className="text-xl font-bold text-slate-800">
            Milestones
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete IELTS activities to unlock
            achievements.
          </p>

        </div>


        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {achievements.map(
            (achievement) => {

              const progress =
                achievement.target > 0
                  ? Math.min(
                      (
                        achievement.progress /
                        achievement.target
                      ) * 100,
                      100
                    )
                  : 0;

              return (
                <div
                  key={achievement.id}
                  className={`rounded-2xl border p-6 shadow-sm transition ${
                    achievement.unlocked
                      ? "border-yellow-200 bg-white"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
                        achievement.unlocked
                          ? "bg-yellow-50"
                          : "bg-slate-200 grayscale"
                      }`}
                    >
                      {achievement.icon}
                    </div>

                    {achievement.unlocked && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                        UNLOCKED
                      </span>
                    )}

                  </div>


                  <h3 className="mt-5 text-lg font-bold text-slate-800">
                    {achievement.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {achievement.description}
                  </p>


                  <div className="mt-5">

                    <div className="mb-2 flex items-center justify-between text-xs">

                      <span className="text-slate-400">
                        Progress
                      </span>

                      <span className="font-semibold text-slate-600">
                        {achievement.progress}/
                        {achievement.target}
                      </span>

                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className={`h-full rounded-full transition-all ${
                          achievement.unlocked
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>


                  <p className="mt-4 text-xs text-slate-400">
                    Goal:{" "}
                    {achievement.requirement}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* ==================================================
          Recent Activity
      ================================================== */}

      {normalizedAttempts.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Recent Achievements Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest completed IELTS tests.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/ielts/progress/history"
                )
              }
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View History →
            </button>

          </div>


          <div className="mt-5 space-y-3">

            {normalizedAttempts
              .slice(0, 5)
              .map(
                (attempt) => (
                  <div
                    key={attempt._id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg">
                        {attempt.section ===
                        "Listening"
                          ? "🎧"
                          : attempt.section ===
                            "Reading"
                          ? "📖"
                          : attempt.section ===
                            "Writing"
                          ? "✍️"
                          : attempt.section ===
                            "Speaking"
                          ? "🎤"
                          : "📝"}
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          {attempt.testTitle}
                        </p>

                        <p className="text-xs text-slate-400">
                          {formatDate(
                            attempt.date
                          )}
                        </p>

                      </div>

                    </div>


                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {attempt.percentage.toFixed(
                        1
                      )}
                      %
                    </span>

                  </div>
                )
              )}

          </div>

        </div>
      )}


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
              Keep Going!
            </h2>

            <p className="mt-2 text-sm leading-6 text-purple-800">
              Every practice test brings you closer to
              your IELTS goal. Keep practicing, review
              your mistakes, and continue improving your
              weaker sections.
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
              "/student/ielts/progress/performance"
            )
          }
          className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 font-semibold text-blue-700 hover:bg-blue-100"
        >
          Performance
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

export default IELTSAchievements;