import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getSpeakingTestById,
  startSpeakingAttempt,
  submitSpeakingAttempt,
} from "../../../services/ieltsSpeakingService";

const SpeakingTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);

  const [audioUrl, setAudioUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ======================================================
  // Load Speaking Test
  // ======================================================

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getSpeakingTestById(id);

        setTest(response.data);
      } catch (err) {
        console.error(
          "Speaking Test Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load Speaking task."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [id]);


  // ======================================================
  // Start Attempt
  // ======================================================

  const handleStart = async () => {
    try {
      setStarting(true);
      setError("");

      const response =
        await startSpeakingAttempt(id);

      setAttempt(response.data);
    } catch (err) {
      console.error(
        "Start Speaking Error:",
        err
      );

      setError(
        err.message ||
          "Unable to start Speaking task."
      );
    } finally {
      setStarting(false);
    }
  };


  // ======================================================
  // Start Recording
  // ======================================================

  const startRecording = async () => {
    try {
      setError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError(
          "Audio recording is not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {

        const blob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        setRecordedBlob(blob);

        const url =
          URL.createObjectURL(blob);

        setAudioUrl(url);

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      };

      recorder.start();

      setRecording(true);

    } catch (err) {
      console.error(
        "Recording Error:",
        err
      );

      setError(
        "Microphone permission is required to record your answer."
      );
    }
  };


  // ======================================================
  // Stop Recording
  // ======================================================

  const stopRecording = () => {

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
  };


  // ======================================================
  // Submit Recording
  // ======================================================

  const handleSubmit = async () => {

    if (!attempt) {
      setError(
        "Please start the Speaking task first."
      );

      return;
    }

    if (!recordedBlob) {
      setError(
        "Please record your answer before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * The current API expects an audioUrl.
       * The actual audio upload/storage mechanism
       * will be connected to the backend file-handling
       * system.
       */

      const temporaryAudioUrl =
        audioUrl;

      await submitSpeakingAttempt(
        attempt._id,
        temporaryAudioUrl
      );

      setSubmitted(true);

    } catch (err) {
      console.error(
        "Submit Speaking Error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit Speaking recording."
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
          Loading Speaking task...
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
  // Submitted
  // ======================================================

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            🎉
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            Speaking Submitted
          </h1>

          <p className="mt-3 text-slate-500">
            Your Speaking recording has been submitted
            successfully.
          </p>

          <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
            Your teacher will review your recording and
            provide feedback and a band score.
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/student/ielts/speaking")
            }
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Speaking
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
            🎤
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
                Part
              </p>

              <p className="mt-1 text-xl font-bold">
                {test?.testType || "Speaking"}
              </p>

            </div>

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
              : "Start Speaking"}
          </button>

        </div>

      </div>
    );
  }


  // ======================================================
  // Active Speaking Test
  // ======================================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          {test.title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Speak clearly and record your answer.
        </p>

      </div>


      {/* ==================================================
          Speaking Question
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="text-3xl">
            🎤
          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Speaking Question
            </h2>

            <p className="text-sm text-slate-500">
              {test.testType}
            </p>

          </div>

        </div>


        <div className="mt-6 rounded-xl bg-slate-50 p-5">

          <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
            {test?.questions?.[0]?.questionText ||
              "Speaking question is not available."}
          </p>

        </div>

      </div>


      {/* ==================================================
          Recorder
      ================================================== */}

      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-4xl">
          {recording ? "🔴" : "🎙️"}
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-800">
          {recording
            ? "Recording..."
            : "Voice Recorder"}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {recording
            ? "Speak clearly. Click stop when you finish."
            : "Click start to record your answer."}
        </p>


        {/* Recording Buttons */}

        <div className="mt-6 flex justify-center gap-3">

          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
            >
              Start Recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-900"
            >
              Stop Recording
            </button>
          )}

        </div>


        {/* Audio Preview */}

        {audioUrl && (
          <div className="mt-6">

            <p className="mb-3 text-sm font-medium text-slate-700">
              Recording Preview
            </p>

            <audio
              controls
              src={audioUrl}
              className="mx-auto w-full max-w-lg"
            />

          </div>
        )}

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
        disabled={
          submitting ||
          recording ||
          !recordedBlob
        }
        className="w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Submitting..."
          : "Submit Speaking Recording"}
      </button>

    </div>
  );
};

export default SpeakingTest;