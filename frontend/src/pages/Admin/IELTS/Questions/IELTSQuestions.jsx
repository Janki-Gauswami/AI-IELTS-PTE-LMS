import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteIELTSQuestion,
  getIELTSQuestions,
} from "../../../../services/ieltsQuestionService";

const IELTSQuestions = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [section, setSection] = useState("");
  const [questionType, setQuestionType] =
    useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getIELTSQuestions({
          section,
          questionType,
        });

      setQuestions(response.data || []);

    } catch (err) {
      console.error(
        "IELTS Questions Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load IELTS questions."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [section, questionType]);

  // ======================================================
  // Delete Question
  // ======================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this question?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await deleteIELTSQuestion(id);

      setQuestions((previous) =>
        previous.filter(
          (question) =>
            question._id !== id
        )
      );

    } catch (err) {
      console.error(
        "Delete IELTS Question Error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete question."
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            IELTS Questions
          </h1>

          <p className="mt-1 text-slate-500">
            Manage questions for Listening, Reading,
            Writing, and Speaking.
          </p>

        </div>

        {/* Add Question */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/ielts/questions/add"
            )
          }
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Question
        </button>

      </div>


      {/* ==================================================
          Filters
      ================================================== */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-2">

          <select
            value={section}
            onChange={(event) =>
              setSection(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >

            <option value="">
              All Sections
            </option>

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


          <select
            value={questionType}
            onChange={(event) =>
              setQuestionType(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >

            <option value="">
              All Question Types
            </option>

            <option value="Multiple Choice">
              Multiple Choice
            </option>

            <option value="True False Not Given">
              True / False / Not Given
            </option>

            <option value="Yes No Not Given">
              Yes / No / Not Given
            </option>

            <option value="Matching">
              Matching
            </option>

            <option value="Matching Headings">
              Matching Headings
            </option>

            <option value="Fill in the Blanks">
              Fill in the Blanks
            </option>

            <option value="Sentence Completion">
              Sentence Completion
            </option>

            <option value="Short Answer">
              Short Answer
            </option>

            <option value="Essay">
              Essay
            </option>

            <option value="Speaking Prompt">
              Speaking Prompt
            </option>

          </select>

        </div>

      </div>


      {/* ==================================================
          Error
      ================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}


      {/* ==================================================
          Questions
      ================================================== */}

      <div className="rounded-2xl bg-white shadow-sm">

        {loading ? (

          <div className="p-8 text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

            <p className="text-slate-500">
              Loading questions...
            </p>

          </div>

        ) : questions.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-5xl">
              📝
            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No IELTS questions found.
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first IELTS question to the question bank.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/ielts/questions/add"
                )
              }
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Add Question
            </button>

          </div>

        ) : (

          <div className="divide-y">

            {questions.map(
              (question, index) => (

                <div
                  key={question._id}
                  className="p-6 transition hover:bg-slate-50"
                >

                  <div className="flex flex-col justify-between gap-5 lg:flex-row">

                    {/* Question Information */}

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium text-blue-600">
                        Question {index + 1}
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-slate-800">
                        {question.questionText}
                      </h3>


                      {/* Tags */}

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                          {question.section}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {question.questionType}
                        </span>

                        {question.difficulty && (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                            {question.difficulty}
                          </span>
                        )}

                        {question.marks !==
                          undefined && (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                            {question.marks}{" "}
                            {question.marks === 1
                              ? "Mark"
                              : "Marks"}
                          </span>
                        )}

                        {question.status && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              question.status ===
                              "Published"
                                ? "bg-green-50 text-green-600"
                                : question.status ===
                                  "Archived"
                                ? "bg-red-50 text-red-600"
                                : "bg-yellow-50 text-yellow-600"
                            }`}
                          >
                            {question.status}
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Actions */}

                    <div className="flex flex-wrap items-start gap-2 lg:justify-end">

                      {/* View */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/ielts/questions/${question._id}`
                          )
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        View
                      </button>


                      {/* Edit */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/ielts/questions/${question._id}/edit`
                          )
                        }
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>


                      {/* Delete */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            question._id
                          )
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default IELTSQuestions;