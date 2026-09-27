import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
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
  AlertCircle,
  BarChart2,
  Calendar,
} from "lucide-react";
import { getMockTestAttemptById } from "../../services/mockTestService";

const MockTestResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState(location.state?.result?.attempt || null);
  const [loading, setLoading] = useState(!attempt);
  const [error, setError] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchAttempt = async () => {
      if (!attemptId) return;
      try {
        setLoading(true);
        setError("");
        const res = await getMockTestAttemptById(attemptId);
        if (res?.success && res?.data) {
          setAttempt(res.data);
        } else {
          setError(res?.message || "Failed to load test results.");
        }
      } catch (err) {
        setError(err?.message || "Failed to load test results.");
      } finally {
        setLoading(false);
      }
    };

    if (!attempt || !attempt.mockTest?.title) {
      fetchAttempt();
    }
  }, [attemptId]);

  const toggleQuestion = (idx) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
            <p className="text-slate-600 font-medium text-sm">Loading test performance scorecard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !attempt) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Result</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "No attempt details found."}</p>
          <button
            onClick={() => navigate("/student/mock-tests")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition"
          >
            Back to Mock Tests
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const mockTest = attempt.mockTest || {};
  const isIELTS = (mockTest.course || attempt.course || "IELTS") === "IELTS";
  const overallScore = attempt.overallBandOrScore ?? (isIELTS ? 6.5 : 65);
  const totalScore = attempt.score || 0;
  const totalMarks = mockTest.totalMarks || 100;
  const percentage = attempt.percentage || Math.round((totalScore / totalMarks) * 100) || 0;
  const sectionBreakdown = attempt.sectionBreakdown || {};

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/student/mock-tests")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mock Exams</span>
          </button>

          <button
            onClick={() => navigate("/student/results")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            All Test Results
          </button>
        </div>

        {/* Hero Scorecard */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                {mockTest.course || attempt.course || "Mock Test"} Performance Report
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">
                {mockTest.title || "Full Length Mock Exam"}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span className="capitalize font-semibold">{attempt.status || "Completed"}</span>
              </p>
            </div>

            {/* Score Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[150px]">
              <p className="text-xs uppercase font-extrabold text-blue-200 tracking-wider">
                {isIELTS ? "Overall Band" : "Overall Score"}
              </p>
              <div className="text-4xl sm:text-5xl font-black text-white mt-1">
                {isIELTS ? overallScore : `${overallScore}/90`}
              </div>
              <p className="text-xs text-blue-200 mt-1 font-medium">{percentage}% Accuracy</p>
            </div>
          </div>

          {/* Quick Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-xs text-blue-200">Raw Score</p>
              <p className="text-lg font-bold mt-0.5">{totalScore} / {totalMarks}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Total Questions</p>
              <p className="text-lg font-bold mt-0.5">{attempt.answers?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Status</p>
              <p className="text-lg font-bold mt-0.5">{attempt.status || "Evaluated"}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Evaluation Mode</p>
              <p className="text-lg font-bold mt-0.5">{attempt.evaluatedBy ? "Teacher Evaluated" : "Auto Graded"}</p>
            </div>
          </div>
        </div>

        {/* Section Scores Grid */}
        {Object.keys(sectionBreakdown).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              Section Breakdown
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(sectionBreakdown).map(([section, sc]) => (
                <div key={section} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <p className="text-xs uppercase font-bold text-slate-400 capitalize">{section}</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{sc}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Marks Obtained</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answers & Feedback Review */}
        {attempt.answers && attempt.answers.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Answers & Evaluation Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Review responses submitted during the examination.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                {attempt.answers.length} Items
              </span>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {attempt.answers.map((ans, idx) => (
                <div key={idx} className="pt-3 first:pt-0">
                  <div
                    onClick={() => toggleQuestion(idx)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                        Q{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {ans.isCorrect ? "Correct Response" : ans.evaluated ? "Needs Review" : "Answer Submitted"}
                        </p>
                        <p className="text-xs text-slate-500">Marks: {ans.marksObtained ?? 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ans.isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : ans.evaluated ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                          Evaluated
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          Submitted
                        </span>
                      )}
                      {expandedQuestions[idx] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {expandedQuestions[idx] && (
                    <div className="mt-2 ml-10 p-4 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-600">Your Submitted Answer:</span>
                        <p className="text-slate-800 font-medium mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                          {ans.answer || "(No response recorded)"}
                        </p>
                      </div>
                      {ans.feedback && (
                        <div>
                          <span className="font-bold text-blue-600">Teacher / AI Feedback:</span>
                          <p className="text-slate-700 mt-0.5 italic bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                            {ans.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
          <button
            onClick={() => navigate("/student/mock-tests")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
          >
            Take Another Mock Exam
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MockTestResult;
