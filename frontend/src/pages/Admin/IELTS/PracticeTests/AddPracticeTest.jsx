import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createPracticeTest,
} from "../../../../services/ieltsPracticeTestService";

const AddPracticeTest = () => {
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  };

  // ======================================================
  // Submit Form
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      // ==================================================
      // Validation
      // ==================================================

      if (!form.title.trim()) {
        setError(
          "Please enter a test title."
        );

        return;
      }

      if (!form.duration || Number(form.duration) < 1) {
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
        totalMarks: Number(form.totalMarks),
        difficulty: form.difficulty,
        questions: [],
      };

      // ==================================================
      // Create Test
      // ==================================================

      const response =
        await createPracticeTest(testData);

      // ==================================================
      // Success
      // ==================================================

      if (response.success) {
        navigate("/admin/ielts/tests");
      } else {
        setError(
          response.message ||
            "Unable to create practice test."
        );
      }

    } catch (err) {
      console.error(
        "Create IELTS Practice Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to create practice test."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Cancel
  // ======================================================

  const handleCancel = () => {
    navigate("/admin/ielts/tests");
  };

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
          Create IELTS Practice Test
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new IELTS practice test.
        </p>

      </div>


      {/* ==================================================
          Form Card
      ================================================== */}

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        {/* ==================================================
            Error
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              Test Title
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
              placeholder="Example: IELTS Reading Practice Test 1"
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
              placeholder="Enter a short description of the practice test..."
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
              placeholder="Enter instructions that students should read before starting the test..."
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

              <p className="mt-1 text-xs text-slate-400">
                Time allowed for completing the test.
              </p>

            </div>


            {/* Total Marks */}

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

              <p className="mt-1 text-xs text-slate-400">
                Maximum marks for this practice test.
              </p>

            </div>

          </div>


          {/* ==================================================
              Initial Status
          ================================================== */}

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

            <div className="flex items-start gap-3">

              <span className="text-xl">
                📝
              </span>

              <div>

                <p className="font-semibold text-yellow-800">
                  Test will be saved as Draft
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  After adding questions, you can
                  publish the test so students can
                  attempt it.
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              Buttons
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating..."
                : "Create Practice Test"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddPracticeTest;