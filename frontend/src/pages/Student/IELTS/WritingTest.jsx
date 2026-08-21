import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getWritingTestById,
  startWritingAttempt,
  submitWritingAttempt,
} from "../../../services/ieltsWritingService";

const WritingTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ======================================================
  // Load Writing Task
  // ======================================================

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getWritingTestById(id);

        setTest(response.data);
      } catch (err) {
        console.error(
          "Writing Test Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load Writing task."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [id]);


  // ======================================================
  // Start Attempt
  // ======================================================

  const handleStart = async () => {
    try {
      setStarting(true);
      setError("");

      const response =
        await startWritingAttempt(id);

      setAttempt(response.data);
    } catch (err) {
      console.error(
        "Start Writing Error:",
        err
      );

      setError(
        err.message ||
          "Unable to start Writing task."
      );
    } finally {
      setStarting(false);
    }
  };


  // ======================================================
  // Word Count
  // ======================================================

  const wordCount = answer
    .trim()
    ? answer.trim().split(/\s+/).length
    : 0;


  // ======================================================
  // Submit
  // ======================================================

  const handleSubmit = async () => {

    if (!attempt) return;

    if (!answer.trim()) {
      setError(
        "Please write your answer before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const answers = [
        {
          questionId:
            test?.questions?.[0]?._id,
          answer: answer.trim(),
        },
      ];

      await submitWritingAttempt(
        attempt._id,
        answers
      );

      setSubmitted(true);

    } catch (err) {
      console.error(
        "Submit Writing Error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit Writing answer."
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <p className="text-slate-500">
          Loading Writing task...
        </p>

      </div>
    );
  }


  // ======================================================
  // Error
  // ======================================================

  if (error && !test) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }


  // ======================================================
  // Submitted
  // ======================================================

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            ✅
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            Writing Submitted
          </h1>

          <p className="mt-3 text-slate-500">
            Your Writing answer has been submitted
            successfully.
          </p>

          <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
            Your teacher will review your answer and
            provide feedback.
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/student/ielts/writing")
            }
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Writing
          </button>

        </div>

      </div>
    );
  }


  // ======================================================
  // Before Start
  // ======================================================

  if (!attempt) {
    return (
      <div className="mx-auto max-w-3xl">

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <div className="text-4xl">
            ✍️
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            {test?.title}
          </h1>

          <p className="mt-3 text-slate-500">
            {test?.description}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Task
              </p>

              <p className="mt-1 text-xl font-bold">
                {test?.testType || "Writing"}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Questions
              </p>

              <p className="mt-1 text-xl font-bold">
                {test?.questions?.length || 0}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Duration
              </p>

              <p className="mt-1 text-xl font-bold">
                {test?.duration || 0} min
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {starting
              ? "Starting..."
              : "Start Writing Task"}
          </button>

        </div>

      </div>
    );
  }


  // ======================================================
  // Active Writing Task
  // ======================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ==================================================
          Header
      ================================================== */}

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          {test.title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Read the task carefully and write your answer.
        </p>

      </div>


      {/* ==================================================
          Writing Question
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Writing Task
        </h2>

        <div className="rounded-xl bg-slate-50 p-5">

          <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
            {test?.questions?.[0]?.questionText ||
              "Writing question is not available."}
          </p>

        </div>

      </div>


      {/* ==================================================
          Answer
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-lg font-bold text-slate-800">
            Your Answer
          </h2>

          <span
            className={
              wordCount < 150
                ? "text-sm font-medium text-orange-600"
                : "text-sm font-medium text-green-600"
            }
          >
            {wordCount} words
          </span>

        </div>

        <textarea
          value={answer}
          onChange={(event) =>
            setAnswer(event.target.value)
          }
          rows={20}
          placeholder="Write your answer here..."
          className="w-full resize-y rounded-xl border border-slate-300 p-5 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-3 text-xs text-slate-400">
          Write your answer clearly and organize your
          response into appropriate paragraphs.
        </p>

      </div>


      {/* ==================================================
          Error
      ================================================== */}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}


      {/* ==================================================
          Submit
      ================================================== */}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Submitting..."
          : "Submit Writing Answer"}
      </button>

    </div>
  );
};

export default WritingTest;