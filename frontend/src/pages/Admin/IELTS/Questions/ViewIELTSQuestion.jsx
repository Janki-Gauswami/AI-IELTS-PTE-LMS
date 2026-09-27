import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getIELTSQuestionById,
} from "../../../../services/ieltsQuestionService";

const ViewIELTSQuestion = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [question, setQuestion] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getIELTSQuestionById(id);

      setQuestion(
        response.data || null
      );

    } catch (err) {
      console.error(
        "View IELTS Question Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load IELTS question."
      );

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="text-slate-500">
            Loading question...
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/ielts/questions"
            )
          }
          className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back
        </button>

        <div className="rounded-xl bg-red-50 p-5 text-red-600">
          {error}
        </div>

      </div>
    );
  }

  if (!question) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

        <p className="text-slate-500">
          IELTS question not found.
        </p>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            View IELTS Question
          </h1>

          <p className="mt-1 text-slate-500">
            View complete question details.
          </p>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/ielts/questions/${question._id}/edit`
              )
            }
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/ielts/questions"
              )
            }
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>

        </div>

      </div>


      {/* Question */}

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <div className="flex flex-wrap gap-2">

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

          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-600">
            {question.marks}{" "}
            {question.marks === 1
              ? "Mark"
              : "Marks"}
          </span>

          {question.status && (
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs text-yellow-600">
              {question.status}
            </span>
          )}

        </div>


        {/* Question Text */}

        <div className="mt-8">

          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Question
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-lg leading-8 text-slate-800">
            {question.questionText}
          </p>

        </div>


        {/* Passage */}

        {question.passage && (
          <div className="mt-8">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Passage / Context
            </h2>

            <div className="mt-3 rounded-xl bg-slate-50 p-5">

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {question.passage}
              </p>

            </div>

          </div>
        )}


        {/* Options */}

        {question.options &&
          question.options.length > 0 && (

          <div className="mt-8">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Options
            </h2>

            <div className="mt-3 space-y-3">

              {question.options.map(
                (option) => (

                  <div
                    key={option.label}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
                  >

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-semibold text-blue-600">
                      {option.label}
                    </span>

                    <p className="pt-1 text-sm text-slate-700">
                      {option.text}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        )}


        {/* Correct Answer */}

        {question.correctAnswer && (
          <div className="mt-8">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Correct Answer
            </h2>

            <div className="mt-3 rounded-xl bg-green-50 p-4">

              <p className="font-medium text-green-700">
                {question.correctAnswer}
              </p>

            </div>

          </div>
        )}


        {/* Explanation */}

        {question.explanation && (
          <div className="mt-8">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Explanation
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {question.explanation}
            </p>

          </div>
        )}


        {/* Lesson */}

        {question.lesson && (
          <div className="mt-8 border-t border-slate-100 pt-6">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Lesson
            </h2>

            <p className="mt-2 font-medium text-slate-700">
              {question.lesson.title}
            </p>

            {question.lesson.section && (
              <p className="mt-1 text-sm text-slate-500">
                {question.lesson.section}
              </p>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default ViewIELTSQuestion;