import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  TrendingUp,
  FileText,
  Loader2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { getAdminAnalytics } from "../../services/analyticsService";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getAdminAnalytics();
        if (res?.success) {
          setData(res.data);
        } else {
          setError(res?.message || "Failed to load admin analytics.");
        }
      } catch (err) {
        setError(err?.message || "Failed to load admin analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Aggregating real-time institute analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 rounded-2xl p-8 text-center text-red-600 border border-red-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">{error || "No data available."}</p>
        </div>
      </DashboardLayout>
    );
  }

  const counts = data.counts || {};
  const metrics = data.metrics || {};
  const batchPerformance = data.batchPerformance || [];
  const enrollmentTrends = data.enrollmentTrends || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institute Analytics & Insights</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            System-wide statistics on student enrollments, batch health, attendance correlations, and average scores.
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{counts.totalStudents || 0}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {counts.activeStudents || 0} Active Students
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">IELTS vs PTE Ratio</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-slate-800">{counts.ieltsCount || 0}</span>
                <span className="text-xs text-slate-400">IELTS /</span>
                <span className="text-xl font-extrabold text-purple-600">{counts.pteCount || 0}</span>
                <span className="text-xs text-slate-400">PTE</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Attendance</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.attendanceRate || 85}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Across all batches</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tests Taken</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{counts.totalTestsTaken || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Practice & Full Mocks</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Enrollment Trends Bar Visualizer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Enrollment Growth</h2>
              <p className="text-xs text-slate-500 mt-0.5">Student intake trends for IELTS & PTE coaching.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span className="text-slate-600">IELTS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-600" />
                <span className="text-slate-600">PTE</span>
              </div>
            </div>
          </div>

          {/* Pure Tailwind Responsive Trend Chart */}
          <div className="grid grid-cols-6 gap-3 sm:gap-6 pt-6 pb-2 items-end h-48 border-b border-slate-100">
            {enrollmentTrends.map((trend, idx) => {
              const maxVal = Math.max(...enrollmentTrends.map((t) => t.total || 10), 10);
              const ieltsH = Math.min(100, Math.round(((trend.IELTS || 1) / maxVal) * 100));
              const pteH = Math.min(100, Math.round(((trend.PTE || 1) / maxVal) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                    <div
                      className="w-1/2 bg-blue-600 rounded-t-md transition-all duration-500 hover:bg-blue-700"
                      style={{ height: `${Math.max(12, ieltsH)}%` }}
                      title={`IELTS: ${trend.IELTS}`}
                    />
                    <div
                      className="w-1/2 bg-purple-600 rounded-t-md transition-all duration-500 hover:bg-purple-700"
                      style={{ height: `${Math.max(12, pteH)}%` }}
                      title={`PTE: ${trend.PTE}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{trend.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Batch Performance Matrix */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Batch Health & Performance Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">Capacity utilization and average score per batch.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Batch Name</th>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6 text-center">Enrolled / Capacity</th>
                  <th className="py-4 px-6 text-center">Avg Attendance</th>
                  <th className="py-4 px-6 text-center">Average Score</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {batchPerformance.map((batch, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-800">{batch.batchName}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          batch.course === "IELTS" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {batch.course}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-700">
                      {batch.enrolled} / {batch.capacity}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-emerald-600">
                      {batch.avgAttendance}%
                    </td>
                    <td className="py-4 px-6 text-center font-black text-slate-900">
                      {batch.course === "IELTS" ? `Band ${batch.avgScore}` : `${batch.avgScore} / 90`}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                        Healthy
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
