import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/Dashboard/DashboardLayout";
import {
  getPTEPracticeTestById,
} from "../../../services/ptePracticeTestService";
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Globe,
  FileText,
  Edit3,
  Clock,
  Award,
  Calendar,
  User,
  Volume2,
} from "lucide-react";

const PTEPracticeTestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTest = async () => {
      try {
        const response = await getPTEPracticeTestById(id);
        setTest(response.data);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load test details.");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [id]);

  const renderSectionIcon = (sec) => {
    switch (sec) {
      case "Speaking":
      case "Speaking & Writing":
        return <Mic className="w-5 h-5 text-amber-600" />;
      case "Writing":
        return <PenTool className="w-5 h-5 text-purple-600" />;
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-slate-500 font-medium">Loading test details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !test) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <button
            type="button"
            onClick={() => navigate("/admin/pte/tests")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to PTE Tests
          </button>
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error || "Test not found."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
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
            <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{test.description || "No description provided."}</p>
          </div>

          <button
            onClick={() => navigate(`/admin/pte/tests/${id}/edit`)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Test</span>
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
            <div className="text-xs font-medium text-slate-500">Section</div>
            <div className="font-bold text-slate-900 mt-1 flex items-center gap-1 text-sm">
              {renderSectionIcon(test.section)} {test.section}
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
            <div className="text-xs font-medium text-slate-500">Questions</div>
            <div className="font-bold text-slate-900 mt-1 text-base">{test.questions?.length || 0}</div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
            <div className="text-xs font-medium text-slate-500">Duration</div>
            <div className="font-bold text-slate-900 mt-1 text-base">{test.duration} mins</div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
            <div className="text-xs font-medium text-slate-500">Total Marks</div>
            <div className="font-bold text-slate-900 mt-1 text-base">{test.totalMarks}</div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 col-span-2 sm:col-span-1">
            <div className="text-xs font-medium text-slate-500">Status</div>
            <div className="mt-1">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  test.status === "Published"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {test.status}
              </span>
            </div>
          </div>
        </div>

        {/* Test Details Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Test Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <strong className="text-slate-800">Test Type:</strong> {test.testType || "Practice"}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <strong className="text-slate-800">Difficulty:</strong> {test.difficulty}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <strong className="text-slate-800">Created By:</strong> {test.createdBy?.name || "Admin"}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <strong className="text-slate-800">Created:</strong>{" "}
              {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "-"}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Assigned Questions ({test.questions?.length || 0})
            </h2>
            <button
              onClick={() => navigate(`/admin/pte/tests/${id}/edit`)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              + Add / Edit Questions
            </button>
          </div>

          {!test.questions || test.questions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No questions assigned to this practice test yet.
            </div>
          ) : (
            <div className="space-y-3">
              {test.questions.map((question, index) => (
                <div
                  key={question._id || index}
                  className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50/50 transition space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-blue-700">Question #{index + 1}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {question.section}
                    </span>
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                      {question.questionType}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
                    </span>
                    <span className="rounded-full bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 text-xs">
                      {question.difficulty}
                    </span>
                    {question.audioUrl && (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> Audio Clip
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {question.questionText}
                  </p>

                  {question.audioUrl && (
                    <div className="pt-1">
                      <audio
                        controls
                        src={question.audioUrl.startsWith("http") ? question.audioUrl : `http://localhost:5000${question.audioUrl}`}
                        className="w-full h-8 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PTEPracticeTestDetails;