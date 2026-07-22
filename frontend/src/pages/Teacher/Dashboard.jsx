import { useEffect, useState } from "react";

import TeacherStatCard from "../../components/teacher/TeacherStatCard";
import TeacherBatchCard from "../../components/teacher/TeacherBatchCard";
import TeacherTodayClassCard from "../../components/teacher/TeacherTodayClassCard";
import NotificationCard from "../../components/teacher/NotificationCard";

import {
  getDashboardSummary,
  getMyBatches,
  getTodayClasses,
} from "../../services/teacherDashboardService";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [batches, setBatches] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const summaryResponse = await getDashboardSummary();
      const batchesResponse = await getMyBatches();
      const todayClassesResponse = await getTodayClasses();

      setSummary(summaryResponse.data);
      setBatches(batchesResponse.data || []);
      setTodayClasses(todayClassesResponse.data || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <h2 className="text-xl font-semibold text-slate-600">
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <>
      {/* ================= Header ================= */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Teacher Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back! Here's an overview of your teaching activities.
        </p>
      </div>

      {/* ================= Statistics ================= */}

      <h2 className="mb-4 text-xl font-semibold text-slate-700">
        Teaching Statistics
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <TeacherStatCard
          title="Assigned Batches"
          value={summary?.assignedBatches || 0}
          type="batches"
        />

        <TeacherStatCard
          title="Students"
          value={summary?.students || 0}
          type="students"
        />

        <TeacherStatCard
          title="Today's Classes"
          value={summary?.todayClasses || 0}
          type="classes"
        />

        <TeacherStatCard
          title="Upcoming Tests"
          value={summary?.upcomingTests || 0}
          type="tests"
        />

      </div>

      {/* ================= My Batches ================= */}

      <div className="mt-10">

        <h2 className="mb-5 text-xl font-semibold text-slate-700">
          My Batches
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {batches.length > 0 ? (
            batches.map((batch) => (
              <TeacherBatchCard
                key={batch.batchId}
                batch={batch}
              />
            ))
          ) : (
            <div className="rounded-2xl bg-white p-6 shadow">
              No batches assigned.
            </div>
          )}

        </div>

      </div>

      {/* ================= Today's Classes ================= */}

      <div className="mt-10">

        <h2 className="mb-5 text-xl font-semibold text-slate-700">
          Today's Classes
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {todayClasses.length > 0 ? (
            todayClasses.map((batch) => (
              <TeacherTodayClassCard
                key={batch.batchId}
                batch={batch}
              />
            ))
          ) : (
            <div className="rounded-2xl bg-white p-6 shadow">
              No classes scheduled today.
            </div>
          )}

        </div>

      </div>

      {/* ================= Notifications ================= */}

      <div className="mt-10">

        <h2 className="mb-5 text-xl font-semibold text-slate-700">
          Recent Notifications
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          <NotificationCard
            title="Welcome"
            message="Welcome to the AI IELTS & PTE LMS."
          />

          <NotificationCard
            title="Attendance"
            message="Mark attendance directly from Today's Classes."
          />

          <NotificationCard
            title="Upcoming Tests"
            message="Mock tests and evaluations will be available soon."
          />

        </div>

      </div>
    </>
  );
};

export default Dashboard;