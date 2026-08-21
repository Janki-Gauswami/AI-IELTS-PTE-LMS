import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getListeningTestById,
  startListeningTest,
  submitListeningTest,
} from "../../../services/ieltsListeningService";

const ListeningTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);

  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // ======================================================
  // Load Test
  // ======================================================

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);

        const response =
          await getListeningTestById(id);

        setTest(response.data);
      } catch (err) {
        console.error(
          "Load Listening Test Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load Listening test."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [id]);

  // ======================================================
  // Start Test
  // ======================================================

  const handleStart = async () => {
    try {
      setStarting(true);
      setError("");

      const response =
        await startListeningTest(id);

      setAttempt(response.data);
    } catch (err) {
      console.error(
        "Start Listening Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to start Listening test."
      );
    } finally {
      setStarting(false);
    }
  };

  // ======================================================
  // Answer Change
  // ======================================================

  const handleAnswerChange = (
    questionId,
    answer
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  // ======================================================
  // Submit Test
  // ======================================================

  const handleSubmit = async () => {
    if (!attempt) return;

    try {
      setSubmitting(true);
      setError("");

      const formattedAnswers =
        Object.entries(answers).map(
          ([questionId, answer]) => ({
            questionId,
            answer,
          })
        );

      const response =
        await submitListeningTest(
          attempt._id,
          formattedAnswers
        );

      setResult(response.data);
    } catch (err) {
      console.error(
        "Submit Listening Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit Listening test."
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
          Loading Listening test...
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
  // Result
  // ======================================================

  if (result) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            🎉
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            Listening Test Completed
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Score
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {result.score}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Band
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {result.band}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/student/ielts/listening")
            }
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Listening
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Test Information — Before Start
  // ======================================================

  if (!attempt) {
    return (
      <div className="mx-auto max-w-3xl">

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <div className="text-4xl">
            🎧
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
                Questions
              </p>

              <p className="mt-1 text-xl font-bold">
                {test?.questions?.length || 0}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Marks
              </p>

              <p className="mt-1 text-xl font-bold">
                {test?.totalMarks || 0}
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
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting
              ? "Starting..."
              : "Start Listening Test"}
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Active Test
  // ======================================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {test.title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Answer all questions carefully.
        </p>
      </div>


      {/* Audio */}

      {test.audioUrl && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-lg font-semibold">
            Listening Audio
          </h2>

          <audio
            controls
            className="w-full"
          >
            <source
              src={test.audioUrl}
              type="audio/mpeg"
            />
          </audio>

        </div>
      )}


      {/* Questions */}

      <div className="space-y-5">

        {test.questions?.map(
          (question, index) => (
            <div
              key={question._id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >

              <p className="font-semibold text-slate-800">
                {index + 1}.{" "}
                {question.questionText}
              </p>


              {/* Multiple Choice */}

              {question.options?.length > 0 ? (
                <div className="mt-4 space-y-3">

                  {question.options.map(
                    (option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-slate-50"
                      >

                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          value={
                            option.label ||
                            option.text
                          }
                          checked={
                            answers[
                              question._id
                            ] ===
                            (
                              option.label ||
                              option.text
                            )
                          }
                          onChange={(event) =>
                            handleAnswerChange(
                              question._id,
                              event.target.value
                            )
                          }
                        />

                        <span>
                          {option.label
                            ? `${option.label}. `
                            : ""}
                          {option.text}
                        </span>

                      </label>
                    )
                  )}

                </div>
              ) : (
                <input
                  type="text"
                  value={
                    answers[
                      question._id
                    ] || ""
                  }
                  onChange={(event) =>
                    handleAnswerChange(
                      question._id,
                      event.target.value
                    )
                  }
                  placeholder="Enter your answer"
                  className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              )}

            </div>
          )
        )}

      </div>


      {/* Error */}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}


      {/* Submit */}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Submitting..."
          : "Submit Listening Test"}
      </button>

    </div>
  );
};

export default ListeningTest;