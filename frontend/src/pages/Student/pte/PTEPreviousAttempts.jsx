import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/Dashboard/DashboardLayout";
import {
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { getMyPTEAttempts } from "../../../services/pteTestAttemptService";

const PTEPreviousAttempts = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMyPTEAttempts();
        if (res?.success) {
          setAttempts(res.data || []);
        } else {
          setError(res?.message || "Failed to load previous PTE attempts.");
        }
      } catch (err) {
        setError(err?.message || "Failed to load previous PTE attempts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      (attempt.test || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attempt.section || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection =
      sectionFilter === "all" ||
      (attempt.section || "").toLowerCase() === sectionFilter.toLowerCase();
    return matchesSearch && matchesSection;
  });

  const totalTaken = attempts.length;
  const avgScore =
    totalTaken > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / totalTaken
        )
      : 0;
  const highestScore =
    totalTaken > 0
      ? Math.max(...attempts.map((a) => Number(a.score) || 0))
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">PTE Previous Attempts</h1>
          <p className="mt-1 text-slate-500 text-sm">
            Review your previous PTE practice tests, score trends, and answer breakdowns.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Attempts
              </p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalTaken}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Average Score
              </p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{avgScore}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Highest Score
              </p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">{highestScore}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search attempts by test title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sections</option>
              <option value="Speaking & Writing">Speaking & Writing</option>
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
            </select>
          </div>
        </div>

        {/* Attempts List / Loading / Error */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading PTE attempt history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-6 text-center text-red-600 border border-red-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No PTE Attempts Found</h3>
              <p className="text-slate-500 text-xs mt-1">
                You haven't attempted any PTE practice tests yet.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/pte/tests")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Browse PTE Tests
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-4 px-6">Test Title</th>
                    <th className="py-4 px-6">Section</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-center">Score / Marks</th>
                    <th className="py-4 px-6 text-center">Percentage</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAttempts.map((attempt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {attempt.test || "PTE Practice Test"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {attempt.section || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(attempt.date || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-800">
                        {attempt.score !== undefined ? attempt.score : "-"}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-blue-600">
                        {attempt.percentage !== undefined ? `${attempt.percentage}%` : "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            attempt.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {attempt.status === "completed" ? "Completed" : "In Progress"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {attempt._id || attempt.id ? (
                          <button
                            onClick={() =>
                              navigate(
                                `/student/pte/tests/${attempt.testId || "test"}/results/${
                                  attempt._id || attempt.id
                                }`
                              )
                            }
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PTEPreviousAttempts;
