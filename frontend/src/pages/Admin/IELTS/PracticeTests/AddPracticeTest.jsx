import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";
import {
  createPracticeTest,
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
  FileText,
} from "lucide-react";

const AddPracticeTest = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    section: "Listening",
    description: "",
    instructions: "",
    duration: 40,
    totalMarks: 40,
    difficulty: "Medium",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

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
        questions: [],
      };

      const response = await createPracticeTest(testData);

      if (response.success && response.data?._id) {
        // Redirect directly to select questions for newly created test
        navigate(`/admin/ielts/tests/${response.data._id}/questions`);
      } else {
        navigate("/admin/ielts/tests");
      }
    } catch (err) {
      console.error("Create IELTS Practice Test Error:", err);
      setError(err.message || "Unable to create practice test.");
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/ielts/tests")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to IELTS Practice Tests</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-5">
            <h1 className="text-2xl font-bold text-slate-900">Create IELTS Practice Test</h1>
            <p className="mt-1 text-sm text-slate-500">
              Set up practice test parameters. You can assign test questions right after saving.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
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
                placeholder="e.g., IELTS Academic Listening Practice Test 1"
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

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/admin/ielts/tests")}
                disabled={loading}
                className="px-6 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Create & Select Questions</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddPracticeTest;