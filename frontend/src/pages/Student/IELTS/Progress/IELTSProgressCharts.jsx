import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentPreviousAttempts,
} from "../../../../services/ieltsPracticeTestService";

const IELTSProgressCharts = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load IELTS Attempts
  // ======================================================

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentPreviousAttempts();

      if (!response || !response.success) {
        setError(
          response?.message ||
            "Unable to load IELTS analytics."
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
        "IELTS Progress Charts Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS analytics."
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

          _chartId:
            attempt._id || index,

          title:
            test.title ||
            attempt.testTitle ||
            "IELTS Practice Test",

          section:
            test.section ||
            attempt.section ||
            "",

          score,

          totalMarks,

          percentage,

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
        const dateA = a.date
          ? new Date(a.date).getTime()
          : 0;

        const dateB = b.date
          ? new Date(b.date).getTime()
          : 0;

        return dateA - dateB;
      });
  }, [attempts]);

  // ======================================================
  // Overall Statistics
  // ======================================================

  const overallStatistics = useMemo(() => {
    const percentages =
      normalizedAttempts.map(
        (attempt) =>
          Number(attempt.percentage) || 0
      );

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

    return {
      averagePercentage:
        percentages.length
          ? percentages.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            percentages.length
          : 0,

      bestPercentage:
        percentages.length
          ? Math.max(...percentages)
          : 0,

      averageBand:
        bands.length
          ? bands.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / bands.length
          : null,

      bestBand:
        bands.length
          ? Math.max(...bands)
          : null,

      latestBand:
        bands.length
          ? bands[bands.length - 1]
          : null,
    };
  }, [normalizedAttempts]);

  // ======================================================
  // Section Statistics
  // ======================================================

  const sectionStatistics = useMemo(() => {
    const sectionData = {
      Listening: [],
      Reading: [],
      Writing: [],
      Speaking: [],
    };

    normalizedAttempts.forEach(
      (attempt) => {
        if (
          attempt.listeningBand !==
            null &&
          attempt.listeningBand !==
            undefined
        ) {
          sectionData.Listening.push(
            Number(
              attempt.listeningBand
            )
          );
        }

        if (
          attempt.readingBand !==
            null &&
          attempt.readingBand !==
            undefined
        ) {
          sectionData.Reading.push(
            Number(
              attempt.readingBand
            )
          );
        }

        if (
          attempt.writingBand !==
            null &&
          attempt.writingBand !==
            undefined
        ) {
          sectionData.Writing.push(
            Number(
              attempt.writingBand
            )
          );
        }

        if (
          attempt.speakingBand !==
            null &&
          attempt.speakingBand !==
            undefined
        ) {
          sectionData.Speaking.push(
            Number(
              attempt.speakingBand
            )
          );
        }
      }
    );

    return Object.entries(
      sectionData
    ).map(
      ([name, values]) => ({
        name,

        average:
          values.length
            ? values.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) /
              values.length
            : null,

        best:
          values.length
            ? Math.max(...values)
            : null,

        latest:
          values.length
            ? values[
                values.length - 1
              ]
            : null,

        count:
          values.length,
      })
    );
  }, [normalizedAttempts]);

  // ======================================================
  // Chart Helpers
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

  const getPercentageWidth = (
    percentage
  ) => {
    return Math.min(
      Math.max(
        Number(percentage) || 0,
        0
      ),
      100
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      );
    } catch {
      return "";
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
            Loading IELTS analytics...
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
            Analytics Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadChartData}
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
            IELTS Visual Analytics
          </h1>

          <p className="mt-2 text-slate-500">
            Visualize your IELTS progress and performance.
          </p>

        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📊
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Not Enough Data
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete IELTS practice tests to generate
            performance charts.
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
              IELTS Visual Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Visualize your scores, band progression,
              and section-wise IELTS performance.
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
          Summary Cards
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Tests
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {normalizedAttempts.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Completed attempts
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Average Score
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {overallStatistics.averagePercentage.toFixed(
              1
            )}
            %
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Across attempts
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Best Band
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {overallStatistics.bestBand !==
            null
              ? overallStatistics.bestBand
              : "—"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Highest overall band
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Latest Band
          </p>

          <p className="mt-2 text-3xl font-bold text-purple-600">
            {overallStatistics.latestBand !==
            null
              ? overallStatistics.latestBand
              : "—"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Most recent result
          </p>

        </div>

      </div>


      {/* ==================================================
          Overall Score Trend
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Overall Score Trend
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your percentage score across previous
              attempts.
            </p>

          </div>

          <span className="text-2xl">
            📈
          </span>

        </div>


        <div className="mt-8 overflow-x-auto">

          <div
            className="flex min-w-[700px] items-end gap-4"
            style={{
              height: "300px",
            }}
          >

            {normalizedAttempts.map(
              (attempt, index) => {

                const height =
                  getPercentageWidth(
                    attempt.percentage
                  );

                return (
                  <div
                    key={
                      attempt._chartId
                    }
                    className="flex h-full min-w-[70px] flex-1 flex-col items-center justify-end"
                  >

                    {/* Percentage */}

                    <span className="mb-2 text-xs font-bold text-blue-600">
                      {Number(
                        attempt.percentage
                      ).toFixed(0)}
                      %
                    </span>


                    {/* Bar */}

                    <div className="flex h-[220px] w-full max-w-[55px] items-end rounded-t-xl bg-slate-100">

                      <div
                        className="w-full rounded-t-xl bg-blue-600 transition-all duration-500"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${attempt.title} - ${Number(
                          attempt.percentage
                        ).toFixed(1)}%`}
                      />

                    </div>


                    {/* Attempt */}

                    <span className="mt-2 text-xs font-semibold text-slate-600">
                      Test {index + 1}
                    </span>

                    <span className="mt-1 text-[10px] text-slate-400">
                      {formatDate(
                        attempt.date
                      )}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          Overall Band Progress
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Overall Band Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track your overall IELTS band across
              attempts.
            </p>

          </div>

          <span className="text-2xl">
            🎯
          </span>

        </div>


        <div className="mt-8 space-y-5">

          {normalizedAttempts.map(
            (attempt, index) => {

              const band =
                attempt.overallBand;

              const width =
                getBandWidth(band);

              return (
                <div
                  key={
                    `${attempt._chartId}-band`
                  }
                >

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {index + 1}
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {attempt.title}
                      </span>

                    </div>

                    <span className="font-bold text-purple-600">

                      {band !== null
                        ? band
                        : "—"}

                    </span>

                  </div>


                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-purple-600 transition-all duration-500"
                      style={{
                        width: `${width}%`,
                      }}
                    />

                  </div>

                </div>
              );
            }
          )}

        </div>

      </section>


      {/* ==================================================
          Section Comparison
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Section Comparison
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare your average performance across the
            four IELTS sections.
          </p>

        </div>


        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {sectionStatistics.map(
            (section) => {

              const width =
                getBandWidth(
                  section.average
                );

              const icons = {
                Listening: "🎧",
                Reading: "📖",
                Writing: "✍️",
                Speaking: "🎤",
              };

              return (
                <div
                  key={section.name}
                  className="rounded-2xl border border-slate-100 p-5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      {
                        icons[
                          section.name
                        ]
                      }
                    </div>

                    <span className="text-2xl font-bold text-slate-800">

                      {section.average !==
                      null
                        ? section.average.toFixed(
                            1
                          )
                        : "—"}

                    </span>

                  </div>


                  <h3 className="mt-4 font-bold text-slate-800">
                    {section.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Average Band
                  </p>


                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${width}%`,
                      }}
                    />

                  </div>


                  <div className="mt-3 flex justify-between text-xs">

                    <span className="text-slate-400">
                      Best
                    </span>

                    <span className="font-semibold text-green-600">

                      {section.best !==
                      null
                        ? section.best
                        : "—"}

                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </section>


      {/* ==================================================
          Section-by-Section Attempt Comparison
      ================================================== */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Section Performance by Attempt
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare Listening, Reading, Writing, and
            Speaking bands for every attempt.
          </p>

        </div>


        <div className="mt-6 overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="border-b border-slate-100 text-left">

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Attempt
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

              {normalizedAttempts.map(
                (attempt, index) => (

                  <tr
                    key={
                      `${attempt._chartId}-sections`
                    }
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >

                    <td className="px-4 py-4">

                      <p className="font-semibold text-slate-700">
                        Test {index + 1}
                      </p>

                      <p className="text-xs text-slate-400">
                        {formatDate(
                          attempt.date
                        )}
                      </p>

                    </td>


                    <td className="px-4 py-4">

                      {attempt.listeningBand !==
                      null ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                          {
                            attempt.listeningBand
                          }
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.readingBand !==
                      null ? (
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                          {
                            attempt.readingBand
                          }
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.writingBand !==
                      null ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-600">
                          {
                            attempt.writingBand
                          }
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.speakingBand !==
                      null ? (
                        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">
                          {
                            attempt.speakingBand
                          }
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    <td className="px-4 py-4">

                      {attempt.overallBand !==
                      null ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                          {
                            attempt.overallBand
                          }
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ==================================================
          Performance Insight
      ================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            💡
          </div>

          <div>

            <h2 className="text-lg font-bold text-blue-900">
              Your Performance Analytics
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-800">

              Your charts show how your IELTS performance
              changes over multiple attempts. Use the
              section comparison to identify the skills
              that need more practice.

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
              "/student/ielts/progress/performance"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Performance Breakdown
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

export default IELTSProgressCharts;