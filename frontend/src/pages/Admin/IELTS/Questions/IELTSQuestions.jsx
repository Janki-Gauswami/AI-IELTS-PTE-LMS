import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";
import {
  deleteIELTSQuestion,
  getIELTSQuestions,
} from "../../../../services/ieltsQuestionService";
import { Volume2, Plus, Trash2, Edit3 } from "lucide-react";

const IELTSQuestions = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [section, setSection] = useState("");
  const [questionType, setQuestionType] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getIELTSQuestions({
        section,
        questionType,
      });

      setQuestions(response.data || []);
    } catch (err) {
      console.error("IELTS Questions Error:", err);
      setError(err.message || "Unable to load IELTS questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [section, questionType]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmed) return;

    try {
      setError("");
      await deleteIELTSQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Delete IELTS Question Error:", err);
      setError(err.message || "Unable to delete question.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">IELTS Questions Library</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage questions with audio uploads, writing prompts, and speaking topic cards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/ielts/questions/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Sections</option>
              <option value="Listening">Listening</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing</option>
              <option value="Speaking">Speaking</option>
            </select>

            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Question Types</option>
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="Fill in the Blanks">Fill in the Blanks</option>
              <option value="Sentence Completion">Sentence Completion</option>
              <option value="Short Answer">Short Answer</option>
              <option value="True False Not Given">True / False / Not Given</option>
              <option value="Yes No Not Given">Yes / No / Not Given</option>
              <option value="Matching">Matching</option>
              <option value="Task 1 Report">Task 1 Report</option>
              <option value="Task 2 Essay">Task 2 Essay</option>
              <option value="Essay Writing">Essay Writing</option>
              <option value="Part 1 Interview">Part 1 Interview</option>
              <option value="Part 2 Cue Card">Part 2 Cue Card</option>
              <option value="Part 3 Discussion">Part 3 Discussion</option>
            </select>
          </div>
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
              <p className="text-slate-500 text-sm">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-medium">No IELTS questions found.</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting the filters or add a new question.</p>
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
                        <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-0.5 text-xs font-semibold">
                          {q.section}
                        </span>
                        <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-0.5 text-xs font-medium">
                          {q.questionType}
                        </span>
                        {q.audioUrl && (
                          <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-0.5 text-xs font-semibold flex items-center gap-1">
                            <Volume2 className="w-3 h-3" /> Audio Clip
                          </span>
                        )}
                        {q.wordLimit > 0 && (
                          <span className="rounded-full bg-purple-50 text-purple-700 px-3 py-0.5 text-xs font-semibold">
                            {q.wordLimit} Words
                          </span>
                        )}
                        {q.prepTimeSeconds && q.section === "Speaking" && (
                          <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-0.5 text-xs font-semibold">
                            {q.prepTimeSeconds}s Prep / {q.responseTimeSeconds}s Resp
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
                        onClick={() => navigate(`/admin/ielts/questions/${q._id}/edit`)}
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

export default IELTSQuestions;