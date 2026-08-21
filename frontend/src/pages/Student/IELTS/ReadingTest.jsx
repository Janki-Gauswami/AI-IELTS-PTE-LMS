import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getReadingTestById,
  startReadingTest,
  submitReadingTest,
} from "../../../services/ieltsReadingService";

const ReadingTest = () => {
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
  // Load Reading Test
  // ======================================================

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getReadingTestById(id);

        setTest(response.data);
      } catch (err) {
        console.error(
          "Reading Test Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load Reading test."
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
        await startReadingTest(id);

      setAttempt(response.data);
    } catch (err) {
      console.error(
        "Start Reading Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to start Reading test."
      );
    } finally {
      setStarting(false);
    }
  };

  // ======================================================
  // Change Answer
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
  // Submit
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
        await submitReadingTest(
          attempt._id,
          formattedAnswers
        );

      setResult(response.data);
    } catch (err) {
      console.error(
        "Submit Reading Test Error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit Reading test."
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
          Loading Reading test...
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
            Reading Test Completed
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
              navigate("/student/ielts/reading")
            }
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Reading
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
            📖
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
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {starting
              ? "Starting..."
              : "Start Reading Test"}
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Active Reading Test
  // ======================================================

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {test.title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Read the passage carefully and answer the
          questions.
        </p>
      </div>


      {/* Main Reading Area */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ==================================================
            Passage
        ================================================== */}

        <div className="rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:h-fit">

          <h2 className="mb-5 text-xl font-bold text-slate-800">
            Reading Passage
          </h2>

          {test.questions?.[0]?.passage ? (
            <div className="max-h-[650px] overflow-y-auto whitespace-pre-line text-sm leading-7 text-slate-700">
              {test.questions[0].passage}
            </div>
          ) : (
            <p className="text-slate-500">
              No reading passage has been added to this
              test yet.
            </p>
          )}

        </div>


        {/* ==================================================
            Questions
        ================================================== */}

        <div className="space-y-5">

          {test.questions?.map(
            (question, index) => (
              <div
                key={question._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                <div className="flex items-start gap-3">

                  <span className="font-bold text-blue-600">
                    {index + 1}.
                  </span>

                  <div className="flex-1">

                    <p className="font-semibold text-slate-800">
                      {question.questionText}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {question.questionType}
                    </p>

                  </div>

                </div>


                {/* ==================================================
                    Multiple Choice
                ================================================== */}

                {question.questionType ===
                  "Multiple Choice" &&
                  question.options?.length > 0 && (
                    <div className="mt-4 space-y-3">

                      {question.options.map(
                        (option, optionIndex) => {

                          const value =
                            option.label ||
                            option.text;

                          return (
                            <label
                              key={optionIndex}
                              className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition hover:bg-slate-50"
                            >

                              <input
                                type="radio"
                                name={`question-${question._id}`}
                                value={value}
                                checked={
                                  answers[
                                    question._id
                                  ] === value
                                }
                                onChange={(event) =>
                                  handleAnswerChange(
                                    question._id,
                                    event.target.value
                                  )
                                }
                              />

                              <span className="text-sm text-slate-700">
                                {option.label
                                  ? `${option.label}. `
                                  : ""}
                                {option.text}
                              </span>

                            </label>
                          );
                        }
                      )}

                    </div>
                  )}


                {/* ==================================================
                    True / False / Not Given
                ================================================== */}

                {(question.questionType ===
                  "True False Not Given" ||
                  question.questionType ===
                    "Yes No Not Given") && (
                  <div className="mt-4 space-y-3">

                    {(
                      question.questionType ===
                      "True False Not Given"
                        ? [
                            "True",
                            "False",
                            "Not Given",
                          ]
                        : [
                            "Yes",
                            "No",
                            "Not Given",
                          ]
                    ).map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-slate-50"
                      >

                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          value={option}
                          checked={
                            answers[
                              question._id
                            ] === option
                          }
                          onChange={(event) =>
                            handleAnswerChange(
                              question._id,
                              event.target.value
                            )
                          }
                        />

                        <span className="text-sm">
                          {option}
                        </span>

                      </label>
                    ))}

                  </div>
                )}


                {/* ==================================================
                    Other Question Types
                ================================================== */}

                {[
                  "Matching",
                  "Matching Headings",
                  "Fill in the Blanks",
                  "Sentence Completion",
                  "Short Answer",
                ].includes(
                  question.questionType
                ) && (
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
                    className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                )}

              </div>
            )
          )}

        </div>

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
        className="w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Submitting..."
          : "Submit Reading Test"}
      </button>

    </div>
  );
};

export default ReadingTest;