import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPracticeTestById,
  updatePracticeTest,
} from "../../../../services/ieltsPracticeTestService";

import {
  getIELTSQuestions,
} from "../../../../services/ieltsQuestionService";

const SelectQuestions = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ======================================================
  // States
  // ======================================================

  const [test, setTest] = useState(null);

  const [questions, setQuestions] = useState([]);

  const [selectedQuestions, setSelectedQuestions] =
    useState([]);

  const [questionType, setQuestionType] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================================
  // Load Test
  // ======================================================

  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPracticeTestById(id);

      const practiceTest = response.data;

      if (!practiceTest) {
        setError(
          "Practice test not found."
        );
        return;
      }

      setTest(practiceTest);

      // Existing question IDs
      const existingQuestionIds =
        (practiceTest.questions || []).map(
          (question) =>
            typeof question === "string"
              ? question
              : question._id
        );

      setSelectedQuestions(
        existingQuestionIds
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
  // Load Questions
  // ======================================================

  const loadQuestions = async () => {
    try {
      setError("");

      const response =
        await getIELTSQuestions({
          section: test?.section,
          questionType,
          difficulty,
          search,
        });

      setQuestions(
        response.data || []
      );

    } catch (err) {
      console.error(
        "Load IELTS Questions Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load IELTS questions."
      );
    }
  };

  // ======================================================
  // Load Questions When Test Is Available
  // ======================================================

  useEffect(() => {
    if (test) {
      loadQuestions();
    }
  }, [
    test,
    questionType,
    difficulty,
  ]);

  // ======================================================
  // Toggle Question
  // ======================================================

  const toggleQuestion = (questionId) => {
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

    setSuccess("");
  };

  // ======================================================
  // Save Questions
  // ======================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await updatePracticeTest(id, {
          questions: selectedQuestions,
        });

      if (response.success) {
        setSuccess(
          "Questions added to the practice test successfully."
        );

        // Update local test
        setTest(response.data);
      } else {
        setError(
          response.message ||
            "Unable to save questions."
        );
      }

    } catch (err) {
      console.error(
        "Save Questions Error:",
        err
      );

      setError(
        err.message ||
          "Unable to save questions."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // Search
  // ======================================================

  const handleSearch = (event) => {
    event.preventDefault();

    loadQuestions();
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
    <div className="mx-auto max-w-6xl">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Select Questions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {test?.title}
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/ielts/tests")
          }
          className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Tests
        </button>

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
          Test Information
      ================================================== */}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

        <div className="grid gap-4 sm:grid-cols-4">

          <div>
            <p className="text-xs text-slate-500">
              Section
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {test?.section}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Difficulty
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {test?.difficulty}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Duration
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {test?.duration} minutes
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Selected
            </p>

            <p className="mt-1 font-semibold text-blue-600">
              {selectedQuestions.length}
            </p>
          </div>

        </div>

      </div>


      {/* ==================================================
          Filters
      ================================================== */}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

        <form
          onSubmit={handleSearch}
          className="grid gap-4 md:grid-cols-4"
        >

          {/* Search */}

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search questions..."
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />


          {/* Question Type */}

          <select
            value={questionType}
            onChange={(event) =>
              setQuestionType(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >

            <option value="">
              All Question Types
            </option>

            <option value="MCQ">
              MCQ
            </option>

            <option value="Multiple Choice">
              Multiple Choice
            </option>

            <option value="True False Not Given">
              True / False / Not Given
            </option>

            <option value="Matching">
              Matching
            </option>

            <option value="Fill in the Blanks">
              Fill in the Blanks
            </option>

          </select>


          {/* Difficulty */}

          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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


          {/* Search Button */}

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Search
          </button>

        </form>

      </div>


      {/* ==================================================
          Questions
      ================================================== */}

      <div className="space-y-4">

        {questions.length === 0 ? (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              ❓
            </div>

            <h2 className="mt-4 font-semibold text-slate-800">
              No Questions Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create IELTS questions first from the
              IELTS Questions module.
            </p>

          </div>

        ) : (

          questions.map(
            (question, index) => {

              const isSelected =
                selectedQuestions.includes(
                  question._id
                );

              return (
                <div
                  key={question._id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >

                  <div className="flex gap-4">

                    {/* Checkbox */}

                    <div className="pt-1">

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleQuestion(
                            question._id
                          )
                        }
                        className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600"
                      />

                    </div>


                    {/* Question */}

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          Question {index + 1}
                        </span>

                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                          {question.questionType}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {question.difficulty}
                        </span>

                      </div>


                      <h3 className="mt-3 font-semibold leading-6 text-slate-800">
                        {question.questionText}
                      </h3>


                      {question.passage && (
                        <p className="mt-3 line-clamp-3 text-sm text-slate-500">
                          {question.passage}
                        </p>
                      )}


                      {question.options &&
                        question.options.length >
                          0 && (

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">

                            {question.options.map(
                              (
                                option,
                                optionIndex
                              ) => (
                                <div
                                  key={
                                    optionIndex
                                  }
                                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
                                >
                                  {typeof option ===
                                  "object"
                                    ? option.text
                                    : option}
                                </div>
                              )
                            )}

                          </div>
                        )}


                      <div className="mt-4 text-xs text-slate-400">

                        Marks:
                        {" "}
                        {question.marks ||
                          1}

                      </div>

                    </div>

                  </div>

                </div>
              );
            }
          )

        )}

      </div>


      {/* ==================================================
          Bottom Action Bar
      ================================================== */}

      <div className="sticky bottom-0 mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="font-semibold text-slate-800">
            {selectedQuestions.length}
            {" "}
            question(s) selected
          </p>

          <p className="text-sm text-slate-500">
            Select the questions you want to include
            in this test.
          </p>

        </div>


        <div className="flex gap-3">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/ielts/tests")
            }
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Questions"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default SelectQuestions;