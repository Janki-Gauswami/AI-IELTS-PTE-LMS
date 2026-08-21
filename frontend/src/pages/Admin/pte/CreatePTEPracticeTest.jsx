import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getPTEQuestions,
} from "../../../services/pteQuestionService";

import {
  createPTEPracticeTest,
} from "../../../services/ptePracticeTestService";

const CreatePTEPracticeTest = () => {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      section: "Reading",
      testType: "Practice",
      duration: 30,
      difficulty: "Medium",
      questions: [],
      status: "Draft",
    });

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // LOAD QUESTIONS
  // ====================================================

  useEffect(() => {
    const loadQuestions =
      async () => {
        try {
          setLoading(true);

          const response =
            await getPTEQuestions();

          setQuestions(
            response.data || []
          );
        } catch (err) {
          console.error(err);

          setError(
            err?.response?.data
              ?.message ||
              "Failed to load PTE questions."
          );
        } finally {
          setLoading(false);
        }
      };

    loadQuestions();
  }, []);

  // ====================================================
  // FORM CHANGE
  // ====================================================

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // QUESTION SELECT
  // ====================================================

  const toggleQuestion = (
    questionId
  ) => {
    setForm((prev) => {
      const exists =
        prev.questions.includes(
          questionId
        );

      return {
        ...prev,
        questions: exists
          ? prev.questions.filter(
              (id) =>
                id !== questionId
            )
          : [
              ...prev.questions,
              questionId,
            ],
      };
    });
  };

  // ====================================================
  // TOTAL MARKS
  // ====================================================

  const totalMarks =
    questions
      .filter((question) =>
        form.questions.includes(
          question._id
        )
      )
      .reduce(
        (total, question) =>
          total +
          Number(
            question.marks || 0
          ),
        0
      );

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError(
        "Test title is required."
      );
      return;
    }

    if (
      form.questions.length ===
      0
    ) {
      setError(
        "Please select at least one question."
      );
      return;
    }

    try {
      setSaving(true);

      await createPTEPracticeTest({
        ...form,
        duration: Number(
          form.duration
        ),
      });

      navigate(
        "/admin/pte/tests"
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data
          ?.message ||
          "Failed to create practice test."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Create PTE Practice Test
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6"
      >

        {/* TITLE */}

        <div className="mb-5">

          <label className="block font-medium mb-2">
            Test Title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="PTE Reading Practice 1"
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* DESCRIPTION */}

        <div className="mb-5">

          <label className="block font-medium mb-2">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* SECTION */}

        <div className="grid md:grid-cols-4 gap-4 mb-5">

          <div>

            <label className="block font-medium mb-2">
              Section
            </label>

            <select
              name="section"
              value={form.section}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
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

          <div>

            <label className="block font-medium mb-2">
              Test Type
            </label>

            <select
              name="testType"
              value={form.testType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >

              <option value="Practice">
                Practice
              </option>

              <option value="Section Test">
                Section Test
              </option>

              <option value="Mock Test">
                Mock Test
              </option>

            </select>

          </div>

          <div>

            <label className="block font-medium mb-2">
              Duration (minutes)
            </label>

            <input
              type="number"
              min="1"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>

          <div>

            <label className="block font-medium mb-2">
              Difficulty
            </label>

            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
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

        {/* QUESTIONS */}

        <div className="mb-6">

          <div className="flex justify-between items-center mb-3">

            <h2 className="text-lg font-semibold">
              Select PTE Questions
            </h2>

            <div className="text-sm">
              Selected:
              {" "}
              <strong>
                {form.questions.length}
              </strong>

              {" | "}

              Marks:
              {" "}
              <strong>
                {totalMarks}
              </strong>
            </div>

          </div>

          {loading ? (

            <div className="p-5 text-gray-500">
              Loading questions...
            </div>

          ) : questions.length === 0 ? (

            <div className="p-5 bg-yellow-50 text-yellow-700 rounded">
              No PTE questions available.
              Create questions first from PTE Question Management.
            </div>

          ) : (

            <div className="border rounded-lg max-h-[500px] overflow-y-auto">

              {questions.map(
                (question) => {

                  const selected =
                    form.questions.includes(
                      question._id
                    );

                  return (
                    <label
                      key={
                        question._id
                      }
                      className={`flex gap-3 p-4 border-b cursor-pointer ${
                        selected
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleQuestion(
                            question._id
                          )
                        }
                        className="mt-1"
                      />

                      <div>

                        <div className="font-medium">
                          {
                            question.questionType
                          }
                        </div>

                        <div className="text-sm text-gray-600">
                          {
                            question.questionText
                          }
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {
                            question.section
                          }
                          {" • "}
                          Marks:
                          {" "}
                          {
                            question.marks
                          }
                          {" • "}
                          {
                            question.difficulty
                          }
                        </div>

                      </div>

                    </label>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* ACTIONS */}

        <div className="flex gap-3">

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/pte/tests"
              )
            }
            className="px-5 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
};

export default CreatePTEPracticeTest;