import { useEffect, useState } from "react";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";

import {
  getAttendanceReport,
  exportAttendanceCSV,
  exportAttendanceExcel,
  exportAttendancePDF,
} from "../../services/attendanceReportService";

import {
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaSearch,
} from "react-icons/fa";

const AttendanceReports = () => {
  // ==========================================
  // Report Data
  // ==========================================

  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // Filters
  // ==========================================

  const [filters, setFilters] = useState({
    batch: "",
    teacher: "",
    student: "",
    date: "",
    month: "",
    year: "",
  });

  // ==========================================
  // Load Report
  // ==========================================

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAttendanceReport(filters);

      setAttendance(response.data || []);
    } catch (err) {
      setError(
        err.message || "Failed to fetch attendance report."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Load on Page Open
  // ==========================================

  useEffect(() => {
    fetchAttendanceReport();
  }, []);

  // ==========================================
  // Handle Input Change
  // ==========================================

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // Search
  // ==========================================

  const handleSearch = () => {
    fetchAttendanceReport();
  };

  // ==========================================
  // Export CSV
  // ==========================================

  const handleCSV = async () => {
    try {
      const blob = await exportAttendanceCSV(filters);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "attendance-report.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // Export Excel
  // ==========================================

  const handleExcel = async () => {
    try {
      const blob = await exportAttendanceExcel(filters);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "attendance-report.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // Export PDF
  // ==========================================

  const handlePDF = async () => {
    try {
      const blob = await exportAttendancePDF(filters);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "attendance-report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // Print
  // ==========================================

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
              {/* ==========================================
          Header
      ========================================== */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Attendance Reports
        </h1>

        <p className="mt-2 text-slate-500">
          Generate and export attendance reports using
          different filters.
        </p>

      </div>

      {/* ==========================================
          Filters
      ========================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-xl font-semibold text-slate-700">
          Report Filters
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {/* Batch */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-600">
              Batch
            </label>

            <input
              type="text"
              name="batch"
              value={filters.batch}
              onChange={handleChange}
              placeholder="Enter Batch ID"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>

          {/* Teacher */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-600">
              Teacher
            </label>

            <input
              type="text"
              name="teacher"
              value={filters.teacher}
              onChange={handleChange}
              placeholder="Enter Teacher ID"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>

          {/* Student */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-600">
              Student
            </label>

            <input
              type="text"
              name="student"
              value={filters.student}
              onChange={handleChange}
              placeholder="Enter Student ID"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>

          {/* Date */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-600">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>

          {/* Month */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-600">
              Month
            </label>

            <select
              name="month"
              value={filters.month}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >

              <option value="">Select Month</option>

              {Array.from({ length: 12 }, (_, i) => (
                <option
                  key={i + 1}
                  value={i + 1}
                >
                  {new Date(2024, i).toLocaleString(
                    "default",
                    {
                      month: "long",
                    }
                  )}
                </option>
              ))}

            </select>

          </div>

          {/* Year */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-600">
              Year
            </label>

            <input
              type="number"
              name="year"
              value={filters.year}
              onChange={handleChange}
              placeholder="2026"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>

        </div>

        {/* Search Button */}

        <div className="mt-6">

          <button
            onClick={handleSearch}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >

            <FaSearch />

            Generate Report

          </button>

        </div>

      </div>
            {/* ==========================================
          Export Buttons
      ========================================== */}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-xl font-semibold text-slate-700">
          Export Attendance Report
        </h2>

        <div className="flex flex-wrap gap-4">

          {/* CSV */}

          <button
            onClick={handleCSV}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
          >
            <FaFileCsv size={18} />
            Export CSV
          </button>

          {/* Excel */}

          <button
            onClick={handleExcel}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700"
          >
            <FaFileExcel size={18} />
            Export Excel
          </button>

          {/* PDF */}

          <button
            onClick={handlePDF}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
          >
            <FaFilePdf size={18} />
            Export PDF
          </button>

          {/* Print */}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-slate-700 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            <FaPrint size={18} />
            Print Report
          </button>

        </div>

      </div>

      {/* ==========================================
          Loading
      ========================================== */}

      {loading && (

        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow">

          <h2 className="text-lg font-semibold text-slate-600">
            Loading attendance report...
          </h2>

        </div>

      )}

      {/* ==========================================
          Error
      ========================================== */}

      {!loading && error && (

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

          <h2 className="font-semibold text-red-600">
            {error}
          </h2>

        </div>

      )}
            {/* ==========================================
          Attendance Report Table
      ========================================== */}

      {!loading && !error && (

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-xl font-semibold text-slate-700">
              Attendance Report
            </h2>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Total Records : {attendance.length}
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full border-collapse">

              <thead>

                <tr className="border-b bg-slate-100">

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Student
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Teacher
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Batch
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Course
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {attendance.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-500"
                    >
                      No attendance records found.
                    </td>

                  </tr>

                ) : (

                  attendance.map((record) => (

                    <tr
                      key={record._id}
                      className="border-b transition hover:bg-slate-50"
                    >

                      <td className="px-4 py-4">

                        <div>

                          <p className="font-semibold text-slate-800">
                            {record.student?.fullName}
                          </p>

                          <p className="text-sm text-slate-500">
                            {record.student?.email}
                          </p>

                        </div>

                      </td>

                      <td className="px-4 py-4">
                        {record.teacher?.fullName}
                      </td>

                      <td className="px-4 py-4">
                        {record.batch?.batchName}
                      </td>

                      <td className="px-4 py-4">
                        {record.batch?.course}
                      </td>

                      <td className="px-4 py-4">
                        {new Date(
                          record.date
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold
                          ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : record.status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : record.status === "Late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {record.status}
                        </span>

                      </td>

                      <td className="px-4 py-4">
                        {record.remarks || "-"}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}
          </DashboardLayout>
  );
};

export default AttendanceReports;