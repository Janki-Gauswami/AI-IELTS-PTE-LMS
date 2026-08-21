import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getStudentPracticeTest,
  startIELTSTestAttempt,
  submitIELTSTestAttempt,
  saveIELTSTestAnswers,
} from "../../../../services/ieltsPracticeTestService";


const TestInterface = () => {

  const navigate = useNavigate();

  const { id } = useParams();


  // ======================================================
  // Test State
  // ======================================================

  const [test, setTest] = useState(null);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const [attempt, setAttempt] =
    useState(null);


  // ======================================================
  // Loading / Error
  // ======================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");


  // ======================================================
  // Submission
  // ======================================================

  const [submitting, setSubmitting] =
    useState(false);

  const submittedRef =
    useRef(false);


  // ======================================================
  // Timer
  // ======================================================

  const [timeRemaining, setTimeRemaining] =
    useState(0);

  const [timeExpired, setTimeExpired] =
    useState(false);

  const timerRef =
    useRef(null);


  // ======================================================
  // Auto Save
  // ======================================================

  const saveTimerRef =
    useRef(null);


  // ======================================================
  // Load Test
  // ======================================================

  useEffect(() => {

    if (!id) {
      setError("Practice test ID is missing.");
      setLoading(false);
      return;
    }

    loadTest();

  }, [id]);


  // ======================================================
  // Fetch Test + Start Attempt
  // ======================================================

  const loadTest = async () => {

    try {

      setLoading(true);
      setError("");

      // -----------------------------------------------
      // Get Student Test
      // -----------------------------------------------

      const response =
        await getStudentPracticeTest(id);


      if (
        !response ||
        !response.success ||
        !response.data
      ) {

        setError(
          response?.message ||
            "Unable to load test."
        );

        return;
      }


      const loadedTest =
        response.data;


      setTest(loadedTest);


      // -----------------------------------------------
      // Initialize Timer
      // -----------------------------------------------

      const duration =
        Number(loadedTest.duration) || 0;

      setTimeRemaining(
        duration * 60
      );


      // -----------------------------------------------
      // Start Attempt
      // -----------------------------------------------

      const attemptResponse =
        await startIELTSTestAttempt(id);


      if (
        !attemptResponse ||
        !attemptResponse.success ||
        !attemptResponse.data
      ) {

        setError(
          attemptResponse?.message ||
            "Unable to start the test attempt."
        );

        return;
      }


      setAttempt(
        attemptResponse.data
      );


      // -----------------------------------------------
      // Restore Existing Answers
      // -----------------------------------------------

      if (
        attemptResponse.data.answers &&
        Array.isArray(
          attemptResponse.data.answers
        )
      ) {

        const restoredAnswers = {};

        attemptResponse.data.answers.forEach(
          (item) => {

            if (
              item &&
              item.question
            ) {

              const questionId =
                typeof item.question === "object"
                  ? item.question._id
                  : item.question;

              restoredAnswers[
                questionId
              ] = item.answer;
            }

          }
        );


        setAnswers(
          restoredAnswers
        );
      }


    } catch (err) {

      console.error(
        "Student Test Interface Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load IELTS test."
      );

    } finally {

      setLoading(false);

    }

  };


  // ======================================================
  // Timer
  // ======================================================

  useEffect(() => {

    if (
      !test ||
      loading ||
      timeExpired ||
      timeRemaining <= 0
    ) {
      return;
    }


    timerRef.current =
      setInterval(() => {

        setTimeRemaining(
          (previousTime) => {

            if (previousTime <= 1) {

              clearInterval(
                timerRef.current
              );

              setTimeExpired(true);

              return 0;
            }


            return previousTime - 1;

          }
        );

      }, 1000);


    return () => {

      clearInterval(
        timerRef.current
      );

    };

  }, [
    test,
    loading,
    timeExpired,
  ]);


  // ======================================================
  // Automatic Submission When Time Expires
  // ======================================================

  useEffect(() => {

    if (!timeExpired) {
      return;
    }

    if (!attempt?._id) {
      return;
    }

    if (submittedRef.current) {
      return;
    }

    handleSubmit(true);

  }, [
    timeExpired,
    attempt,
  ]);


  // ======================================================
  // Auto Save Answers
  // ======================================================

  useEffect(() => {

    if (!attempt?._id) {
      return;
    }

    if (
      !answers ||
      Object.keys(answers).length === 0
    ) {
      return;
    }


    // Clear previous timer

    if (saveTimerRef.current) {

      clearTimeout(
        saveTimerRef.current
      );

    }


    // Save after 1 second

    saveTimerRef.current =
      setTimeout(() => {

        saveAnswers(
          answers
        );

      }, 1000);


    return () => {

      if (saveTimerRef.current) {

        clearTimeout(
          saveTimerRef.current
        );

      }

    };

  }, [
    answers,
    attempt?._id,
  ]);


  // ======================================================
  // Save Answers
  // ======================================================

  const saveAnswers = async (
    currentAnswers
  ) => {

    if (!attempt?._id) {
      return;
    }


    try {

      await saveIELTSTestAnswers(
        id,
        attempt._id,
        currentAnswers
      );


      console.log(
        "IELTS answers saved successfully."
      );


    } catch (err) {

      console.error(
        "Auto-save IELTS Answers Error:",
        err
      );

      // Do not interrupt the student's test
      // because auto-save failed.

    }

  };


  // ======================================================
  // Handle Answer
  // ======================================================

  const handleAnswer = (
    questionId,
    answer
  ) => {

    if (
      submitting ||
      timeExpired
    ) {
      return;
    }


    setAnswers(
      (previousAnswers) => ({
        ...previousAnswers,
        [questionId]: answer,
      })
    );

  };


  // ======================================================
  // Submit Test
  // ======================================================

  const handleSubmit = async (
    automatic = false
  ) => {

    // Prevent duplicate submission

    if (
      submittedRef.current ||
      submitting
    ) {
      return;
    }


    if (!attempt?._id) {

      setSubmitError(
        "Test attempt not found."
      );

      return;
    }


    submittedRef.current = true;

    setSubmitting(true);

    setSubmitError("");


    // Stop timer

    if (timerRef.current) {

      clearInterval(
        timerRef.current
      );

    }


    try {

      const response =
        await submitIELTSTestAttempt(
          id,
          attempt._id,
          answers
        );


      if (
        !response ||
        !response.success
      ) {

        submittedRef.current = false;

        setSubmitError(
          response?.message ||
            "Unable to submit test."
        );

        setSubmitting(false);

        return;
      }


      // -----------------------------------------------
      // Navigate to Result
      // -----------------------------------------------

      navigate(
        `/student/ielts/tests/${id}/results/${attempt._id}`,
        {
          replace: true,
          state: {
            automaticSubmission:
              automatic,
          },
        }
      );


    } catch (err) {

      console.error(
        "Submit IELTS Test Error:",
        err
      );


      submittedRef.current = false;


      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit test."
      );


      setSubmitting(false);

    }

  };


  // ======================================================
  // Next Question
  // ======================================================

  const handleNext = () => {

    if (!test?.questions) {
      return;
    }


    if (
      currentQuestion <
      test.questions.length - 1
    ) {

      setCurrentQuestion(
        (previous) =>
          previous + 1
      );


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    }

  };


  // ======================================================
  // Previous Question
  // ======================================================

  const handlePrevious = () => {

    if (
      currentQuestion > 0
    ) {

      setCurrentQuestion(
        (previous) =>
          previous - 1
      );


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    }

  };


  // ======================================================
  // Question Navigation
  // ======================================================

  const goToQuestion = (
    index
  ) => {

    setCurrentQuestion(
      index
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // ======================================================
  // Format Timer
  // ======================================================

  const formatTime = (
    seconds
  ) => {

    const safeSeconds =
      Math.max(
        0,
        Number(seconds) || 0
      );


    const minutes =
      Math.floor(
        safeSeconds / 60
      );


    const remainingSeconds =
      safeSeconds % 60;


    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;

  };


  // ======================================================
  // Loading
  // ======================================================

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-100">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="font-medium text-slate-600">
            Loading your test...
          </p>

        </div>

      </div>

    );

  }


  // ======================================================
  // Error
  // ======================================================

  if (error || !test) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">

        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Unable to Start Test
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The test could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/tests"
              )
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Practice Tests
          </button>

        </div>

      </div>

    );

  }


  // ======================================================
  // No Questions
  // ======================================================

  if (
    !test.questions ||
    test.questions.length === 0
  ) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">

        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            📝
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            No Questions Available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This test does not contain any
            questions yet.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/tests"
              )
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Tests
          </button>

        </div>

      </div>

    );

  }


  // ======================================================
  // Time Expired Screen
  // ======================================================

  if (timeExpired) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">

        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="text-6xl">
            ⏰
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Time's Up!
          </h2>

          <p className="mt-3 leading-6 text-slate-500">
            The allotted time for this IELTS
            practice test has ended.
          </p>


          <div className="mt-6 rounded-xl bg-slate-50 p-4">

            <p className="text-sm text-slate-500">
              Questions Answered
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">

              {Object.keys(
                answers
              ).length}

              {" / "}

              {test.questions.length}

            </p>

          </div>


          {submitError && (

            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {submitError}
            </div>

          )}


          <button
            type="button"
            disabled
            className="mt-6 w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white disabled:opacity-70"
          >
            {submitting
              ? "Submitting Automatically..."
              : "Submitting..."}
          </button>

        </div>

      </div>

    );

  }


  // ======================================================
  // Current Question
  // ======================================================

  const question =
    test.questions[
      currentQuestion
    ];


  const selectedAnswer =
    answers[
      question._id
    ];


  const answeredCount =
    Object.keys(
      answers
    ).length;


  const totalQuestions =
    test.questions.length;


  const progress =
    totalQuestions > 0
      ? (
          (currentQuestion + 1) /
          totalQuestions
        ) * 100
      : 0;


  const isTimeLow =
    timeRemaining <= 5 * 60;


  const isLastQuestion =
    currentQuestion ===
    totalQuestions - 1;


  // ======================================================
  // Render
  // ======================================================

  return (

    <div className="min-h-screen bg-slate-100">

      {/* ==================================================
          Header
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">

          <div className="min-w-0">

            <h1 className="truncate font-bold text-slate-800">
              {test.title}
            </h1>

            <p className="text-xs text-slate-500">
              {test.section ||
                "IELTS"}{" "}
              • IELTS Practice Test
            </p>

          </div>


          {/* Timer */}

          <div
            className={`shrink-0 rounded-xl px-4 py-2 text-center ${
              isTimeLow
                ? "bg-red-50"
                : "bg-blue-50"
            }`}
          >

            <p
              className={`text-[10px] font-semibold uppercase ${
                isTimeLow
                  ? "text-red-500"
                  : "text-blue-500"
              }`}
            >
              Time Remaining
            </p>

            <p
              className={`font-bold ${
                isTimeLow
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {formatTime(
                timeRemaining
              )}
            </p>

          </div>

        </div>

      </header>


      {/* ==================================================
          Progress Bar
      ================================================== */}

      <div className="h-1 bg-slate-200">

        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>


      {/* ==================================================
          Main
      ================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">


          {/* ==================================================
              Question Area
          ================================================== */}

          <section>

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              {/* Question Header */}

              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">

                <div>

                  <p className="text-sm font-medium text-blue-600">

                    Question{" "}

                    {currentQuestion + 1}

                    {" "}of{" "}

                    {totalQuestions}

                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-800">
                    {question.questionType ||
                      "Question"}
                  </h2>

                </div>


                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">

                  {question.marks || 1}{" "}

                  {question.marks === 1
                    ? "Mark"
                    : "Marks"}

                </span>

              </div>


              {/* Passage */}

              {question.passage && (

                <div className="mt-6 rounded-xl bg-slate-50 p-5">

                  <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                    {question.passage}
                  </p>

                </div>

              )}


              {/* Question */}

              <div className="mt-7">

                <h3 className="text-lg font-semibold leading-8 text-slate-800">
                  {question.questionText}
                </h3>

              </div>


              {/* ==================================================
                  Options
              ================================================== */}

              {question.options &&
                question.options.length > 0 && (

                  <div className="mt-7 space-y-3">

                    {question.options.map(
                      (
                        option,
                        index
                      ) => {

                        const optionValue =
                          typeof option ===
                          "object"
                            ? option.text
                            : option;


                        const isSelected =
                          selectedAnswer ===
                          optionValue;


                        return (

                          <button
                            key={index}
                            type="button"
                            disabled={
                              submitting
                            }
                            onClick={() =>
                              handleAnswer(
                                question._id,
                                optionValue
                              )
                            }
                            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >

                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(
                                65 + index
                              )}
                            </span>

                            <span className="text-sm font-medium text-slate-700">
                              {optionValue}
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

                <div className="mt-7">

                  <textarea
                    value={
                      selectedAnswer || ""
                    }
                    onChange={(event) =>
                      handleAnswer(
                        question._id,
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Type your answer here..."
                    disabled={
                      submitting
                    }
                    className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

              )}


              {/* Auto Save Status */}

              <div className="mt-4 text-right">

                <span className="text-xs text-slate-400">
                  💾 Answers are saved automatically
                </span>

              </div>


              {/* Submit Error */}

              {submitError && (

                <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {submitError}
                </div>

              )}


              {/* ==================================================
                  Navigation
              ================================================== */}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">

                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    currentQuestion === 0 ||
                    submitting
                  }
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>


                {!isLastQuestion ? (

                  <button
                    type="button"
                    onClick={
                      handleNext
                    }
                    disabled={
                      submitting
                    }
                    className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next →
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      handleSubmit(
                        false
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="rounded-xl bg-green-600 px-7 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Test"}
                  </button>

                )}

              </div>

            </div>

          </section>


          {/* ==================================================
              Question Navigator
          ================================================== */}

          <aside>

            <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-sm">

              <h2 className="font-bold text-slate-800">
                Questions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {answeredCount} of{" "}
                {totalQuestions} answered
              </p>


              {/* Question Numbers */}

              <div className="mt-5 grid grid-cols-5 gap-2">

                {test.questions.map(
                  (
                    item,
                    index
                  ) => {

                    const isAnswered =
                      answers[
                        item._id
                      ] !== undefined;


                    const isCurrent =
                      currentQuestion ===
                      index;


                    return (

                      <button
                        key={item._id}
                        type="button"
                        onClick={() =>
                          goToQuestion(
                            index
                          )
                        }
                        disabled={
                          submitting
                        }
                        className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : isAnswered
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        } disabled:cursor-not-allowed`}
                      >
                        {index + 1}
                      </button>

                    );

                  }
                )}

              </div>


              {/* Legend */}

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">

                <div className="flex items-center gap-2 text-xs text-slate-500">

                  <span className="h-3 w-3 rounded bg-blue-600" />

                  Current

                </div>


                <div className="flex items-center gap-2 text-xs text-slate-500">

                  <span className="h-3 w-3 rounded bg-green-100" />

                  Answered

                </div>


                <div className="flex items-center gap-2 text-xs text-slate-500">

                  <span className="h-3 w-3 rounded bg-slate-100" />

                  Not Answered

                </div>

              </div>


              {/* Progress */}

              <div className="mt-6 rounded-xl bg-blue-50 p-4">

                <p className="text-xs text-blue-600">
                  Progress
                </p>

                <p className="mt-1 text-xl font-bold text-blue-700">

                  {Math.round(
                    (
                      answeredCount /
                      totalQuestions
                    ) * 100
                  )}

                  %

                </p>

              </div>


              {/* Remaining Time */}

              <div
                className={`mt-4 rounded-xl p-4 ${
                  isTimeLow
                    ? "bg-red-50"
                    : "bg-slate-50"
                }`}
              >

                <p className="text-xs text-slate-500">
                  Time Remaining
                </p>

                <p
                  className={`mt-1 text-lg font-bold ${
                    isTimeLow
                      ? "text-red-600"
                      : "text-slate-800"
                  }`}
                >
                  {formatTime(
                    timeRemaining
                  )}
                </p>

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>

  );
};


export default TestInterface;