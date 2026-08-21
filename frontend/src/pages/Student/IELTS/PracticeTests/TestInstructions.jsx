import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPracticeTestById,
} from "../../../../services/ieltsPracticeTestService";

const TestInstructions = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ======================================================
  // State
  // ======================================================

  const [test, setTest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [accepted, setAccepted] = useState(false);

  const [starting, setStarting] = useState(false);

  // ======================================================
  // Load Practice Test
  // ======================================================

  useEffect(() => {
    if (!id) {
      setError("Practice test ID is missing.");
      setLoading(false);
      return;
    }

    loadPracticeTest();
  }, [id]);

  // ======================================================
  // Fetch Test
  // ======================================================

  const loadPracticeTest = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPracticeTestById(id);

      if (
        !response ||
        !response.success ||
        !response.data
      ) {
        setError(
          response?.message ||
            "Practice test not found."
        );

        return;
      }

      const practiceTest =
        response.data;

      // ==================================================
      // Student can access Published tests only
      // ==================================================

      if (
        practiceTest.status !==
        "Published"
      ) {
        setError(
          "This practice test is not currently available."
        );

        return;
      }

      setTest(practiceTest);

    } catch (err) {
      console.error(
        "Load IELTS Test Instructions Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load practice test."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Start Test
  // ======================================================

  const handleStartTest = () => {
    if (!accepted || starting) {
      return;
    }

    setStarting(true);

    navigate(
      `/student/ielts/tests/${id}/start`
    );
  };

  // ======================================================
  // Back to Practice Tests
  // ======================================================

  const handleBack = () => {
    navigate(
      "/student/ielts/tests"
    );
  };

  // ======================================================
  // Section Icon
  // ======================================================

  const getSectionIcon = () => {
    switch (test?.section) {
      case "Listening":
        return "🎧";

      case "Reading":
        return "📖";

      case "Writing":
        return "✍️";

      case "Speaking":
        return "🎤";

      default:
        return "📝";
    }
  };

  // ======================================================
  // Section Description
  // ======================================================

  const getSectionDescription = () => {
    switch (test?.section) {
      case "Listening":
        return "Listen carefully to the audio and answer the questions.";

      case "Reading":
        return "Read the passages carefully and answer the questions.";

      case "Writing":
        return "Complete the writing tasks according to the given instructions.";

      case "Speaking":
        return "Complete the speaking tasks and submit your responses.";

      default:
        return "Complete the IELTS practice test within the given time.";
    }
  };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="font-medium text-slate-600">
            Loading test instructions...
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

  if (error || !test) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-red-700">
            Test Unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error ||
              "This practice test could not be loaded."}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Practice Tests
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ==================================================
          Back
      ================================================== */}

      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
      >
        ← Back to Practice Tests
      </button>


      {/* ==================================================
          Test Header
      ================================================== */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-5xl">
              {getSectionIcon()}
            </div>

            <div className="flex-1">

              <div className="mb-3 flex flex-wrap gap-2">

                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  {test.section || "IELTS"}
                </span>

                {test.difficulty && (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    {test.difficulty}
                  </span>
                )}

                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  Published
                </span>

              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                {test.title}
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                {getSectionDescription()}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            Test Statistics
        ================================================== */}

        <div className="grid grid-cols-2 divide-x divide-y border-b border-slate-100 sm:grid-cols-4 sm:divide-y-0">

          <div className="p-5 text-center">

            <p className="text-xs font-medium text-slate-500">
              Questions
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">
              {test.questions?.length || 0}
            </p>

          </div>


          <div className="p-5 text-center">

            <p className="text-xs font-medium text-slate-500">
              Duration
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">
              {test.duration || 0}
            </p>

            <p className="text-xs text-slate-400">
              minutes
            </p>

          </div>


          <div className="p-5 text-center">

            <p className="text-xs font-medium text-slate-500">
              Total Marks
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">
              {test.totalMarks || 0}
            </p>

          </div>


          <div className="p-5 text-center">

            <p className="text-xs font-medium text-slate-500">
              Difficulty
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">
              {test.difficulty || "N/A"}
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          Description
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <h2 className="text-lg font-bold text-slate-800">
          About This Test
        </h2>

        <p className="mt-3 leading-7 text-slate-600">
          {test.description ||
            "This is an IELTS practice test designed to help you improve your performance."}
        </p>

      </div>


      {/* ==================================================
          Test Instructions
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
            📋
          </div>

          <div>

            <h2 className="text-lg font-bold text-slate-800">
              Test Instructions
            </h2>

            <p className="text-xs text-slate-400">
              Read carefully before starting.
            </p>

          </div>

        </div>


        {test.instructions ? (

          <div className="mt-5 whitespace-pre-line rounded-xl bg-slate-50 p-5 leading-7 text-slate-600">
            {test.instructions}
          </div>

        ) : (

          <div className="mt-5 rounded-xl bg-slate-50 p-5">

            <p className="font-semibold text-slate-700">
              Please read the instructions before
              starting your test.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">

              <li>
                • Read each question carefully.
              </li>

              <li>
                • Answer all questions you can.
              </li>

              <li>
                • Keep track of the remaining time.
              </li>

              <li>
                • Review your answers before submitting.
              </li>

            </ul>

          </div>

        )}

      </div>


      {/* ==================================================
          Important Rules
      ================================================== */}

      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

        <div className="flex items-start gap-4">

          <div className="text-2xl">
            ⚠️
          </div>

          <div className="flex-1">

            <h2 className="font-bold text-yellow-800">
              Important Rules
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-yellow-700">

              <li>
                • Make sure you have a stable internet
                connection before starting.
              </li>

              <li>
                • The test has a fixed time limit.
              </li>

              <li>
                • Once you start the test, the timer
                will begin.
              </li>

              <li>
                • Make sure you submit your answers
                before the time expires.
              </li>

              <li>
                • Do not refresh or close the page while
                taking the test.
              </li>

            </ul>

          </div>

        </div>

      </div>


      {/* ==================================================
          Confirmation
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <label className="flex cursor-pointer items-start gap-4">

          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) =>
              setAccepted(
                event.target.checked
              )
            }
            className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <span>

            <span className="block font-semibold text-slate-800">
              I have read and understood the
              instructions.
            </span>

            <span className="mt-1 block text-sm text-slate-500">
              I am ready to start the IELTS
              practice test.
            </span>

          </span>

        </label>

      </div>


      {/* ==================================================
          Action Buttons
      ================================================== */}

      <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={handleBack}
          disabled={starting}
          className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>


        <button
          type="button"
          onClick={handleStartTest}
          disabled={!accepted || starting}
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {starting
            ? "Starting Test..."
            : "Start Test →"}
        </button>

      </div>

    </div>
  );
};

export default TestInstructions;