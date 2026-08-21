import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHeadphones,
  FaPlay,
  FaClock,
  FaBookOpen,
  FaArrowLeft,
  FaArrowRight,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getListeningLessons,
  getListeningTests,
} from "../../../services/ieltsListeningService";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

const Listening = () => {
  const navigate = useNavigate();

  // ======================================================
  // State
  // ======================================================

  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Listening Content
  // ======================================================

  useEffect(() => {
    const loadListeningContent = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          lessonsResponse,
          testsResponse,
        ] = await Promise.all([
          getListeningLessons(),
          getListeningTests(),
        ]);

        setLessons(
          lessonsResponse?.data || []
        );

        setTests(
          testsResponse?.data || []
        );

      } catch (err) {
        console.error(
          "Listening Content Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load Listening content."
        );

      } finally {
        setLoading(false);
      }
    };

    loadListeningContent();
  }, []);

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
              Loading IELTS Listening...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we load your lessons and tests.
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
            Back to IELTS Dashboard
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

        <div className="overflow-hidden rounded-2xl bg-blue-600 shadow-sm">

          <div className="p-6 md:p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* --------------------------------------------
                  Header Information
              -------------------------------------------- */}

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white">

                  <FaHeadphones />

                </div>


                <div>

                  <p className="text-sm font-medium text-blue-100">
                    IELTS Student Panel
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                    IELTS Listening
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                    Improve your listening skills through
                    lessons, audio practice and IELTS
                    listening tests.
                  </p>

                </div>

              </div>


              {/* --------------------------------------------
                  Progress
              -------------------------------------------- */}

              <div className="rounded-2xl bg-white/10 px-6 py-5 text-center">

                <p className="text-xs font-medium text-blue-100">
                  Section Progress
                </p>

                <p className="mt-1 text-3xl font-bold text-white">
                  0%
                </p>

                <p className="mt-1 text-xs text-blue-100">
                  Start practicing
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            Error
        ================================================== */}

        {error && (

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <div className="text-lg">
                ⚠️
              </div>

              <div>

                <p className="font-semibold text-red-700">
                  Unable to load Listening content
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* ==================================================
            Statistics
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Lessons */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <FaBookOpen />

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Available Lessons
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {lessons.length}
                </p>

              </div>

            </div>

          </div>


          {/* Tests */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">

                <FaClipboardList />

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Listening Tests
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {tests.length}
                </p>

              </div>

            </div>

          </div>


          {/* Progress */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                <FaCheckCircle />

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Completed
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  0
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            Listening Skills
        ================================================== */}

        <section>

          <div className="mb-4">

            <p className="text-sm font-medium text-blue-600">
              What You Will Practice
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Listening Skills
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Develop the skills required to perform well
              in the IELTS Listening section.
            </p>

          </div>


          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

            {[
              "Understanding main ideas",
              "Identifying specific information",
              "Following conversations",
              "Listening for details",
              "Recognizing keywords",
              "Understanding different speakers",
            ].map((skill) => (

              <div
                key={skill}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
              >

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-600">
                  ✓
                </span>

                <span className="text-sm font-medium text-slate-600">
                  {skill}
                </span>

              </div>

            ))}

          </div>

        </section>


        {/* ==================================================
            Listening Lessons
        ================================================== */}

        <section>

          <div className="mb-5">

            <p className="text-sm font-medium text-blue-600">
              Learning Content
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Listening Lessons
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Learn strategies and improve your listening
              skills through the available lessons.
            </p>

          </div>


          {lessons.length === 0 ? (

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                <FaHeadphones />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No Listening Lessons Available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your teacher has not added any Listening
                lessons yet.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2">

              {lessons.map((lesson, index) => (

                <div
                  key={lesson._id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* ------------------------------------------
                      Lesson Header
                  ------------------------------------------ */}

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">

                        {index + 1}

                      </div>

                      <div>

                        <h3 className="text-lg font-semibold text-slate-800">
                          {lesson.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">

                          {lesson.difficulty && (

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                              {lesson.difficulty}
                            </span>

                          )}

                          {lesson.lessonType && (

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {lesson.lessonType}
                            </span>

                          )}

                        </div>

                      </div>

                    </div>


                    <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">

                      <FaHeadphones />

                    </div>

                  </div>


                  {/* ------------------------------------------
                      Description
                  ------------------------------------------ */}

                  <p className="mt-5 text-sm leading-6 text-slate-500">

                    {lesson.description ||
                      "IELTS Listening lesson"}

                  </p>


                  {/* ------------------------------------------
                      Audio
                  ------------------------------------------ */}

                  {lesson.audioUrl ? (

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                      <div className="mb-3 flex items-center gap-2">

                        <FaHeadphones className="text-sm text-blue-600" />

                        <span className="text-xs font-semibold text-slate-600">
                          Audio Practice
                        </span>

                      </div>

                      <audio
                        controls
                        preload="metadata"
                        className="w-full"
                      >

                        <source
                          src={lesson.audioUrl}
                          type="audio/mpeg"
                        />

                        Your browser does not support
                        audio playback.

                      </audio>

                    </div>

                  ) : (

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                      <p className="text-xs text-slate-400">
                        Audio is not available for this
                        lesson yet.
                      </p>

                    </div>

                  )}


                  {/* ------------------------------------------
                      Lesson Information
                  ------------------------------------------ */}

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-400">

                    {lesson.duration && (

                      <div className="flex items-center gap-2">

                        <FaClock />

                        {lesson.duration}

                      </div>

                    )}

                    <div className="flex items-center gap-2">

                      <FaHeadphones />

                      Listening Lesson

                    </div>

                  </div>


                  {/* ------------------------------------------
                      Progress
                  ------------------------------------------ */}

                  <div className="mt-5">

                    <div className="flex items-center justify-between">

                      <span className="text-xs font-medium text-slate-500">
                        Lesson Progress
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        0%
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: "0%",
                        }}
                      />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ==================================================
            Listening Tests
        ================================================== */}

        <section>

          <div className="mb-5">

            <p className="text-sm font-medium text-green-600">
              Assessment
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Listening Tests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Test your Listening skills and check your
              performance.
            </p>

          </div>


          {tests.length === 0 ? (

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl text-green-600">
                <FaClipboardList />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No Listening Tests Available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your teacher has not added any Listening
                tests yet.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2">

              {tests.map((test, index) => (

                <div
                  key={test._id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* ------------------------------------------
                      Test Header
                  ------------------------------------------ */}

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 font-bold text-green-600">

                        {index + 1}

                      </div>

                      <div className="text-2xl">
                        📝
                      </div>

                    </div>


                    {test.testType && (

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                        {test.testType}
                      </span>

                    )}

                  </div>


                  {/* ------------------------------------------
                      Test Title
                  ------------------------------------------ */}

                  <h3 className="mt-5 text-lg font-semibold text-slate-800">
                    {test.title}
                  </h3>


                  {/* ------------------------------------------
                      Description
                  ------------------------------------------ */}

                  <p className="mt-2 text-sm leading-6 text-slate-500">

                    {test.description ||
                      "IELTS Listening practice test"}

                  </p>


                  {/* ------------------------------------------
                      Test Information
                  ------------------------------------------ */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Questions
                      </p>

                      <p className="mt-1 font-bold text-slate-700">
                        {test.questions?.length || 0}
                      </p>

                    </div>


                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Marks
                      </p>

                      <p className="mt-1 font-bold text-slate-700">
                        {test.totalMarks || 0}
                      </p>

                    </div>

                  </div>


                  {/* ------------------------------------------
                      Start Test
                  ------------------------------------------ */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/ielts/listening/test/${test._id}`
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >

                    <FaPlay className="text-xs" />

                    Start Test

                    <FaArrowRight className="text-xs" />

                  </button>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ==================================================
            Practice Test CTA
        ================================================== */}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-blue-600">
                Ready to Practice?
              </p>

              <h2 className="mt-1 text-lg font-bold text-blue-900">
                Take a complete IELTS practice test
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-700">
                Test your skills and review your performance
                after completing the test.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/ielts/tests"
                )
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >

              Practice Tests

              <FaArrowRight className="text-xs" />

            </button>

          </div>

        </div>


        {/* ==================================================
            Bottom Navigation
        ================================================== */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">

          {/* IELTS Dashboard */}

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


          {/* Reading */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/reading"
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >

            Next: Reading

            <FaArrowRight className="text-xs" />

          </button>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default Listening;