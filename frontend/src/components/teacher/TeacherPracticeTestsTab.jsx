import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Clock,
  Award,
  Layers,
} from "lucide-react";

import {
  getPracticeTests as getIELTSPracticeTests,
  deletePracticeTest as deleteIELTSTest,
  publishPracticeTest as publishIELTSTest,
  unpublishPracticeTest as unpublishIELTSTest,
} from "../../services/ieltsPracticeTestService";

import {
  getPTEPracticeTests,
  deletePTEPracticeTest as deletePTETest,
  publishPTEPracticeTest as publishPTETest,
  unpublishPTEPracticeTest as unpublishPTETest,
} from "../../services/ptePracticeTestService";

const TeacherPracticeTestsTab = ({ teacherSpecialization }) => {
  const navigate = useNavigate();

  // Selected course tab: "IELTS" or "PTE"
  const defaultCourse =
    teacherSpecialization === "PTE" ? "PTE" : "IELTS";
  const [selectedCourse, setSelectedCourse] = useState(defaultCourse);

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const canIELTS =
    teacherSpecialization === "IELTS" || teacherSpecialization === "Both";
  const canPTE =
    teacherSpecialization === "PTE" || teacherSpecialization === "Both";

  // If teacher is only PTE, ensure selectedCourse is PTE
  useEffect(() => {
    if (teacherSpecialization === "PTE") {
      setSelectedCourse("PTE");
    } else if (teacherSpecialization === "IELTS") {
      setSelectedCourse("IELTS");
    }
  }, [teacherSpecialization]);

  // Load tests for selected course
  const loadTests = async () => {
    try {
      setLoading(true);
      setError("");

      if (selectedCourse === "IELTS" && canIELTS) {
        const res = await getIELTSPracticeTests();
        setTests(res?.data || []);
      } else if (selectedCourse === "PTE" && canPTE) {
        const res = await getPTEPracticeTests();
        setTests(res?.data || []);
      } else {
        setTests([]);
      }
    } catch (err) {
      console.error("Load Teacher Practice Tests Error:", err);
      setError(
        err?.message ||
          `Failed to load ${selectedCourse} practice tests.`
      );
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [selectedCourse]);

  // Handle Publish / Unpublish Toggle
  const handleTogglePublish = async (test) => {
    try {
      setActionLoading(test._id);
      if (selectedCourse === "IELTS") {
        if (test.isPublished) {
          await unpublishIELTSTest(test._id);
        } else {
          await publishIELTSTest(test._id);
        }
      } else {
        if (test.isPublished) {
          await unpublishPTETest(test._id);
        } else {
          await publishPTETest(test._id);
        }
      }
      await loadTests();
    } catch (err) {
      alert(err?.message || "Failed to update test publish status.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete Test
  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this practice test?")) {
      return;
    }

    try {
      setActionLoading(testId);
      if (selectedCourse === "IELTS") {
        await deleteIELTSTest(testId);
      } else {
        await deletePTETest(testId);
      }
      await loadTests();
    } catch (err) {
      alert(err?.message || "Failed to delete practice test.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter tests
  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tests.filter((test) => {
      const title = (test.title || "").toLowerCase();
      const section = (test.section || "").toLowerCase();
      const matchesSearch = !q || title.includes(q) || section.includes(q);

      const matchesSection =
        sectionFilter === "all" ||
        section.toLowerCase() === sectionFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && test.isPublished) ||
        (statusFilter === "draft" && !test.isPublished);

      return matchesSearch && matchesSection && matchesStatus;
    });
  }, [tests, search, sectionFilter, statusFilter]);

  const sectionsList =
    selectedCourse === "IELTS"
      ? ["Listening", "Reading", "Writing", "Speaking"]
      : ["Speaking", "Writing", "Reading", "Listening"];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Practice Test Management
            </h2>
            <p className="text-xs text-slate-500">
              Create, edit, and organize practice tests for students
            </p>
          </div>
        </div>

        {/* Course Selection (if teacher has specialization "Both") */}
        <div className="flex flex-wrap items-center gap-3">
          {teacherSpecialization === "Both" && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCourse("IELTS")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedCourse === "IELTS"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                IELTS Tests
              </button>
              <button
                type="button"
                onClick={() => setSelectedCourse("PTE")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedCourse === "PTE"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                PTE Tests
              </button>
            </div>
          )}

          {/* Action: Create Test */}
          <button
            type="button"
            onClick={() => {
              if (selectedCourse === "IELTS") {
                navigate("/admin/ielts/tests/add");
              } else {
                navigate("/admin/pte/tests/create");
              }
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create {selectedCourse} Test
          </button>

          {/* Action: Add Question */}
          <button
            type="button"
            onClick={() => {
              if (selectedCourse === "IELTS") {
                navigate("/admin/ielts/questions/add");
              } else {
                navigate("/admin/pte/questions/add");
              }
            }}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-slate-300"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Add Question
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${selectedCourse} tests...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Section Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">All Sections</option>
            {sectionsList.map((sec) => (
              <option key={sec} value={sec}>
                {sec} Section
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft / Unpublished</option>
          </select>
        </div>
      </div>

      {/* Tests Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            Loading {selectedCourse} practice tests...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            type="button"
            onClick={loadTests}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No {selectedCourse} Practice Tests Found
          </h3>
          <p className="text-slate-500 text-sm max-w-md mt-1 mb-5">
            {search || sectionFilter !== "all" || statusFilter !== "all"
              ? "No practice tests match your selected search or filter criteria."
              : `You haven't created any ${selectedCourse} practice tests yet. Click the button below to get started.`}
          </p>
          <button
            type="button"
            onClick={() => {
              if (selectedCourse === "IELTS") {
                navigate("/admin/ielts/tests/add");
              } else {
                navigate("/admin/pte/tests/create");
              }
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create First {selectedCourse} Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const questionCount = Array.isArray(test.questions)
              ? test.questions.length
              : 0;

            const isBusy = actionLoading === test._id;

            return (
              <div
                key={test._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        test.section === "Speaking"
                          ? "bg-purple-100 text-purple-700"
                          : test.section === "Writing"
                          ? "bg-blue-100 text-blue-700"
                          : test.section === "Listening"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {test.section}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        test.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {test.isPublished ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Published
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Draft
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-800 text-base line-clamp-1 mb-1">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {test.description || "No description provided for this test."}
                  </p>

                  {/* Meta Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl mb-4 text-center">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Duration
                      </p>
                      <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {test.duration || 0}m
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Questions
                      </p>
                      <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {questionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Marks
                      </p>
                      <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                        <Award className="w-3 h-3 text-slate-400" />
                        {test.totalMarks || questionCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Edit Test */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCourse === "IELTS") {
                          navigate(`/admin/ielts/tests/edit/${test._id}`);
                        } else {
                          navigate(`/admin/pte/tests/${test._id}/edit`);
                        }
                      }}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Test Settings"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Manage Questions (IELTS) */}
                    {selectedCourse === "IELTS" && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/ielts/tests/${test._id}/questions`)
                        }
                        className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Manage Questions"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Test */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDeleteTest(test._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toggle Publish */}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleTogglePublish(test)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                      test.isPublished
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : test.isPublished ? (
                      "Unpublish"
                    ) : (
                      "Publish"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherPracticeTestsTab;
