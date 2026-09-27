import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";

import {
  Award,
  Clock,
  Play,
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  FileText,
  CalendarDays,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  getAllMockTests,
  startMockTestAttempt,
} from "../../services/mockTestService";

const StudentMockTests = () => {
  const navigate = useNavigate();

  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH MOCK TESTS
  // ============================================================

  const fetchMockTests = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllMockTests();

      if (res?.success) {
        setMockTests(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res?.message || "Failed to load mock tests.");
      }
    } catch (err) {
      console.error("Fetch Mock Tests Error:", err);

      setError(
        err?.message ||
          err?.error ||
          "Failed to load mock tests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockTests();
  }, []);

  // ============================================================
  // START MOCK TEST
  // ============================================================

  const handleStartMock = async (test) => {
    if (!test?._id) {
      setError("Invalid mock test.");
      return;
    }

    try {
      setStartingId(test._id);
      setError("");

      const res = await startMockTestAttempt(test._id);

      if (!res?.success) {
        throw new Error(
          res?.message || "Failed to start mock test."
        );
      }

      /*
       * Backend should return:
       *
       * {
       *   success: true,
       *   data: {
       *      _id: attemptId,
       *      mockTest: ...
       *   }
       * }
       *
       * We support both:
       * res.data._id
       * res.data.attempt._id
       */

      const attempt = res?.data?.attempt || res?.data;

      const attemptId = attempt?._id;

      if (!attemptId) {
        throw new Error(
          "Mock test started, but attempt ID was not returned by the server."
        );
      }

      /*
       * IMPORTANT:
       *
       * Previously this navigated to:
       * /student/ielts/tests
       * /student/pte/tests
       *
       * That was incorrect because MockTest has its own
       * questions and attempt.
       *
       * Now we open the dedicated Mock Test Attempt page.
       */

      navigate(`/student/mock-tests/${test._id}/attempt/${attemptId}`);
    } catch (err) {
      console.error("Start Mock Test Error:", err);

      setError(
        err?.message ||
          err?.error ||
          "Failed to start mock test."
      );
    } finally {
      setStartingId(null);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // TEST STATUS
  // ============================================================

  const getTestStatus = (test) => {
    if (!test) return "Active";

    if (test.status === "Published") {
      return "Active";
    }

    if (test.status === "Draft") {
      return "Draft";
    }

    if (test.status === "Archived") {
      return "Archived";
    }

    return "Active";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Full Mock Examinations
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Simulate real IELTS and PTE examination conditions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />

            <p className="text-sm font-medium text-slate-700">
              Loading available mock examinations...
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Please wait.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Full Mock Examinations
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Simulate real exam conditions for IELTS and PTE with
              full timed multi-section tests.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMockTests}
            disabled={loading}
            className="self-start md:self-auto px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />

            Refresh
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Unable to load mock tests
              </p>

              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchMockTests}
              className="text-xs font-semibold text-red-700 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* ======================================================
            INFO BANNER
        ====================================================== */}

        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">

          <div className="space-y-2 max-w-2xl">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-300" />

              <h2 className="text-base font-bold text-blue-200">
                Official Exam Simulation Mode
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mock examinations simulate real test-day conditions.
              Complete every section within the allocated time and
              receive your performance results after submission.
            </p>

          </div>

          <button
            type="button"
            onClick={() => navigate("/student/results")}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/10 transition flex items-center gap-2 whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4" />

            View Previous Results

            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {!error && mockTests.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">

            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-800">
              No Scheduled Mock Exams
            </h3>

            <p className="text-slate-500 text-xs max-w-md mx-auto mt-2 leading-relaxed">
              Upcoming mock exams assigned to your batch will appear
              here. In the meantime, continue practicing individual
              IELTS and PTE sections.
            </p>

            <button
              type="button"
              onClick={fetchMockTests}
              className="mt-5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />

              Check Again
            </button>
          </div>
        )}

        {/* ======================================================
            TEST LIST
        ====================================================== */}

        {mockTests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {mockTests.map((test) => {
              const isStarting = startingId === test._id;

              const status = getTestStatus(test);

              const scheduledDate = formatDate(
                test.scheduledDate
              );

              const expiresDate = formatDate(
                test.expiresAt
              );

              const questionCount =
                Array.isArray(test.questions)
                  ? test.questions.length
                  : Array.isArray(test.sections)
                  ? test.sections.reduce(
                      (total, section) =>
                        total +
                        (Array.isArray(section.questions)
                          ? section.questions.length
                          : 0),
                      0
                    )
                  : 0;

              const isDisabled =
                isStarting ||
                status === "Archived" ||
                status === "Draft";

              return (
                <div
                  key={test._id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition"
                >
                  <div>

                    {/* COURSE + STATUS */}

                    <div className="flex items-center justify-between gap-2">

                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          test.course === "IELTS"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {test.course || "Exam"}
                        {" • "}
                        {test.mockType || "Full Mock"}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          status === "Published"
                            ? "bg-green-50 text-green-700"
                            : status === "Draft"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* TITLE */}

                    <h3 className="text-base font-bold text-slate-800 mt-4">
                      {test.title || "Untitled Mock Test"}
                    </h3>

                    {/* DESCRIPTION */}

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                      {test.description ||
                        "Official length examination simulation."}
                    </p>

                    {/* TEST INFORMATION */}

                    <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-4 gap-x-2">

                      {/* DURATION */}

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />

                        <div>
                          <p className="font-semibold text-slate-700">
                            Duration
                          </p>

                          <p className="text-slate-500">
                            {test.duration || 0} min
                          </p>
                        </div>
                      </div>

                      {/* MARKS */}

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Award className="w-4 h-4 text-slate-400 shrink-0" />

                        <div>
                          <p className="font-semibold text-slate-700">
                            Marks
                          </p>

                          <p className="text-slate-500">
                            {test.totalMarks || 0}
                          </p>
                        </div>
                      </div>

                      {/* QUESTIONS */}

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />

                        <div>
                          <p className="font-semibold text-slate-700">
                            Questions
                          </p>

                          <p className="text-slate-500">
                            {questionCount}
                          </p>
                        </div>
                      </div>

                      {/* PASSING SCORE */}

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />

                        <div>
                          <p className="font-semibold text-slate-700">
                            Passing
                          </p>

                          <p className="text-slate-500">
                            {test.passingScore || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SCHEDULE */}

                    {(scheduledDate || expiresDate) && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">

                        {scheduledDate && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-600">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />

                            <span>
                              Scheduled:{" "}
                              <strong className="text-slate-700">
                                {scheduledDate}
                              </strong>
                            </span>
                          </div>
                        )}

                        {expiresDate && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />

                            <span>
                              Expires:{" "}
                              <strong className="text-slate-700">
                                {expiresDate}
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* START BUTTON */}

                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleStartMock(test)}
                    className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                      isDisabled
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />

                        Starting Mock Exam...
                      </>
                    ) : status === "Draft" ? (
                      <>
                        <FileText className="w-3.5 h-3.5" />

                        Not Available
                      </>
                    ) : status === "Archived" ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />

                        Archived
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />

                        Start Mock Exam
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentMockTests;