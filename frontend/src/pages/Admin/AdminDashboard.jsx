import { useEffect, useState } from "react";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import useDashboard from "../../hooks/useDashboard";

import {
  getAttendanceCards,
} from "../../services/attendanceDashboardService";

import {
  FaLayerGroup,
  FaCheckCircle,
  FaUsers,
  FaChartPie,
  FaUserGraduate,
  FaUserCheck,
  FaBookOpen,
  FaClipboardList,
  FaCalendarCheck,
  FaUserTimes,
  FaClock,
  FaPercentage,
} from "react-icons/fa";

const AdminDashboard = () => {
  const { statistics, loading, error } = useDashboard();

  // ==========================================
  // Attendance Analytics State
  // ==========================================

  const [attendanceCards, setAttendanceCards] = useState({
    todayAttendance: 0,
    present: 0,
    absent: 0,
    late: 0,
    overallPercentage: 0,
  });

  const [attendanceLoading, setAttendanceLoading] =
    useState(true);

  // ==========================================
  // Load Attendance Dashboard
  // ==========================================

  useEffect(() => {
    fetchAttendanceCards();
  }, []);

  const fetchAttendanceCards = async () => {
    try {
      setAttendanceLoading(true);

      const cards = await getAttendanceCards();

      setAttendanceCards(cards || {});
    } catch (error) {
      console.error(
        "Attendance Dashboard Error:",
        error
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  // ==========================================
  // Dashboard Loading
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <h2 className="text-xl font-semibold text-slate-600">
            Loading Dashboard...
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // Dashboard Error
  // ==========================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-xl bg-red-100 p-6 text-center text-red-600">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* ==========================================
          Attendance Statistics
      ========================================== */}

      <h2 className="mt-10 mb-4 text-xl font-semibold text-slate-700">
        Attendance Statistics
      </h2>

      {attendanceLoading ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-slate-500">
            Loading attendance analytics...
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

          <DashboardCard
            title="Today's Attendance"
            value={attendanceCards?.todayAttendance || 0}
            icon={<FaCalendarCheck size={26} />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />

          <DashboardCard
            title="Present"
            value={attendanceCards?.present || 0}
            icon={<FaCheckCircle size={26} />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />

          <DashboardCard
            title="Absent"
            value={attendanceCards?.absent || 0}
            icon={<FaUserTimes size={26} />}
            iconBg="bg-red-100"
            iconColor="text-red-600"
          />

          <DashboardCard
            title="Late"
            value={attendanceCards?.late || 0}
            icon={<FaClock size={26} />}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />

          <DashboardCard
            title="Overall Attendance"
            value={`${attendanceCards?.overallPercentage || 0}%`}
            icon={<FaPercentage size={26} />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />

        </div>
      )}
            {/* ==========================================
          Batch Statistics
      ========================================== */}

      <h2 className="mb-4 mt-10 text-xl font-semibold text-slate-700">
        Batch Statistics
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Total Batches"
          value={statistics?.totalBatches || 0}
          icon={<FaLayerGroup size={26} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <DashboardCard
          title="Active Batches"
          value={statistics?.activeBatches || 0}
          icon={<FaCheckCircle size={26} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <DashboardCard
          title="Full Batches"
          value={statistics?.fullBatches || 0}
          icon={<FaUsers size={26} />}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />

        <DashboardCard
          title="Capacity"
          value={`${statistics?.occupiedSeats || 0} / ${
            statistics?.totalCapacity || 0
          }`}
          icon={<FaChartPie size={26} />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />

      </div>
            {/* ==========================================
          Student Statistics
      ========================================== */}

      <h2 className="mt-10 mb-4 text-xl font-semibold text-slate-700">
        Student Statistics
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Total Students"
          value={statistics?.totalStudents || 0}
          icon={<FaUserGraduate size={26} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <DashboardCard
          title="Active Students"
          value={statistics?.activeStudents || 0}
          icon={<FaUserCheck size={26} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <DashboardCard
          title="IELTS Students"
          value={statistics?.ieltsStudents || 0}
          icon={<FaBookOpen size={26} />}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />

        <DashboardCard
          title="PTE Students"
          value={statistics?.pteStudents || 0}
          icon={<FaClipboardList size={26} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

      </div>
            {/* ==========================================
          Capacity Utilization
      ========================================== */}

      <div className="mt-10 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          Capacity Utilization
        </h2>

        <div className="mb-3 flex items-center justify-between text-sm text-slate-600">

          <span>Occupied Seats</span>

          <span>
            {statistics?.occupiedSeats || 0} /{" "}
            {statistics?.totalCapacity || 0}
          </span>

        </div>

        <div className="h-4 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${
                statistics?.totalCapacity
                  ? (
                      (statistics.occupiedSeats /
                        statistics.totalCapacity) *
                      100
                    ).toFixed(0)
                  : 0
              }%`,
            }}
          />

        </div>

        <div className="mt-4 flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Available Seats
            </p>

            <h3 className="text-lg font-semibold text-green-600">
              {statistics?.availableSeats || 0}
            </h3>

          </div>

          <div className="text-right">

            <p className="text-sm text-slate-500">
              Occupied Seats
            </p>

            <h3 className="text-lg font-semibold text-blue-600">
              {statistics?.occupiedSeats || 0}
            </h3>

          </div>

        </div>

      </div>
      </DashboardLayout>
  )
}
      // ==========================================
// Dashboard Card Component
// ==========================================

const DashboardCard = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="group rounded-2xl bg-white p-6 shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            {value}
          </h2>

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );

};
export default AdminDashboard;