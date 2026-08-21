import { useEffect, useState } from "react";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";

import {
  Award,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Clock,
  Loader2,
  AlertCircle,
  X,
  ListChecks,
  ChevronRight,
} from "lucide-react";

import {
  getAllMockTests,
  createMockTest,
  deleteMockTest,
  updateMockTest,
} from "../../services/mockTestService";

import { getAllBatches } from "../../services/batchService";

import MockTestCreate from "./MockTestCreate";
import MockTestQuestions from "./MockTestQuestions";

const DEFAULT_FORM_DATA = {
  title: "",
  course: "IELTS",
  mockType: "Full Mock",
  description: "",
  instructions:
    "Complete all sections within the allocated time. Do not refresh or close the browser during the exam.",
  duration: 180,
  totalMarks: 9,
  passingScore: 6,
  difficulty: "Medium",
  assignedBatches: [],
  scheduledDate: "",
  expiresAt: "",
  status: "Draft",
};

const AdminMockTests = () => {
  const [mockTests, setMockTests] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editingTest, setEditingTest] = useState(null);

  const [questionsTest, setQuestionsTest] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // =========================================================
  // LOAD MOCK TESTS + BATCHES
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [testsResponse, batchesResponse] = await Promise.all([
        getAllMockTests(),
        getAllBatches(),
      ]);

      if (testsResponse?.success) {
        setMockTests(Array.isArray(testsResponse.data) ? testsResponse.data : []);
      } else {
        setMockTests([]);
      }

      if (batchesResponse?.success) {
        setBatches(
          Array.isArray(batchesResponse.data)
            ? batchesResponse.data
            : Array.isArray(batchesResponse.batches)
            ? batchesResponse.batches
            : []
        );
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.error("Load Mock Tests Error:", err);

      setError(
        err?.message ||
          err?.error?.message ||
          "Failed to load mock examinations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreateSuccess = (createdTest) => {
    setShowCreateModal(false);

    if (createdTest) {
      setMockTests((previous) => [
        createdTest,
        ...previous.filter((item) => item._id !== createdTest._id),
      ]);
    } else {
      loadData();
    }
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdateSuccess = (updatedTest) => {
    setEditingTest(null);

    if (updatedTest) {
      setMockTests((previous) =>
        previous.map((test) =>
          test._id === updatedTest._id ? updatedTest : test
        )
      );
    } else {
      loadData();
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this mock test?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await deleteMockTest(id);

      setMockTests((previous) =>
        previous.filter((test) => test._id !== id)
      );

      if (questionsTest?._id === id) {
        setQuestionsTest(null);
      }
    } catch (err) {
      console.error("Delete Mock Test Error:", err);

      setError(
        err?.message ||
          err?.error?.message ||
          "Failed to delete mock test."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // PUBLISH / DRAFT
  // =========================================================

  const handleStatusChange = async (test) => {
    if (!test?._id) return;

    const nextStatus =
      test.status === "Published" ? "Draft" : "Published";

    const confirmed = window.confirm(
      nextStatus === "Published"
        ? "Publish this mock test?"
        : "Move this mock test back to Draft?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await updateMockTest(test._id, {
        status: nextStatus,
        ...(nextStatus === "Published"
          ? {
              publishedAt: new Date().toISOString(),
              archivedAt: null,
            }
          : {
              publishedAt: null,
            }),
      });

      const updatedTest = response?.data;

      if (updatedTest) {
        setMockTests((previous) =>
          previous.map((item) =>
            item._id === updatedTest._id ? updatedTest : item
          )
        );
      } else {
        await loadData();
      }
    } catch (err) {
      console.error("Update Mock Test Status Error:", err);

      setError(
        err?.message ||
          err?.error?.message ||
          "Failed to update mock test status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredTests = mockTests.filter((test) => {
    const title = String(test?.title || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = title.includes(search);

    const matchesCourse =
      courseFilter === "all" ||
      String(test?.course || "") === courseFilter;

    const matchesStatus =
      statusFilter === "all" ||
      String(test?.status || "") === statusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // =========================================================
  // QUESTION COUNT
  // =========================================================

  const getQuestionCount = (test) => {
    const flatCount = Array.isArray(test?.questions)
      ? test.questions.length
      : 0;

    const sectionCount = Array.isArray(test?.sections)
      ? test.sections.reduce(
          (total, section) =>
            total +
            (Array.isArray(section?.questions)
              ? section.questions.length
              : 0),
          0
        )
      : 0;

    return Math.max(flatCount, sectionCount);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Mock Examinations
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage full IELTS & PTE mock examinations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTest(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Mock Exam
          </button>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search mock tests..."
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Course */}

            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={courseFilter}
                onChange={(event) =>
                  setCourseFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Courses</option>
                <option value="IELTS">IELTS</option>
                <option value="PTE">PTE</option>
              </select>
            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />

            <p className="text-sm text-slate-500">
              Loading mock examinations...
            </p>
          </div>
        ) : filteredTests.length === 0 ? (
          /* ===================================================
             EMPTY
          =================================================== */

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Award className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No Mock Tests Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first IELTS or PTE mock examination and
              then add questions to it.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Mock Exam
            </button>
          </div>
        ) : (
          /* ===================================================
             TEST CARDS
          =================================================== */

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTests.map((test) => {
              const questionCount = getQuestionCount(test);

              return (
                <div
                  key={test._id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Card Header */}

                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                        test.course === "IELTS"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {test.course}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        test.status === "Published"
                          ? "bg-green-50 text-green-700"
                          : test.status === "Archived"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {test.status || "Draft"}
                    </span>
                  </div>

                  {/* Title */}

                  <h2 className="mt-4 line-clamp-2 text-lg font-bold text-slate-800">
                    {test.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {test.description ||
                      "Comprehensive mock examination."}
                  </p>

                  {/* Information */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />

                        <span className="text-xs text-slate-500">
                          Duration
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {test.duration || 0} min
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-slate-400" />

                        <span className="text-xs text-slate-500">
                          Marks
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {test.totalMarks || 0}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-slate-400" />

                        <span className="text-xs text-slate-500">
                          Questions
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {questionCount}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-xs text-slate-500">
                        Difficulty
                      </span>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {test.difficulty || "Medium"}
                      </p>
                    </div>
                  </div>

                  {/* Batches */}

                  <div className="mt-4 text-xs text-slate-500">
                    Assigned Batches:{" "}
                    <span className="font-semibold text-slate-700">
                      {(test.assignedBatches || []).length > 0
                        ? test.assignedBatches.length
                        : "All"}
                    </span>
                  </div>

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                    {/* ADD / MANAGE QUESTIONS */}

                    <button
                      type="button"
                      onClick={() => setQuestionsTest(test)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      <ListChecks className="h-4 w-4" />
                      Manage Questions
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() => setEditingTest(test)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Test
                    </button>

                    {/* STATUS */}

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(test)}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        test.status === "Published"
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-green-600 text-white hover:bg-green-700"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {test.status === "Published"
                        ? "Move to Draft"
                        : "Publish Test"}
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleDelete(test._id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Test
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =====================================================
            CREATE MODAL
        ===================================================== */}

        {showCreateModal && (
          <MockTestCreate
            batches={batches}
            initialData={DEFAULT_FORM_DATA}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
            createMockTest={createMockTest}
          />
        )}

        {/* =====================================================
            EDIT MODAL
        ===================================================== */}

        {editingTest && (
          <MockTestCreate
            batches={batches}
            initialData={{
              ...DEFAULT_FORM_DATA,
              ...editingTest,
              scheduledDate: editingTest.scheduledDate
                ? new Date(editingTest.scheduledDate)
                    .toISOString()
                    .slice(0, 16)
                : "",
              expiresAt: editingTest.expiresAt
                ? new Date(editingTest.expiresAt)
                    .toISOString()
                    .slice(0, 16)
                : "",
              assignedBatches: Array.isArray(
                editingTest.assignedBatches
              )
                ? editingTest.assignedBatches.map((batch) =>
                    typeof batch === "object"
                      ? batch._id
                      : batch
                  )
                : [],
            }}
            editMode
            testId={editingTest._id}
            onClose={() => setEditingTest(null)}
            onSuccess={handleUpdateSuccess}
            createMockTest={createMockTest}
            updateMockTest={updateMockTest}
          />
        )}

        {/* =====================================================
            QUESTIONS MODAL
        ===================================================== */}

        {questionsTest && (
          <MockTestQuestions
            testId={questionsTest._id}
            initialTest={questionsTest}
            onClose={() => setQuestionsTest(null)}
            onUpdated={(updatedTest) => {
              if (updatedTest?._id) {
                setMockTests((previous) =>
                  previous.map((test) =>
                    test._id === updatedTest._id
                      ? updatedTest
                      : test
                  )
                );
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminMockTests;