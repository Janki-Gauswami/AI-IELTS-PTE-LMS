import { useCallback, useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";

import {
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Loader2,
  AlertCircle,
  Users,
  Search,
  RefreshCw,
  Target,
  Brain,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

import { getCohortAIOverview } from "../../services/aiService";

const AdminAIReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * ============================================================
   * FETCH REAL AI REPORT DATA
   * ============================================================
   */
  const fetchAIOverview = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await getCohortAIOverview();

      if (!res?.success) {
        throw new Error(
          res?.message || "Failed to load AI cohort reports."
        );
      }

      /**
       * IMPORTANT:
       * Do NOT create fake fallback data here.
       *
       * Whatever the backend returns is what the dashboard displays.
       */
      setData(res.data || null);
    } catch (err) {
      console.error("Admin AI Reports Error:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to load AI cohort reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAIOverview();
  }, [fetchAIOverview]);

  /**
   * ============================================================
   * SAFE DATA EXTRACTION
   * ============================================================
   *
   * No fake numbers are generated here.
   * Missing backend values remain unavailable instead of
   * displaying misleading information.
   */

  const studentReports = useMemo(() => {
    if (!Array.isArray(data?.studentReports)) {
      return [];
    }

    return data.studentReports;
  }, [data]);

  const topWeaknesses = useMemo(() => {
    if (!Array.isArray(data?.topInstituteWeaknesses)) {
      return [];
    }

    return data.topInstituteWeaknesses;
  }, [data]);

  /**
   * ============================================================
   * SEARCH
   * ============================================================
   */
  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return studentReports;
    }

    return studentReports.filter((student) => {
      const name = String(student?.name || "").toLowerCase();
      const email = String(student?.email || "").toLowerCase();
      const exam = String(student?.exam || "").toLowerCase();

      return (
        name.includes(search) ||
        email.includes(search) ||
        exam.includes(search)
      );
    });
  }, [studentReports, searchTerm]);

  /**
   * ============================================================
   * FORMATTERS
   * ============================================================
   */

  const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "—";
    }

    return number.toFixed(decimals);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "—";
    }

    return `${formatNumber(number, number % 1 === 0 ? 0 : 1)}%`;
  };

  const formatScore = (exam, value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (exam === "IELTS") {
      return `Band ${formatNumber(value, 1)}`;
    }

    return formatNumber(value, 0);
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized.includes("on track") ||
      normalized.includes("ready") ||
      normalized.includes("good")
    ) {
      return "bg-green-50 text-green-700";
    }

    if (
      normalized.includes("risk") ||
      normalized.includes("lag") ||
      normalized.includes("weak") ||
      normalized.includes("attention")
    ) {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getTrendIcon = (student) => {
    const predicted = Number(student?.predictedScore);
    const target = Number(student?.targetScore);

    if (
      Number.isNaN(predicted) ||
      Number.isNaN(target)
    ) {
      return (
        <Minus className="w-3.5 h-3.5 text-slate-400" />
      );
    }

    if (predicted > target) {
      return (
        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
      );
    }

    if (predicted < target) {
      return (
        <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
      );
    }

    return (
      <Minus className="w-3.5 h-3.5 text-slate-400" />
    );
  };

  /**
   * ============================================================
   * LOADING STATE
   * ============================================================
   */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                AI Powered Insights
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              Cohort AI Predictions & Diagnosis
            </h1>

            <p className="text-slate-500 text-sm mt-0.5">
              Analyzing actual student performance data...
            </p>
          </div>

          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />

            <p className="text-slate-700 text-sm font-semibold">
              Loading AI reports
            </p>

            <p className="text-slate-400 text-xs mt-1">
              Reading student performance and assessment data...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /**
   * ============================================================
   * ERROR STATE
   * ============================================================
   */
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                AI Powered Insights
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              Cohort AI Predictions & Diagnosis
            </h1>

            <p className="text-slate-500 text-sm mt-0.5">
              AI analysis based on actual LMS performance data.
            </p>
          </div>

          <div className="bg-red-50 rounded-2xl p-8 text-center text-red-600 border border-red-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-3" />

            <p className="text-sm font-semibold">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchAIOverview()}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /**
   * ============================================================
   * NO DATA STATE
   * ============================================================
   */
  if (!data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                AI Powered Insights
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              Cohort AI Predictions & Diagnosis
            </h1>

            <p className="text-slate-500 text-sm mt-0.5">
              AI analysis based on actual LMS performance data.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <Brain className="w-10 h-10 mx-auto mb-3 text-slate-300" />

            <h3 className="text-base font-bold text-slate-800">
              No AI report data available
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              There is currently no generated report from the backend.
            </p>

            <button
              type="button"
              onClick={() => fetchAIOverview()}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Report
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /**
   * ============================================================
   * REAL BACKEND VALUES
   * ============================================================
   */

  const onTrackRate = data?.onTrackRate;
  const atRiskCount = data?.atRiskCount;
  const totalAnalyzed = data?.totalAnalyzed;

  /**
   * ============================================================
   * MAIN UI
   * ============================================================
   */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                AI Powered Insights
              </span>

              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-semibold">
                LIVE DATA
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              Cohort AI Predictions & Diagnosis
            </h1>

            <p className="text-slate-500 text-sm mt-0.5">
              AI analysis generated from actual student performance,
              assessment and practice data.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => fetchAIOverview(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing..." : "Refresh Analysis"}
          </button>
        </div>

        {/* =====================================================
            OVERVIEW STATS
        ====================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* ON TRACK */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                On-Track Readiness
              </p>

              <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                {formatPercentage(onTrackRate)}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Based on available student performance data
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* AT RISK */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Students Requiring Attention
              </p>

              <p className="text-3xl font-extrabold text-amber-600 mt-1">
                {formatNumber(atRiskCount)}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Identified from actual analysis
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* TOTAL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Students Analyzed
              </p>

              <p className="text-3xl font-extrabold text-slate-800 mt-1">
                {formatNumber(totalAnalyzed)}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Students included in this report
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* =====================================================
            REPORT INFORMATION
        ====================================================== */}
        {(data.generatedAt || data.lastUpdated || data.analysisPeriod) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-blue-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />

              <span className="font-semibold">
                AI Analysis
              </span>
            </div>

            {data.generatedAt && (
              <span>
                Generated:{" "}
                {new Date(data.generatedAt).toLocaleString()}
              </span>
            )}

            {data.lastUpdated && (
              <span>
                Updated:{" "}
                {new Date(data.lastUpdated).toLocaleString()}
              </span>
            )}

            {data.analysisPeriod && (
              <span>
                Period: {data.analysisPeriod}
              </span>
            )}
          </div>
        )}

        {/* =====================================================
            TOP INSTITUTE WEAKNESSES
        ====================================================== */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Top Institute-wide Skill Bottlenecks
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Skills identified as weaknesses across analyzed students.
              </p>
            </div>

            <BarChart3 className="w-5 h-5 text-slate-300" />
          </div>

          {topWeaknesses.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl">
              <Target className="w-7 h-7 mx-auto text-slate-300 mb-2" />

              <p className="text-sm font-semibold text-slate-600">
                No bottleneck data available
              </p>

              <p className="text-xs text-slate-400 mt-1">
                The backend has not returned institute-wide weakness data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topWeaknesses.map((item, index) => {
                const percentage = Number(
                  item?.affectedPercentage
                );

                const safePercentage =
                  Number.isNaN(percentage)
                    ? null
                    : Math.max(0, Math.min(100, percentage));

                return (
                  <div
                    key={`${item?.skill || "weakness"}-${index}`}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3"
                  >
                    <div className="flex justify-between items-center gap-3 text-xs font-bold text-slate-700">
                      <span className="truncate">
                        {item?.skill || "Unknown Skill"}
                      </span>

                      <span className="text-red-600 whitespace-nowrap">
                        {safePercentage === null
                          ? "—"
                          : `${formatPercentage(
                              safePercentage
                            )} Students`}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-500 transition-all"
                        style={{
                          width:
                            safePercentage === null
                              ? "0%"
                              : `${safePercentage}%`,
                        }}
                      />
                    </div>

                    {item?.description && (
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =====================================================
            STUDENT AI PREDICTIONS
        ====================================================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Student AI Predictions & Recommended Actions
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Individual predictions and weaknesses returned by the
                backend analysis.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {studentReports.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-9 h-9 mx-auto text-slate-300 mb-3" />

              <h3 className="text-sm font-bold text-slate-700">
                No student AI predictions available
              </h3>

              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                The backend did not return any analyzed student
                records. Predictions will appear here once actual
                student assessment data has been processed.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-3" />

              <h3 className="text-sm font-bold text-slate-700">
                No students found
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Try searching with another name, email or course.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-4 px-6">
                      Student
                    </th>

                    <th className="py-4 px-6">
                      Course
                    </th>

                    <th className="py-4 px-6 text-center">
                      Target
                    </th>

                    <th className="py-4 px-6 text-center">
                      AI Projected
                    </th>

                    <th className="py-4 px-6">
                      Primary Bottleneck
                    </th>

                    <th className="py-4 px-6 text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={
                        student?._id ||
                        student?.studentId ||
                        `${student?.email || "student"}-${index}`
                      }
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* STUDENT */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">
                          {student?.name || "Unknown Student"}
                        </div>

                        <div className="text-xs text-slate-400">
                          {student?.email || "—"}
                        </div>
                      </td>

                      {/* COURSE */}
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            student?.exam === "PTE"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {student?.exam || "—"}
                        </span>
                      </td>

                      {/* TARGET */}
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {formatScore(
                          student?.exam,
                          student?.targetScore
                        )}
                      </td>

                      {/* PREDICTED */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1.5">
                          {getTrendIcon(student)}

                          <span className="font-black text-blue-600">
                            {formatScore(
                              student?.exam,
                              student?.predictedScore
                            )}
                          </span>
                        </div>
                      </td>

                      {/* WEAKNESS */}
                      <td className="py-4 px-6">
                        <div className="text-xs text-slate-600 font-medium">
                          {student?.primaryWeakness || "—"}
                        </div>

                        {student?.recommendedAction && (
                          <div className="text-[11px] text-blue-600 mt-1">
                            Action:{" "}
                            {student.recommendedAction}
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(
                            student?.status
                          )}`}
                        >
                          {student?.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE FOOTER */}
          {studentReports.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
              <span>
                Showing{" "}
                <strong className="text-slate-700">
                  {filteredStudents.length}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-700">
                  {studentReports.length}
                </strong>{" "}
                analyzed students
              </span>

              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Data supplied by LMS AI analysis
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            OPTIONAL RAW DIAGNOSIS / SUMMARY
        ====================================================== */}
        {(data?.diagnosis || data?.summary || data?.overallDiagnosis) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-blue-600" />

              <h2 className="text-base font-bold text-slate-900">
                Cohort Diagnosis
              </h2>
            </div>

            <p className="text-sm leading-7 text-slate-600">
              {data?.diagnosis ||
                data?.overallDiagnosis ||
                data?.summary}
            </p>
          </div>
        )}

        {/* =====================================================
            IMPORTANT NOTE
        ====================================================== */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

            <p className="text-[11px] leading-relaxed text-slate-500">
              Predictions and diagnosis shown on this page are
              displayed from the AI report returned by the LMS
              backend. This dashboard does not generate or invent
              fallback scores when analysis data is unavailable.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAIReports;