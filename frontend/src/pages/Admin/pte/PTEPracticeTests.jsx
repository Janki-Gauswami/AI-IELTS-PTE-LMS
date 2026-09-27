import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/Dashboard/DashboardLayout";
import {
  getPTEPracticeTests,
  deletePTEPracticeTest,
  publishPTEPracticeTest,
  unpublishPTEPracticeTest,
} from "../../../services/ptePracticeTestService";
import {
  Plus,
  Search,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Clock,
  HelpCircle,
  Edit3,
  Trash2,
  ListPlus,
  Globe,
  FileText,
} from "lucide-react";

const PTEPracticeTests = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [section, setSection] = useState("");
  const [status, setStatus] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const loadTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPTEPracticeTests({
        search,
        section,
        status,
        difficulty,
      });

      setTests(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load PTE practice tests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [search, section, status, difficulty]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this PTE practice test?"
    );
    if (!confirmed) return;

    try {
      await deletePTEPracticeTest(id);
      await loadTests();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete test.");
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishPTEPracticeTest(id);
      await loadTests();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to publish test.");
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await unpublishPTEPracticeTest(id);
      await loadTests();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to unpublish test.");
    }
  };

  const renderSectionIcon = (sec) => {
    switch (sec) {
      case "Speaking & Writing":
        return <Mic className="w-5 h-5 text-amber-600" />;
      case "Reading":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case "Listening":
        return <Headphones className="w-5 h-5 text-blue-600" />;
      case "Full Test":
        return <Globe className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PTE Practice Tests</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, configure, and assign PTE questions to practice tests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/pte/tests/create")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create PTE Test</span>
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search PTE tests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="">All Sections</option>
              <option value="Speaking & Writing">Speaking & Writing</option>
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
              <option value="Full Test">Full Test</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Test Cards Grid */}
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-slate-500 text-sm">Loading PTE practice tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-800">No PTE Practice Tests Found</h2>
            <p className="mt-1 text-sm text-slate-500">Create your first PTE practice test and assign questions.</p>
            <button
              type="button"
              onClick={() => navigate("/admin/pte/tests/create")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Create Test
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test._id}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {renderSectionIcon(test.section)}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        test.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <h2 className="mt-4 text-base font-bold text-slate-900 line-clamp-1">{test.title}</h2>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    {test.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {test.section}
                    </span>
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                      {test.difficulty}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {test.testType || "Practice"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-500">Questions</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{test.questions?.length || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-500">Duration</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{test.duration}m</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-500">Marks</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{test.totalMarks || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/pte/tests/${test._id}/edit`)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Test & Select Questions</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {test.status === "Published" ? (
                      <button
                        type="button"
                        onClick={() => handleUnpublish(test._id)}
                        className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublish(test._id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(test._id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition border border-slate-200"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PTEPracticeTests;