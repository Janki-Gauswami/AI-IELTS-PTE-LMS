import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  PlayCircle,
  Edit3,
  Loader2,
  X,
  Volume2,
  User,
  BookOpen,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import {
  getIELTSTestAttemptsForReview,
  getIELTSTestAttemptForReview,
  evaluateIELTSTestAttempt,
} from "../../services/ieltsPracticeTestService";

import {
  getPTETestAttemptsForReview,
  getPTETestAttemptForReview,
  evaluatePTETestAttempt,
} from "../../services/ptePracticeTestService";

const TeacherPracticeTestEvaluationsTab = ({ teacherSpecialization }) => {
  const canIELTS =
    teacherSpecialization === "IELTS" || teacherSpecialization === "Both";
  const canPTE =
    teacherSpecialization === "PTE" || teacherSpecialization === "Both";

  const [courseFilter, setCourseFilter] = useState(
    teacherSpecialization === "PTE" ? "PTE" : "IELTS"
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Evaluation Modal State
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submittingEval, setSubmittingEval] = useState(false);
  const [questionScores, setQuestionScores] = useState({});

  const [evalForm, setEvalForm] = useState({
    overallBandOrScore: "",
    speakingBandOrScore: "",
    writingBandOrScore: "",
    readingScore: "",
    listeningScore: "",
    numericScore: "",
    speakingFeedback: "",
    writingFeedback: "",
    generalFeedback: "",
  });

  // Load review submissions
  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      let allAttempts = [];

      if (courseFilter === "IELTS" && canIELTS) {
        const res = await getIELTSTestAttemptsForReview();
        const list = (res?.data || []).map((item) => ({
          ...item,
          examType: "IELTS",
        }));
        allAttempts = list;
      } else if (courseFilter === "PTE" && canPTE) {
        const res = await getPTETestAttemptsForReview();
        const list = (res?.data || []).map((item) => ({
          ...item,
          examType: "PTE",
        }));
        allAttempts = list;
      }

      setAttempts(allAttempts);
    } catch (err) {
      console.error("Load Submissions Error:", err);
      setError(
        err?.message ||
          `Failed to load ${courseFilter} submissions for evaluation.`
      );
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [courseFilter]);

  // Open Evaluation Modal & Load Detailed Attempt
  const handleOpenEvaluation = async (attempt) => {
    try {
      setLoadingDetails(true);
      setSelectedAttempt(null);

      let detailData = null;

      if (attempt.examType === "IELTS") {
        const res = await getIELTSTestAttemptForReview(attempt._id);
        detailData = { ...res?.data, examType: "IELTS" };

        const testSec = detailData.test?.section || detailData.section || "";
        const initialBand = detailData.overallBand ?? "";
        const maxMarks =
          detailData.totalMarks ||
          detailData.test?.totalMarks ||
          (Array.isArray(detailData.answers)
            ? detailData.answers.reduce((acc, a) => acc + (a.marks || 1), 0)
            : 1) || 1;

        const initialScore =
          detailData.score !== undefined && detailData.score !== null && detailData.score !== "" && Number(detailData.score) > 0
            ? detailData.score
            : (initialBand !== "" ? Math.max(1, Math.round((Number(initialBand) / 9) * maxMarks)) : "");

        const initialQ = {};
        const answersList = detailData.answers || [];
        if (answersList.length === 1 && initialScore !== "") {
          initialQ[answersList[0].questionId || 0] = initialScore;
        }
        setQuestionScores(initialQ);

        setEvalForm({
          overallBandOrScore: initialBand,
          speakingBandOrScore: detailData.speakingBand ?? (testSec === "Speaking" ? initialBand : ""),
          writingBandOrScore: detailData.writingBand ?? (testSec === "Writing" ? initialBand : ""),
          readingScore: detailData.readingBand ?? "",
          listeningScore: detailData.listeningBand ?? "",
          numericScore: initialScore,
          speakingFeedback: detailData.speakingFeedback ?? "",
          writingFeedback: detailData.writingFeedback ?? "",
          generalFeedback: "",
        });
      } else {
        const res = await getPTETestAttemptForReview(attempt._id);
        detailData = { ...res?.data, examType: "PTE" };
        const testSec = detailData.test?.section || detailData.section || "";
        const initialScorePTE = detailData.overallScore ?? "";
        const maxMarks =
          detailData.totalMarks ||
          detailData.test?.totalMarks ||
          (Array.isArray(detailData.answers)
            ? detailData.answers.reduce((acc, a) => acc + (a.marks || 1), 0)
            : 1) || 1;

        const initialScore =
          detailData.score !== undefined && detailData.score !== null && detailData.score !== "" && Number(detailData.score) > 0
            ? detailData.score
            : (initialScorePTE !== "" ? Math.max(1, Math.round((Number(initialScorePTE) / 90) * maxMarks)) : "");

        const initialQ = {};
        const answersList = detailData.answers || [];
        if (answersList.length === 1 && initialScore !== "") {
          initialQ[answersList[0].questionId || 0] = initialScore;
        }
        setQuestionScores(initialQ);

        setEvalForm({
          overallBandOrScore: initialScorePTE,
          speakingBandOrScore: detailData.speakingScore ?? (testSec === "Speaking" ? initialScorePTE : ""),
          writingBandOrScore: detailData.writingScore ?? (testSec === "Writing" ? initialScorePTE : ""),
          readingScore: detailData.readingScore ?? "",
          listeningScore: detailData.listeningScore ?? "",
          numericScore: initialScore,
          speakingFeedback: "",
          writingFeedback: "",
          generalFeedback: detailData.feedback ?? "",
        });
      }

      setSelectedAttempt(detailData);
    } catch (err) {
      alert(err?.message || "Failed to load attempt details for evaluation.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Sync total score change with band & question scores
  const handleTotalScoreChange = (scoreVal) => {
    const maxMarks =
      selectedAttempt?.totalMarks ||
      selectedAttempt?.test?.totalMarks ||
      (Array.isArray(selectedAttempt?.answers)
        ? selectedAttempt.answers.reduce((acc, a) => acc + (a.marks || 1), 0)
        : 1) || 1;

    setEvalForm((prev) => {
      const updated = { ...prev, numericScore: scoreVal };
      if (scoreVal !== "" && !isNaN(Number(scoreVal)) && Number(scoreVal) >= 0 && maxMarks > 0) {
        const num = Number(scoreVal);
        const ratio = Math.min(1, Math.max(0, num / maxMarks));

        if (selectedAttempt?.examType === "IELTS") {
          const estimatedBand = Number((ratio * 9).toFixed(1));
          const testSec = selectedAttempt.test?.section || selectedAttempt.section || "";
          updated.overallBandOrScore = estimatedBand;
          if (testSec === "Speaking") updated.speakingBandOrScore = estimatedBand;
          if (testSec === "Writing") updated.writingBandOrScore = estimatedBand;
        } else if (selectedAttempt?.examType === "PTE") {
          const estimatedScore = Math.round(10 + ratio * 80);
          const testSec = selectedAttempt.test?.section || selectedAttempt.section || "";
          updated.overallBandOrScore = estimatedScore;
          if (testSec === "Speaking") updated.speakingBandOrScore = estimatedScore;
          if (testSec === "Writing") updated.writingBandOrScore = estimatedScore;
        }
      }
      return updated;
    });

    const answersList = selectedAttempt?.answers || [];
    if (answersList.length === 1) {
      const qKey = answersList[0].questionId || 0;
      setQuestionScores({ [qKey]: scoreVal });
    }
  };

  // Sync individual question score change with total score & band
  const handleQuestionScoreChange = (qKey, val) => {
    setQuestionScores((prev) => {
      const nextScores = { ...prev, [qKey]: val };

      let total = 0;
      let hasAny = false;
      Object.values(nextScores).forEach((s) => {
        if (s !== "" && !isNaN(Number(s))) {
          total += Number(s);
          hasAny = true;
        }
      });

      const scoreString = hasAny ? String(Number(total.toFixed(1))) : "";
      const maxMarks =
        selectedAttempt?.totalMarks ||
        selectedAttempt?.test?.totalMarks ||
        (Array.isArray(selectedAttempt?.answers)
          ? selectedAttempt.answers.reduce((acc, a) => acc + (a.marks || 1), 0)
          : 1) || 1;

      setEvalForm((prevForm) => {
        const updated = { ...prevForm, numericScore: scoreString };
        if (scoreString !== "" && maxMarks > 0) {
          const ratio = Math.min(1, Math.max(0, total / maxMarks));
          if (selectedAttempt?.examType === "IELTS") {
            const estimatedBand = Number((ratio * 9).toFixed(1));
            const testSec = selectedAttempt.test?.section || selectedAttempt.section || "";
            updated.overallBandOrScore = estimatedBand;
            if (testSec === "Speaking") updated.speakingBandOrScore = estimatedBand;
            if (testSec === "Writing") updated.writingBandOrScore = estimatedBand;
          } else if (selectedAttempt?.examType === "PTE") {
            const estimatedScore = Math.round(10 + ratio * 80);
            const testSec = selectedAttempt.test?.section || selectedAttempt.section || "";
            updated.overallBandOrScore = estimatedScore;
            if (testSec === "Speaking") updated.speakingBandOrScore = estimatedScore;
            if (testSec === "Writing") updated.writingBandOrScore = estimatedScore;
          }
        }
        return updated;
      });

      return nextScores;
    });
  };

  // Submit Evaluation
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedAttempt) return;

    try {
      setSubmittingEval(true);

      if (selectedAttempt.examType === "IELTS") {
        const payload = {
          overallBand:
            evalForm.overallBandOrScore !== ""
              ? Number(evalForm.overallBandOrScore)
              : undefined,
          speakingBand:
            evalForm.speakingBandOrScore !== ""
              ? Number(evalForm.speakingBandOrScore)
              : undefined,
          writingBand:
            evalForm.writingBandOrScore !== ""
              ? Number(evalForm.writingBandOrScore)
              : undefined,
          score:
            evalForm.numericScore !== "" && !isNaN(Number(evalForm.numericScore))
              ? Number(evalForm.numericScore)
              : undefined,
          speakingFeedback: evalForm.speakingFeedback,
          writingFeedback: evalForm.writingFeedback,
          feedback: evalForm.generalFeedback,
          status: "Evaluated",
        };

        await evaluateIELTSTestAttempt(selectedAttempt.attemptId, payload);
      } else {
        const payload = {
          overallScore:
            evalForm.overallBandOrScore !== ""
              ? Number(evalForm.overallBandOrScore)
              : undefined,
          speakingScore:
            evalForm.speakingBandOrScore !== ""
              ? Number(evalForm.speakingBandOrScore)
              : undefined,
          writingScore:
            evalForm.writingBandOrScore !== ""
              ? Number(evalForm.writingBandOrScore)
              : undefined,
          readingScore:
            evalForm.readingScore !== ""
              ? Number(evalForm.readingScore)
              : undefined,
          listeningScore:
            evalForm.listeningScore !== ""
              ? Number(evalForm.listeningScore)
              : undefined,
          score:
            evalForm.numericScore !== "" && !isNaN(Number(evalForm.numericScore))
              ? Number(evalForm.numericScore)
              : undefined,
          feedback: evalForm.generalFeedback,
          status: "Evaluated",
        };

        await evaluatePTETestAttempt(selectedAttempt.attemptId, payload);
      }

      alert("Test evaluation submitted and marks updated successfully!");
      setSelectedAttempt(null);
      await loadSubmissions();
    } catch (err) {
      alert(err?.message || "Failed to submit evaluation.");
    } finally {
      setSubmittingEval(false);
    }
  };

  // Filter attempts
  const filteredAttempts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return attempts.filter((att) => {
      const studentName = (att.student?.name || "").toLowerCase();
      const studentEmail = (att.student?.email || "").toLowerCase();
      const testTitle = (att.test?.title || "").toLowerCase();

      const matchesSearch =
        !q ||
        studentName.includes(q) ||
        studentEmail.includes(q) ||
        testTitle.includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" &&
          (att.status === "Submitted" || att.manualReviewRequired)) ||
        (statusFilter === "evaluated" && att.status === "Evaluated");

      const section = att.test?.section?.toLowerCase() || "";
      const matchesSection =
        sectionFilter === "all" || section === sectionFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesSection;
    });
  }, [attempts, search, statusFilter, sectionFilter]);

  const sectionsList =
    courseFilter === "IELTS"
      ? ["Speaking", "Writing", "Listening", "Reading"]
      : ["Speaking", "Writing", "Reading", "Listening"];

  // Count pending reviews
  const pendingCount = attempts.filter(
    (att) => att.status === "Submitted" || att.manualReviewRequired
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Course Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">
                Evaluate Student Submissions
              </h2>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Listen to audio recordings, review written essays, and award band
              marks & feedback
            </p>
          </div>
        </div>

        {/* Course toggle if teacher teaches Both */}
        {teacherSpecialization === "Both" && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setCourseFilter("IELTS")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                courseFilter === "IELTS"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              IELTS Submissions
            </button>
            <button
              type="button"
              onClick={() => setCourseFilter("PTE")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                courseFilter === "PTE"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PTE Submissions
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or test title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Needs Evaluation / Pending Review</option>
            <option value="evaluated">Already Evaluated</option>
          </select>
        </div>

        {/* Section Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">All Sections</option>
            {sectionsList.map((sec) => (
              <option key={sec} value={sec}>
                {sec} Section
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            Loading student submissions...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            type="button"
            onClick={loadSubmissions}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No Submissions Found
          </h3>
          <p className="text-slate-500 text-sm max-w-md mt-1">
            {statusFilter === "pending"
              ? "Great job! There are currently no pending student submissions requiring evaluation."
              : "No student submissions matched your selected filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttempts.map((attempt) => {
            const isPending =
              attempt.status === "Submitted" || attempt.manualReviewRequired;

            const section = attempt.test?.section || "";

            return (
              <div
                key={attempt._id}
                className={`bg-white rounded-2xl border p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPending
                    ? "border-amber-200 bg-amber-50/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                      section === "Speaking"
                        ? "bg-purple-600"
                        : section === "Writing"
                        ? "bg-blue-600"
                        : "bg-emerald-600"
                    }`}
                  >
                    {section.charAt(0) || "T"}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-base">
                        {attempt.student?.name || "Student"}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({attempt.student?.email || "No email"})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">
                        {attempt.test?.title || "Test"}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                        {attempt.examType} {section}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Recently"}
                      </span>
                    </div>

                    {/* Evaluated info */}
                    {!isPending && (
                      <p className="text-[11px] text-green-700 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Evaluated{" "}
                        {attempt.speakingEvaluatedBy?.name
                          ? `by ${attempt.speakingEvaluatedBy.name}`
                          : attempt.writingEvaluatedBy?.name
                          ? `by ${attempt.writingEvaluatedBy.name}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right badges & action */}
                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                  {/* Current Score / Band */}
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 font-medium uppercase">
                      {attempt.examType === "IELTS" ? "Band Score" : "PTE Score"}
                    </p>
                    <p className="text-base font-black text-slate-800">
                      {attempt.examType === "IELTS"
                        ? attempt.overallBand !== null &&
                          attempt.overallBand !== undefined
                          ? `Band ${attempt.overallBand}`
                          : isPending
                          ? "Under Review"
                          : "Not graded"
                        : attempt.overallScore !== null &&
                          attempt.overallScore !== undefined
                        ? `${attempt.overallScore} pts`
                        : isPending
                        ? "Under Review"
                        : "Not graded"}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isPending
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {isPending ? "Needs Evaluation" : "Evaluated"}
                  </span>

                  {/* Evaluate Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEvaluation(attempt)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition ${
                      isPending
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isPending ? "Evaluate & Grade" : "Edit Marks"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVALUATION MODAL */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {selectedAttempt.examType} Evaluation
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">
                    {selectedAttempt.test?.section} Section
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mt-1">
                  {selectedAttempt.test?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Student: {selectedAttempt.student?.name} (
                  {selectedAttempt.student?.email})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAttempt(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Student Questions & Audio Answers */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Student Responses ({selectedAttempt.answers?.length || 0}{" "}
                  Questions)
                </h4>

                {selectedAttempt.answers?.map((ans, idx) => (
                  <div
                    key={ans.questionId || idx}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-slate-800 text-sm">
                          {ans.questionText || `Question #${idx + 1}`}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 rounded text-[11px] font-medium text-slate-600">
                          Max: {ans.marks || 1} mark(s)
                        </span>
                        <div className="flex items-center gap-1.5 bg-white border border-blue-300 rounded-lg px-2 py-0.5 shadow-xs">
                          <span className="text-[11px] font-bold text-slate-600">Award:</span>
                          <input
                            type="number"
                            min="0"
                            max={ans.marks || 1}
                            step={ans.marks <= 5 ? "0.5" : "1"}
                            value={questionScores[ans.questionId || idx] ?? ""}
                            onChange={(e) => handleQuestionScoreChange(ans.questionId || idx, e.target.value)}
                            placeholder="0"
                            className="w-12 text-center font-bold text-blue-700 text-xs border border-slate-200 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                          <span className="text-[11px] font-bold text-slate-400">/ {ans.marks || 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Passage / Prompt if present */}
                    {ans.passage && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 italic">
                        {ans.passage}
                      </div>
                    )}

                    {/* Written Text Answer */}
                    {ans.studentAnswer ? (
                      <div className="p-4 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Student Written Response:
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {
                              ans.studentAnswer
                                .trim()
                                .split(/\s+/)
                                .filter(Boolean).length
                            }{" "}
                            words
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {ans.studentAnswer}
                        </p>
                      </div>
                    ) : null}

                    {/* Audio Player for Speaking responses */}
                    {ans.studentAudioUrl ? (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-purple-800 text-xs font-bold uppercase tracking-wider">
                          <Volume2 className="w-4 h-4 text-purple-600" />
                          Recorded Voice Audio Response:
                        </div>
                        <audio
                          controls
                          className="w-full mt-1"
                          src={ans.studentAudioUrl}
                        >
                          Your browser does not support audio playback.
                        </audio>
                        <p className="text-[11px] text-purple-600 font-medium">
                          Listen carefully to rate pronunciation, fluency, and
                          grammatical accuracy.
                        </p>
                      </div>
                    ) : null}

                    {!ans.studentAnswer && !ans.studentAudioUrl && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 italic">
                        Student did not provide an answer or audio for this
                        question.
                      </div>
                    )}

                    {/* Model Answer / Rubrics if available */}
                    {ans.correctAnswer && (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                        <span className="font-bold">Correct / Reference Answer:</span>{" "}
                        {ans.correctAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Grading & Mark Awarding Form */}
              <form
                id="evaluation-form"
                onSubmit={handleSubmitEvaluation}
                className="p-6 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-4"
              >
                <h4 className="text-base font-bold text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Teacher Evaluation & Marks Award
                </h4>

                {(() => {
                  const attemptSec = selectedAttempt.test?.section || selectedAttempt.section || "";
                  const isSpeakingOnly = attemptSec === "Speaking";
                  const isWritingOnly = attemptSec === "Writing";
                  const isSingleSection = isSpeakingOnly || isWritingOnly;
                  const maxMarks =
                    selectedAttempt.totalMarks ||
                    selectedAttempt.test?.totalMarks ||
                    (Array.isArray(selectedAttempt.answers)
                      ? selectedAttempt.answers.reduce((acc, a) => acc + (a.marks || 1), 0)
                      : 1) || 1;

                  return (
                    <div className="space-y-4">
                      {/* Prominent Marks Awarded Card */}
                      <div className="p-4 bg-white border-2 border-blue-300 rounded-2xl shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-blue-600" />
                            Marks Awarded (Raw Score)
                          </label>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            Test Total: {maxMarks} {maxMarks === 1 ? "mark" : "marks"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-32">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              step={maxMarks <= 5 ? "0.5" : "1"}
                              value={evalForm.numericScore}
                              onChange={(e) => handleTotalScoreChange(e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 bg-blue-50/50 border-2 border-blue-500 rounded-xl text-lg font-black text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-center"
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-600">out of {maxMarks} mark(s)</span>

                          {evalForm.numericScore !== "" && !isNaN(Number(evalForm.numericScore)) && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold">
                              {Math.min(100, Math.round((Number(evalForm.numericScore) / (maxMarks || 1)) * 100))}% Score
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Enter how many marks the student scored out of {maxMarks}. Changing marks auto-calculates the percentage and estimates the Band.
                        </p>
                      </div>

                      {/* Band / Score Fields */}
                      <div className={`grid grid-cols-1 ${isSingleSection ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}>
                        {/* Overall Band / Score */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {selectedAttempt.examType === "IELTS"
                              ? "Overall Band (0 - 9)"
                              : "Overall Score (10 - 90)"}
                          </label>
                          <input
                            type="number"
                            step={selectedAttempt.examType === "IELTS" ? "0.5" : "1"}
                            min={selectedAttempt.examType === "IELTS" ? "0" : "10"}
                            max={selectedAttempt.examType === "IELTS" ? "9" : "90"}
                            value={evalForm.overallBandOrScore}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEvalForm((prev) => ({
                                ...prev,
                                overallBandOrScore: val,
                                speakingBandOrScore: isSpeakingOnly ? val : prev.speakingBandOrScore,
                                writingBandOrScore: isWritingOnly ? val : prev.writingBandOrScore,
                              }));
                            }}
                            placeholder={
                              selectedAttempt.examType === "IELTS"
                                ? "e.g. 7.5"
                                : "e.g. 75"
                            }
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        {/* Speaking Band/Score */}
                        {(!isWritingOnly) && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Speaking {selectedAttempt.examType === "IELTS" ? "Band" : "Score"}
                            </label>
                            <input
                              type="number"
                              step={selectedAttempt.examType === "IELTS" ? "0.5" : "1"}
                              min={selectedAttempt.examType === "IELTS" ? "0" : "10"}
                              max={selectedAttempt.examType === "IELTS" ? "9" : "90"}
                              value={evalForm.speakingBandOrScore}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEvalForm((prev) => ({
                                  ...prev,
                                  speakingBandOrScore: val,
                                  overallBandOrScore: isSpeakingOnly ? val : prev.overallBandOrScore,
                                }));
                              }}
                              placeholder={
                                selectedAttempt.examType === "IELTS"
                                  ? "e.g. 7.0"
                                  : "e.g. 70"
                              }
                              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {/* Writing Band/Score */}
                        {(!isSpeakingOnly) && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Writing {selectedAttempt.examType === "IELTS" ? "Band" : "Score"}
                            </label>
                            <input
                              type="number"
                              step={selectedAttempt.examType === "IELTS" ? "0.5" : "1"}
                              min={selectedAttempt.examType === "IELTS" ? "0" : "10"}
                              max={selectedAttempt.examType === "IELTS" ? "9" : "90"}
                              value={evalForm.writingBandOrScore}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEvalForm((prev) => ({
                                  ...prev,
                                  writingBandOrScore: val,
                                  overallBandOrScore: isWritingOnly ? val : prev.overallBandOrScore,
                                }));
                              }}
                              placeholder={
                                selectedAttempt.examType === "IELTS"
                                  ? "e.g. 6.5"
                                  : "e.g. 65"
                              }
                              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Feedback Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teacher Feedback & Recommendations
                  </label>
                  <textarea
                    rows={3}
                    value={evalForm.generalFeedback}
                    onChange={(e) =>
                      setEvalForm({
                        ...evalForm,
                        generalFeedback: e.target.value,
                      })
                    }
                    placeholder="Provide constructive feedback on pronunciation, coherence, lexical resource, or grammar..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAttempt(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="evaluation-form"
                disabled={submittingEval}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {submittingEval ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Evaluation...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Evaluation & Award Marks
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPracticeTestEvaluationsTab;
