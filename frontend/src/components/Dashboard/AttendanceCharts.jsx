import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  getAttendanceTrend,
  getBatchComparison,
  getDailyAttendance,
  getMonthlyAttendance,
} from "../../services/attendanceDashboardService";

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#F59E0B",
];

const AttendanceCharts = () => {

  const [attendanceTrend, setAttendanceTrend] = useState([]);

  const [batchComparison, setBatchComparison] =
    useState([]);

  const [dailyAttendance, setDailyAttendance] =
    useState([]);

  const [monthlyAttendance, setMonthlyAttendance] =
    useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {

      const trend =
        await getAttendanceTrend();

      const batches =
        await getBatchComparison();

      const daily =
        await getDailyAttendance();

      const monthly =
        await getMonthlyAttendance();

      setAttendanceTrend(trend || []);

      setBatchComparison(batches || []);

      setDailyAttendance(daily || []);

      setMonthlyAttendance(monthly || []);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };
    // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-10 shadow">
        <h2 className="text-center text-lg font-semibold text-slate-500">
          Loading Attendance Charts...
        </h2>
      </div>
    );
  }

  // ==========================================
  // Charts
  // ==========================================

  return (
    <div className="mt-10 space-y-8">

      {/* ==========================================
          Attendance Trend
      ========================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          Attendance Trend (Last 7 Days)
        </h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <LineChart data={attendanceTrend}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>
            {/* ==========================================
          Batch Comparison & Daily Attendance
      ========================================== */}

      <div className="grid gap-8 lg:grid-cols-2">

        {/* ==========================================
            Batch Comparison
        ========================================== */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-6 text-xl font-semibold text-slate-800">
            Batch Comparison
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart data={batchComparison}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="batchName" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="total"
                fill="#2563EB"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* ==========================================
            Daily Attendance
        ========================================== */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-6 text-xl font-semibold text-slate-800">
            Today's Attendance Distribution
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={dailyAttendance}
                dataKey="count"
                nameKey="status"
                outerRadius={120}
                label
              >

                {dailyAttendance.map((entry, index) => (

                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />

                ))}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>
            {/* ==========================================
          Monthly Attendance
      ========================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          Monthly Attendance
        </h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <AreaChart data={monthlyAttendance}>

            <defs>

              <linearGradient
                id="attendanceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="5%"
                  stopColor="#2563EB"
                  stopOpacity={0.8}
                />

                <stop
                  offset="95%"
                  stopColor="#2563EB"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="_id.month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Area
              type="monotone"
              dataKey="total"
              stroke="#2563EB"
              fillOpacity={1}
              fill="url(#attendanceGradient)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default AttendanceCharts;