import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  getIELTSAttemptResult,
} from "../../../../services/ieltsPracticeTestService";


const IELTSPracticeTestResult = () => {
  const navigate = useNavigate();

  const {
    testId,
    attemptId,
  } = useParams();

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ======================================================
  // LOAD RESULT
  // ======================================================

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      if (!testId || !attemptId) {
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
            testId,
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
  }, [testId, attemptId]);


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
  // NORMALIZE RESULT DATA
  // ======================================================

  const totalMarks =
    Number(result.totalMarks) || 0;

  const score =
    Number(result.score) || 0;

  const percentage =
    Number(result.percentage) ||
    (
      totalMarks > 0
        ? (score / totalMarks) * 100
        : 0
    );

  const correctAnswers =
    Number(result.correctAnswers) || 0;

  const incorrectAnswers =
    Number(result.incorrectAnswers) || 0;

  const unanswered =
    Number(result.unanswered) || 0;

  const overallBand =
    result.overallBand ??
    result.band ??
    null;

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
                <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold">
                  {result.status}
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


        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-7 text-white shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="text-sm text-blue-100 font-medium">
                Overall IELTS Band
              </p>

              <div className="flex items-center gap-3 mt-2">
                <Award className="w-8 h-8" />

                <span className="text-5xl font-black">
                  {overallBand !== null
                    ? overallBand
                    : "—"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">

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

            </div>

          </div>
        </div>


        {/* Objective Performance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

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
            />

            <BandCard
              title="Reading"
              band={readingBand}
            />

            <BandCard
              title="Writing"
              band={writingBand}
            />

            <BandCard
              title="Speaking"
              band={speakingBand}
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
}) => {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </p>

      <p className="text-3xl font-black text-blue-600 mt-2">
        {band !== null &&
        band !== undefined
          ? band
          : "—"}
      </p>

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