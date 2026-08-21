import { useEffect, useState } from "react";

import {
  X,
  Loader2,
  Save,
  Plus,
  Calendar,
  BookOpen,
} from "lucide-react";

const MockTestCreate = ({
  batches = [],
  initialData,
  editMode = false,
  testId = null,
  onClose,
  onSuccess,
  createMockTest,
  updateMockTest,
}) => {
  const [formData, setFormData] = useState({
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
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // INITIAL DATA
  // =========================================================

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      title: initialData.title || "",
      course: initialData.course || "IELTS",
      mockType: initialData.mockType || "Full Mock",
      description: initialData.description || "",
      instructions:
        initialData.instructions ||
        "Complete all sections within the allocated time. Do not refresh or close the browser during the exam.",
      duration: Number(initialData.duration) || 180,
      totalMarks: Number(initialData.totalMarks) || 9,
      passingScore: Number(initialData.passingScore) || 6,
      difficulty: initialData.difficulty || "Medium",
      assignedBatches: Array.isArray(initialData.assignedBatches)
        ? initialData.assignedBatches.map((batch) =>
            typeof batch === "object" ? batch._id : batch
          )
        : [],
      scheduledDate: initialData.scheduledDate || "",
      expiresAt: initialData.expiresAt || "",
      status: initialData.status || "Draft",
    });
  }, [initialData]);

  // =========================================================
  // CHANGE COURSE
  // =========================================================

  const handleCourseChange = (course) => {
    setFormData((previous) => ({
      ...previous,
      course,

      // Keep sensible defaults when changing course.
      duration:
        course === "IELTS"
          ? 180
          : previous.duration === 180
          ? 120
          : previous.duration,

      totalMarks:
        course === "IELTS"
          ? 9
          : previous.totalMarks === 9
          ? 90
          : previous.totalMarks,

      passingScore:
        course === "IELTS"
          ? 6
          : previous.passingScore === 6
          ? 60
          : previous.passingScore,
    }));
  };

  // =========================================================
  // INPUT HANDLER
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // NUMBER HANDLER
  // =========================================================

  const handleNumberChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // =========================================================
  // BATCH HANDLER
  // =========================================================

  const handleBatchChange = (event) => {
    const selectedValues = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );

    setFormData((previous) => ({
      ...previous,
      assignedBatches: selectedValues,
    }));
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validate = () => {
    if (!formData.title.trim()) {
      return "Mock test title is required.";
    }

    if (!formData.course) {
      return "Course is required.";
    }

    if (!formData.mockType) {
      return "Mock type is required.";
    }

    if (
      !formData.duration ||
      Number(formData.duration) < 1
    ) {
      return "Duration must be at least 1 minute.";
    }

    if (
      formData.totalMarks === "" ||
      Number(formData.totalMarks) < 0
    ) {
      return "Total marks cannot be negative.";
    }

    if (
      formData.passingScore === "" ||
      Number(formData.passingScore) < 0
    ) {
      return "Passing score cannot be negative.";
    }

    return "";
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: formData.title.trim(),
        course: formData.course,
        mockType: formData.mockType,
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        passingScore: Number(formData.passingScore),
        difficulty: formData.difficulty,
        assignedBatches: Array.isArray(formData.assignedBatches)
          ? formData.assignedBatches
          : [],
        status: formData.status,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate).toISOString()
          : null,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : null,
      };

      let response;

      if (editMode) {
        if (!testId) {
          throw new Error("Mock test ID is missing.");
        }

        if (typeof updateMockTest !== "function") {
          throw new Error(
            "Mock test update service is not available."
          );
        }

        response = await updateMockTest(testId, payload);
      } else {
        if (typeof createMockTest !== "function") {
          throw new Error(
            "Mock test creation service is not available."
          );
        }

        response = await createMockTest(payload);
      }

      if (!response?.success) {
        throw new Error(
          response?.message ||
            `Failed to ${editMode ? "update" : "create"} mock test.`
        );
      }

      onSuccess?.(response.data);
    } catch (err) {
      console.error(
        editMode
          ? "Update Mock Test Error:"
          : "Create Mock Test Error:",
        err
      );

      setError(
        err?.message ||
          err?.error?.message ||
          `Failed to ${
            editMode ? "update" : "create"
          } mock test.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editMode
                ? "Edit Mock Examination"
                : "Create Mock Examination"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Configure the mock test before adding questions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            id="mock-test-create-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* TITLE */}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                Mock Test Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. IELTS Academic Full Mock Test 01"
                maxLength={200}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* COURSE + MOCK TYPE */}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Course *
                </label>

                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={formData.course}
                    onChange={(event) =>
                      handleCourseChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="IELTS">IELTS</option>
                    <option value="PTE">PTE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Mock Type *
                </label>

                <select
                  name="mockType"
                  value={formData.mockType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Full Mock">Full Mock</option>
                  <option value="Sectional Mock">
                    Sectional Mock
                  </option>
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                maxLength={2000}
                placeholder="Describe this mock examination..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* DURATION / MARKS / PASSING */}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Duration (Minutes) *
                </label>

                <input
                  type="number"
                  name="duration"
                  min="1"
                  value={formData.duration}
                  onChange={handleNumberChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Total Marks *
                </label>

                <input
                  type="number"
                  name="totalMarks"
                  min="0"
                  value={formData.totalMarks}
                  onChange={handleNumberChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Passing Score *
                </label>

                <input
                  type="number"
                  name="passingScore"
                  min="0"
                  value={formData.passingScore}
                  onChange={handleNumberChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* DIFFICULTY + STATUS */}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Difficulty
                </label>

                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* INSTRUCTIONS */}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                Instructions
              </label>

              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* BATCHES */}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                Assign Batches
              </label>

              <select
                multiple
                value={formData.assignedBatches}
                onChange={handleBatchChange}
                className="h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {batches.length === 0 ? (
                  <option disabled>
                    No batches available
                  </option>
                ) : (
                  batches.map((batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.batchName || batch.name || "Unnamed Batch"}
                      {batch.course
                        ? ` (${batch.course})`
                        : ""}
                    </option>
                  ))
                )}
              </select>

              <p className="mt-1.5 text-[11px] text-slate-400">
                Hold Ctrl/Cmd to select multiple batches.
                Leave empty if the test should not be restricted
                to selected batches.
              </p>
            </div>

            {/* SCHEDULE */}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                  <Calendar className="h-3.5 w-3.5" />
                  Scheduled Date
                </label>

                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                  <Calendar className="h-3.5 w-3.5" />
                  Expiry Date
                </label>

                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </form>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="mock-test-create-form"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editMode ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {submitting
              ? editMode
                ? "Updating..."
                : "Creating..."
              : editMode
              ? "Update Mock Test"
              : "Create Mock Test"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockTestCreate;