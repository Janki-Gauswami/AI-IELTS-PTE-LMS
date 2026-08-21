import {
  FaHeadphones,
  FaBookOpen,
  FaPen,
  FaMicrophone,
  FaClipboardList,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

const IELTSDashboard = () => {
  const navigate = useNavigate();

  // ======================================================
  // IELTS Sections
  // ======================================================

  const sections = [
    {
      title: "Listening",
      description:
        "Develop your ability to understand conversations, discussions, lectures and spoken information.",

      skills: [
        "Understanding main ideas",
        "Identifying specific information",
        "Following conversations",
        "Listening for details",
      ],

      activities: [
        "Audio Lessons",
        "Practice Questions",
        "Listening Practice",
      ],

      icon: FaHeadphones,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      buttonColor:
        "bg-blue-600 hover:bg-blue-700",

      path: "/student/ielts/listening",
    },

    {
      title: "Reading",
      description:
        "Improve your ability to understand academic texts, identify information and interpret written passages.",

      skills: [
        "Reading comprehension",
        "Finding specific information",
        "Understanding main ideas",
        "Vocabulary in context",
      ],

      activities: [
        "Reading Passages",
        "Practice Questions",
        "Reading Practice",
      ],

      icon: FaBookOpen,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      buttonColor:
        "bg-green-600 hover:bg-green-700",

      path: "/student/ielts/reading",
    },

    {
      title: "Writing",
      description:
        "Practice IELTS Writing Task 1 and Task 2 and develop your ability to express ideas clearly and effectively.",

      skills: [
        "Task 1 writing",
        "Task 2 essay writing",
        "Grammar and vocabulary",
        "Coherence and cohesion",
      ],

      activities: [
        "Task 1 Practice",
        "Task 2 Practice",
        "Writing Submissions",
      ],

      icon: FaPen,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      buttonColor:
        "bg-purple-600 hover:bg-purple-700",

      path: "/student/ielts/writing",
    },

    {
      title: "Speaking",
      description:
        "Practice all three IELTS Speaking parts and develop fluency, vocabulary and confidence.",

      skills: [
        "Speaking Part 1",
        "Speaking Part 2",
        "Speaking Part 3",
        "Fluency and pronunciation",
      ],

      activities: [
        "Part 1 Practice",
        "Part 2 Cue Cards",
        "Part 3 Discussion",
      ],

      icon: FaMicrophone,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      buttonColor:
        "bg-orange-500 hover:bg-orange-600",

      path: "/student/ielts/speaking",
    },
  ];

  // ======================================================
  // Render
  // ======================================================

  return (
    <DashboardLayout>

      <div className="space-y-6">

        {/* ==================================================
            Header
        ================================================== */}

        <div>

          <p className="text-sm font-medium text-blue-600">
            IELTS Module
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-800">
            IELTS Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Continue your IELTS preparation and improve
            your performance across all four sections.
          </p>

        </div>


        {/* ==================================================
            Overview Cards
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* ==================================================
              Listening
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/listening"
              )
            }
            className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FaHeadphones />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Section
              </span>

            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Listening
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Audio practice and questions
            </p>

          </button>


          {/* ==================================================
              Reading
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/reading"
              )
            }
            className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <FaBookOpen />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Section
              </span>

            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Reading
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Passages and practice
            </p>

          </button>


          {/* ==================================================
              Writing
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/writing"
              )
            }
            className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FaPen />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Section
              </span>

            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Writing
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Task 1 and Task 2
            </p>

          </button>


          {/* ==================================================
              Speaking
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/ielts/speaking"
              )
            }
            className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <FaMicrophone />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Section
              </span>

            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Speaking
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Parts 1, 2 and 3
            </p>

          </button>

        </div>


        {/* ==================================================
            IELTS Course Overview
        ================================================== */}

        <div>

          <div className="mb-5">

            <p className="text-sm font-medium text-blue-600">
              Course Overview
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              IELTS Sections
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              IELTS consists of four main sections.
              Choose a section below to view lessons,
              practice activities and assessments.
            </p>

          </div>


          {/* ==================================================
              Section Cards
          ================================================== */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {sections.map((section) => {

              const Icon = section.icon;

              return (

                <div
                  key={section.title}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* ==================================================
                      Card Header
                  ================================================== */}

                  <div className="flex items-start justify-between p-6">

                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${section.iconBg} ${section.iconColor}`}
                    >
                      <Icon />
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      IELTS Section
                    </span>

                  </div>


                  {/* ==================================================
                      Section Information
                  ================================================== */}

                  <div className="px-6">

                    <h3 className="text-xl font-bold text-slate-800">
                      IELTS {section.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {section.description}
                    </p>

                  </div>


                  {/* ==================================================
                      Skills Covered
                  ================================================== */}

                  <div className="px-6 pt-5">

                    <h4 className="text-sm font-semibold text-slate-700">
                      Skills Covered
                    </h4>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">

                      {section.skills.map(
                        (skill) => (

                          <div
                            key={skill}
                            className="flex items-center gap-2 text-xs text-slate-500"
                          >

                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                              ✓
                            </span>

                            <span>
                              {skill}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>


                  {/* ==================================================
                      Available Activities
                  ================================================== */}

                  <div className="px-6 pt-5">

                    <h4 className="text-sm font-semibold text-slate-700">
                      Available Activities
                    </h4>

                    <div className="mt-3 flex flex-wrap gap-2">

                      {section.activities.map(
                        (activity) => (

                          <span
                            key={activity}
                            className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                          >
                            {activity}
                          </span>

                        )
                      )}

                    </div>

                  </div>


                  {/* ==================================================
                      Section Progress
                  ================================================== */}

                  <div className="mx-6 mt-6 rounded-xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-xs font-medium text-slate-500">
                        Section Progress
                      </span>

                      <span className="text-xs font-bold text-slate-700">
                        0%
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: "0%",
                        }}
                      />

                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Start practicing to track your progress.
                    </p>

                  </div>


                  {/* ==================================================
                      Continue Button
                  ================================================== */}

                  <div className="p-6">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          section.path
                        )
                      }
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${section.buttonColor}`}
                    >

                      Continue with{" "}
                      {section.title}

                      <FaArrowRight
                        className="text-xs"
                      />

                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        </div>


        {/* ==================================================
            Quick Actions
        ================================================== */}

        <div>

          <h2 className="mb-4 text-lg font-bold text-slate-800">
            Quick Actions
          </h2>


          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* ==================================================
                Practice Tests
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/ielts/tests"
                )
              }
              className="group flex items-center justify-between rounded-2xl bg-blue-600 p-6 text-left text-white transition hover:bg-blue-700"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-xl">
                  <FaClipboardList />
                </div>

                <div>

                  <h3 className="font-bold">
                    IELTS Practice Tests
                  </h3>

                  <p className="mt-1 text-sm text-blue-100">
                    Take complete IELTS practice tests.
                  </p>

                </div>

              </div>

              <FaArrowRight
                className="transition group-hover:translate-x-1"
              />

            </button>


            {/* ==================================================
                Results
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/ielts/tests/attempts"
                )
              }
              className="group flex items-center justify-between rounded-2xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                  <FaChartLine />
                </div>

                <div>

                  <h3 className="font-bold text-slate-800">
                    My IELTS Results
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    View your previous IELTS performance.
                  </p>

                </div>

              </div>

              <FaArrowRight
                className="text-slate-400 transition group-hover:translate-x-1"
              />

              

            </button>

          </div>
          

        </div>
        <div
  onClick={() =>
    navigate("/student/ielts/progress")
  }
  className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <div className="text-3xl">
    📈
  </div>

  <h3 className="mt-4 text-lg font-bold text-slate-800">
    My Progress
  </h3>

  <p className="mt-2 text-sm text-slate-500">
    Track your IELTS scores, attempts and performance.
  </p>

  <p className="mt-4 text-sm font-semibold text-blue-600">
    View Progress →
  </p>
</div>
<button
  type="button"
  onClick={() =>
    navigate(
      "/student/ielts/progress/history"
    )
  }
  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
>
  Test History
</button>
<button
  type="button"
  onClick={() =>
    navigate(
      "/student/ielts/progress/achievements"
    )
  }
  className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 font-semibold text-purple-700 hover:bg-purple-100"
>
  🏆 Achievements
</button>
<button
  type="button"
  onClick={() =>
    navigate(
      "/student/ielts/progress/goals"
    )
  }
  className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-100"
>
  🎯 My Goals
</button>



        {/* ==================================================
            Preparation Tip
        ================================================== */}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              💡
            </div>

            <div>

              <h3 className="font-bold text-blue-900">
                IELTS Preparation Tip
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Practice all four IELTS sections regularly
                and use your test results to identify areas
                that need improvement.
              </p>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default IELTSDashboard;