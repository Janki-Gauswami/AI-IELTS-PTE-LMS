import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Mic,
  Volume2,
  FileText,
  HelpCircle,
} from "lucide-react";
import { getPTEPracticeTestById } from "../../../services/ptePracticeTestService";
import {
  savePTEAnswers,
  submitPTEAttempt,
  getPTEAttemptById,
} from "../../../services/pteTestAttemptService";

const PTETestInterface = () => {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Recording simulation state for speaking
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const recordTimerRef = useRef(null);
  const isSubmittedRef = useRef(false);

  useEffect(() => {
    const initializeTest = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Fetch test details
        const testRes = await getPTEPracticeTestById(id);
        if (!testRes?.success || !testRes?.data) {
          throw new Error(testRes?.message || "Failed to load test");
        }

        const testData = testRes.data;
        setTest(testData);
        const qList = testData.questions || [];
        setQuestions(qList);

        // 2. Fetch existing attempt data if available
        let savedAnswersMap = {};
        if (attemptId) {
          try {
            const attemptRes = await getPTEAttemptById(attemptId);
            if (attemptRes?.success && attemptRes?.data?.answers) {
              attemptRes.data.answers.forEach((ans) => {
                const qId = ans.question?._id || ans.question;
                if (qId) savedAnswersMap[qId] = ans.answer || "";
              });
            }
          } catch (e) {
            console.warn("Could not retrieve previous answers", e);
          }
        }
        setAnswers(savedAnswersMap);

        // 3. Set timer
        const durationMins = testData.duration || 30;
        setTimeLeft(durationMins * 60);
      } catch (err) {
        setError(err.message || "Failed to initialize PTE test.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initializeTest();
    }
  }, [id, attemptId]);

  // Countdown timer
  useEffect(() => {
    if (loading || timeLeft <= 0 || isSubmittedRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, timeLeft]);

  // Handle speaking recorder
  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(recordTimerRef.current);
      setIsRecording(false);
      const currentQ = questions[currentIdx];
      if (currentQ) {
        handleAnswerChange(currentQ._id, `[Recorded Audio response - ${recordTime}s]`);
      }
    } else {
      setRecordTime(0);
      setIsRecording(true);
      recordTimerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    }
  };

  const handleAnswerChange = async (questionId, value) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);

    // Auto-save
    if (attemptId) {
      try {
        setSaving(true);
        await savePTEAnswers(attemptId, {
          questionId,
          answer: value,
        });
      } catch (err) {
        console.error("Failed to auto-save answer:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    try {
      setSubmitting(true);
      await submitPTEAttempt(attemptId);
      navigate(`/student/pte/tests/${id}/results/${attemptId}`);
    } catch (err) {
      setError(err.message || "Failed to auto-submit test.");
      setSubmitting(false);
    }
  };

  const handleSubmitTest = async () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    try {
      setSubmitting(true);
      setShowSubmitModal(false);
      await submitPTEAttempt(attemptId);
      navigate(`/student/pte/tests/${id}/results/${attemptId}`);
    } catch (err) {
      isSubmittedRef.current = false;
      setError(err.message || "Failed to submit test.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-400 font-medium">Preparing your PTE test environment...</p>
        </div>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-red-100">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Test</h2>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/student/pte/tests")}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition"
          >
            Back to PTE Tests
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).filter((k) => (answers[k] || "").trim() !== "").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                PTE Academic
              </span>
              <h1 className="text-lg font-bold text-white truncate max-w-md">
                {test?.title || "PTE Practice Test"}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Section: {test?.section || "Practice"} • Question {currentIdx + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Auto save indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>Saved</span>
                </>
              )}
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-base font-bold transition-all ${
                timeLeft < 300
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                  : "bg-slate-800 text-white border border-slate-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Test</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Main: Active Question */}
        <div className="lg:col-span-3 space-y-6">
          {currentQ ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">
                    {currentIdx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                      {currentQ.section} Section
                    </span>
                    <h2 className="text-sm font-bold text-slate-800">
                      {currentQ.questionType || "Task Item"}
                    </h2>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  {currentQ.marks || 1} {currentQ.marks === 1 ? "Mark" : "Marks"}
                </span>
              </div>

              {/* Task Instructions / Prompt */}
              <div className="mt-6">
                <p className="text-base font-semibold text-slate-900 leading-relaxed">
                  {currentQ.questionText}
                </p>
              </div>

              {/* Passage / Context Box (if any) */}
              {currentQ.passage && (
                <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {currentQ.passage}
                </div>
              )}

              {/* Interaction Component by Section & Question Type */}
              <div className="mt-6">
                {/* 1. Speaking Tasks (Audio Recording) */}
                {currentQ.section === "Speaking" && (
                  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold text-sm">
                      <Mic className="w-5 h-5" />
                      <span>Audio Response Recording</span>
                    </div>

                    <div className="py-2">
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`px-6 py-3 rounded-xl font-bold text-white transition flex items-center gap-2 mx-auto shadow-md ${
                          isRecording
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        <Mic className="w-5 h-5" />
                        {isRecording ? `Stop Recording (${recordTime}s)` : "Start Recording"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500">
                      Speak clearly into your microphone. When done, click Stop Recording.
                    </p>

                    {answers[currentQ._id] && (
                      <div className="text-xs text-green-700 bg-green-50 py-2 px-4 rounded-lg border border-green-200 inline-block font-medium">
                        Recorded: {answers[currentQ._id]}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Multiple Choice Single / Multiple */}
                {(currentQ.questionType?.includes("Multiple Choice") || (currentQ.options && currentQ.options.length > 0 && currentQ.section !== "Writing")) && (
                  <div className="space-y-3">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = (answers[currentQ._id] || "") === opt.text || (answers[currentQ._id] || "") === opt.label;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleAnswerChange(currentQ._id, opt.text || opt.label)}
                          className={`w-full p-4 rounded-xl text-left border transition flex items-center gap-4 ${
                            isSelected
                              ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {opt.label || String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="text-sm font-medium leading-normal flex-1">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Text / Essay / Short Answer / Dictation Input */}
                {(!currentQ.options || currentQ.options.length === 0 || currentQ.section === "Writing") && currentQ.section !== "Speaking" && (
                  <div className="space-y-2">
                    {currentQ.questionType === "Write Essay" || currentQ.questionType === "Summarize Written Text" ? (
                      <div>
                        <textarea
                          rows={10}
                          value={answers[currentQ._id] || ""}
                          onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                          placeholder="Type your response here..."
                          className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>
                            Word count: {(answers[currentQ._id] || "").trim() ? (answers[currentQ._id] || "").trim().split(/\s+/).length : 0} words
                          </span>
                          <span>Suggested: {currentQ.questionType === "Write Essay" ? "200-300 words" : "5-75 words"}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Your Answer:
                        </label>
                        <input
                          type="text"
                          value={answers[currentQ._id] || ""}
                          onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                          placeholder="Enter your answer..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs text-slate-400">
                  Question {currentIdx + 1} of {questions.length}
                </div>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition flex items-center gap-2 shadow-sm"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition flex items-center gap-2 shadow-sm"
                  >
                    <span>Complete & Review</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
              No questions found in this test.
            </div>
          )}
        </div>

        {/* Right Sidebar: Question Palette & Progress */}
        <div className="space-y-6">
          {/* Question Palette */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs text-slate-500 font-normal">
                {answeredCount}/{questions.length} Answered
              </span>
            </h3>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = (answers[q._id] || "").trim() !== "";
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl font-bold text-xs transition flex items-center justify-center ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                        : isAnswered
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-600" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-green-100 border border-green-300" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-100" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>

          {/* Tips / Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 text-blue-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              PTE Test Guidelines
            </h4>
            <ul className="text-xs space-y-1.5 text-blue-800/80 list-disc list-inside">
              <li>Answers are automatically synchronized.</li>
              <li>You can navigate questions at any time.</li>
              <li>Timer will auto-submit when remaining time is 0.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Submit PTE Practice Test?</h3>
              <p className="text-sm text-slate-500 mt-1">
                You have answered <span className="font-bold text-slate-800">{answeredCount}</span> of{" "}
                <span className="font-bold text-slate-800">{questions.length}</span> questions.
              </p>
            </div>

            {answeredCount < questions.length && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>You have {questions.length - answeredCount} unanswered questions remaining.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitTest}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Confirm Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTETestInterface;
