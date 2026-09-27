import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Users,
  X,
  AlertCircle,
  PlayCircle,
  Edit3,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getTeacherProfile } from "../../services/teacherDashboardService";
import TeacherPracticeTestsTab from "../../components/teacher/TeacherPracticeTestsTab";
import TeacherPracticeTestEvaluationsTab from "../../components/teacher/TeacherPracticeTestEvaluationsTab";

import {
  getAllMockTests,
  getMockTestAttempts,
  evaluateMockTestAttempt,
} from "../../services/mockTestService";
import { evaluateSubmission } from "../../services/aiService";

const TeacherTests = () => {
  /* =========================================================
     AUTH & TEACHER SPECIALIZATION
  ========================================================= */

  const { user } = useAuth();
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [specialization, setSpecialization] = useState(
    user?.specialization || "Both"
  );

  useEffect(() => {
    getTeacherProfile()
      .then((res) => {
        if (res?.data) {
          setTeacherProfile(res.data);
          if (res.data.specialization) {
            setSpecialization(res.data.specialization);
          }
        }
      })
      .catch(() => {});
  }, [user?.specialization]);

  /* =========================================================
     STATE
  ========================================================= */

  const [mockTests, setMockTests] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("practice-tests");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  /* =========================================================
     TEST DETAILS MODAL
  ========================================================= */

  const [selectedTest, setSelectedTest] = useState(null);

  /* =========================================================
     ATTEMPT DETAILS MODAL
  ========================================================= */

  const [selectedAttempt, setSelectedAttempt] = useState(null);

  /* =========================================================
     EVALUATION MODAL
  ========================================================= */

  const [evaluationAttempt, setEvaluationAttempt] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [aiEvaluating, setAiEvaluating] = useState(false);

  const [evalData, setEvalData] = useState({
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
    overallBandOrScore: "",
    feedback: "",
  });

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [testsRes, attemptsRes] = await Promise.all([
        getAllMockTests(),
        getMockTestAttempts(),
      ]);

      if (testsRes?.success) {
        setMockTests(Array.isArray(testsRes.data) ? testsRes.data : []);
      } else {
        setMockTests([]);
      }

      if (attemptsRes?.success) {
        setAttempts(
          Array.isArray(attemptsRes.data) ? attemptsRes.data : []
        );
      } else {
        setAttempts([]);
      }
    } catch (err) {
      console.error("Teacher Mock Test Load Error:", err);

      setError(
        err?.message ||
          err?.error ||
          "Failed to load mock test information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getTestQuestionsCount = (test) => {
    if (!test) return 0;

    if (Array.isArray(test.questions) && test.questions.length > 0) {
      return test.questions.length;
    }

    if (Array.isArray(test.sections)) {
      return test.sections.reduce((total, section) => {
        return (
          total +
          (Array.isArray(section.questions)
            ? section.questions.length
            : 0)
        );
      }, 0);
    }

    return 0;
  };

  const getTestSectionsCount = (test) => {
    if (!test || !Array.isArray(test.sections)) {
      return 0;
    }

    return test.sections.length;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Published":
        return "bg-green-50 text-green-700 border-green-200";

      case "Archived":
        return "bg-slate-100 text-slate-600 border-slate-200";

      case "Draft":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getAttemptStatusClasses = (status) => {
    switch (status) {
      case "Evaluated":
        return "bg-green-50 text-green-700 border-green-200";

      case "Submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getQuestionTypeBadge = (questionType) => {
    if (!questionType) {
      return "Question";
    }

    return questionType;
  };

  /* =========================================================
     FILTERED TESTS
  ========================================================= */

  const filteredTests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return mockTests.filter((test) => {
      const matchesSearch =
        !search ||
        test?.title?.toLowerCase().includes(search) ||
        test?.description?.toLowerCase().includes(search);

      const matchesCourse =
        courseFilter === "All" || test?.course === courseFilter;

      const matchesStatus =
        statusFilter === "All" || test?.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [
    mockTests,
    searchTerm,
    courseFilter,
    statusFilter,
  ]);

  /* =========================================================
     FILTERED ATTEMPTS
  ========================================================= */

  const filteredAttempts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const studentName =
        attempt?.student?.name?.toLowerCase() || "";

      const studentEmail =
        attempt?.student?.email?.toLowerCase() || "";

      const testTitle =
        attempt?.mockTest?.title?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        studentName.includes(search) ||
        studentEmail.includes(search) ||
        testTitle.includes(search);

      const matchesCourse =
        courseFilter === "All" ||
        attempt?.course === courseFilter;

      const matchesStatus =
        statusFilter === "All" ||
        attempt?.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [
    attempts,
    searchTerm,
    courseFilter,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const totalTests = mockTests.length;

    const publishedTests = mockTests.filter(
      (test) => test.status === "Published"
    ).length;

    const totalSubmissions = attempts.length;

    const pendingEvaluation = attempts.filter(
      (attempt) =>
        attempt.status === "Submitted" ||
        attempt.status === "In Progress"
    ).length;

    const evaluated = attempts.filter(
      (attempt) => attempt.status === "Evaluated"
    ).length;

    return {
      totalTests,
      publishedTests,
      totalSubmissions,
      pendingEvaluation,
      evaluated,
    };
  }, [mockTests, attempts]);

  /* =========================================================
     OPEN TEST DETAILS
  ========================================================= */

  const handleOpenTest = (test) => {
    setSelectedTest(test);
  };

  /* =========================================================
     OPEN ATTEMPT DETAILS
  ========================================================= */

  const handleOpenAttempt = (attempt) => {
    setSelectedAttempt(attempt);
  };

  /* =========================================================
     OPEN EVALUATION
  ========================================================= */

  const handleOpenEvaluate = (attempt) => {
    if (!attempt) return;

    setEvaluationAttempt(attempt);

    const breakdown = attempt.sectionBreakdown || {};

    setEvalData({
      listening:
        breakdown.listening !== undefined
          ? breakdown.listening
          : "",

      reading:
        breakdown.reading !== undefined
          ? breakdown.reading
          : "",

      writing:
        breakdown.writing !== undefined
          ? breakdown.writing
          : "",

      speaking:
        breakdown.speaking !== undefined
          ? breakdown.speaking
          : "",

      overallBandOrScore:
        attempt.overallBandOrScore !== undefined &&
        attempt.overallBandOrScore !== null
          ? attempt.overallBandOrScore
          : "",

      feedback: attempt.feedback || "",
    });
  };

  /* =========================================================
     CLOSE EVALUATION
  ========================================================= */

  const handleCloseEvaluation = () => {
    if (evaluating) return;

    setEvaluationAttempt(null);

    setEvalData({
      listening: "",
      reading: "",
      writing: "",
      speaking: "",
      overallBandOrScore: "",
      feedback: "",
    });
  };

  /* =========================================================
     CHANGE EVALUATION FIELD
  ========================================================= */

  const handleEvaluationChange = (field, value) => {
    setEvalData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =========================================================
     AI AUTO-EVALUATION
  ========================================================= */

  const handleAIEvaluate = async () => {
    if (!evaluationAttempt) return;

    try {
      setAiEvaluating(true);

      const course = evaluationAttempt.course || "IELTS";
      const answers = Array.isArray(evaluationAttempt.answers) ? evaluationAttempt.answers : [];

      // Combine answers for assessment
      const answerTexts = answers.map((a) => typeof a.answer === "string" ? a.answer : JSON.stringify(a.answer || "")).join("\n\n");

      const res = await evaluateSubmission({
        examType: course,
        section: "Writing",
        questionText: evaluationAttempt.mockTest?.title || "Mock Test Assessment",
        studentAnswer: answerTexts,
        wordCount: answerTexts.split(/\s+/).filter(Boolean).length,
      });

      if (res?.success && res.data) {
        const { band, score, feedback } = res.data;

        if (course === "IELTS") {
          const autoBand = band || 6.5;
          setEvalData((prev) => ({
            ...prev,
            listening: prev.listening || autoBand,
            reading: prev.reading || autoBand,
            writing: prev.writing || (autoBand > 0.5 ? autoBand - 0.5 : autoBand),
            speaking: prev.speaking || autoBand,
            overallBandOrScore: autoBand,
            feedback: (prev.feedback ? prev.feedback + "\n\n" : "") + `[AI Evaluation]: ${feedback}`,
          }));
        } else {
          const autoScore = score || 65;
          setEvalData((prev) => ({
            ...prev,
            listening: prev.listening || autoScore,
            reading: prev.reading || autoScore,
            writing: prev.writing || (autoScore > 5 ? autoScore - 5 : autoScore),
            speaking: prev.speaking || autoScore,
            overallBandOrScore: autoScore,
            feedback: (prev.feedback ? prev.feedback + "\n\n" : "") + `[AI Evaluation]: ${feedback}`,
          }));
        }
      }
    } catch (err) {
      console.error("AI Evaluation error:", err);
      alert(err?.message || "Failed to run AI evaluation.");
    } finally {
      setAiEvaluating(false);
    }
  };

  /* =========================================================
     SAVE EVALUATION
  ========================================================= */

  const handleSaveEvaluation = async (event) => {
    event.preventDefault();

    if (!evaluationAttempt?._id) {
      return;
    }

    try {
      setEvaluating(true);

      const isIELTS =
        evaluationAttempt.course === "IELTS";

      const listening = Number(
        evalData.listening || 0
      );

      const reading = Number(
        evalData.reading || 0
      );

      const writing = Number(
        evalData.writing || 0
      );

      const speaking = Number(
        evalData.speaking || 0
      );

      let overall = Number(
        evalData.overallBandOrScore || 0
      );

      /*
       * If teacher has not manually entered
       * an overall score, calculate it.
       */
      if (!overall) {
        const values = [
          listening,
          reading,
          writing,
          speaking,
        ];

        const hasValues = values.some(
          (value) => value > 0
        );

        if (hasValues) {
          const average =
            values.reduce(
              (sum, value) => sum + value,
              0
            ) / values.length;

          overall = isIELTS
            ? Number(average.toFixed(1))
            : Math.round(average);
        }
      }

      await evaluateMockTestAttempt(
        evaluationAttempt._id,
        {
          sectionBreakdown: {
            listening,
            reading,
            writing,
            speaking,
          },

          overallBandOrScore: overall,

          feedback: evalData.feedback.trim(),
        }
      );

      handleCloseEvaluation();

      await loadData(false);

      alert("Evaluation saved successfully.");
    } catch (err) {
      console.error(
        "Mock Test Evaluation Error:",
        err
      );

      alert(
        err?.message ||
          err?.error ||
          "Failed to save evaluation."
      );
    } finally {
      setEvaluating(false);
    }
  };

  /* =========================================================
     RENDER LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
          <Loader2 className="w-9 h-9 animate-spin text-blue-600 mx-auto mb-4" />

          <h3 className="text-sm font-bold text-slate-800">
            Loading Mock Tests
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Please wait while we load test information.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="space-y-6 pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-800">
                  Teacher Test & Evaluation Center
                </h1>

                <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full text-xs shadow-sm flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  {specialization === "Both"
                    ? "Dual Specialization: IELTS & PTE Trainer"
                    : `${specialization} Trainer`}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Create and manage practice tests, evaluate student speaking voice
                recordings & essays, and oversee assigned mock tests.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadData(false)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-60"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Unable to load mock tests
            </p>

            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            className="text-xs font-bold text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN TAB NAVIGATION
      ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl px-5 pt-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("practice-tests")}
            className={`px-4 pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "practice-tests"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Practice Tests
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("practice-evaluations")}
            className={`px-4 pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "practice-evaluations"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Award className="w-4 h-4" />
            Evaluate Practice Tests
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tests")}
            className={`px-4 pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "tests"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            Mock Tests ({mockTests.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`px-4 pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "submissions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Mock Submissions ({attempts.length})
          </button>
        </div>

        {/* Filters only for Mock Tests tabs */}
        {(activeTab === "tests" || activeTab === "submissions") && (
          <div className="py-4 flex flex-col xl:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={
                  activeTab === "tests"
                    ? "Search mock tests..."
                    : "Search student or test..."
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className="appearance-none pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="All">All Courses</option>
                <option value="IELTS">IELTS</option>
                <option value="PTE">PTE</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
              >
                {activeTab === "tests" ? (
                  <>
                    <option value="All">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </>
                ) : (
                  <>
                    <option value="All">All Status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Evaluated">Evaluated</option>
                  </>
                )}
              </select>
            </div>

            {(searchTerm || courseFilter !== "All" || statusFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCourseFilter("All");
                  setStatusFilter("All");
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          PRACTICE TESTS TAB
      ===================================================== */}

      {activeTab === "practice-tests" && (
        <TeacherPracticeTestsTab teacherSpecialization={specialization} />
      )}

      {/* =====================================================
          PRACTICE EVALUATIONS TAB
      ===================================================== */}

      {activeTab === "practice-evaluations" && (
        <TeacherPracticeTestEvaluationsTab
          teacherSpecialization={specialization}
        />
      )}

      {/* =====================================================
          TESTS TAB
      ===================================================== */}

      {activeTab === "tests" && (
        <>
          {filteredTests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No mock tests found"
              message={
                mockTests.length === 0
                  ? "No mock tests have been assigned yet."
                  : "Try changing your search or filters."
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {filteredTests.map((test) => (
                <div
                  key={test._id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                >

                  {/* Card top */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          test.course === "IELTS"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {test.course}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusClasses(
                          test.status
                        )}`}
                      >
                        {test.status || "Draft"}
                      </span>

                    </div>

                    <h3 className="text-base font-bold text-slate-800 mt-4">
                      {test.title || "Untitled Mock Test"}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 min-h-[32px]">
                      {test.description ||
                        "No description provided for this mock test."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-5">

                      <InfoBox
                        icon={Clock}
                        label="Duration"
                        value={`${test.duration || 0} min`}
                      />

                      <InfoBox
                        icon={Award}
                        label="Marks"
                        value={test.totalMarks || 0}
                      />

                      <InfoBox
                        icon={BookOpen}
                        label="Sections"
                        value={getTestSectionsCount(test)}
                      />

                      <InfoBox
                        icon={FileText}
                        label="Questions"
                        value={getTestQuestionsCount(test)}
                      />

                    </div>

                    {Array.isArray(test.assignedBatches) &&
                      test.assignedBatches.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5" />

                          <span>
                            {test.assignedBatches.length} assigned batch
                            {test.assignedBatches.length !== 1
                              ? "es"
                              : ""}
                          </span>
                        </div>
                      )}

                  </div>

                  {/* Card footer */}

                  <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">

                    <span className="text-[11px] text-slate-400">
                      Created {formatDate(test.createdAt)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenTest(test)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}
        </>
      )}

      {/* =====================================================
          SUBMISSIONS TAB
      ===================================================== */}

      {activeTab === "submissions" && (
        <>
          {filteredAttempts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No student submissions"
              message={
                attempts.length === 0
                  ? "Students have not submitted any mock tests yet."
                  : "Try changing your search or filters."
              }
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">

                      <th className="py-4 px-5">
                        Student
                      </th>

                      <th className="py-4 px-5">
                        Mock Test
                      </th>

                      <th className="py-4 px-5">
                        Course
                      </th>

                      <th className="py-4 px-5">
                        Submitted
                      </th>

                      <th className="py-4 px-5 text-center">
                        Score / Band
                      </th>

                      <th className="py-4 px-5 text-center">
                        Status
                      </th>

                      <th className="py-4 px-5 text-right">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredAttempts.map((attempt) => (
                      <tr
                        key={attempt._id}
                        className="hover:bg-slate-50/70 transition"
                      >

                        <td className="py-4 px-5">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {(attempt.student?.name ||
                                "S")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {attempt.student?.name ||
                                  "Student"}
                              </p>

                              <p className="text-[11px] text-slate-400">
                                {attempt.student?.email ||
                                  "No email"}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="py-4 px-5">

                          <p className="font-semibold text-slate-800 text-sm">
                            {attempt.mockTest?.title ||
                              "Mock Test"}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {attempt.mockTest?.mockType ||
                              "Mock"}
                          </p>

                        </td>

                        <td className="py-4 px-5">

                          <span
                            className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                              attempt.course ===
                              "IELTS"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {attempt.course ||
                              "-"}
                          </span>

                        </td>

                        <td className="py-4 px-5 text-xs text-slate-500">
                          {formatDateTime(
                            attempt.submittedAt ||
                              attempt.createdAt
                          )}
                        </td>

                        <td className="py-4 px-5 text-center">

                          <span className="text-base font-bold text-slate-800">
                            {attempt.overallBandOrScore ||
                              "-"}
                          </span>

                          {attempt.percentage !==
                            undefined &&
                            attempt.percentage !== null && (
                              <p className="text-[10px] text-slate-400">
                                {attempt.percentage}%
                              </p>
                            )}

                        </td>

                        <td className="py-4 px-5 text-center">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold ${getAttemptStatusClasses(
                              attempt.status
                            )}`}
                          >
                            {attempt.status ||
                              "Unknown"}
                          </span>

                        </td>

                        <td className="py-4 px-5">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenAttempt(
                                  attempt
                                )
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="View submission"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenEvaluate(
                                  attempt
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />

                              {attempt.status ===
                              "Evaluated"
                                ? "Re-evaluate"
                                : "Evaluate"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>
          )}
        </>
      )}

      {/* =====================================================
          TEST DETAILS MODAL
      ===================================================== */}

      {selectedTest && (
        <Modal
          title="Mock Test Details"
          subtitle={selectedTest.title}
          onClose={() => setSelectedTest(null)}
          maxWidth="max-w-4xl"
        >

          <div className="space-y-5">

            {/* Basic information */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              <DetailCard
                label="Course"
                value={selectedTest.course}
              />

              <DetailCard
                label="Mock Type"
                value={selectedTest.mockType}
              />

              <DetailCard
                label="Duration"
                value={`${selectedTest.duration || 0} minutes`}
              />

              <DetailCard
                label="Difficulty"
                value={selectedTest.difficulty}
              />

            </div>

            {/* Description */}

            {selectedTest.description && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Description
                </h4>

                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-6">
                  {selectedTest.description}
                </div>
              </div>
            )}

            {/* Instructions */}

            {selectedTest.instructions && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Instructions
                </h4>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-6">
                  {selectedTest.instructions}
                </div>
              </div>
            )}

            {/* Sections */}

            <div>

              <div className="flex items-center justify-between mb-3">

                <h4 className="text-sm font-bold text-slate-800">
                  Sections
                </h4>

                <span className="text-xs text-slate-400">
                  {getTestSectionsCount(
                    selectedTest
                  )}{" "}
                  sections
                </span>

              </div>

              {Array.isArray(
                selectedTest.sections
              ) &&
              selectedTest.sections.length > 0 ? (
                <div className="space-y-3">

                  {selectedTest.sections.map(
                    (section, index) => (
                      <SectionPreview
                        key={
                          section._id ||
                          `${section.name}-${index}`
                        }
                        section={section}
                        index={index}
                      />
                    )
                  )}

                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-5 text-center">
                  <p className="text-xs text-slate-500">
                    No section information available.
                  </p>
                </div>
              )}

            </div>

          </div>

        </Modal>
      )}

      {/* =====================================================
          ATTEMPT DETAILS MODAL
      ===================================================== */}

      {selectedAttempt && (
        <Modal
          title="Student Submission"
          subtitle={`${selectedAttempt.student?.name || "Student"} • ${
            selectedAttempt.mockTest?.title ||
            "Mock Test"
          }`}
          onClose={() =>
            setSelectedAttempt(null)
          }
          maxWidth="max-w-5xl"
        >

          <div className="space-y-5">

            {/* Attempt summary */}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

              <DetailCard
                label="Course"
                value={selectedAttempt.course}
              />

              <DetailCard
                label="Status"
                value={selectedAttempt.status}
              />

              <DetailCard
                label="Score / Band"
                value={
                  selectedAttempt
                    .overallBandOrScore ||
                  "-"
                }
              />

              <DetailCard
                label="Percentage"
                value={
                  selectedAttempt.percentage !==
                  undefined
                    ? `${selectedAttempt.percentage}%`
                    : "-"
                }
              />

              <DetailCard
                label="Submitted"
                value={formatDate(
                  selectedAttempt.submittedAt
                )}
              />

            </div>

            {/* Section breakdown */}

            <div>

              <h4 className="text-sm font-bold text-slate-800 mb-3">
                Section Breakdown
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <ScoreCard
                  label="Listening"
                  value={
                    selectedAttempt
                      .sectionBreakdown
                      ?.listening
                  }
                />

                <ScoreCard
                  label="Reading"
                  value={
                    selectedAttempt
                      .sectionBreakdown
                      ?.reading
                  }
                />

                <ScoreCard
                  label="Writing"
                  value={
                    selectedAttempt
                      .sectionBreakdown
                      ?.writing
                  }
                />

                <ScoreCard
                  label="Speaking"
                  value={
                    selectedAttempt
                      .sectionBreakdown
                      ?.speaking
                  }
                />

              </div>

            </div>

            {/* Answers */}

            <div>

              <div className="flex items-center justify-between mb-3">

                <h4 className="text-sm font-bold text-slate-800">
                  Submitted Answers
                </h4>

                <span className="text-xs text-slate-400">
                  {Array.isArray(
                    selectedAttempt.answers
                  )
                    ? selectedAttempt.answers.length
                    : 0}{" "}
                  answers
                </span>

              </div>

              {Array.isArray(
                selectedAttempt.answers
              ) &&
              selectedAttempt.answers.length >
                0 ? (
                <div className="space-y-3">

                  {selectedAttempt.answers.map(
                    (answer, index) => (
                      <div
                        key={
                          answer.questionId ||
                          index
                        }
                        className="border border-slate-200 rounded-xl p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-start gap-3">

                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                              {index + 1}
                            </div>

                            <div>

                              <p className="text-xs font-bold text-slate-500 uppercase">
                                Question ID
                              </p>

                              <p className="text-xs text-slate-700 mt-1 break-all">
                                {answer.questionId ||
                                  "-"}
                              </p>

                            </div>

                          </div>

                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              answer.evaluated
                                ? answer.isCorrect
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {answer.evaluated
                              ? answer.isCorrect
                                ? "Correct"
                                : "Incorrect"
                              : "Pending"}
                          </span>

                        </div>

                        <div className="mt-4 bg-slate-50 rounded-lg p-3">

                          <p className="text-[10px] uppercase font-bold text-slate-400">
                            Student Answer
                          </p>

                          {typeof answer.answer === "string" && (answer.answer.includes("/uploads/audio") || answer.answer.startsWith("http") && (answer.answer.endsWith(".webm") || answer.answer.endsWith(".mp3") || answer.answer.endsWith(".wav") || answer.answer.endsWith(".ogg"))) ? (
                            <div className="mt-2">
                              <audio
                                controls
                                src={answer.answer.startsWith("http") ? answer.answer : `http://localhost:5000${answer.answer}`}
                                className="w-full h-9 rounded-lg"
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap break-words">
                              {formatAnswer(
                                answer.answer
                              )}
                            </p>
                          )}

                        </div>

                        {answer.feedback && (
                          <div className="mt-3 flex gap-2">

                            <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />

                            <p className="text-xs text-slate-600">
                              {answer.feedback}
                            </p>

                          </div>
                        )}

                        <div className="mt-3 text-xs text-slate-400">
                          Marks obtained:{" "}
                          <span className="font-bold text-slate-600">
                            {answer.marksObtained ??
                              0}
                          </span>
                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />

                  <p className="text-sm font-semibold text-slate-600">
                    No submitted answers available
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    The backend did not return answer details for this attempt.
                  </p>
                </div>
              )}

            </div>

            {/* Feedback */}

            {selectedAttempt.feedback && (
              <div>

                <h4 className="text-sm font-bold text-slate-800 mb-2">
                  Teacher Feedback
                </h4>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-6">
                  {selectedAttempt.feedback}
                </div>

              </div>
            )}

            {/* Actions */}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">

              <button
                type="button"
                onClick={() => {
                  setSelectedAttempt(null);
                  handleOpenEvaluate(
                    selectedAttempt
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
              >
                <Edit3 className="w-4 h-4" />

                {selectedAttempt.status ===
                "Evaluated"
                  ? "Re-evaluate"
                  : "Evaluate"}
              </button>

            </div>

          </div>

        </Modal>
      )}

      {/* =====================================================
          EVALUATION MODAL
      ===================================================== */}

      {evaluationAttempt && (
        <Modal
          title={
            evaluationAttempt.status ===
            "Evaluated"
              ? "Re-evaluate Submission"
              : "Evaluate Submission"
          }
          subtitle={`${evaluationAttempt.student?.name || "Student"} • ${
            evaluationAttempt.mockTest?.title ||
            "Mock Test"
          }`}
          onClose={handleCloseEvaluation}
          maxWidth="max-w-2xl"
        >

          <form
            onSubmit={handleSaveEvaluation}
            className="space-y-5"
          >

            {/* Evaluation notice & AI Evaluate */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800">
                    Teacher Evaluation & AI Assistant
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-5">
                    Enter section scores manually or use AI to automatically generate scores and feedback.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAIEvaluate}
                disabled={aiEvaluating || evaluating}
                className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow transition disabled:opacity-60"
              >
                {aiEvaluating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                )}
                {aiEvaluating ? "Analyzing with AI..." : "Evaluate with AI"}
              </button>

            </div>

            {/* Scores */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <EvaluationInput
                label="Listening"
                value={evalData.listening}
                onChange={(value) =>
                  handleEvaluationChange(
                    "listening",
                    value
                  )
                }
                isIELTS={
                  evaluationAttempt.course ===
                  "IELTS"
                }
              />

              <EvaluationInput
                label="Reading"
                value={evalData.reading}
                onChange={(value) =>
                  handleEvaluationChange(
                    "reading",
                    value
                  )
                }
                isIELTS={
                  evaluationAttempt.course ===
                  "IELTS"
                }
              />

              <EvaluationInput
                label="Writing"
                value={evalData.writing}
                onChange={(value) =>
                  handleEvaluationChange(
                    "writing",
                    value
                  )
                }
                isIELTS={
                  evaluationAttempt.course ===
                  "IELTS"
                }
              />

              <EvaluationInput
                label="Speaking"
                value={evalData.speaking}
                onChange={(value) =>
                  handleEvaluationChange(
                    "speaking",
                    value
                  )
                }
                isIELTS={
                  evaluationAttempt.course ===
                  "IELTS"
                }
              />

            </div>

            {/* Overall */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Overall{" "}
                {evaluationAttempt.course ===
                "IELTS"
                  ? "Band"
                  : "Score"}
              </label>

              <input
                type="number"
                min="0"
                step={
                  evaluationAttempt.course ===
                  "IELTS"
                    ? "0.5"
                    : "1"
                }
                value={
                  evalData.overallBandOrScore
                }
                onChange={(event) =>
                  handleEvaluationChange(
                    "overallBandOrScore",
                    event.target.value
                  )
                }
                placeholder="Leave empty to calculate"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />

            </div>

            {/* Feedback */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Teacher Feedback
              </label>

              <textarea
                rows={5}
                value={evalData.feedback}
                onChange={(event) =>
                  handleEvaluationChange(
                    "feedback",
                    event.target.value
                  )
                }
                placeholder="Write feedback for the student..."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />

              <p className="text-[11px] text-slate-400 mt-1.5">
                This feedback will be stored with the
                student's mock test result.
              </p>

            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">

              <button
                type="button"
                onClick={handleCloseEvaluation}
                disabled={evaluating}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={evaluating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-60"
              >
                {evaluating && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}

                {evaluating
                  ? "Saving..."
                  : "Save Evaluation"}
              </button>

            </div>

          </form>

        </Modal>
      )}

    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconClass,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-semibold text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-1">
            {value}
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>

      </div>

    </div>
  );
};

/* =========================================================
   INFO BOX
========================================================= */

const InfoBox = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="bg-slate-50 rounded-xl p-3">

      <div className="flex items-center gap-1.5 text-slate-400">

        <Icon className="w-3.5 h-3.5" />

        <span className="text-[10px] uppercase font-bold">
          {label}
        </span>

      </div>

      <p className="text-sm font-bold text-slate-700 mt-1">
        {value}
      </p>

    </div>
  );
};

/* =========================================================
   DETAIL CARD
========================================================= */

const DetailCard = ({
  label,
  value,
}) => {
  return (
    <div className="bg-slate-50 rounded-xl p-3">

      <p className="text-[10px] uppercase font-bold text-slate-400">
        {label}
      </p>

      <p className="text-sm font-bold text-slate-700 mt-1 break-words">
        {value || "-"}
      </p>

    </div>
  );
};

/* =========================================================
   SCORE CARD
========================================================= */

const ScoreCard = ({
  label,
  value,
}) => {
  return (
    <div className="border border-slate-200 rounded-xl p-4">

      <p className="text-[10px] uppercase font-bold text-slate-400">
        {label}
      </p>

      <p className="text-xl font-bold text-slate-800 mt-1">
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? value
          : "-"}
      </p>

    </div>
  );
};

/* =========================================================
   EVALUATION INPUT
========================================================= */

const EvaluationInput = ({
  label,
  value,
  onChange,
  isIELTS,
}) => {
  return (
    <div>

      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
        {label}
      </label>

      <input
        type="number"
        min="0"
        step={isIELTS ? "0.5" : "1"}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={
          isIELTS
            ? "e.g. 7.5"
            : "e.g. 78"
        }
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
      />

    </div>
  );
};

/* =========================================================
   SECTION PREVIEW
========================================================= */

const SectionPreview = ({
  section,
  index,
}) => {
  const [expanded, setExpanded] =
    useState(false);

  const questions = Array.isArray(
    section?.questions
  )
    ? section.questions
    : [];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">

      <button
        type="button"
        onClick={() =>
          setExpanded(!expanded)
        }
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-slate-50 transition text-left"
      >

        <div className="flex items-center gap-3">

          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>

          <div>

            <p className="text-sm font-bold text-slate-800">
              {section?.name ||
                `Section ${index + 1}`}
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              {section?.duration || 0} minutes
              {" • "}
              {questions.length} questions
            </p>

          </div>

        </div>

        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}

      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">

          {section?.instructions && (
            <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">

              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Instructions
              </p>

              <p className="text-xs text-slate-600 leading-5">
                {section.instructions}
              </p>

            </div>
          )}

          {questions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">
              No questions in this section.
            </p>
          ) : (
            <div className="space-y-2">

              {questions.map(
                (question, questionIndex) => (
                  <div
                    key={
                      question?._id ||
                      `${index}-${questionIndex}`
                    }
                    className="bg-white border border-slate-200 rounded-lg p-3"
                  >

                    <div className="flex items-start gap-3">

                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                        Q{questionIndex + 1}
                      </span>

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                            {getQuestionTypeBadge(
                              question?.questionType
                            )}
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {question?.marks ||
                              0}{" "}
                            mark
                            {question?.marks === 1
                              ? ""
                              : "s"}
                          </span>

                        </div>

                        <p className="text-xs text-slate-700 mt-2 leading-5">
                          {question?.question ||
                            question?.questionText ||
                            "No question text available."}
                        </p>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};

/* =========================================================
   MODAL
========================================================= */

const Modal = ({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-lg",
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[92vh] overflow-hidden`}
      >

        {/* Header */}

        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">

          <div>

            <h3 className="text-base font-bold text-slate-900">
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">
                {subtitle}
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* Body */}

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-90px)]">
          {children}
        </div>

      </div>

    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  icon: Icon,
  title,
  message,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>

      <h3 className="text-sm font-bold text-slate-700 mt-4">
        {title}
      </h3>

      <p className="text-xs text-slate-400 mt-1">
        {message}
      </p>

    </div>
  );
};

/* =========================================================
   FORMAT ANSWER
========================================================= */

const formatAnswer = (answer) => {
  if (
    answer === null ||
    answer === undefined ||
    answer === ""
  ) {
    return "No answer submitted.";
  }

  if (Array.isArray(answer)) {
    return answer.join(", ");
  }

  if (typeof answer === "object") {
    try {
      return JSON.stringify(
        answer,
        null,
        2
      );
    } catch {
      return String(answer);
    }
  }

  return String(answer);
};

export default TeacherTests;