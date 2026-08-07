import { useEffect, useState } from "react";
import {
  getAttendanceSummary,
  getAttendanceHistory,
  getAttendanceCalendar,
} from "../../services/studentAttendanceService";

const Attendance = () => {
  // ==========================================
  // State
  // ==========================================

  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Load Attendance Data
  // ==========================================

useEffect(() => {
  loadAttendance();
}, [selectedMonth, selectedStatus]);

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const filters = {};

if (selectedMonth) {
  filters.month = selectedMonth;
}

if (selectedStatus) {
  filters.status = selectedStatus;
}

const [
  summaryResponse,
  historyResponse,
  calendarResponse,
] = await Promise.all([
  getAttendanceSummary(),
  getAttendanceHistory(filters),
  getAttendanceCalendar(filters),
]);

      setSummary(summaryResponse.data);

      setHistory(historyResponse.data || []);

      setCalendar(calendarResponse.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Loading Screen
  // ==========================================

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <h2 className="text-xl font-semibold text-slate-700">
          Loading Attendance...
        </h2>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          My Attendance
        </h1>

        <p className="mt-2 text-slate-500">
          View your attendance summary and history.
        </p>
      </div>

      {/* Summary Placeholder */}
{/* ==========================================
    Attendance Summary
========================================== */}

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

  {/* Attendance Percentage */}

  <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow">

    <p className="text-sm opacity-90">
      Attendance %
    </p>

    <h2 className="mt-3 text-4xl font-bold">
      {summary?.attendancePercentage ?? 0}%
    </h2>

  </div>

  {/* Present */}

  <div className="rounded-2xl bg-white p-6 shadow">

    <p className="text-sm text-slate-500">
      Present
    </p>

    <h2 className="mt-3 text-4xl font-bold text-green-600">
      {summary?.presentDays ?? 0}
    </h2>

  </div>

  {/* Absent */}

  <div className="rounded-2xl bg-white p-6 shadow">

    <p className="text-sm text-slate-500">
      Absent
    </p>

    <h2 className="mt-3 text-4xl font-bold text-red-600">
      {summary?.absentDays ?? 0}
    </h2>

  </div>

  {/* Late */}

  <div className="rounded-2xl bg-white p-6 shadow">

    <p className="text-sm text-slate-500">
      Late
    </p>

    <h2 className="mt-3 text-4xl font-bold text-yellow-500">
      {summary?.lateDays ?? 0}
    </h2>

  </div>

  {/* Excused */}

  <div className="rounded-2xl bg-white p-6 shadow">

    <p className="text-sm text-slate-500">
      Excused
    </p>

    <h2 className="mt-3 text-4xl font-bold text-purple-600">
      {summary?.excusedDays ?? 0}
    </h2>

  </div>

</div>

     {/* ==========================================
    Attendance Calendar
========================================== */}

<div className="rounded-2xl bg-white shadow">

  <div className="border-b p-6">

    <h2 className="text-xl font-semibold text-slate-800">
      Attendance Calendar
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Attendance status for each recorded day.
    </p>

  </div>

  <div className="grid grid-cols-7 gap-4 p-6">

    {calendar.length === 0 ? (

      <div className="col-span-7 py-8 text-center text-slate-500">
        No attendance records found.
      </div>

    ) : (

      calendar.map((item, index) => {

        const attendanceDate = new Date(item.date);

        const day = attendanceDate.getDate();

        let bgColor = "bg-gray-300";

        if (item.status === "Present")
          bgColor = "bg-green-500";

        if (item.status === "Absent")
          bgColor = "bg-red-500";

        if (item.status === "Late")
          bgColor = "bg-yellow-500";

        if (item.status === "Excused")
          bgColor = "bg-purple-500";

        return (

          <div
            key={index}
            className={`rounded-xl ${bgColor} flex h-16 items-center justify-center text-lg font-bold text-white shadow`}
            title={`${attendanceDate.toLocaleDateString()} - ${item.status}`}
          >
            {day}
          </div>

        );

      })

    )}

  </div>

  {/* Legend */}

  <div className="flex flex-wrap gap-6 border-t p-6 text-sm">

    <div className="flex items-center gap-2">
      <span className="h-4 w-4 rounded bg-green-500"></span>
      Present
    </div>

    <div className="flex items-center gap-2">
      <span className="h-4 w-4 rounded bg-red-500"></span>
      Absent
    </div>

    <div className="flex items-center gap-2">
      <span className="h-4 w-4 rounded bg-yellow-500"></span>
      Late
    </div>

    <div className="flex items-center gap-2">
      <span className="h-4 w-4 rounded bg-purple-500"></span>
      Excused
    </div>

  </div>

</div>
{/* ==========================================
    Filters
========================================== */}

<div className="rounded-2xl bg-white p-6 shadow">

  <div className="grid gap-4 md:grid-cols-2">

    {/* Month */}

    <div>

      <label className="mb-2 block font-medium">
        Month
      </label>

      <input
        type="month"
        value={selectedMonth}
        onChange={(e) =>
          setSelectedMonth(e.target.value)
        }
        className="w-full rounded-lg border px-4 py-3"
      />

    </div>

    {/* Status */}

    <div>

      <label className="mb-2 block font-medium">
        Status
      </label>

      <select
        value={selectedStatus}
        onChange={(e) =>
          setSelectedStatus(e.target.value)
        }
        className="w-full rounded-lg border px-4 py-3"
      >

        <option value="">
          All
        </option>

        <option value="Present">
          Present
        </option>

        <option value="Absent">
          Absent
        </option>

        <option value="Late">
          Late
        </option>

        <option value="Excused">
          Excused
        </option>

      </select>

    </div>

  </div>

</div>
      {/* ==========================================
    Attendance History
========================================== */}

<div className="rounded-2xl bg-white shadow">

  <div className="border-b p-6">

    <h2 className="text-xl font-semibold text-slate-800">
      Attendance History
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      View all your attendance records.
    </p>

  </div>

  <div className="overflow-x-auto">

    {history.length === 0 ? (

      <div className="p-10 text-center text-slate-500">
        No attendance history found.
      </div>

    ) : (

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-6 py-4 text-left">
              Date
            </th>

            <th className="px-6 py-4 text-left">
              Batch
            </th>

            <th className="px-6 py-4 text-left">
              Teacher
            </th>

            <th className="px-6 py-4 text-center">
              Status
            </th>

            <th className="px-6 py-4 text-left">
              Remarks
            </th>

          </tr>

        </thead>

        <tbody>

          {history.map((record) => {

            let badgeColor =
              "bg-gray-100 text-gray-700";

            if (record.status === "Present")
              badgeColor =
                "bg-green-100 text-green-700";

            if (record.status === "Absent")
              badgeColor =
                "bg-red-100 text-red-700";

            if (record.status === "Late")
              badgeColor =
                "bg-yellow-100 text-yellow-700";

            if (record.status === "Excused")
              badgeColor =
                "bg-purple-100 text-purple-700";

            return (

              <tr
                key={record._id}
                className="border-b hover:bg-slate-50"
              >

                <td className="px-6 py-4">
                  {new Date(
                    record.date
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  {record.batch?.batchName || "-"}
                </td>

                <td className="px-6 py-4">
                  {record.teacher?.fullName || "-"}
                </td>

                <td className="px-6 py-4 text-center">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeColor}`}
                  >
                    {record.status}
                  </span>

                </td>

                <td className="px-6 py-4">
                  {record.remarks || "-"}
                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    )}

  </div>

</div>

    </div>
  );
};

export default Attendance;