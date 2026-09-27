import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/Dashboard/DashboardLayout";
import {
  getPTEQuestions,
} from "../../../services/pteQuestionService";
import {
  createPTEPracticeTest,
} from "../../../services/ptePracticeTestService";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  HelpCircle,
  Volume2,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Save,
  Loader2,
  CheckSquare,
  Square,
  Sparkles,
  Globe,
  AlertCircle,
} from "lucide-react";

const CreatePTEPracticeTest = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    section: "Reading",
    testType: "Practice",
    duration: 30,
    difficulty: "Medium",
    questions: [],
    status: "Draft",
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("Reading");
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const loadQuestions = async (sec = sectionFilter) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        questionType,
        difficulty,
        search,
      };

      if (sec && sec !== "All") {
        params.section = sec;
      }

      const response = await getPTEQuestions(params);
      setQuestions(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load PTE questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(sectionFilter);
  }, [sectionFilter, questionType, difficulty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "section" && value !== "Full Test" && value !== "Speaking & Writing") {
      setSectionFilter(value);
    }
  };

  const toggleQuestion = (questionId) => {
    setForm((prev) => {
      const exists = prev.questions.includes(questionId);
      return {
        ...prev,
        questions: exists
          ? prev.questions.filter((id) => id !== questionId)
          : [...prev.questions, questionId],
      };
    });
  };

  const handleSelectAll = () => {
    const visibleIds = questions.map((q) => q._id);
    setForm((prev) => {
      const combined = new Set([...prev.questions, ...visibleIds]);
      return {
        ...prev,
        questions: Array.from(combined),
      };
    });
  };

  const handleDeselectAll = () => {
    const visibleIds = new Set(questions.map((q) => q._id));
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((id) => !visibleIds.has(id)),
    }));
  };

  const totalMarks = questions
    .filter((question) => form.questions.includes(question._id))
    .reduce((total, question) => total + Number(question.marks || 1), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.title.trim()) {
        setError("Please provide a test title.");
        return;
      }

      if (form.questions.length === 0) {
        setError("Please select at least one question for the test.");
        return;
      }

      const payload = {
        ...form,
        duration: Number(form.duration) || 30,
        totalMarks,
      };

      const response = await createPTEPracticeTest(payload);

      if (response?.data?._id || response?.success) {
        navigate("/admin/pte/tests");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create PTE practice test.");
    } finally {
      setSaving(false);
    }
  };

  const renderSectionIcon = (sec) => {
    switch (sec) {
      case "Speaking":
      case "Speaking & Writing":
        return <Mic className="w-4 h-4 text-amber-600" />;
      case "Writing":
        return <PenTool className="w-4 h-4 text-purple-600" />;
      case "Reading":
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case "Listening":
        return <Headphones className="w-4 h-4 text-blue-600" />;
      case "Full Test":
        return <Globe className="w-4 h-4 text-purple-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/pte/tests")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to PTE Tests
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Create PTE Practice Test</h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure test settings and select PTE questions from your library.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Test ({form.questions.length} Questions)</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Meta */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Test Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Test Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., PTE Academic Full Test 1"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Section
              </label>
              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="Speaking & Writing">Speaking & Writing</option>
                <option value="Full Test">Full Test</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Test Type
              </label>
              <select
                name="testType"
                value={form.testType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option value="Practice">Practice</option>
                <option value="Section Test">Section Test</option>
                <option value="Mock Test">Mock Test</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Overview of this PTE test..."
                className="w-full rounded-xl border border-slate-300 p-4 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Question Selector Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Select PTE Questions</h2>
              <p className="text-xs text-slate-500">
                Choose questions to include in this practice test.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                {form.questions.length} Selected ({totalMarks} Marks)
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="font-semibold text-blue-600 hover:text-blue-700 bg-slate-100 px-3 py-1.5 rounded-lg transition"
              >
                Select All Filtered
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="font-semibold text-slate-600 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg transition"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["All", "Speaking", "Writing", "Reading", "Listening"].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectionFilter(sec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  sectionFilter === sec
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PTE questions..."
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm bg-white outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 font-medium"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Question List */}
          <div className="space-y-3 pt-2">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-sm">No PTE questions found for this filter.</p>
                <p className="text-xs text-slate-400 mt-1">Try selecting "All" or create new questions from PTE Library.</p>
              </div>
            ) : (
              questions.map((q, idx) => {
                const isSelected = form.questions.includes(q._id);
                return (
                  <div
                    key={q._id}
                    onClick={() => toggleQuestion(q._id)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleQuestion(q._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 cursor-pointer text-blue-600 rounded border-slate-300"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-blue-700">#{idx + 1}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 flex items-center gap-1">
                            {renderSectionIcon(q.section)} {q.section}
                          </span>
                          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                            {q.questionType}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                          </span>
                          {q.audioUrl && (
                            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 flex items-center gap-1">
                              <Volume2 className="w-3 h-3" /> Audio Clip
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-snug">
                          {q.questionText}
                        </p>
                        {q.passage && (
                          <p className="text-xs text-slate-500 line-clamp-1 bg-slate-50 p-2 rounded border border-slate-100">
                            {q.passage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-slate-200 p-4 shadow-lg lg:pl-64">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-100 text-blue-800 font-bold px-3 py-1 text-xs">
                {form.questions.length} Questions Selected
              </span>
              <span className="text-xs text-slate-500">
                Total Marks: <strong>{totalMarks}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/pte/tests")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Create Practice Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatePTEPracticeTest;