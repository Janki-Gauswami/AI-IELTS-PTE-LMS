import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import useDashboard from "../../hooks/useDashboard";

import {
  FaLayerGroup,
  FaCheckCircle,
  FaUsers,
  FaChartPie,
  FaUserGraduate,
  FaUserCheck,
  FaBookOpen,
  FaClipboardList,
} from "react-icons/fa";

const AdminDashboard = () => {
  const { statistics, loading, error } = useDashboard();

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
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back! Here's an overview of your institute.
        </p>
      </div>

      {/* Batch Statistics */}

      <h2 className="mb-4 text-xl font-semibold text-slate-700">
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

      {/* Student Statistics */}

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

      {/* Capacity Utilization */}

      <div className="mt-10 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          Capacity Utilization
        </h2>

        <div className="mb-3 flex justify-between text-sm text-slate-600">
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
                  ? (statistics.occupiedSeats /
                      statistics.totalCapacity) *
                    100
                  : 0
              }%`,
            }}
          />

        </div>

        <div className="mt-4 flex justify-between text-sm">

          <span className="text-green-600">
            Available Seats: {statistics?.availableSeats || 0}
          </span>

          <span className="text-blue-600">
            Occupied Seats: {statistics?.occupiedSeats || 0}
          </span>

        </div>

      </div>
    </DashboardLayout>
  );
};

const DashboardCard = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow transition hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            {value}
          </h2>

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;