import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  Mic,
  RefreshCw,
  Volume2,
  XCircle,
} from "lucide-react";

import {
  getIELTSAttemptResult,
} from "../../../../services/ieltsPracticeTestService";


const IELTSPracticeTestResult = () => {
  const navigate = useNavigate();

  const {
    id,
    testId,
    attemptId,
  } = useParams();

  const effectiveTestId = id || testId;

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ======================================================
  // LOAD RESULT
  // ======================================================

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      if (!effectiveTestId || !attemptId) {
        if (mounted) {
          setError(
            "Test ID or attempt ID is missing."
          );

          setLoading(false);
        }

        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError("");
        }

        const response =
          await getIELTSAttemptResult(
            effectiveTestId,
            attemptId
          );

        if (!mounted) {
          return;
        }

        if (response?.success) {
          setResult(
            response.data || null
          );
        } else {
          setError(
            response?.message ||
              "This test has not been evaluated yet."
          );
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load IELTS result.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [effectiveTestId, attemptId]);


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600 mx-auto mb-4" />

            <h2 className="text-lg font-bold text-slate-800">
              Loading Result
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Please wait while we retrieve your IELTS result.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  // ======================================================
  // ERROR / RESULT NOT AVAILABLE
  // ======================================================

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">

            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>

            <h1 className="text-xl font-bold text-slate-800">
              Result Unavailable
            </h1>

            <p className="text-sm text-red-600 mt-2">
              {error ||
                "This test has not been evaluated yet."}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/student/ielts/tests"
                  )
                }
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Tests
              </button>

            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }


