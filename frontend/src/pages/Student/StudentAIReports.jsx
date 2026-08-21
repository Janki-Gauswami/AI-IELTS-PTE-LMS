import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import {
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  getBandPrediction,
  getWeaknessDetection,
  generateStudyPlan,
} from "../../services/aiService";

const StudentAIReports = () => {
  const [prediction, setPrediction] = useState(null);
  const [weaknesses, setWeaknesses] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Study plan options
  const [dailyHours, setDailyHours] = useState(2);
  const [targetScore, setTargetScore] = useState(7.5);

  const loadAIData = async () => {
    try {
      setLoading(true);
      setError("");

      const [predRes, weakRes, planRes] = await Promise.all([
        getBandPrediction(),
        getWeaknessDetection(),
        generateStudyPlan({ dailyHours, targetScore }),
      ]);

      if (predRes?.success) setPrediction(predRes.data);
      if (weakRes?.success) setWeaknesses(weakRes.data);
      if (planRes?.success) setStudyPlan(planRes.data);
    } catch (err) {
      setError(err?.message || "Failed to load AI analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIData();
  }, []);

  const handleRegeneratePlan = async () => {
    try {
      setGenerating(true);
      const res = await generateStudyPlan({
        targetExam: prediction?.targetExam || "IELTS",
        targetScore,
        dailyHours,
        weaknesses: weaknesses?.weaknesses || [],
      });
      if (res?.success) setStudyPlan(res.data);
    } catch (err) {
      alert(err.message || "Failed to regenerate study plan.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Analyzing test performance & generating AI insights...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isIelts = prediction?.targetExam === "IELTS";
  const predScore = prediction?.predictedScore || (isIelts ? 6.5 : 62);
  const sectionPredictions = prediction?.sectionPredictions || {};
  const weaknessList = weaknesses?.weaknesses || [];
  const scheduleDays = studyPlan?.weeklySchedule || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              AI Powered Insights
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">AI Prediction & Smart Study Plan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Machine learning projections of your test performance, skill bottleneck diagnosis, and weekly adaptive plan.
          </p>
        </div>

        {/* Hero Prediction Card */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                {prediction?.targetExam || "IELTS"} Projected Score
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Projected Band: {predScore}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed">
                {prediction?.recommendation}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[190px]">
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Target Delta</p>
              <div className="text-3xl font-black text-white mt-1">
                {prediction?.targetDelta > 0 ? `-${prediction?.targetDelta}` : "✓ On Target"}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                AI Confidence: {prediction?.confidence || 85}%
              </p>
            </div>
          </div>

          {/* Section Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            {Object.entries(sectionPredictions).map(([sec, val], idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-3.5 text-center border border-white/5">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">{sec}</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {isIelts ? `Band ${val}` : `${val} / 90`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weakness Detection Matrix */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>AI Detected Weakness & Remedy Matrix</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknessList.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {item.section}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.severity === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.severity} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic AI Weekly Study Planner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Personalized Weekly Study Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic routine aligned with your weak areas and study hours.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Hours/Day:</label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>

              <button
                type="button"
                disabled={generating}
                onClick={handleRegeneratePlan}
                className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                {generating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Update Schedule</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {scheduleDays.map((day, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="font-bold text-slate-800 text-xs">{day.day}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {day.duration}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-blue-900 mt-2.5">{day.focus}</h4>

                  <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                    {(day.tasks || []).map((t, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="leading-tight">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAIReports;
