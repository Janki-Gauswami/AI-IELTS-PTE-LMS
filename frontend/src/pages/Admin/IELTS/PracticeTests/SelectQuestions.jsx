import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";
import {
  getPracticeTestById,
  updatePracticeTest,
} from "../../../../services/ieltsPracticeTestService";
import {
  getIELTSQuestions,
} from "../../../../services/ieltsQuestionService";
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
} from "lucide-react";

const SelectQuestions = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ======================================================
  // States
  // ======================================================
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [sectionFilter, setSectionFilter] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // Load Test
  // ======================================================
  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPracticeTestById(id);
      const practiceTest = response.data;

      if (!practiceTest) {
        setError("Practice test not found.");
        return;
      }

      setTest(practiceTest);
      setSectionFilter(practiceTest.section || "");

      const existingQuestionIds = (practiceTest.questions || []).map((question) =>
        typeof question === "string" ? question : question._id
      );

      setSelectedQuestions(existingQuestionIds);
    } catch (err) {
      console.error("Load Practice Test Error:", err);
      setError(err.message || "Unable to load practice test.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Load Questions
  // ======================================================
  const loadQuestions = async (sec = sectionFilter) => {
    try {
      setError("");

      const params = {
        questionType,
        difficulty,
        search,
      };

      if (sec && sec !== "All") {
        params.section = sec;
      }

      const response = await getIELTSQuestions(params);
      setQuestions(response.data || []);
    } catch (err) {
      console.error("Load IELTS Questions Error:", err);
      setError(err.message || "Unable to load IELTS questions.");
    }
  };

  useEffect(() => {
    if (test) {
      loadQuestions(sectionFilter);
    }
  }, [test, sectionFilter, questionType, difficulty]);

  // ======================================================
  // Toggle Question Selection
  // ======================================================
  const toggleQuestion = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((qId) => qId !== questionId);
      }
      return [...prev, questionId];
    });
    setSuccess("");
  };

  const handleSelectAll = () => {
    const visibleIds = questions.map((q) => q._id);
    setSelectedQuestions((prev) => {
      const combined = new Set([...prev, ...visibleIds]);
      return Array.from(combined);
    });
  };

  const handleDeselectAll = () => {
    const visibleIds = new Set(questions.map((q) => q._id));
    setSelectedQuestions((prev) => prev.filter((id) => !visibleIds.has(id)));
  };

  // ======================================================
  // Save Questions
  // ======================================================
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updatePracticeTest(id, {
        questions: selectedQuestions,
      });

      if (response.success) {
        setSuccess("Questions updated in practice test successfully!");
        setTest(response.data);
      } else {
        setError(response.message || "Unable to save questions.");
      }
    } catch (err) {
      console.error("Save Questions Error:", err);
      setError(err.message || "Unable to save questions.");
    } finally {
      setSaving(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQuestions(sectionFilter);
  };

  const renderSectionIcon = (sec) => {
    switch (sec) {
      case "Listening":
        return <Headphones className="w-4 h-4 text-blue-600" />;
      case "Reading":
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case "Writing":
        return <PenTool className="w-4 h-4 text-purple-600" />;
      case "Speaking":
        return <Mic className="w-4 h-4 text-amber-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-slate-500 font-medium">Loading practice test questions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/ielts/tests")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to IELTS Practice Tests
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Select Test Questions</h1>
            <p className="mt-1 text-sm text-slate-500">
              Assign and manage questions for: <span className="font-semibold text-slate-800">{test?.title}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Selection ({selectedQuestions.length})</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Test Summary Pill Card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Test Section</p>
              <p className="mt-1 text-sm font-bold text-slate-800 flex items-center gap-1.5">
                {renderSectionIcon(test?.section)} {test?.section}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Difficulty</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{test?.difficulty || "Medium"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Duration</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{test?.duration} mins</p>
            </div>
            <div className="rounded-xl bg-blue-50/80 p-3 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700">Selected Questions</p>
              <p className="mt-1 text-base font-bold text-blue-900">{selectedQuestions.length} Total</p>
            </div>
          </div>
        </div>

        {/* Section Tabs & Filters */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            {/* Section tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Default Section (" + (test?.section || "") + ")", val: test?.section || "" },
                { label: "All Sections", val: "All" },
                { label: "Listening", val: "Listening" },
                { label: "Reading", val: "Reading" },
                { label: "Writing", val: "Writing" },
                { label: "Speaking", val: "Speaking" },
              ].map((tab) => (
                <button
                  key={tab.val}
                  type="button"
                  onClick={() => setSectionFilter(tab.val)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    sectionFilter === tab.val
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Bulk Selection Actions */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Select All Filtered ({questions.length})
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg transition"
              >
                <Square className="w-3.5 h-3.5" /> Deselect All
              </button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by question text or passage keyword..."
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="">All Question Types</option>
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="Fill in the Blanks">Fill in the Blanks</option>
              <option value="Sentence Completion">Sentence Completion</option>
              <option value="Summary Completion">Summary Completion</option>
              <option value="Short Answer">Short Answer</option>
              <option value="True False Not Given">True / False / Not Given</option>
              <option value="Yes No Not Given">Yes / No / Not Given</option>
              <option value="Matching">Matching</option>
              <option value="Matching Headings">Matching Headings</option>
              <option value="Map / Diagram Labelling">Map / Diagram Labelling</option>
              <option value="Task 1 Report">Task 1 Report</option>
              <option value="Task 2 Essay">Task 2 Essay</option>
              <option value="Essay Writing">Essay Writing</option>
              <option value="Part 1 Interview">Part 1 Interview</option>
              <option value="Part 2 Cue Card">Part 2 Cue Card</option>
              <option value="Part 3 Discussion">Part 3 Discussion</option>
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
          </form>
        </div>

        {/* Questions Cards List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-800">No Questions Found</h2>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                No questions match the current filter. Try switching to "All Sections" or create new questions in the IELTS Questions Library.
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/ielts/questions/add")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                <Sparkles className="w-4 h-4" /> Create Question
              </button>
            </div>
          ) : (
            questions.map((question, index) => {
              const isSelected = selectedQuestions.includes(question._id);

              return (
                <div
                  key={question._id}
                  onClick={() => toggleQuestion(question._id)}
                  className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleQuestion(question._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                          #{index + 1}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 flex items-center gap-1">
                          {renderSectionIcon(question.section)} {question.section}
                        </span>
                        <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                          {question.questionType}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {question.difficulty}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
                        </span>
                        {question.audioUrl && (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5" /> Audio Clip
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-snug">
                        {question.questionText}
                      </h3>

                      {question.passage && (
                        <p className="line-clamp-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {question.passage}
                        </p>
                      )}

                      {/* Audio preview */}
                      {question.audioUrl && (
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <audio
                            controls
                            src={question.audioUrl.startsWith("http") ? question.audioUrl : `http://localhost:5000${question.audioUrl}`}
                            className="w-full h-8 rounded-lg"
                          />
                        </div>
                      )}

                      {/* Options */}
                      {question.options && question.options.length > 0 && (
                        <div className="grid gap-2 sm:grid-cols-2 pt-1">
                          {question.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 border border-slate-100 flex items-center gap-2"
                            >
                              <span className="font-bold text-slate-700">{opt.label || String.fromCharCode(65 + oIdx)}.</span>
                              <span className="truncate">{typeof opt === "object" ? opt.text : opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.correctAnswer && (
                        <p className="text-xs text-emerald-700 font-semibold pt-1">
                          Answer: <span className="font-normal text-slate-700">{question.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-slate-200 p-4 shadow-lg lg:pl-64">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-100 text-blue-800 font-bold px-3 py-1 text-xs">
                {selectedQuestions.length} Questions Selected
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">
                Assigned to <span className="font-semibold text-slate-700">{test?.title}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/ielts/tests")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Selection</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SelectQuestions;