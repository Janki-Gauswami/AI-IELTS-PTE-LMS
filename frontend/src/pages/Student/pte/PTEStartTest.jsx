import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  FileText,
  Play,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getPTEPracticeTestById,
} from "../../../services/ptePracticeTestService";

import {
  startPTEAttempt,
} from "../../../services/pteTestAttemptService";

const PTEStartTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // Load PTE Practice Test
  // ======================================================

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getPTEPracticeTestById(id);

        if (response?.success) {
          setTest(response.data);
        } else {
          setError(
            response?.message ||
              "Unable to load PTE practice test."
          );
        }
      } catch (error) {
        setError(
          error?.message ||
            "Unable to load PTE practice test."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTest();
    }
  }, [id]);

  // ======================================================
  // Start PTE Attempt
  // ======================================================

  const handleStartTest = async () => {
    try {
      setStarting(true);
      setError("");

      const response =
        await startPTEAttempt(id);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to start PTE test."
        );
      }

      // --------------------------------------------------
      // Support different backend response structures
      // --------------------------------------------------

      const attempt =
        response?.data?.attempt ||
        response?.data;

      const attemptId =
        attempt?._id ||
        attempt?.id;

      if (!attemptId) {
        throw new Error(
          "Attempt was created but attempt ID was not returned."
        );
      }

      // --------------------------------------------------
      // Go to actual PTE test interface
      // --------------------------------------------------

      navigate(
        `/student/pte/tests/${id}/attempt/${attemptId}`
      );

    } catch (error) {
      setError(
        error?.message ||
          "Unable to start PTE test."
      );
    } finally {
      setStarting(false);
    }
  };

  // ======================================================
  // Loading Screen
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="flex items-center gap-3 text-slate-600">

          <Loader2
            className="h-6 w-6 animate-spin"
          />

          <span>
            Loading PTE test...
          </span>

        </div>

      </div>
    );
  }

  // ======================================================
  // Error Screen
  // ======================================================

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">

        <div className="max-w-3xl mx-auto">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-3">

              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />

              <div>

                <h2 className="font-semibold text-red-800">
                  Unable to load test
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error ||
                    "PTE practice test was not found."}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ======================================================
  // Test Information
  // ======================================================

  const title =
    test.title ||
    test.name ||
    "PTE Practice Test";

  const description =
    test.description ||
    "Complete this PTE practice test to evaluate your preparation.";

  const duration =
    test.duration ||
    test.durationMinutes ||
    60;

  const questionCount =
    test.questions?.length ||
    test.questionCount ||
    0;

  const testType =
    test.testType ||
    test.type ||
    "Practice";

  // ======================================================
  // Main UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">

      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            Back Button
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >

          <ArrowLeft className="h-4 w-4" />

          Back to PTE Tests

        </button>


        {/* ==================================================
            Main Card
        ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* ==================================================
              Header
          ================================================== */}

          <div className="bg-slate-900 px-8 py-8 text-white">

            <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">

              PTE Practice Test

            </div>

            <h1 className="text-3xl font-bold">
              {title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              {description}
            </p>

          </div>


          {/* ==================================================
              Content
          ================================================== */}

          <div className="p-8">

            {/* ==================================================
                Test Information
            ================================================== */}

            <div className="grid gap-4 md:grid-cols-3">

              {/* Duration */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">

                  <Clock className="h-5 w-5 text-slate-700" />

                </div>

                <p className="text-sm text-slate-500">
                  Duration
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {duration} minutes
                </p>

              </div>


              {/* Questions */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">

                  <FileText className="h-5 w-5 text-slate-700" />

                </div>

                <p className="text-sm text-slate-500">
                  Questions
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {questionCount}
                </p>

              </div>


              {/* Test Type */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">

                  <Play className="h-5 w-5 text-slate-700" />

                </div>

                <p className="text-sm text-slate-500">
                  Test Type
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {testType}
                </p>

              </div>

            </div>


            {/* ==================================================
                Instructions
            ================================================== */}

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">

              <div className="flex items-start gap-3">

                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>

                  <h2 className="font-bold text-amber-900">
                    Before you start
                  </h2>

                  <ul className="mt-3 space-y-2 text-sm text-amber-800">

                    <li>
                      • Make sure you have a stable internet connection.
                    </li>

                    <li>
                      • Do not refresh or close the test window while attempting the test.
                    </li>

                    <li>
                      • Your answers will be saved while you progress.
                    </li>

                    <li>
                      • Once submitted, the attempt cannot be continued.
                    </li>

                  </ul>

                </div>

              </div>

            </div>


            {/* ==================================================
                Error Message
            ================================================== */}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                {error}

              </div>
            )}


            {/* ==================================================
                Start Button
            ================================================== */}

            <div className="mt-8 flex justify-end">

              <button
                type="button"
                onClick={handleStartTest}
                disabled={starting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {starting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />

                    Starting Test...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />

                    Start Test
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PTEStartTest;