import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPracticeTestById,
  updatePracticeTest,
  deletePracticeTest,
} from "../../../../services/ieltsPracticeTestService";

const EditPracticeTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ======================================================
  // Form State
  // ======================================================

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

  // ======================================================
  // Load Practice Test
  // ======================================================

  useEffect(() => {
    loadPracticeTest();
  }, [id]);

  const loadPracticeTest = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPracticeTestById(id);

      const test = response.data;

      if (!test) {
        setError(
          "Practice test could not be found."
        );
        return;
      }

      setForm({
        title: test.title || "",
        section:
          test.section || "Listening",
        description:
          test.description || "",
        instructions:
          test.instructions || "",
        duration:
          test.duration || 40,
        totalMarks:
          test.totalMarks || 40,
        difficulty:
          test.difficulty || "Medium",
      });

      setQuestions(
        test.questions || []
      );

    } catch (err) {
      console.error(
        "Load Practice Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load practice test."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Handle Input Change
  // ======================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // ======================================================
  // Update Practice Test
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ==================================================
      // Validation
      // ==================================================

      if (!form.title.trim()) {
        setError(
          "Please enter a test title."
        );
        return;
      }

      if (
        !form.duration ||
        Number(form.duration) < 1
      ) {
        setError(
          "Duration must be at least 1 minute."
        );
        return;
      }

      // ==================================================
      // Prepare Data
      // ==================================================

      const testData = {
        title: form.title.trim(),
        section: form.section,
        description:
          form.description.trim(),
        instructions:
          form.instructions.trim(),
        duration: Number(form.duration),
        totalMarks:
          Number(form.totalMarks),
        difficulty: form.difficulty,

        // Keep existing questions
        questions: questions.map(
          (question) =>
            typeof question === "string"
              ? question
              : question._id
        ),
      };

      // ==================================================
      // Update
      // ==================================================

      const response =
        await updatePracticeTest(
          id,
          testData
        );

      if (response.success) {
        setSuccess(
          "Practice test updated successfully."
        );
      } else {
        setError(
          response.message ||
            "Unable to update practice test."
        );
      }

    } catch (err) {
      console.error(
        "Update Practice Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update practice test."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // Delete Practice Test
  // ======================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this practice test?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deletePracticeTest(id);

      navigate("/admin/ielts/tests");

    } catch (err) {
      console.error(
        "Delete Practice Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete practice test."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ======================================================
  // Cancel
  // ======================================================

  const handleCancel = () => {
    navigate("/admin/ielts/tests");
  };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="text-slate-500">
            Loading practice test...
          </p>

        </div>

      </div>
    );
  }

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="mx-auto max-w-4xl">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-slate-800">
          Edit IELTS Practice Test
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the details of your IELTS practice test.
        </p>

      </div>


      {/* ==================================================
          Error
      ================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}


      {/* ==================================================
          Success
      ================================================== */}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-600">
          {success}
        </div>
      )}


      {/* ==================================================
          Main Form
      ================================================== */}

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              Title
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Test Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ==================================================
              Section + Difficulty
          ================================================== */}

          <div className="grid gap-5 md:grid-cols-2">

            {/* Section */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                IELTS Section
              </label>

              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="Listening">
                  Listening
                </option>

                <option value="Reading">
                  Reading
                </option>

                <option value="Writing">
                  Writing
                </option>

                <option value="Speaking">
                  Speaking
                </option>

              </select>

            </div>


            {/* Difficulty */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>

              </select>

            </div>

          </div>


          {/* ==================================================
              Description
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ==================================================
              Instructions
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Test Instructions
            </label>

            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ==================================================
              Duration + Marks
          ================================================== */}

          <div className="grid gap-5 md:grid-cols-2">

            {/* Duration */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Duration (Minutes)
              </label>

              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min="1"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* Marks */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Total Marks
              </label>

              <input
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                min="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>


          {/* ==================================================
              Current Questions
          ================================================== */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-semibold text-blue-800">
                  Questions
                </p>

                <p className="mt-1 text-sm text-blue-600">
                  Questions will be managed separately.
                </p>

              </div>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-700">
                {questions.length}
              </span>

            </div>

          </div>


          {/* ==================================================
              Status Information
          ================================================== */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-700">
                  Current Status
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Publishing will be handled separately.
                </p>

              </div>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                Test loaded
              </span>

            </div>

          </div>


          {/* ==================================================
              Buttons
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

            {/* Delete */}

            <button
              type="button"
              onClick={handleDelete}
              disabled={
                saving || deleting
              }
              className="rounded-xl px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Test"}
            </button>


            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={handleCancel}
                disabled={
                  saving || deleting
                }
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  saving || deleting
                }
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditPracticeTest;