import { useEffect, useState } from "react";
import {
  getMyBatches,
  getMyStudents,
} from "../../services/teacherDashboardService";
import { markAttendance } from "../../services/attendanceService";

const Attendance = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudents(selectedBatch);
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await getMyBatches();
      setBatches(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (batchId) => {
    try {
      setLoadingStudents(true);
      const response = await getMyStudents(batchId);
      const studentList = response.students || [];
      setStudents(studentList);

      const initialAttendance = {};
      studentList.forEach((student) => {
        initialAttendance[student.studentId] = "Present";
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <h2 className="text-xl font-semibold">Loading Batches...</h2>
      </div>
    );
  }

  const handleSaveAttendance = async () => {
  try {
    setSaving(true);

    const attendanceDate = new Date()
      .toISOString()
      .split("T")[0];

    for (const student of students) {
      await markAttendance({
        student: student.studentId,
        batch: selectedBatch,
        date: attendanceDate,
        status: attendance[student.studentId],
        remarks: "",
      });
    }

    alert("Attendance saved successfully.");
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to save attendance.");
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Take Attendance</h1>
        <p className="mt-2 text-slate-500">
          Mark attendance for students in your assigned batches.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select Batch
            </label>

            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="">-- Select Batch --</option>
              {batches.map((batch) => (
                <option key={batch.batchId} value={batch.batchId}>
                  {batch.batchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date
            </label>

            <input
              type="text"
              value={today}
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow">
        <div className="border-b p-5">
          <h2 className="text-xl font-semibold text-slate-700">
            Student Attendance
          </h2>
        </div>

        <div className="overflow-x-auto">
          {!selectedBatch && (
            <div className="p-8 text-center text-slate-500">
              Select a batch to load students.
            </div>
          )}

          {selectedBatch && loadingStudents && (
            <div className="p-8 text-center text-slate-500">
              Loading students...
            </div>
          )}

          {selectedBatch && !loadingStudents && students.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No students found in this batch.
            </div>
          )}

          {selectedBatch && !loadingStudents && students.length > 0 && (
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="w-16 px-4 py-4 text-center">#</th>
                  <th className="px-6 py-4 text-left">Student</th>
                  <th className="px-4 py-4 text-center">Present</th>
                  <th className="px-4 py-4 text-center">Absent</th>
                  <th className="px-4 py-4 text-center">Late</th>
                  <th className="px-4 py-4 text-center">Excused</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => (
                  <tr key={student.studentId} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-4 text-center">{index + 1}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {student.profilePicture ? (
                          <img
                            src={student.profilePicture}
                            alt={student.name}
                            className="h-11 w-11 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {["Present", "Absent", "Late", "Excused"].map((status) => (
                      <td key={status} className="text-center">
                        <label className="flex justify-center cursor-pointer">
                          <input
                            type="radio"
                            name={student.studentId}
                            value={status}
                            checked={attendance[student.studentId] === status}
                            onChange={() =>
                              handleAttendanceChange(student.studentId, status)
                            }
                            className="h-4 w-4 accent-blue-600"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveAttendance}
          disabled={
            !selectedBatch ||
            loadingStudents ||
            students.length === 0 ||
            saving
          }
          className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {saving ? "Saving Attendance..." : "Save Attendance"}
        </button>

      </div>
    </div>
  );
};

export default Attendance;