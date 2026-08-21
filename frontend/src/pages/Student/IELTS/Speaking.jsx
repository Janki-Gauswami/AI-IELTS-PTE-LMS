import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaMicrophone,
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaPlay,
  FaUserEdit,
} from "react-icons/fa";

import {
  getSpeakingLessons,
  getSpeakingTests,
} from "../../../services/ieltsSpeakingService";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

const Speaking = () => {
  const navigate = useNavigate();

  // ======================================================
  // State
  // ======================================================

  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load Speaking Content
  // ======================================================

  useEffect(() => {
    const loadSpeakingContent = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          lessonsResponse,
          testsResponse,
        ] = await Promise.all([
          getSpeakingLessons(),
          getSpeakingTests(),
        ]);

        setLessons(
          lessonsResponse?.data || []
        );

        setTests(
          testsResponse?.data || []
        );

      } catch (err) {
        console.error(
          "Speaking Content Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load Speaking content."
        );

      } finally {
        setLoading(false);
      }
    };

    loadSpeakingContent();
  }, []);

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <DashboardLayout>

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

            <p className="text-sm font-medium text-slate-500">
              Loading IELTS Speaking...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we load your lessons and practice tasks.
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
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-500"
        >

          <FaArrowLeft className="text-xs" />

          Back to IELTS Dashboard

        </button>


        {/* ==================================================
            Header
        ================================================== */}

        <div className="overflow-hidden rounded-2xl bg-orange-500 shadow-sm">

          <div className="p-6 md:p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* --------------------------------------------
                  Header Information
              -------------------------------------------- */}

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white">

                  <FaMicrophone />

                </div>


                <div>

                  <p className="text-sm font-medium text-orange-100">
                    IELTS Student Panel
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                    IELTS Speaking
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-orange-100">
                    Practice Speaking Part 1, Part 2 and
                    Part 3 through speaking activities,
                    audio recording and teacher feedback.
                  </p>

                </div>

              </div>


              {/* --------------------------------------------
                  Progress
              -------------------------------------------- */}

              <div className="rounded-2xl bg-white/10 px-6 py-5 text-center">

                <p className="text-xs font-medium text-orange-100">
                  Section Progress
                </p>

                <p className="mt-1 text-3xl font-bold text-white">
                  0%
                </p>

                <p className="mt-1 text-xs text-orange-100">
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
                  Unable to load Speaking content
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

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">

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


          {/* Speaking Tasks */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <FaClipboardList />

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Speaking Tasks
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {tests.length}
                </p>

              </div>

            </div>

          </div>


          {/* Teacher Evaluation */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">

                <FaUserEdit />

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Evaluation
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  Teacher
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            Speaking Parts
        ================================================== */}

        <section>

          <div className="mb-4">

            <p className="text-sm font-medium text-orange-500">
              IELTS Speaking
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Speaking Parts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Understand and practice all three parts of
              the IELTS Speaking section.
            </p>

          </div>


          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Part 1 */}

            <div className="rounded-2xl bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-500">
                1
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                Part 1
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Introduction and interview questions
                about familiar topics.
              </p>

            </div>


            {/* Part 2 */}

            <div className="rounded-2xl bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-500">
                2
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                Part 2
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Individual long turn where you speak about
                a given topic.
              </p>

            </div>


            {/* Part 3 */}

            <div className="rounded-2xl bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-500">
                3
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                Part 3
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Discussion questions requiring deeper
                answers and explanations.
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            Speaking Skills
        ================================================== */}

        <section>

          <div className="mb-4">

            <p className="text-sm font-medium text-orange-500">
              What You Will Practice
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Speaking Skills
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Develop the skills required for effective IELTS
              Speaking responses.
            </p>

          </div>


          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

            {[
              "Fluency and coherence",
              "Vocabulary development",
              "Grammar and sentence structure",
              "Pronunciation practice",
              "Answer development",
              "Speaking confidence",
            ].map((skill) => (

              <div
                key={skill}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
              >

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-500">
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
            Speaking Lessons
        ================================================== */}

        <section>

          <div className="mb-5">

            <p className="text-sm font-medium text-orange-500">
              Learning Content
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Speaking Lessons
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Learn speaking techniques and improve your
              communication skills.
            </p>

          </div>


          {lessons.length === 0 ? (

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-orange-500">
                <FaMicrophone />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No Speaking Lessons Available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your teacher has not added any Speaking
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

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-500">
                        {index + 1}
                      </div>

                      <div>

                        <h3 className="text-lg font-semibold text-slate-800">
                          {lesson.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">

                          {lesson.difficulty && (

                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
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


                    <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 sm:flex">

                      <FaMicrophone />

                    </div>

                  </div>


                  {/* ------------------------------------------
                      Description
                  ------------------------------------------ */}

                  <p className="mt-5 text-sm leading-6 text-slate-500">

                    {lesson.description ||
                      "IELTS Speaking lesson"}

                  </p>


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

                      <FaMicrophone />

                      Speaking Lesson

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
                        className="h-full rounded-full bg-orange-500"
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
            Speaking Practice
        ================================================== */}

        <section>

          <div className="mb-5">

            <p className="text-sm font-medium text-orange-500">
              Speaking Practice
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Speaking Tasks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record your answers and submit them for teacher
              evaluation.
            </p>

          </div>


          {tests.length === 0 ? (

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-orange-500">
                <FaClipboardList />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No Speaking Tasks Available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your teacher has not added any Speaking
                tasks yet.
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
                      Task Header
                  ------------------------------------------ */}

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-500">
                        {index + 1}
                      </div>

                      <div className="text-2xl">
                        🎤
                      </div>

                    </div>


                    {test.testType && (

                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                        {test.testType}
                      </span>

                    )}

                  </div>


                  {/* ------------------------------------------
                      Task Title
                  ------------------------------------------ */}

                  <h3 className="mt-5 text-lg font-semibold text-slate-800">
                    {test.title}
                  </h3>


                  {/* ------------------------------------------
                      Description
                  ------------------------------------------ */}

                  <p className="mt-2 text-sm leading-6 text-slate-500">

                    {test.description ||
                      "IELTS Speaking practice"}

                  </p>


                  {/* ------------------------------------------
                      Evaluation Information
                  ------------------------------------------ */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Practice
                      </p>

                      <p className="mt-1 font-bold text-slate-700">
                        Audio Recording
                      </p>

                    </div>


                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Evaluation
                      </p>

                      <p className="mt-1 font-bold text-slate-700">
                        Teacher
                      </p>

                    </div>

                  </div>


                  {/* ------------------------------------------
                      Start Speaking
                  ------------------------------------------ */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/ielts/speaking/test/${test._id}`
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
                  >

                    <FaPlay className="text-xs" />

                    Start Speaking

                    <FaArrowRight className="text-xs" />

                  </button>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ==================================================
            Recording + Teacher Evaluation Notice
        ================================================== */}

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">

              <FaMicrophone />

            </div>


            <div>

              <p className="text-sm font-medium text-orange-500">
                Speaking Practice
              </p>

              <h2 className="mt-1 text-lg font-bold text-orange-900">
                Record your response and receive teacher feedback
              </h2>

              <p className="mt-2 text-sm leading-6 text-orange-700">
                Your speaking responses can be recorded and
                submitted for teacher evaluation. Automatic
                pronunciation analysis and fully automatic
                Speaking band scoring are not included in this
                module.
              </p>

            </div>

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


          {/* Next: Question Practice */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/questions"
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >

            Next: Question Practice

            <FaArrowRight className="text-xs" />

          </button>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default Speaking;