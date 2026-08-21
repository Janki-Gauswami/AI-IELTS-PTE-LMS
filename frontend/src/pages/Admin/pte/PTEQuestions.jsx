import React, {
  useEffect,
  useState,
} from "react";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaRedo,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
  getPTEQuestions,
  deletePTEQuestion,
} from "../../../services/pteQuestionService";

// ======================================================
// Component
// ======================================================

const PTEQuestions = () => {
  const navigate = useNavigate();

  // ====================================================
  // Questions
  // ====================================================

  const [questions, setQuestions] = useState([]);

  // ====================================================
  // Loading / Error
  // ====================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // Filters
  // ====================================================

  const [search, setSearch] = useState("");

  const [section, setSection] = useState("");

  const [questionType, setQuestionType] = useState("");

  const [difficulty, setDifficulty] = useState("");

  const [status, setStatus] = useState("");

  // ====================================================
  // Delete State
  // ====================================================

  const [deletingId, setDeletingId] = useState(null);

  // ====================================================
  // Question Types
  // ====================================================

  const questionTypes = [
    // Speaking
    "Read Aloud",
    "Repeat Sentence",
    "Describe Image",
    "Re-tell Lecture",
    "Answer Short Question",

    // Writing
    "Summarize Written Text",
    "Write Essay",

    // Reading
    "Reading & Writing Fill in the Blanks",
    "Multiple Choice Single Answer",
    "Multiple Choice Multiple Answers",
    "Re-order Paragraphs",
    "Reading Fill in the Blanks",

    // Listening
    "Summarize Spoken Text",
    "Listening Multiple Choice Single Answer",
    "Listening Multiple Choice Multiple Answers",
    "Fill in the Blanks",
    "Highlight Incorrect Words",
    "Write From Dictation",
  ];

  // ====================================================
  // Fetch Questions
  // ====================================================

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      // Search
      if (search.trim()) {
        params.search = search.trim();
      }

      // Section
      if (section) {
        params.section = section;
      }

      // Question Type
      if (questionType) {
        params.questionType = questionType;
      }

      // Difficulty
      if (difficulty) {
        params.difficulty = difficulty;
      }

      // Status
      if (status) {
        params.status = status;
      }

      const response = await getPTEQuestions(params);

      setQuestions(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Fetch PTE Questions Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load PTE questions."
      );

      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // Initial Load
  // ====================================================

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ====================================================
  // Search / Filter Submit
  // ====================================================

  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    await fetchQuestions();
  };

  // ====================================================
  // Reset Filters
  // ====================================================

  const handleResetFilters = async () => {
    setSearch("");
    setSection("");
    setQuestionType("");
    setDifficulty("");
    setStatus("");

    try {
      setLoading(true);
      setError("");

      const response = await getPTEQuestions();

      setQuestions(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Reset PTE Question Filters Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to reload questions."
      );

      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // Delete Question
  // ====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this PTE question?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deletePTEQuestion(id);

      setQuestions((previous) =>
        previous.filter(
          (question) => question._id !== id
        )
      );
    } catch (err) {
      console.error(
        "Delete PTE Question Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to delete question."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ====================================================
  // Render
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              PTE Question Management
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Create, view, edit, delete and filter
              PTE questions.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/pte/questions/add"
              )
            }
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <FaPlus />

            Add Question
          </button>

        </div>

        {/* ==================================================
            Error
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            Filters
        ================================================== */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">

          <form
            onSubmit={handleFilterSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >

            {/* ==================================================
                Search
            ================================================== */}

            <div className="lg:col-span-2 relative">

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search Question
              </label>

              <FaSearch className="absolute left-3 bottom-3 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search question text..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* ==================================================
                Section
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Section
              </label>

              <select
                value={section}
                onChange={(e) =>
                  setSection(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  All Sections
                </option>

                <option value="Speaking">
                  Speaking
                </option>

                <option value="Writing">
                  Writing
                </option>

                <option value="Reading">
                  Reading
                </option>

                <option value="Listening">
                  Listening
                </option>

              </select>

            </div>

            {/* ==================================================
                Question Type
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Question Type
              </label>

              <select
                value={questionType}
                onChange={(e) =>
                  setQuestionType(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  All Question Types
                </option>

                {questionTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}

              </select>

            </div>

            {/* ==================================================
                Difficulty
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  All Difficulties
                </option>

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

            {/* ==================================================
                Status
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  All Statuses
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Archived">
                  Archived
                </option>

              </select>

            </div>

            {/* ==================================================
                Buttons
            ================================================== */}

            <div className="lg:col-span-4 flex flex-col sm:flex-row justify-end gap-3">

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                <FaRedo />

                Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 transition"
              >

                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSearch />
                )}

                Search / Filter

              </button>

            </div>

          </form>

        </div>

        {/* ==================================================
            Result Count
        ================================================== */}

        {!loading && (
          <div className="mb-3 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {questions.length}
            </span>{" "}
            question
            {questions.length !== 1
              ? "s"
              : ""}
          </div>
        )}

        {/* ==================================================
            Questions Table
        ================================================== */}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {loading ? (

            <div className="py-16 flex flex-col items-center justify-center">

              <FaSpinner className="animate-spin text-3xl text-blue-600 mb-3" />

              <p className="text-gray-500">
                Loading questions...
              </p>

            </div>

          ) : questions.length === 0 ? (

            <div className="py-16 text-center">

              <p className="text-gray-500">
                No PTE questions found.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/pte/questions/add"
                  )
                }
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <FaPlus />

                Add First Question
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b border-gray-200">

                  <tr>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                      Question
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                      Section
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                      Type
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                      Difficulty
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {questions.map(
                    (question) => (

                      <tr
                        key={question._id}
                        className="hover:bg-gray-50"
                      >

                        {/* Question */}

                        <td className="px-5 py-4 max-w-md">

                          <p className="font-medium text-gray-800 truncate">
                            {question.questionText}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Marks:{" "}
                            {question.marks}
                          </p>

                        </td>

                        {/* Section */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-gray-700">
                            {question.section}
                          </span>

                        </td>

                        {/* Type */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-gray-700">
                            {question.questionType}
                          </span>

                        </td>

                        {/* Difficulty */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-gray-700">
                            {question.difficulty}
                          </span>

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              question.status ===
                              "Published"
                                ? "bg-green-100 text-green-700"
                                : question.status ===
                                  "Archived"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {question.status}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end items-center gap-2">

                            {/* Edit */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/pte/questions/${question._id}/edit`
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                              title="Edit Question"
                            >
                              <FaEdit />
                            </button>

                            {/* Delete */}

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                question._id
                              }
                              onClick={() =>
                                handleDelete(
                                  question._id
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                              title="Delete Question"
                            >
                              {deletingId ===
                              question._id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default PTEQuestions;