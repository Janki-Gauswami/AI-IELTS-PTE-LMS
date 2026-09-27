import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSWeakAreas = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Student Attempts
  // ======================================================

  useEffect(() => {
    loadWeakAreaData();
  }, []);

  const loadWeakAreaData = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPreviousAttempts();

      if (!response || !response.success) {
        setError(
          response?.message ||
            "Unable to load IELTS performance data."
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
        "IELTS Weak Areas Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS performance data."
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

        _id:
          attempt._id || index,

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
    });
  }, [attempts]);

  // ======================================================
  // Calculate Section Statistics
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
        const average = values.length
          ? values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / values.length
          : null;

        const best = values.length
          ? Math.max(...values)
          : null;

        const latest = values.length
          ? values[values.length - 1]
          : null;

        return {
          name,
          values,
          average,
          best,
          latest,
          count: values.length,
        };
      }
    );
  }, [normalizedAttempts]);

  // ======================================================
  // Identify Weak Areas
  // ======================================================

  const weakAreas = useMemo(() => {
    return sectionStatistics
      .filter(
        (section) =>
          section.average !== null
      )
      .map((section) => {
        let level = "Strong";

        if (section.average < 5) {
          level = "Needs Major Improvement";
        } else if (
          section.average < 6
        ) {
          level = "Needs Improvement";
        } else if (
          section.average < 6.5
        ) {
          level = "Developing";
        } else if (
          section.average < 7
        ) {
          level = "Good";
        }

        return {
          ...section,
          level,
        };
      })
      .sort(
        (a, b) =>
          a.average - b.average
      );
  }, [sectionStatistics]);

  // ======================================================
  // Weakest Section
  // ======================================================

  const weakestSection =
    weakAreas.length
      ? weakAreas[0]
      : null;

  // ======================================================
  // Strongest Section
  // ======================================================

  const strongestSection =
    weakAreas.length
      ? weakAreas[
          weakAreas.length - 1
        ]
      : null;

  // ======================================================
  // Improvement Difference
  // ======================================================

  const improvementGap = (
    section
  ) => {
    if (
      !section ||
      section.average === null
    ) {
      return 0;
    }

    return Math.max(
      0,
      7 - section.average
    );
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
  // Section Icon
  // ======================================================

  const getIcon = (section) => {
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
  // Level Classes
  // ======================================================

  const getLevelClasses = (level) => {
    switch (level) {
      case "Needs Major Improvement":
        return "bg-red-50 text-red-700";

      case "Needs Improvement":
        return "bg-orange-50 text-orange-700";

      case "Developing":
        return "bg-yellow-50 text-yellow-700";

      case "Good":
        return "bg-blue-50 text-blue-700";

      case "Strong":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ======================================================
  // Progress Width
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
            Analysing your IELTS performance...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Finding your strengths and weak areas.
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
            Unable to Analyse Performance
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadWeakAreaData}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // No Data
  // ======================================================

  if (!weakAreas.length) {
    return (
      <div className="space-y-6">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            IELTS Weak Areas
          </h1>

          <p className="mt-2 text-slate-500">
            Identify the IELTS sections that need more
            practice.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📊
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Not Enough Performance Data
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete IELTS practice tests with section
            scores to identify your weak areas.
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
              Weak Areas Analysis
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Understand which IELTS sections need more
              attention and focus your preparation.
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
          Main Weak Area
      ================================================== */}

      {weakestSection && (
        <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                {getIcon(
                  weakestSection.name
                )}
              </div>

              <div>

                <p className="text-sm font-medium text-red-500">
                  Primary Area to Improve
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-800">
                  {weakestSection.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This is currently your lowest-performing
                  IELTS section.
                </p>

              </div>

            </div>


            <div className="text-left md:text-right">

              <p className="text-sm text-slate-400">
                Average Band
              </p>

              <p className="text-4xl font-bold text-red-600">
                {weakestSection.average.toFixed(
                  1
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Target: Band 7.0
              </p>

            </div>

          </div>


          <div className="mt-6">

            <div className="mb-2 flex justify-between text-xs">

              <span className="text-slate-400">
                Current performance
              </span>

              <span className="font-semibold text-red-600">
                {weakestSection.average.toFixed(
                  1
                )} / 9
              </span>

            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{
                  width: `${getBandWidth(
                    weakestSection.average
                  )}%`,
                }}
              />

            </div>

          </div>

        </section>
      )}


      {/* ==================================================
          Section Analysis
      ================================================== */}

      <section>

        <div className="mb-5">

          <h2 className="text-xl font-bold text-slate-800">
            Section Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your average, best, and latest band for each
            IELTS section.
          </p>

        </div>


        <div className="grid gap-5 md:grid-cols-2">

          {weakAreas.map(
            (section) => (

              <div
                key={section.name}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      {getIcon(
                        section.name
                      )}
                    </div>

                    <div>

                      <h3 className="font-bold text-slate-800">
                        {section.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        {section.count} scored attempt
                        {section.count !== 1
                          ? "s"
                          : ""}
                      </p>

                    </div>

                  </div>


                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getLevelClasses(
                      section.level
                    )}`}
                  >
                    {section.level}
                  </span>

                </div>


                {/* Average */}

                <div className="mt-6 flex items-end justify-between">

                  <div>

                    <p className="text-xs text-slate-400">
                      Average Band
                    </p>

                    <p className="mt-1 text-3xl font-bold text-slate-800">

                      {section.average !==
                      null
                        ? section.average.toFixed(
                            1
                          )
                        : "—"}

                    </p>

                  </div>


                  <div className="text-right">

                    <p className="text-xs text-slate-400">
                      Best
                    </p>

                    <p className="mt-1 text-lg font-bold text-green-600">

                      {section.best !==
                      null
                        ? section.best
                        : "—"}

                    </p>

                  </div>

                </div>


                {/* Band Progress */}

                <div className="mt-5">

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full ${
                        section.average <
                        5
                          ? "bg-red-500"
                          : section.average <
                            6
                          ? "bg-orange-500"
                          : section.average <
                            6.5
                          ? "bg-yellow-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${getBandWidth(
                          section.average
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                {/* Improvement Gap */}

                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Gap to Band 7
                    </span>

                    <span className="font-bold text-slate-700">

                      {improvementGap(
                        section
                      ).toFixed(1)}

                    </span>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          Strongest Area
      ================================================== */}

      {strongestSection &&
        strongestSection.name !==
          weakestSection?.name && (

        <section className="rounded-2xl border border-green-100 bg-green-50 p-6">

          <div className="flex gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-xl text-white">
              🏆
            </div>

            <div>

              <p className="text-sm font-medium text-green-600">
                Strongest IELTS Section
              </p>

              <h2 className="mt-1 text-xl font-bold text-green-900">
                {strongestSection.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-green-800">

                Your strongest section currently has an
                average band of{" "}
                <strong>
                  {strongestSection.average.toFixed(
                    1
                  )}
                </strong>
                . Continue practising this section while
                giving additional attention to your weaker
                areas.

              </p>

            </div>

          </div>

        </section>
      )}


      {/* ==================================================
          Recommendations
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-xl">
            💡
          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Recommended Focus
            </h2>

            <p className="text-sm text-slate-500">
              Use your weak areas to guide your preparation.
            </p>

          </div>

        </div>


        <div className="mt-6 space-y-3">

          {weakAreas
            .filter(
              (section) =>
                section.average < 6.5
            )
            .slice(0, 3)
            .map(
              (section) => (

                <div
                  key={
                    `${section.name}-recommendation`
                  }
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                >

                  <div className="flex items-center gap-3">

                    <span className="text-xl">
                      {getIcon(
                        section.name
                      )}
                    </span>

                    <div>

                      <p className="font-semibold text-slate-700">
                        Focus on{" "}
                        {section.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        Current average:{" "}
                        {section.average.toFixed(
                          1
                        )}
                      </p>

                    </div>

                  </div>

                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                    Priority
                  </span>

                </div>

              )
            )}

          {!weakAreas.some(
            (section) =>
              section.average < 6.5
          ) && (

            <div className="rounded-xl bg-green-50 p-5 text-center">

              <p className="font-semibold text-green-700">
                🎉 No major weak areas detected.
              </p>

              <p className="mt-1 text-sm text-green-600">
                Keep practising consistently to maintain
                your performance.
              </p>

            </div>

          )}

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

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/tests"
            )
          }
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Practice Test
        </button>

      </div>

    </div>
  );
};

export default IELTSWeakAreas;