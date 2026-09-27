import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Send,
  ShieldAlert,
} from "lucide-react";

import {
  getMockTestById,
  submitMockTestAttempt,
} from "../../services/mockTestService";

const StudentMockTestAttempt = () => {
  const { testId, attemptId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const [showSubmitConfirm, setShowSubmitConfirm] =
    useState(false);

  // ============================================================
  // LOAD TEST
  // ============================================================

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");

        if (!testId || !attemptId) {
          throw new Error(
            "Mock test or attempt information is missing."
          );
        }

        const res = await getMockTestById(testId);

        if (!res?.success) {
          throw new Error(
            res?.message || "Failed to load mock test."
          );
        }

        const mockTest = res?.data;

        if (!mockTest) {
          throw new Error("Mock test data was not found.");
        }

        setTest(mockTest);

        const durationMinutes =
          Number(mockTest.duration) || 60;

        setRemainingSeconds(durationMinutes * 60);
      } catch (err) {
        console.error("Load Mock Test Error:", err);

        setError(
          err?.message ||
            "Failed to load the mock examination."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId, attemptId]);

  // ============================================================
  // NORMALIZE SECTIONS
  // ============================================================

  const sections = useMemo(() => {
    if (!test) return [];

    /*
     * Preferred structure:
     *
     * test.sections = [
     *   {
     *      name: "Listening",
     *      questions: [...]
     *   }
     * ]
     */

    if (
      Array.isArray(test.sections) &&
      test.sections.length > 0
    ) {
      return test.sections;
    }

    /*
     * Fallback:
     *
     * test.questions = [...]
     *
     * Group them by section.
     */

    if (
      Array.isArray(test.questions) &&
      test.questions.length > 0
    ) {
      const grouped = {};

      test.questions.forEach((question) => {
        const sectionName =
          question.section || "General";

        if (!grouped[sectionName]) {
          grouped[sectionName] = [];
        }

        grouped[sectionName].push(question);
      });

      return Object.keys(grouped).map((name, index) => ({
        _id: `section-${index}`,
        name,
        questions: grouped[name],
      }));
    }

    return [];
  }, [test]);

  // ============================================================
  // CURRENT SECTION
  // ============================================================

  const currentSection =
    sections[currentSectionIndex] || null;

  const questions = Array.isArray(
    currentSection?.questions
  )
    ? currentSection.questions
    : [];

  const currentQuestion =
    questions[currentQuestionIndex] || null;

  // ============================================================
  // TIMER
  // ============================================================

  useEffect(() => {
    if (loading || !test || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, test, remainingSeconds]);

  // ============================================================
  // AUTO SUBMIT WHEN TIMER ENDS
  // ============================================================

  useEffect(() => {
    if (
      !loading &&
      test &&
      remainingSeconds === 0 &&
      !submitting
    ) {
      handleSubmit(true);
    }
  }, [remainingSeconds]);

  // ============================================================
  // FORMAT TIMER
  // ============================================================

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);

    const hours = Math.floor(safeSeconds / 3600);

    const minutes = Math.floor(
      (safeSeconds % 3600) / 60
    );

    const secs = safeSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  // ============================================================
  // SAVE ANSWER
  // ============================================================

  const handleAnswerChange = (questionId, value) => {
    if (!questionId) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  };

  // ============================================================
  // TOTAL QUESTIONS
  // ============================================================

  const totalQuestions = useMemo(() => {
    return sections.reduce(
      (total, section) =>
        total +
        (Array.isArray(section.questions)
          ? section.questions.length
          : 0),
      0
    );
  }, [sections]);

  // ============================================================
  // ANSWERED QUESTIONS
  // ============================================================

  const answeredQuestions = useMemo(() => {
    return Object.values(answers).filter((answer) => {
      if (answer === null || answer === undefined) {
        return false;
      }

      if (typeof answer === "string") {
        return answer.trim().length > 0;
      }

      if (Array.isArray(answer)) {
        return answer.length > 0;
      }

      return true;
    }).length;
  }, [answers]);

  // ============================================================
  // NEXT QUESTION
  // ============================================================

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(
        (previous) => previous + 1
      );

      return;
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(
        (previous) => previous + 1
      );

      setCurrentQuestionIndex(0);
    }
  };

  // ============================================================
  // PREVIOUS QUESTION
  // ============================================================

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(
        (previous) => previous - 1
      );

      return;
    }

    if (currentSectionIndex > 0) {
      const previousSectionIndex =
        currentSectionIndex - 1;

      const previousSection =
        sections[previousSectionIndex];

      const previousQuestions =
        Array.isArray(previousSection?.questions)
          ? previousSection.questions
          : [];

      setCurrentSectionIndex(previousSectionIndex);

      setCurrentQuestionIndex(
        Math.max(previousQuestions.length - 1, 0)
      );
    }
  };

  // ============================================================
  // GO TO QUESTION
  // ============================================================

  const goToQuestion = (sectionIndex, questionIndex) => {
    setCurrentSectionIndex(sectionIndex);

    setCurrentQuestionIndex(questionIndex);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (automatic = false) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      /*
       * Convert:
       *
       * {
       *   questionId: answer
       * }
       *
       * into:
       *
       * [
       *   {
       *      questionId,
       *      answer
       *   }
       * ]
       */

      const formattedAnswers = Object.entries(
        answers
      ).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const payload = {
        answers: formattedAnswers,
        autoSubmitted: automatic,
      };

      const res = await submitMockTestAttempt(
        attemptId,
        payload
      );

      if (!res?.success) {
        throw new Error(
          res?.message ||
            "Failed to submit mock test."
        );
      }

      /*
       * Navigate to result page.
       *
       * We keep the attempt ID in the URL because the
       * result page can use it later.
       */

      navigate(
        `/student/mock-tests/result/${attemptId}`,
        {
          replace: true,
          state: {
            testId,
            attemptId,
            result: res?.data || null,
          },
        }
      );
    } catch (err) {
      console.error(
        "Submit Mock Test Error:",
        err
      );

      setSubmitting(false);

      alert(
        err?.message ||
          "Failed to submit mock test. Please try again."
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />

            <p className="text-sm font-semibold text-slate-700">
              Loading Mock Examination...
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Preparing your examination environment.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !test) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-10 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />

            <h2 className="text-lg font-bold text-slate-800">
              Unable to Load Mock Test
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {error ||
                "Mock test information is unavailable."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/student/mock-tests")
              }
              className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
            >
              Back to Mock Tests
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // NO QUESTIONS
  // ============================================================

  if (sections.length === 0 || totalQuestions === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">

          <button
            type="button"
            onClick={() =>
              navigate("/student/mock-tests")
            }
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />

            Back to Mock Tests
          </button>

          <div className="bg-white rounded-2xl border border-amber-200 p-12 text-center">
            <FileText className="w-10 h-10 text-amber-500 mx-auto mb-4" />

            <h2 className="text-lg font-bold text-slate-800">
              This Mock Test Has No Questions
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              The administrator or teacher has not added
              questions to this examination yet.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // QUESTION TYPE
  // ============================================================

  const renderQuestionInput = () => {
    if (!currentQuestion) {
      return null;
    }

    const questionId =
      currentQuestion._id;

    const questionType =
      currentQuestion.questionType ||
      "Multiple Choice";

    const currentAnswer =
      answers[questionId] ?? "";

    // ----------------------------------------------------------
    // WRITING
    // ----------------------------------------------------------

    if (
      questionType === "Writing" ||
      questionType === "Essay"
    ) {
      return (
        <div className="space-y-3">
          <textarea
            value={currentAnswer}
            onChange={(event) =>
              handleAnswerChange(
                questionId,
                event.target.value
              )
            }
            rows={12}
            placeholder="Write your answer here..."
            className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />

          {currentQuestion.wordLimit && (
            <p className="text-xs text-slate-400">
              Recommended word limit:{" "}
              {currentQuestion.wordLimit} words
            </p>
          )}
        </div>
      );
    }

    // ----------------------------------------------------------
    // SPEAKING
    // ----------------------------------------------------------

    if (
      questionType === "Speaking" ||
      questionType === "Speaking Prompt"
    ) {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700 leading-relaxed">
              Speaking response recording will be handled
              by the speaking recorder component. For now,
              enter or record the response using the available
              answer field.
            </p>
          </div>

          <textarea
            value={currentAnswer}
            onChange={(event) =>
              handleAnswerChange(
                questionId,
                event.target.value
              )
            }
            rows={8}
            placeholder="Enter your speaking response..."
            className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      );
    }

    // ----------------------------------------------------------
    // OPTIONS
    // ----------------------------------------------------------

    if (
      Array.isArray(currentQuestion.options) &&
      currentQuestion.options.length > 0
    ) {
      return (
        <div className="space-y-3">
          {currentQuestion.options.map(
            (option, index) => {
              const value =
                typeof option === "string"
                  ? option
                  : option?.label ||
                    option?.text ||
                    "";

              const displayText =
                typeof option === "string"
                  ? option
                  : option?.text ||
                    option?.label ||
                    "";

              const selected =
                currentAnswer === value;

              return (
                <button
                  key={`${questionId}-option-${index}`}
                  type="button"
                  onClick={() =>
                    handleAnswerChange(
                      questionId,
                      value
                    )
                  }
                  className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 ${
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 text-slate-500"
                    }`}
                  >
                    {typeof option === "object" &&
                    option?.label
                      ? option.label
                      : String.fromCharCode(
                          65 + index
                        )}
                  </span>

                  <span className="text-sm text-slate-700">
                    {displayText}
                  </span>
                </button>
              );
            }
          )}
        </div>
      );
    }

    // ----------------------------------------------------------
    // DEFAULT TEXT ANSWER
    // ----------------------------------------------------------

    return (
      <input
        type="text"
        value={currentAnswer}
        onChange={(event) =>
          handleAnswerChange(
            questionId,
            event.target.value
          )
        }
        placeholder="Enter your answer..."
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  // ============================================================
  // MAIN EXAM UI
  // ============================================================

  return (
    <DashboardLayout>
      <div className="space-y-4">

        {/* ======================================================
            EXAM HEADER
        ====================================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sticky top-0 z-20">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div className="min-w-0">

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold">
                  {test.course}
                </span>

                <span className="text-xs text-slate-400">
                  {test.mockType || "Full Mock"}
                </span>
              </div>

              <h1 className="text-lg font-bold text-slate-800 mt-1 truncate">
                {test.title}
              </h1>
            </div>

            {/* TIMER */}

            <div
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
                remainingSeconds <= 300
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <Clock className="w-5 h-5" />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide">
                  Time Remaining
                </p>

                <p className="text-lg font-bold font-mono">
                  {formatTime(remainingSeconds)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            EXAM CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">

          {/* ====================================================
              SIDEBAR
          ==================================================== */}

          <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 h-fit lg:sticky lg:top-28">

            <div className="mb-4">

              <p className="text-xs font-bold text-slate-800">
                Examination Progress
              </p>

              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${
                      totalQuestions > 0
                        ? (answeredQuestions /
                            totalQuestions) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-2">
                {answeredQuestions} of{" "}
                {totalQuestions} answered
              </p>
            </div>

            <div className="space-y-4">

              {sections.map(
                (section, sectionIndex) => (
                  <div key={section._id || sectionIndex}>

                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                      {section.name ||
                        `Section ${
                          sectionIndex + 1
                        }`}
                    </p>

                    <div className="grid grid-cols-5 gap-1.5">

                      {(
                        Array.isArray(
                          section.questions
                        )
                          ? section.questions
                          : []
                      ).map(
                        (question, questionIndex) => {
                          const answered =
                            Object.prototype.hasOwnProperty.call(
                              answers,
                              question._id
                            ) &&
                            answers[
                              question._id
                            ] !== "";

                          const active =
                            sectionIndex ===
                              currentSectionIndex &&
                            questionIndex ===
                              currentQuestionIndex;

                          return (
                            <button
                              key={
                                question._id ||
                                `${sectionIndex}-${questionIndex}`
                              }
                              type="button"
                              onClick={() =>
                                goToQuestion(
                                  sectionIndex,
                                  questionIndex
                                )
                              }
                              className={`h-8 rounded-lg text-[10px] font-bold border transition ${
                                active
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : answered
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                              }`}
                            >
                              {questionIndex + 1}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </aside>

          {/* ====================================================
              QUESTION AREA
          ==================================================== */}

          <main className="bg-white border border-slate-200 rounded-2xl shadow-sm">

            {/* QUESTION HEADER */}

            <div className="p-6 border-b border-slate-100">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                <div>
                  <p className="text-xs font-semibold text-blue-600">
                    {currentSection?.name ||
                      "Section"}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Question{" "}
                    {currentQuestionIndex + 1} of{" "}
                    {questions.length}
                  </p>
                </div>

                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                  {currentQuestion?.questionType ||
                    "Question"}
                </span>
              </div>
            </div>

            {/* QUESTION */}

            <div className="p-6">

              {currentQuestion?.passage && (
                <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-bold text-slate-600 mb-2">
                    Passage
                  </p>

                  <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                    {currentQuestion.passage}
                  </p>
                </div>
              )}

              <h2 className="text-lg font-semibold text-slate-800 leading-relaxed">
                {currentQuestion?.question ||
                  currentQuestion?.questionText ||
                  "Question"}
              </h2>

              <div className="mt-6">
                {renderQuestionInput()}
              </div>
            </div>

            {/* NAVIGATION */}

            <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">

              <button
                type="button"
                disabled={
                  currentSectionIndex === 0 &&
                  currentQuestionIndex === 0
                }
                onClick={handlePrevious}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />

                Previous
              </button>

              {currentSectionIndex ===
                sections.length - 1 &&
              currentQuestionIndex ===
                questions.length - 1 ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setShowSubmitConfirm(true)
                  }
                  className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />

                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />

                      Submit Examination
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  Next

                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </main>
        </div>

        {/* ======================================================
            SUBMIT CONFIRMATION
        ====================================================== */}

        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">

              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Submit Mock Examination?
              </h2>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                You have answered{" "}
                <strong>
                  {answeredQuestions}
                </strong>{" "}
                out of{" "}
                <strong>
                  {totalQuestions}
                </strong>{" "}
                questions.
              </p>

              {answeredQuestions <
                totalQuestions && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">
                    Some questions are unanswered. You can
                    still submit the examination.
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowSubmitConfirm(false)
                  }
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Continue Exam
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleSubmit(false);
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}

                  Submit
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentMockTestAttempt;