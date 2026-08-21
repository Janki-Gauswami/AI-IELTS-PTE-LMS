import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getIELTSTestResult,
} from "../../../../services/ieltsPracticeTestService";

const IELTSPracticeTestAnalysis = () => {
  const navigate = useNavigate();

  const {
    id,
    attemptId,
  } = useParams();

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("all");


  // ======================================================
  // Load Result
  // ======================================================

  useEffect(() => {
    if (!id || !attemptId) {
      setError(
        "Test ID or attempt ID is missing."
      );

      setLoading(false);

      return;
    }

    loadResult();
  }, [id, attemptId]);


  const loadResult = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getIELTSTestResult(
          id,
          attemptId
        );

      if (
        !response ||
        !response.success ||
        !response.data
      ) {
        setError(
          response?.message ||
            "Unable to load detailed analysis."
        );

        return;
      }

      setResult(
        response.data
      );

    } catch (err) {
      console.error(
        "IELTS Detailed Analysis Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load detailed analysis."
      );

    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // Flexible Data Handling
  // ======================================================

  const test =
    result?.test ||
    result?.practiceTest ||
    {};

  const attempt =
    result?.attempt ||
    {};

  const questions =
    result?.questions ||
    attempt?.questions ||
    test?.questions ||
    [];

  const answers =
    result?.answers ||
    attempt?.answers ||
    [];


  // ======================================================
  // Normalize Answers
  // ======================================================

  const answerMap = useMemo(() => {
    const map = {};

    if (Array.isArray(answers)) {
      answers.forEach((item) => {
        if (!item) return;

        const questionId =
          typeof item.question === "object"
            ? item.question?._id
            : item.question;

        if (questionId) {
          map[questionId] =
            item.answer ??
            item.selectedAnswer ??
            "";
        }
      });
    }

    if (
      !Array.isArray(answers) &&
      answers &&
      typeof answers === "object"
    ) {
      Object.assign(
        map,
        answers
      );
    }

    return map;

  }, [answers]);


  // ======================================================
  // Normalize Questions
  // ======================================================

  const normalizedQuestions =
    useMemo(() => {

      return questions.map(
        (question, index) => {

          const questionId =
            question?._id ||
            question?.id ||
            String(index);

          const userAnswer =
            answerMap[
              questionId
            ] ?? "";

          const correctAnswer =
            question?.correctAnswer ??
            question?.answer ??
            "";

          let status =
            question?.isCorrect;

          if (
            status === undefined
          ) {

            if (
              userAnswer === "" ||
              userAnswer === null ||
              userAnswer === undefined
            ) {
              status = "unanswered";

            } else if (
              correctAnswer !== ""
            ) {

              const normalize = (
                value
              ) =>
                String(value)
                  .trim()
                  .toLowerCase();

              status =
                normalize(
                  userAnswer
                ) ===
                normalize(
                  correctAnswer
                );

            } else {
              status = "answered";
            }
          }

          return {
            ...question,
            questionId,
            questionNumber:
              index + 1,
            userAnswer,
            correctAnswer,
            status,
          };

        }
      );

    }, [
      questions,
      answerMap,
    ]);


  // ======================================================
  // Statistics
  // ======================================================

  const statistics =
    useMemo(() => {

      let correct = 0;
      let incorrect = 0;
      let unanswered = 0;

      normalizedQuestions.forEach(
        (question) => {

          if (
            question.status === true ||
            question.status === "correct"
          ) {
            correct++;
          } else if (
            question.status === false ||
            question.status === "incorrect"
          ) {
            incorrect++;
          } else if (
            question.status === "unanswered" ||
            question.userAnswer === ""
          ) {
            unanswered++;
          }

        }
      );

      return {
        total:
          normalizedQuestions.length,

        correct,

        incorrect,

        unanswered,
      };

    }, [
      normalizedQuestions,
    ]);


  // ======================================================
  // Filtered Questions
  // ======================================================

  const filteredQuestions =
    useMemo(() => {

      if (
        activeFilter === "all"
      ) {
        return normalizedQuestions;
      }

      if (
        activeFilter === "correct"
      ) {
        return normalizedQuestions.filter(
          (question) =>
            question.status === true ||
            question.status === "correct"
        );
      }

      if (
        activeFilter === "incorrect"
      ) {
        return normalizedQuestions.filter(
          (question) =>
            question.status === false ||
            question.status === "incorrect"
        );
      }

      if (
        activeFilter === "unanswered"
      ) {
        return normalizedQuestions.filter(
          (question) =>
            question.status ===
              "unanswered" ||
            question.userAnswer === ""
        );
      }

      return normalizedQuestions;

    }, [
      normalizedQuestions,
      activeFilter,
    ]);


  // ======================================================
  // Overall Score
  // ======================================================

  const totalMarks =
    result?.totalMarks ??
    attempt?.totalMarks ??
    test?.totalMarks ??
    statistics.total;

  const obtainedMarks =
    result?.obtainedMarks ??
    result?.score ??
    result?.totalScore ??
    attempt?.obtainedMarks ??
    statistics.correct;

  const percentage =
    result?.percentage ??
    (
      Number(totalMarks) > 0
        ? (
            Number(obtainedMarks) /
            Number(totalMarks)
          ) * 100
        : 0
    );


  // ======================================================
  // Band
  // ======================================================

  const bandScore =
    result?.bandScore ??
    result?.overallBand ??
    attempt?.bandScore ??
    null;


  // ======================================================
  // Helpers
  // ======================================================

  const getStatus = (
    question
  ) => {

    if (
      question.status === true ||
      question.status === "correct"
    ) {
      return "correct";
    }

    if (
      question.status === false ||
      question.status === "incorrect"
    ) {
      return "incorrect";
    }

    if (
      question.status === "unanswered" ||
      question.userAnswer === ""
    ) {
      return "unanswered";
    }

    return "answered";
  };


  const getStatusStyles = (
    status
  ) => {

    if (
      status === "correct"
    ) {
      return {
        container:
          "border-green-200 bg-green-50",
        badge:
          "bg-green-100 text-green-700",
        icon: "✓",
      };
    }

    if (
      status === "incorrect"
    ) {
      return {
        container:
          "border-red-200 bg-red-50",
        badge:
          "bg-red-100 text-red-700",
        icon: "✕",
      };
    }

    if (
      status === "unanswered"
    ) {
      return {
        container:
          "border-slate-200 bg-slate-50",
        badge:
          "bg-slate-200 text-slate-600",
        icon: "—",
      };
    }

    return {
      container:
        "border-blue-200 bg-blue-50",
      badge:
        "bg-blue-100 text-blue-700",
      icon: "•",
    };
  };


  const getQuestionType =
    (question) =>
      question.questionType ||
      question.type ||
      "Question";


  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="font-semibold text-slate-700">
            Loading detailed analysis...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Please wait.
          </p>

        </div>

      </div>
    );
  }


  // ======================================================
  // Error
  // ======================================================

  if (error || !result) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-red-700">
            Analysis Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error ||
              "Detailed test analysis could not be loaded."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              type="button"
              onClick={loadResult}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/student/ielts/tests/${id}/results/${attemptId}`
                )
              }
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-white"
            >
              Back to Result
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:p-8">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/student/ielts/tests/${id}/results/${attemptId}`
            )
          }
          className="mb-6 text-sm font-semibold text-blue-100 hover:text-white"
        >
          ← Back to Result
        </button>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div>

            <p className="text-sm text-blue-100">
              IELTS Practice Test
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              {test.title ||
                result.testTitle ||
                "Detailed Performance Analysis"}
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              Review your answers and identify areas
              that need improvement.
            </p>

          </div>


          <div className="rounded-2xl bg-white/15 p-5 text-center">

            <p className="text-xs text-blue-100">
              Overall Score
            </p>

            <p className="mt-1 text-4xl font-bold">
              {Number(
                percentage
              ).toFixed(1)}
              %
            </p>

            {bandScore !== null && (
              <p className="mt-1 text-sm text-blue-100">
                Band {bandScore}
              </p>
            )}

          </div>

        </div>

      </div>


      {/* ==================================================
          Statistics
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total Questions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {statistics.total}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Correct
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {statistics.correct}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Incorrect
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {statistics.incorrect}
          </p>

        </div>


        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Unanswered
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-600">
            {statistics.unanswered}
          </p>

        </div>

      </div>


      {/* ==================================================
          Accuracy
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Accuracy
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your correct-answer percentage.
            </p>

          </div>

          <p className="text-2xl font-bold text-blue-600">

            {statistics.total > 0
              ? (
                  (
                    statistics.correct /
                    statistics.total
                  ) * 100
                ).toFixed(1)
              : "0.0"}
            %

          </p>

        </div>


        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${
                statistics.total > 0
                  ? (
                      statistics.correct /
                      statistics.total
                    ) * 100
                  : 0
              }%`,
            }}
          />

        </div>

      </div>


      {/* ==================================================
          Question Filters
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Question Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review each question and your answer.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                setActiveFilter("all")
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({statistics.total})
            </button>


            <button
              type="button"
              onClick={() =>
                setActiveFilter("correct")
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeFilter === "correct"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              Correct ({statistics.correct})
            </button>


            <button
              type="button"
              onClick={() =>
                setActiveFilter("incorrect")
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeFilter === "incorrect"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              Incorrect ({statistics.incorrect})
            </button>


            <button
              type="button"
              onClick={() =>
                setActiveFilter("unanswered")
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeFilter === "unanswered"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Unanswered ({statistics.unanswered})
            </button>

          </div>

        </div>


        {/* ==================================================
            Questions
        ================================================== */}

        <div className="mt-6 space-y-4">

          {filteredQuestions.length === 0 ? (

            <div className="rounded-xl bg-slate-50 p-8 text-center">

              <div className="text-4xl">
                🔍
              </div>

              <p className="mt-3 font-semibold text-slate-700">
                No questions found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                There are no questions matching this filter.
              </p>

            </div>

          ) : (

            filteredQuestions.map(
              (question) => {

                const status =
                  getStatus(
                    question
                  );

                const styles =
                  getStatusStyles(
                    status
                  );


                return (

                  <div
                    key={
                      question.questionId
                    }
                    className={`rounded-2xl border p-5 ${styles.container}`}
                  >

                    {/* Question Header */}

                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                      <div className="flex gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 shadow-sm">
                          {question.questionNumber}
                        </div>

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {getQuestionType(
                              question
                            )}
                          </p>

                          <h3 className="mt-1 font-semibold leading-6 text-slate-800">
                            {question.questionText ||
                              question.text ||
                              "Question"}
                          </h3>

                        </div>

                      </div>


                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}
                      >
                        {styles.icon}{" "}

                        {status === "correct"
                          ? "Correct"
                          : status === "incorrect"
                          ? "Incorrect"
                          : status === "unanswered"
                          ? "Unanswered"
                          : "Answered"}
                      </span>

                    </div>


                    {/* Passage */}

                    {question.passage && (

                      <div className="mt-4 rounded-xl bg-white/70 p-4">

                        <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                          {question.passage}
                        </p>

                      </div>

                    )}


                    {/* Answers */}

                    <div className="mt-5 grid gap-4 md:grid-cols-2">

                      <div className="rounded-xl bg-white p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Your Answer
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-700">

                          {question.userAnswer !==
                            "" &&
                          question.userAnswer !==
                            null &&
                          question.userAnswer !==
                            undefined
                            ? question.userAnswer
                            : "Not answered"}

                        </p>

                      </div>


                      <div className="rounded-xl bg-white p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Correct Answer
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-700">

                          {question.correctAnswer !==
                            "" &&
                          question.correctAnswer !==
                            null &&
                          question.correctAnswer !==
                            undefined
                            ? question.correctAnswer
                            : "Not available"}

                        </p>

                      </div>

                    </div>


                    {/* Explanation */}

                    {question.explanation && (

                      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Explanation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-blue-800">
                          {question.explanation}
                        </p>

                      </div>

                    )}

                  </div>

                );

              }
            )

          )}

        </div>

      </div>


      {/* ==================================================
          Improvement Suggestions
      ================================================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            💡
          </div>

          <div>

            <h2 className="font-bold text-blue-900">
              Improvement Suggestions
            </h2>

            <div className="mt-3 space-y-2 text-sm leading-6 text-blue-800">

              {statistics.incorrect >
                statistics.correct && (

                <p>
                  • Focus on reviewing the questions
                  you answered incorrectly.
                </p>

              )}

              {statistics.unanswered > 0 && (

                <p>
                  • Try to manage your time better so
                  fewer questions remain unanswered.
                </p>

              )}

              {statistics.correct >=
                statistics.incorrect && (

                <p>
                  • Your accuracy is developing well.
                  Continue practicing regularly.
                </p>

              )}

              <p>
                • Review explanations and practice
                similar question types before your
                next IELTS test.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          Actions
      ================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/student/ielts/tests/${id}/results/${attemptId}`
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Result
        </button>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts/tests"
            )
          }
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Take Another Test
        </button>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/ielts"
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          IELTS Dashboard
        </button>

      </div>

    </div>
  );
};

export default IELTSPracticeTestAnalysis;