// ======================================================
// HELPER: FORMAT AUDIO URL
// ======================================================
const formatAudioUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
};


  // ======================================================
  // NORMALIZE RESULT DATA
  // ======================================================

  const section =
    result.test?.section ||
    result.section ||
    "";

  const isSubjective =
    section === "Speaking" ||
    section === "Writing" ||
    Boolean(result.manualReviewRequired) ||
    result.status === "Submitted";

  const isEvaluated =
    result.status === "Evaluated";

  const totalMarks =
    Number(result.totalMarks) || 0;

  const evaluatedBand =
    result.overallBand ??
    result.speakingBand ??
    result.writingBand ??
    result.readingBand ??
    result.listeningBand;

  const rawScore = Number(result.score) || 0;
  const score =
    (rawScore > 0 || !isEvaluated || !evaluatedBand)
      ? rawScore
      : (totalMarks > 0 ? Math.max(1, Math.round((evaluatedBand / 9) * totalMarks)) : 0);

  const rawPercentage = Number(result.percentage) || 0;
  const percentage =
    (rawPercentage > 0 || !isEvaluated || !evaluatedBand)
      ? (rawPercentage || (totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0))
      : Math.min(100, Math.round((evaluatedBand / 9) * 100));

  const correctAnswers =
    Number(result.correctAnswers) || 0;

  const incorrectAnswers =
    Number(result.incorrectAnswers) || 0;

  const totalQuestions =
    Number(result.totalQuestions) ||
    (Array.isArray(result.test?.questions)
      ? result.test.questions.length
      : 0);

  const answersList = Array.isArray(result.answers)
    ? result.answers
    : [];

  const testQuestions = Array.isArray(result.test?.questions)
    ? result.test.questions
    : [];

  // Robust answered & unanswered calculation (supports audio responses)
  let answeredQuestions =
    Number(result.answeredQuestions) || 0;
  let unanswered =
    Number(result.unanswered) || 0;

  if (testQuestions.length > 0) {
    const calculatedAnswered = testQuestions.filter((q) => {
      const qId = String(q._id || q);
      const ans = answersList.find(
        (item) => String(item.question?._id || item.question) === qId
      );
      if (!ans) return false;
      const hasText =
        ans.answer !== undefined &&
        ans.answer !== null &&
        String(ans.answer).trim() !== "";
      const hasAudio =
        ans.audioUrl !== undefined &&
        ans.audioUrl !== null &&
        String(ans.audioUrl).trim() !== "";
      return hasText || hasAudio;
    }).length;

    if (calculatedAnswered > answeredQuestions || result.status === "Submitted") {
      answeredQuestions = calculatedAnswered;
      unanswered = Math.max(totalQuestions - answeredQuestions, 0);
    }
  } else if (answersList.length > 0 && answeredQuestions === 0) {
    const calculatedAnswered = answersList.filter(
      (item) =>
        (item.answer !== undefined &&
          item.answer !== null &&
          String(item.answer).trim() !== "") ||
        (item.audioUrl !== undefined &&
          item.audioUrl !== null &&
          String(item.audioUrl).trim() !== "")
    ).length;
    if (calculatedAnswered > 0) {
      answeredQuestions = calculatedAnswered;
      unanswered = Math.max(totalQuestions - answeredQuestions, 0);
    }
  }

  // IELTS Band logic
  const overallBand =
    result.overallBand ??
    result.readingBand ??
    result.listeningBand ??
    result.writingBand ??
    result.speakingBand ??
    result.band ??
    (!isSubjective && isEvaluated && totalMarks > 0 && score > 0
      ? Number(((score / totalMarks) * 9).toFixed(1))
      : null);

  const listeningBand =
    result.listeningBand ?? null;

  const readingBand =
    result.readingBand ?? null;

  const writingBand =
    result.writingBand ?? null;

  const speakingBand =
    result.speakingBand ?? null;


  // ======================================================
  // RESULT PAGE
  // ======================================================

  return (
    <DashboardLayout>

      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                IELTS RESULT
              </span>

              {result.status && (
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    result.status === "Evaluated"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {result.status === "Submitted"
                    ? "Submitted (Evaluation Pending)"
                    : result.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mt-2">
              IELTS Practice Test Result
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Your performance summary for this practice test.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/tests"
              )
            }
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tests
          </button>

        </div>


        {/* Overall Score / Status Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-7 text-white shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="text-sm text-blue-100 font-medium">
                Overall IELTS Band
              </p>

              {isSubjective && !isEvaluated && overallBand === null ? (
                <div className="flex items-center gap-3 mt-2">
                  <Clock className="w-8 h-8 text-amber-300 animate-pulse" />
                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-amber-200">
                      Under Review
                    </span>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Examiner evaluation in progress
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-2">
                  <Award className="w-8 h-8" />
                  <span className="text-5xl font-black">
                    {overallBand !== null
                      ? overallBand
                      : "—"}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">

              {isSubjective && !isEvaluated ? (
                <>
                  <div className="bg-white/10 rounded-xl px-5 py-4">
                    <p className="text-xs text-blue-100">
                      Questions Answered
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {answeredQuestions} / {totalQuestions}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-xl px-5 py-4">
                    <p className="text-xs text-blue-100">
                      Review Status
                    </p>
                    <p className="text-xl font-bold mt-1 text-amber-200">
                      Pending
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/10 rounded-xl px-5 py-4">
                    <p className="text-xs text-blue-100">
                      Score
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {score} / {totalMarks}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-xl px-5 py-4">
                    <p className="text-xs text-blue-100">
                      Percentage
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>


        {/* Evaluation Pending Notice for Subjective Tests */}
        {isSubjective && !isEvaluated && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              {section === "Speaking" ? (
                <Mic className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {section === "Speaking"
                  ? "Speaking Test Successfully Submitted"
                  : section === "Writing"
                  ? "Writing Test Successfully Submitted"
                  : "Test Successfully Submitted"}
              </h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                {section === "Speaking"
                  ? "Your recorded audio response has been saved and is currently under evaluation by our IELTS examiners. Your fluency, pronunciation, grammar, and lexical resource will be assessed. Your official band score and detailed feedback will appear here once reviewed."
                  : "Your response has been received and is queued for examiner assessment. Your official band score and comprehensive feedback will appear here once evaluated."}
              </p>
            </div>
          </div>
        )}


        {/* Performance Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          {isSubjective && !isEvaluated ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Total Questions
                    </p>
                    <p className="text-2xl font-black text-slate-800">
                      {totalQuestions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Answered
                    </p>
                    <p className="text-2xl font-black text-green-600">
                      {answeredQuestions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Unanswered
                    </p>
                    <p className="text-2xl font-black text-slate-700">
                      {unanswered}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Correct
                    </p>
                    <p className="text-2xl font-black text-green-600">
                      {correctAnswers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Incorrect
                    </p>
                    <p className="text-2xl font-black text-red-600">
                      {incorrectAnswers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Unanswered
                    </p>
                    <p className="text-2xl font-black text-slate-700">
                      {unanswered}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>


        {/* IELTS Bands */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <h2 className="text-base font-bold text-slate-800 mb-5">
            Section Performance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <BandCard
              title="Listening"
              band={listeningBand}
              isPending={!isEvaluated && section === "Listening"}
            />

            <BandCard
              title="Reading"
              band={readingBand}
              isPending={!isEvaluated && section === "Reading"}
            />

            <BandCard
              title="Writing"
              band={writingBand}
              isPending={!isEvaluated && section === "Writing"}
            />

            <BandCard
              title="Speaking"
              band={speakingBand}
              isPending={!isEvaluated && section === "Speaking"}
            />

          </div>
        </div>


        {/* Feedback */}
        {(result.writingFeedback ||
          result.speakingFeedback) && (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {result.writingFeedback && (
              <FeedbackCard
                title="Writing Feedback"
                feedback={
                  result.writingFeedback
                }
              />
            )}

            {result.speakingFeedback && (
              <FeedbackCard
                title="Speaking Feedback"
                feedback={
                  result.speakingFeedback
                }
              />
            )}

          </div>
        )}


        {/* Student's Submitted Responses Preview */}
        {testQuestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span>Your Submitted Response{testQuestions.length > 1 ? "s" : ""}</span>
            </h2>

            <div className="space-y-4">
              {testQuestions.map((q, idx) => {
                const qId = String(q._id || q);
                const ans = answersList.find(
                  (item) => String(item.question?._id || item.question) === qId
                );
                const hasAudio = Boolean(ans?.audioUrl);
                const hasText = Boolean(ans?.answer && String(ans.answer).trim() !== "");

                return (
                  <div
                    key={qId || idx}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                          Question {idx + 1}
                        </span>
                        {q.questionType && (
                          <span className="text-xs font-semibold text-slate-500">
                            {q.questionType}
                          </span>
                        )}
                      </div>

                      {hasAudio ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Audio Recorded
                        </span>
                      ) : hasText ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Not Answered
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {q.questionText || q.question || "Speaking Question"}
                    </p>

                    {/* Audio Player if recording exists */}
                    {hasAudio && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-blue-600" />
                          Your Audio Recording:
                        </p>
                        <audio
                          controls
                          src={formatAudioUrl(ans.audioUrl)}
                          className="w-full h-10 rounded-lg outline-none"
                        />
                      </div>
                    )}

                    {/* Notes / Text if present */}
                    {hasText && (
                      <div className="mt-2 p-3 rounded-lg bg-white border border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 mb-1">
                          {hasAudio ? "Transcript / Notes:" : "Your Answer:"}
                        </p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {ans.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </DashboardLayout>
  );
};


// ======================================================
// BAND CARD
// ======================================================

const BandCard = ({
  title,
  band,
  isPending = false,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </p>

      {isPending && (band === null || band === undefined) ? (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-sm font-bold">
            Pending
          </span>
        </div>
      ) : (
        <p className="text-3xl font-black text-blue-600 mt-2">
          {band !== null &&
          band !== undefined
            ? band
            : "—"}
        </p>
      )}

      <p className="text-xs text-slate-500 mt-1">
        IELTS Band
      </p>

    </div>
  );
};


// ======================================================
// FEEDBACK CARD
// ======================================================

const FeedbackCard = ({
  title,
  feedback,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-base font-bold text-slate-800">
        {title}
      </h2>

      <p className="text-sm text-slate-600 leading-6 mt-3 whitespace-pre-wrap">
        {feedback}
      </p>

    </div>
  );
};


export default IELTSPracticeTestResult;