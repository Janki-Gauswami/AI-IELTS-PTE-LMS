import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/Dashboard/DashboardLayout";
import {
  getPTEQuestions,
  deletePTEQuestion,
} from "../../../services/pteQuestionService";
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  Volume2,
  Headphones,
  Mic,
  PenTool,
  BookOpen,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

const PTEQuestions = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [section, setSection] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPTEQuestions({
        search,
        section,
        questionType,
        difficulty,
        status,
      });

      setQuestions(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch PTE Questions Error:", err);
      setError(err?.response?.data?.message || "Unable to fetch PTE questions.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [section, questionType, difficulty, status]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSection("");
    setQuestionType("");
    setDifficulty("");
    setStatus("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this PTE question?"
    );
    if (!confirmed) return;

    try {
      setError("");
      await deletePTEQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Delete PTE Question Error:", err);
      setError(err?.response?.data?.message || "Unable to delete question.");
    }
  };

  const renderSectionIcon = (sec) => {
    switch (sec) {
      case "Speaking":
        return <Mic className="w-4 h-4 text-amber-600" />;
      case "Writing":
        return <PenTool className="w-4 h-4 text-purple-600" />;
      case "Reading":
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case "Listening":
        return <Headphones className="w-4 h-4 text-blue-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PTE Questions Library</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage questions with audio clips, chart descriptions, and scoring templates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/pte/questions/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <form onSubmit={handleFilterSubmit} className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PTE question text..."
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="">All Sections</option>
              <option value="Speaking">Speaking</option>
              <option value="Writing">Writing</option>
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
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

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Questions List */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-slate-500 text-sm">Loading PTE questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-medium">No PTE questions found.</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria or create a question.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questions.map((q, idx) => (
                <div key={q._id} className="p-5 hover:bg-slate-50/60 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600">
                          #{idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2">
                          {q.questionText}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-0.5 text-xs font-semibold flex items-center gap-1">
                          {renderSectionIcon(q.section)} {q.section}
                        </span>
                        <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-0.5 text-xs font-medium">
                          {q.questionType}
                        </span>
                        {q.audioUrl && (
                          <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-0.5 text-xs font-semibold flex items-center gap-1">
                            <Volume2 className="w-3 h-3" /> Audio Clip
                          </span>
                        )}
                        <span className="rounded-full bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-0.5 text-xs">
                          {q.difficulty}
                        </span>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-medium">
                          {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/pte/questions/${q._id}/edit`)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition"
                        title="Edit Question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q._id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
                        title="Delete Question"
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
      </div>
    </DashboardLayout>
  );
};

export default PTEQuestions;