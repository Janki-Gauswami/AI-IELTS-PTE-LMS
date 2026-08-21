import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { getPTEAttemptById } from "../../../services/pteTestAttemptService";

const PTETestResult = () => {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getPTEAttemptById(attemptId);
        if (res?.success && res?.data) {
          setResult(res.data);
        } else {
          setError(res?.message || "Failed to load PTE test result.");
        }
      } catch (err) {
        setError(err?.message || "Failed to load PTE test result.");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  const toggleQuestion = (qId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">Calculating your PTE scores & evaluation...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-md border border-slate-200">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Results</h2>
          <p className="text-slate-600 text-sm mb-6">{error || "No result found."}</p>
          <button
            onClick={() => navigate("/student/pte/tests")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
          >
            Back to PTE Tests
          </button>
        </div>
      </div>
    );
  }

  const pteScore = result.overallScore || 10;
  const percentage = result.percentage || 0;
  const detailedAnswers = result.detailedAnswers || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/student/pte/tests")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to PTE Tests</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/student/pte/tests/${id}/start`)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={() => navigate("/student/pte/tests/attempts")}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View History</span>
            </button>
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase">
                PTE Academic Score Report
              </span>
              <h1 className="text-3xl font-extrabold text-white">
                {result.testTitle || result.testName || "PTE Practice Test"}
              </h1>
              <p className="text-slate-400 text-sm max-w-md">
                Section: <span className="text-white font-medium">{result.section || "Practice"}</span> • Completed on{" "}
                {new Date(result.submittedAt || result.createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Score Badge */}
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[200px] text-center shadow-lg">
              <span className="text-xs font-bold text-blue-200 tracking-wider uppercase mb-1">
                PTE Overall Score
              </span>
              <div className="text-5xl font-black text-white">{pteScore}</div>
              <span className="text-xs text-slate-300 mt-1">Scale: 10 – 90</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-xs text-slate-400">Accuracy</p>
              <p className="text-xl font-bold text-white mt-1">{percentage}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-xs text-slate-400">Correct Answers</p>
              <p className="text-xl font-bold text-green-400 mt-1">
                {result.correctAnswers} / {result.totalMarks || detailedAnswers.length}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-xs text-slate-400">Incorrect</p>
              <p className="text-xl font-bold text-red-400 mt-1">{result.incorrectAnswers || 0}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-xs text-slate-400">Unanswered</p>
              <p className="text-xl font-bold text-slate-300 mt-1">{result.unanswered || 0}</p>
            </div>
          </div>
        </div>

        {/* Communicative Skills Breakdown */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Communicative Skills Evaluation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { skill: "Speaking", score: result.speakingScore || pteScore, color: "from-purple-500 to-indigo-600" },
              { skill: "Writing", score: result.writingScore || pteScore, color: "from-blue-500 to-cyan-600" },
              { skill: "Reading", score: result.readingScore || pteScore, color: "from-emerald-500 to-teal-600" },
              { skill: "Listening", score: result.listeningScore || pteScore, color: "from-amber-500 to-orange-600" },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>{item.skill}</span>
                  <span className="text-slate-900 font-bold">{item.score} / 90</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(10, (item.score / 90) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question by Question Review */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Question Review & Explanations ({detailedAnswers.length})</span>
          </h2>

          <div className="space-y-4">
            {detailedAnswers.map((q, idx) => {
              const isExpanded = expandedQuestions[q.questionId] !== false; // Default expanded
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all ${
                    q.isCorrect
                      ? "border-green-200 bg-green-50/20"
                      : "border-red-200 bg-red-50/20"
                  }`}
                >
                  <div
                    onClick={() => toggleQuestion(q.questionId)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          q.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-slate-400">
                            {q.section} • {q.questionType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              q.isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {q.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1 mt-0.5">
                          {q.questionText}
                        </p>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                      {q.passage && (
                        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
                          {q.passage}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                            Your Answer
                          </span>
                          <p className={`font-semibold text-sm ${q.isCorrect ? "text-green-700" : "text-red-600"}`}>
                            {q.studentAnswer || "<No answer provided>"}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                            Correct Answer
                          </span>
                          <p className="font-semibold text-sm text-green-700">
                            {q.correctAnswer || "Pending teacher evaluation"}
                          </p>
                        </div>
                      </div>

                      {q.explanation && (
                        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                          <span className="font-bold block text-blue-950 mb-1">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTETestResult;
