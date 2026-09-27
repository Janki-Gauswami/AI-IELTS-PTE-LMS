import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";
import {
  getPracticeTestById,
  updatePracticeTest,
  deletePracticeTest,
} from "../../../../services/ieltsPracticeTestService";
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ListPlus,
  FileText,
} from "lucide-react";

const EditPracticeTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    section: "Listening",
    description: "",
    instructions: "",
    duration: 40,
    totalMarks: 40,
    difficulty: "Medium",
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPracticeTest();
  }, [id]);

  const loadPracticeTest = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPracticeTestById(id);
      const test = response.data;

      if (!test) {
        setError("Practice test could not be found.");
        return;
      }

      setForm({
        title: test.title || "",
        section: test.section || "Listening",
        description: test.description || "",
        instructions: test.instructions || "",
        duration: test.duration || 40,
        totalMarks: test.totalMarks || 40,
        difficulty: test.difficulty || "Medium",
      });

      setQuestions(test.questions || []);
    } catch (err) {
      console.error("Load Practice Test Error:", err);
      setError(err.message || "Unable to load practice test.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.title.trim()) {
        setError("Please enter a test title.");
        return;
      }

      if (!form.duration || Number(form.duration) < 1) {
        setError("Duration must be at least 1 minute.");
        return;
      }

      const testData = {
        title: form.title.trim(),
        section: form.section,
        description: form.description.trim(),
        instructions: form.instructions.trim(),
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        difficulty: form.difficulty,
      };

      const response = await updatePracticeTest(id, testData);

      if (response.success) {
        setSuccess("Practice test details updated successfully!");
      } else {
        setError(response.message || "Unable to update practice test.");
      }
    } catch (err) {
      console.error("Update Practice Test Error:", err);
      setError(err.message || "Unable to update practice test.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this IELTS practice test? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await deletePracticeTest(id);

      if (response.success) {
        navigate("/admin/ielts/tests");
      } else {
        setError(response.message || "Unable to delete practice test.");
      }
    } catch (err) {
      console.error("Delete Practice Test Error:", err);
      setError(err.message || "Unable to delete practice test.");
    } finally {
      setDeleting(false);
    }
  };

  const renderSectionIcon = (sec) => {
    switch (sec) {
      case "Listening":
        return <Headphones className="w-5 h-5 text-blue-600" />;
      case "Reading":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case "Writing":
        return <PenTool className="w-5 h-5 text-purple-600" />;
      case "Speaking":
        return <Mic className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-slate-500 font-medium">Loading practice test...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/ielts/tests")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to IELTS Practice Tests</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/admin/ielts/tests/${id}/questions`)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition"
          >
            <ListPlus className="w-4 h-4" />
            <span>Manage Questions ({questions.length})</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-5">
            <h1 className="text-2xl font-bold text-slate-900">Edit Practice Test</h1>
            <p className="mt-1 text-sm text-slate-500">
              Update test parameters, duration, instructions, and scoring.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Test Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Section */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                IELTS Section
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Listening", "Reading", "Writing", "Speaking"].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, section: sec }))}
                    className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                      form.section === sec
                        ? "bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {renderSectionIcon(sec)}
                    <span>{sec}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty + Duration + Total Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <option value="Easy">Easy (Band 5.0 - 6.0)</option>
                  <option value="Medium">Medium (Band 6.5 - 7.5)</option>
                  <option value="Hard">Hard (Band 8.0 - 9.0)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Total Marks
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={form.totalMarks}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Overview of this IELTS practice test..."
                className="w-full rounded-xl border border-slate-300 p-4 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Student Test Instructions
              </label>
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                rows={4}
                placeholder="Important guidelines for students taking this test..."
                className="w-full rounded-xl border border-slate-300 p-4 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Questions Card Link */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-900">Assigned Questions ({questions.length})</p>
                <p className="text-xs text-purple-700 mt-0.5">Click manage questions to add, remove, or change test questions.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/admin/ielts/tests/${id}/questions`)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
              >
                Select Questions
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? "Deleting..." : "Delete Test"}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/ielts/tests")}
                  className="px-6 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-60 text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditPracticeTest;