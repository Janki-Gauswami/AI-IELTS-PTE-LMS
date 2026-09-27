import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

import {
  getStudentPreviousAttempts,
} from "../../../services/ieltsPracticeTestService";


const IELTSPreviousAttempts = () => {

  const navigate = useNavigate();

  const [attempts, setAttempts] =
    useState([]);

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

      if (!response.success) {

        setError(
          response.message ||
            "Unable to load previous attempts."
        );

        return;
      }

      setAttempts(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Previous Attempts Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load previous attempts."
      );

    } finally {

      setLoading(false);

    }
  };


  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-slate-500">
              Loading previous attempts...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  // ======================================================
  // Error
  // ======================================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center shadow">
            <div className="text-5xl">
              ⚠️
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Unable to Load Attempts
            </h2>
            <p className="mt-2 text-sm text-slate-500">
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
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="min-h-screen p-2 md:p-6">
        <div className="mx-auto max-w-6xl">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="mb-6">

          <h1 className="text-3xl font-bold text-slate-800">
            Previous Attempts
          </h1>

          <p className="mt-2 text-slate-500">
            View your previous IELTS practice test attempts
            and results.
          </p>

        </div>


        {/* ==================================================
            Empty State
        ================================================== */}

        {attempts.length === 0 && (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="text-6xl">
              📝
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No Previous Attempts
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You have not completed any IELTS practice tests yet.
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
              Take a Practice Test
            </button>

          </div>

        )}


        {/* ==================================================
            Desktop Table
        ================================================== */}

        {attempts.length > 0 && (

          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">

            <table className="min-w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Test
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Section
                  </th>

                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                    Score
                  </th>

                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                    Percentage
                  </th>

                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                    Band
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Date
                  </th>

                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {attempts.map(
                  (attempt) => {
                    const band =
                      attempt.overallBand ??
                      attempt.readingBand ??
                      attempt.listeningBand ??
                      attempt.writingBand ??
                      attempt.speakingBand ??
                      (attempt.totalMarks > 0
                        ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
                        : (attempt.score > 0 ? Number(((attempt.score / 40) * 9).toFixed(1)) : null));

                    const isEvaluated = attempt.status === "Evaluated" || band !== null;

                    const displayScore =
                      (attempt.score === 0 && isEvaluated && band && band >= 5 && attempt.totalMarks > 0)
                        ? Math.max(1, Math.round((band / 9) * attempt.totalMarks))
                        : (attempt.score ?? 0);

                    const percentage =
                      (attempt.percentage !== undefined && attempt.percentage !== null && attempt.percentage > 0)
                        ? attempt.percentage
                        : (band ? Math.min(100, Math.round((band / 9) * 100)) : (attempt.totalMarks > 0 ? Math.round(((attempt.score || 0) / attempt.totalMarks) * 100) : 0));

                    return (
                      <tr
                        key={attempt._id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">

                          <p className="font-semibold text-slate-800">
                            {attempt.test?.title ||
                              "IELTS Practice Test"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {attempt.test?.difficulty ||
                              "Medium"}
                          </p>

                        </td>


                        <td className="px-6 py-5">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                            {attempt.test?.section ||
                              "IELTS"}
                          </span>

                        </td>


                        <td className="px-6 py-5 text-center">

                          <span className="font-bold text-slate-800">
                            {displayScore}
                          </span>

                          <span className="text-slate-400">
                            {" "}
                            /{" "}
                            {attempt.totalMarks ?? 40}
                          </span>

                        </td>


                        <td className="px-6 py-5 text-center">

                          <span
                            className={`font-bold ${
                              percentage >= 60
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {percentage}%
                          </span>

                        </td>


                        <td className="px-6 py-5 text-center">

                          <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                            {band !== null ? `Band ${band}` : "—"}
                          </span>

                        </td>


                        <td className="px-6 py-5 text-sm text-slate-600">

                          {attempt.submittedAt
                            ? new Date(
                                attempt.submittedAt
                              ).toLocaleDateString()
                            : "N/A"}

                        </td>


                        <td className="px-6 py-5 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/student/ielts/tests/${attempt.test?._id}/results/${attempt._id}`
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            View Result
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* ==================================================
            Mobile Cards
        ================================================== */}

        {attempts.length > 0 && (

          <div className="space-y-4 md:hidden">

            {attempts.map((attempt) => {
              const band =
                attempt.overallBand ??
                attempt.readingBand ??
                attempt.listeningBand ??
                attempt.writingBand ??
                attempt.speakingBand ??
                (attempt.totalMarks > 0
                  ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
                  : (attempt.score > 0 ? Number(((attempt.score / 40) * 9).toFixed(1)) : null));

              const isEvaluated = attempt.status === "Evaluated" || band !== null;

              const displayScore =
                (attempt.score === 0 && isEvaluated && band && band >= 5 && attempt.totalMarks > 0)
                  ? Math.max(1, Math.round((band / 9) * attempt.totalMarks))
                  : (attempt.score ?? 0);

              const percentage =
                (attempt.percentage !== undefined && attempt.percentage !== null && attempt.percentage > 0)
                  ? attempt.percentage
                  : (band ? Math.min(100, Math.round((band / 9) * 100)) : (attempt.totalMarks > 0 ? Math.round(((attempt.score || 0) / attempt.totalMarks) * 100) : 0));

              return (
                <div
                  key={attempt._id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="font-bold text-slate-800">
                        {attempt.test?.title ||
                          "IELTS Practice Test"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {attempt.test?.section}
                      </p>

                    </div>

                    <span className="font-bold text-blue-600">
                      {percentage}%
                    </span>

                  </div>


                  <div className="mt-5 grid grid-cols-2 gap-4">

                    <div>

                      <p className="text-xs text-slate-500">
                        Score
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {displayScore} /{" "}
                        {attempt.totalMarks}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs text-slate-500">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {attempt.submittedAt
                          ? new Date(
                              attempt.submittedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/ielts/tests/${attempt.test?._id}/results/${attempt._id}`
                      )
                    }
                    className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    View Result
                  </button>

                </div>
              );
            })}

          </div>

        )}

      </div>
    </div>
    </DashboardLayout>
  );
};


export default IELTSPreviousAttempts;