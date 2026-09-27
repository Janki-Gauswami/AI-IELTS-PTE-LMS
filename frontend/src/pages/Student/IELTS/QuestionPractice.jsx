import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBookOpen,
  FaArrowLeft,
  FaArrowRight,
  FaFilter,
  FaCheckCircle,
  FaQuestionCircle,
} from "react-icons/fa";

import api from "../../../api/axios";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

const QuestionPractice = () => {
  const navigate = useNavigate();

  // ======================================================
  // State
  // ======================================================

  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [section, setSection] = useState("all");
  const [questionType, setQuestionType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [showAnswer, setShowAnswer] = useState(false);

  // ======================================================
  // Load Questions
  // ======================================================

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/ielts/questions"
        );

        setQuestions(
          response?.data?.data || []
        );

      } catch (err) {
        console.error(
          "IELTS Questions Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load IELTS questions."
        );

      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // ======================================================
  // Filter Questions
  // ======================================================

  const filteredQuestions = useMemo(() => {

    return questions.filter((question) => {

      const sectionMatch =
        section === "all" ||
        question.section === section;

      const typeMatch =
        questionType === "all" ||
        question.questionType === questionType;

      const difficultyMatch =
        difficulty === "all" ||
        question.difficulty === difficulty;

      return (
        sectionMatch &&
        typeMatch &&
        difficultyMatch
      );

    });

  }, [
    questions,
    section,
    questionType,
    difficulty,
  ]);

  // ======================================================
  // Current Question
  // ======================================================

  const question =
    filteredQuestions[currentQuestion];

  // ======================================================
  // Reset Question
  // ======================================================

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  // ======================================================
  // Change Filters
  // ======================================================

  const handleSectionChange = (value) => {
    setSection(value);
    setCurrentQuestion(0);
    resetQuestion();
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setCurrentQuestion(0);
    resetQuestion();
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    setCurrentQuestion(0);
    resetQuestion();
  };

  // ======================================================
  // Select Answer
  // ======================================================

  const handleAnswerSelect = (answer) => {
    if (showAnswer) {
      return;
    }

    setSelectedAnswer(answer);
  };

  // ======================================================
  // Check Answer
  // ======================================================

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      return;
    }

    setShowAnswer(true);
  };

  // ======================================================
  // Next Question
  // ======================================================

  const handleNextQuestion = () => {

    if (
      currentQuestion <
      filteredQuestions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );

      resetQuestion();
    }

  };

  // ======================================================
  // Previous Question
  // ======================================================

  const handlePreviousQuestion = () => {

    if (currentQuestion > 0) {
      setCurrentQuestion(
        currentQuestion - 1
      );

      resetQuestion();
    }

  };

  // ======================================================
  // Answer Correctness
  // ======================================================

  const isCorrect =
    showAnswer &&
    selectedAnswer !== null &&
    question &&
    selectedAnswer ===
      question.correctAnswer;

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <DashboardLayout>

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

            <p className="text-sm font-medium text-slate-500">
              Loading IELTS Questions...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we prepare your practice questions.
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  // ======================================================
  // Render
  // ======================================================

  return (
    <DashboardLayout>

      <div className="space-y-7">

        {/* ==================================================
            Back Navigation
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/student/ielts")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >

          <FaArrowLeft className="text-xs" />

          Back to IELTS Dashboard

        </button>


        {/* ==================================================
            Header
        ================================================== */}

        <div className="rounded-2xl bg-blue-600 p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white">

                <FaQuestionCircle />

              </div>


              <div>

                <p className="text-sm font-medium text-blue-100">
                  IELTS Student Panel
                </p>

                <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                  Question Practice
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                  Practice IELTS questions by section,
                  question type and difficulty.
                </p>

              </div>

            </div>


            <div className="rounded-2xl bg-white/10 px-6 py-5 text-center">

              <p className="text-xs text-blue-100">
                Available Questions
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                {filteredQuestions.length}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            Error
        ================================================== */}

        {error && (

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <span className="text-lg">
                ⚠️
              </span>

              <div>

                <p className="font-semibold text-red-700">
                  Unable to load questions
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* ==================================================
            Filters
        ================================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

              <FaFilter />

            </div>

            <div>

              <h2 className="font-bold text-slate-800">
                Practice Filters
              </h2>

              <p className="text-xs text-slate-400">
                Choose what you want to practice.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Section */}

            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Section
              </label>

              <select
                value={section}
                onChange={(e) =>
                  handleSectionChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              >

                <option value="all">
                  All Sections
                </option>

                <option value="listening">
                  Listening
                </option>

                <option value="reading">
                  Reading
                </option>

                <option value="writing">
                  Writing
                </option>

                <option value="speaking">
                  Speaking
                </option>

              </select>

            </div>


            {/* Question Type */}

            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Question Type
              </label>

              <select
                value={questionType}
                onChange={(e) =>
                  handleQuestionTypeChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              >

                <option value="all">
                  All Question Types
                </option>

                <option value="multiple_choice">
                  Multiple Choice
                </option>

                <option value="true_false_not_given">
                  True / False / Not Given
                </option>

                <option value="yes_no_not_given">
                  Yes / No / Not Given
                </option>

                <option value="matching">
                  Matching
                </option>

                <option value="fill_blank">
                  Fill in the Blank
                </option>

                <option value="short_answer">
                  Short Answer
                </option>

              </select>

            </div>


            {/* Difficulty */}

            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  handleDifficultyChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              >

                <option value="all">
                  All Difficulties
                </option>

                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>

              </select>

            </div>

          </div>

        </section>


        {/* ==================================================
            No Questions
        ================================================== */}

        {filteredQuestions.length === 0 ? (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">

              <FaQuestionCircle />

            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No Questions Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are no IELTS questions matching
              your selected filters.
            </p>

            <button
              type="button"
              onClick={() => {
                handleSectionChange("all");
                handleQuestionTypeChange("all");
                handleDifficultyChange("all");
              }}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Reset Filters
            </button>

          </div>

        ) : (

          <>

            {/* ==================================================
                Question Progress
            ================================================== */}

            <div className="rounded-2xl bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Current Question
                  </p>

                  <p className="mt-1 font-bold text-slate-800">

                    {currentQuestion + 1}

                    <span className="font-normal text-slate-400">
                      {" "}
                      / {filteredQuestions.length}
                    </span>

                  </p>

                </div>


                <div className="text-right">

                  <p className="text-xs font-medium text-slate-400">
                    Section
                  </p>

                  <p className="mt-1 font-semibold capitalize text-blue-600">
                    {question?.section || "-"}
                  </p>

                </div>

              </div>


              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${
                      ((currentQuestion + 1) /
                        filteredQuestions.length) *
                      100
                    }%`,
                  }}
                />

              </div>

            </div>


            {/* ==================================================
                Question Card
            ================================================== */}

            {question && (

              <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

                {/* Question Header */}

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div className="flex flex-wrap gap-2">

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                      {question.section}
                    </span>

                    {question.questionType && (

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {question.questionType}
                      </span>

                    )}

                    {question.difficulty && (

                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium capitalize text-purple-600">
                        {question.difficulty}
                      </span>

                    )}

                  </div>


                  <span className="text-xs font-medium text-slate-400">
                    Marks: {question.marks || 1}
                  </span>

                </div>


                {/* Passage */}

                {question.passage && (

                  <div className="mt-6 rounded-xl bg-slate-50 p-5">

                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Passage
                    </p>

                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                      {question.passage}
                    </p>

                  </div>

                )}


                {/* Question */}

                <div className="mt-7">

                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Question
                  </p>

                  <h2 className="mt-2 text-lg font-bold leading-7 text-slate-800 md:text-xl">
                    {question.questionText}
                  </h2>

                </div>


                {/* ==================================================
                    Options
                ================================================== */}

                {question.options?.length > 0 && (

                  <div className="mt-6 space-y-3">

                    {question.options.map(
                      (option, index) => {

                        const optionValue =
                          typeof option === "object"
                            ? option.value ||
                              option.text ||
                              option.label
                            : option;

                        const optionLabel =
                          typeof option === "object"
                            ? option.label ||
                              option.text ||
                              option.value
                            : option;

                        const selected =
                          selectedAnswer ===
                          optionValue;

                        const correct =
                          showAnswer &&
                          optionValue ===
                            question.correctAnswer;

                        return (

                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              handleAnswerSelect(
                                optionValue
                              )
                            }
                            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                              correct
                                ? "border-green-300 bg-green-50"
                                : selected &&
                                  !showAnswer
                                ? "border-blue-400 bg-blue-50"
                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >

                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                correct
                                  ? "bg-green-100 text-green-700"
                                  : selected &&
                                    !showAnswer
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(
                                65 + index
                              )}
                            </span>

                            <span className="text-sm font-medium text-slate-700">
                              {optionLabel}
                            </span>

                          </button>

                        );
                      }
                    )}

                  </div>

                )}


                {/* ==================================================
                    Text Answer
                ================================================== */}

                {(!question.options ||
                  question.options.length === 0) && (

                  <div className="mt-6">

                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Your Answer
                    </label>

                    <input
                      type="text"
                      value={
                        selectedAnswer || ""
                      }
                      disabled={showAnswer}
                      onChange={(e) =>
                        handleAnswerSelect(
                          e.target.value
                        )
                      }
                      placeholder="Type your answer here..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />

                  </div>

                )}


                {/* ==================================================
                    Answer Result
                ================================================== */}

                {showAnswer && (

                  <div
                    className={`mt-6 rounded-xl border p-5 ${
                      isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div className="mt-0.5">

                        {isCorrect ? (
                          <FaCheckCircle className="text-green-600" />
                        ) : (
                          <span className="text-red-600">
                            ✕
                          </span>
                        )}

                      </div>


                      <div>

                        <p
                          className={`font-bold ${
                            isCorrect
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {isCorrect
                            ? "Correct Answer!"
                            : "Incorrect Answer"}
                        </p>


                        <p className="mt-2 text-sm text-slate-600">

                          <strong>
                            Correct Answer:
                          </strong>{" "}

                          {question.correctAnswer}

                        </p>


                        {question.explanation && (

                          <p className="mt-2 text-sm leading-6 text-slate-600">

                            <strong>
                              Explanation:
                            </strong>{" "}

                            {question.explanation}

                          </p>

                        )}

                      </div>

                    </div>

                  </div>

                )}


                {/* ==================================================
                    Question Actions
                ================================================== */}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    onClick={
                      handlePreviousQuestion
                    }
                    disabled={
                      currentQuestion === 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <FaArrowLeft className="text-xs" />

                    Previous

                  </button>


                  <div className="flex flex-col gap-3 sm:flex-row">

                    {!showAnswer && (

                      <button
                        type="button"
                        onClick={
                          handleCheckAnswer
                        }
                        disabled={
                          selectedAnswer ===
                          null ||
                          selectedAnswer === ""
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        <FaCheckCircle className="text-xs" />

                        Check Answer

                      </button>

                    )}


                    <button
                      type="button"
                      onClick={
                        handleNextQuestion
                      }
                      disabled={
                        currentQuestion ===
                        filteredQuestions.length - 1
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >

                      Next Question

                      <FaArrowRight className="text-xs" />

                    </button>

                  </div>

                </div>

              </section>

            )}

          </>

        )}


        {/* ==================================================
            Bottom Navigation
        ================================================== */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() =>
              navigate("/student/ielts")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >

            <FaArrowLeft className="text-xs" />

            IELTS Dashboard

          </button>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/tests"
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >

            Practice Tests

            <FaArrowRight className="text-xs" />

          </button>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default QuestionPractice;