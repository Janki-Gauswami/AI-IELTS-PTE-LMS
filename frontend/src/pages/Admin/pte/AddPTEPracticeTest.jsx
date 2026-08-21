import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createPTEPracticeTest,
} from "../../../services/ptePracticeTestService";

import {
  getPTEQuestions,
} from "../../../services/pteQuestionService";

const AddPTEPracticeTest = () => {
  const navigate = useNavigate();

  // ======================================================
  // Form
  // ======================================================

  const [form, setForm] = useState({
    title: "",
    description: "",
    section: "Speaking & Writing",
    difficulty: "Medium",
    duration: 30,
    instructions: "",
    status: "Draft",
  });

  // ======================================================
  // Questions
  // ======================================================

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] =
    useState([]);

  const [questionLoading, setQuestionLoading] =
    useState(true);

  // ======================================================
  // UI State
  // ======================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // Load PTE Questions
  // ======================================================

  const loadQuestions = async () => {
    try {
      setQuestionLoading(true);

      const response =
        await getPTEQuestions();

      setQuestions(response.data || []);

    } catch (err) {
      console.error(
        "PTE Questions Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load PTE questions."
      );

    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // ======================================================
  // Handle Form Change
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
  // Select / Remove Question
  // ======================================================

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions((previous) => {
      if (previous.includes(questionId)) {
        return previous.filter(
          (id) => id !== questionId
        );
      }

      return [
        ...previous,
        questionId,
      ];
    });
  };

  // ======================================================
  // Submit
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!form.title.trim()) {
        setError(
          "Practice test title is required."
        );
        return;
      }

      if (selectedQuestions.length === 0) {
        setError(
          "Please select at least one PTE question."
        );
        return;
      }

      const testData = {
        ...form,

        duration: Number(
          form.duration
        ),

        questions:
          selectedQuestions,
      };

      await createPTEPracticeTest(
        testData
      );

      navigate(
        "/admin/pte/tests"
      );

    } catch (err) {
      console.error(
        "Create PTE Practice Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to create PTE practice test."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="mx-auto max-w-5xl">

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        {/* ==================================================
            Header
        ================================================== */}

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Add PTE Practice Test
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create a PTE practice test and assign
            questions to it.
          </p>

        </div>


        {/* ==================================================
            Error
        ================================================== */}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}


        {/* ==================================================
            Form
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          {/* ==================================================
              Title
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Test Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Example: PTE Academic Practice Test 1"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>


          {/* ==================================================
              Description
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter a short description of the practice test..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>


          {/* ==================================================
              Section + Difficulty
          ================================================== */}

          <div className="grid gap-4 md:grid-cols-2">

            {/* Section */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                PTE Section
              </label>

              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >

                <option value="Speaking & Writing">
                  Speaking & Writing
                </option>

                <option value="Reading">
                  Reading
                </option>

                <option value="Listening">
                  Listening
                </option>

                <option value="Full Test">
                  Full Test
                </option>

              </select>

            </div>


            {/* Difficulty */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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
              Duration + Status
          ================================================== */}

          <div className="grid gap-4 md:grid-cols-2">

            {/* Duration */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Duration (Minutes)
              </label>

              <input
                type="number"
                name="duration"
                min="1"
                value={form.duration}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {/* Status */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >

                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>

              </select>

            </div>

          </div>


          {/* ==================================================
              Instructions
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Instructions
            </label>

            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              rows={5}
              placeholder="Enter instructions for students..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>


          {/* ==================================================
              Questions
          ================================================== */}

          <div>

            <div className="mb-3 flex items-center justify-between">

              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Select Questions
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Select the PTE questions that should
                  appear in this practice test.
                </p>

              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                {selectedQuestions.length} Selected
              </span>

            </div>


            {questionLoading ? (

              <div className="rounded-xl border border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Loading PTE questions...
                </p>
              </div>

            ) : questions.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">

                <p className="text-slate-500">
                  No PTE questions available.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin/pte/questions/add"
                    )
                  }
                  className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add PTE Question
                </button>

              </div>

            ) : (

              <div className="max-h-[500px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 p-4">

                {questions.map(
                  (question, index) => {

                    const selected =
                      selectedQuestions.includes(
                        question._id
                      );

                    return (
                      <label
                        key={question._id}
                        className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                          selected
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >

                        {/* Checkbox */}

                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            handleQuestionToggle(
                              question._id
                            )
                          }
                          className="mt-1 h-4 w-4"
                        />


                        {/* Question */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="text-xs font-semibold text-blue-600">
                              Question {index + 1}
                            </span>

                            {question.section && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                {question.section}
                              </span>
                            )}

                            {question.questionType && (
                              <span className="rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-600">
                                {question.questionType}
                              </span>
                            )}

                          </div>

                          <p className="mt-2 text-sm font-medium text-slate-800">
                            {question.questionText}
                          </p>

                        </div>

                      </label>
                    );
                  }
                )}

              </div>

            )}

          </div>


          {/* ==================================================
              Buttons
          ================================================== */}

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/pte/tests"
                )
              }
              className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
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

export default AddPTEPracticeTest;