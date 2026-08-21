import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getStudentAnalytics } from "../../services/analyticsService";
import { getBandPrediction } from "../../services/aiService";
import { getUnifiedStudentResults } from "../../services/mockTestService";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [analyticsRes, predRes, resultsRes] = await Promise.allSettled([
          getStudentAnalytics(),
          getBandPrediction(),
          getUnifiedStudentResults(),
        ]);

        if (analyticsRes.status === "fulfilled" && analyticsRes.value?.success) {
          setAnalytics(analyticsRes.value.data);
        }
        if (predRes.status === "fulfilled" && predRes.value?.success) {
          setPrediction(predRes.value.data);
        }
        if (resultsRes.status === "fulfilled" && resultsRes.value?.success) {
          setRecentResults((resultsRes.value.data || []).slice(0, 4));
        }
      } catch (err) {
        console.error("Student Dashboard Data Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const targetExam = user?.targetExam || prediction?.targetExam || "IELTS";
  const targetScore = user?.targetScore || prediction?.targetScore || (targetExam === "IELTS" ? 7.5 : 72);
  const predictedScore = prediction?.predictedScore || (targetExam === "IELTS" ? 6.5 : 64);
  const attendanceRate = analytics?.attendancePercentage || 92;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  Student Portal
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  {targetExam} Track
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || "Student"}! 👋
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
                Track your IELTS & PTE preparations, practice full mocks, review AI weakness detections, and stay on target.
              </p>
            </div>

            {/* AI Predicted Score Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4 min-w-[220px]">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Projected Band</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white">{predictedScore}</span>
                  <span className="text-xs text-blue-300 font-medium">/ Target {targetScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Exam</p>
              <p className="text-xl font-extrabold text-slate-800 mt-1">{targetExam}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">Target: {targetScore}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{attendanceRate}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Excellent Consistency</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tests Attempted</p>
              <p className="text-xl font-extrabold text-slate-800 mt-1">
                {analytics?.totalTestsAttempted || recentResults.length || 0}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Practice & Mocks</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Readiness Status</p>
              <p className="text-xl font-extrabold text-blue-600 mt-1">
                {Number(predictedScore) >= Number(targetScore) ? "On Track" : "Prep Active"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">AI Confidence: {prediction?.confidence || 85}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Launchpad Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* IELTS Card */}
          <div
            onClick={() => navigate("/student/ielts/tests")}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
              IELTS Practice Tests
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Timed Listening, Reading, Writing, and Speaking practice tests with instant band scoring.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>Start Practice</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* PTE Card */}
          <div
            onClick={() => navigate("/student/pte/tests")}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
              PTE Practice Tests
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Speaking & Writing, Reading, and Listening PTE section items scored on the official 10–90 scale.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>Start PTE Test</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Full Mock Exam Card */}
          <div
            onClick={() => navigate("/student/mock-tests")}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
              Full Mock Exams
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Simulate full test day conditions with continuous timed sections and teacher evaluation.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>Take Full Mock</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* Two-Column Section: AI Study Plan & Recent Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Study Plan Preview */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI Study Plan (Today)</span>
                </div>
                <button
                  onClick={() => navigate("/student/ai-reports")}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View Plan
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">Focus: Writing & Grammar Precision</span>
                  <p className="text-slate-600">Complete 1 Academic Task 2 essay and review paragraph structure.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-800 block">Target: Timed Reading Drill</span>
                  <p className="text-slate-600">20 minutes speed skimming and True/False/Not Given questions.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/student/ai-reports")}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
            >
              Open AI Reports & Planner
            </button>
          </div>

          {/* Recent Test Results */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Recent Test Results</span>
              </h3>
              <button
                onClick={() => navigate("/student/results")}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View All Results
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-400 text-xs">Loading recent test results...</div>
            ) : recentResults.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">No test attempts recorded yet.</p>
                <p className="text-xs text-slate-500">Take an IELTS or PTE practice test to see your score cards here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {recentResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition cursor-pointer"
                    onClick={() => res.link && navigate(res.link)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {res.course}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">{res.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(res.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          {res.course === "IELTS" ? `Band ${res.bandOrScore}` : `Score ${res.bandOrScore}`}
                        </span>
                        <p className="text-[10px] text-slate-400">{res.percentage}% accuracy</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;