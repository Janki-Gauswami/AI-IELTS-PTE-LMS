import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import {
  Award,
  FileText,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { getUnifiedStudentResults } from "../../services/mockTestService";

const StudentResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getUnifiedStudentResults();
        if (res?.success) {
          setResults(res.data || []);
        } else {
          setError(res?.message || "Failed to load test results.");
        }
      } catch (err) {
        setError(err?.message || "Failed to load test results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.section || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "all" || r.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const totalTests = results.length;
  const ieltsTests = results.filter((r) => r.course === "IELTS");
  const pteTests = results.filter((r) => r.course === "PTE");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Test Results & Score Cards</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Unified performance history across IELTS practice tests, PTE tests, and full mock exams.
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tests Taken</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalTests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">IELTS Attempts</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{ieltsTests.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PTE Attempts</p>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">{pteTests.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tests by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="IELTS">IELTS</option>
              <option value="PTE">PTE</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading test results...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-6 text-center text-red-600 border border-red-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Test Results Found</h3>
            <p className="text-slate-500 text-xs">
              Complete your assigned practice tests or mock exams to see comprehensive performance breakdowns here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-4 px-6">Test Title</th>
                    <th className="py-4 px-6">Course & Type</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-center">Score / Band</th>
                    <th className="py-4 px-6 text-center">Accuracy</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredResults.map((res, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-semibold text-slate-800">{res.title}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              res.course === "IELTS" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {res.course}
                          </span>
                          <span className="text-xs text-slate-500">{res.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(res.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-center font-black text-slate-900">
                        {res.course === "IELTS" ? `Band ${res.bandOrScore}` : `${res.bandOrScore} / 90`}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-blue-600">
                        {res.percentage !== undefined && res.percentage !== null && !isNaN(res.percentage)
                          ? `${res.percentage}%`
                          : "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            res.status === "Evaluated"
                              ? "bg-green-50 text-green-700"
                              : res.status === "Submitted"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {res.status || "Completed"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {res.link ? (
                          <button
                            onClick={() => navigate(res.link)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 ${
                              res.status === "In Progress"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            }`}
                          >
                            <span>{res.status === "In Progress" ? "Resume" : "Analysis"}</span>
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

export default StudentResults;
