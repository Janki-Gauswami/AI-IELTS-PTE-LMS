import { useEffect, useMemo, useState } from "react";
import {
  getAttendance,
  updateAttendance,
  deleteAttendance,
} from "../../services/attendanceService";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";

const STATUS = ["", "Present", "Absent", "Late", "Excused"];

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({
    date: "",
    batch: "",
    teacher: "",
    student: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAttendance(filters);
      setRecords(res.data || []);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.page, filters.limit]);

  const filtered = useMemo(() => records, [records]);

  const openEdit = (row) => {
    setSelected(row);
    setEditStatus(row.status);
    setRemarks(row.remarks || "");
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      await updateAttendance(selected._id, {
        status: editStatus,
        remarks,
      });
      alert("Attendance updated.");
      setSelected(null);
      loadData();
    } catch (e) {
      alert(e.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (id) => {
    if (!window.confirm("Delete this attendance record?")) return;

    try {
      await deleteAttendance(id);
      alert("Attendance deleted.");
      loadData();
    } catch (e) {
      alert(e.message || "Delete failed.");
    }
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance History</h1>
        <p className="text-slate-500">
          View, update and delete attendance records.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl bg-white p-5 shadow md:grid-cols-6">
        <input
          type="date"
          className="rounded border p-3"
          value={filters.date}
          onChange={(e)=>setFilters({...filters,date:e.target.value})}
        />

        <input
          className="rounded border p-3"
          placeholder="Batch ID"
          value={filters.batch}
          onChange={(e)=>setFilters({...filters,batch:e.target.value})}
        />

        <input
          className="rounded border p-3"
          placeholder="Teacher ID"
          value={filters.teacher}
          onChange={(e)=>setFilters({...filters,teacher:e.target.value})}
        />

        <input
          className="rounded border p-3"
          placeholder="Search Student"
          value={filters.student}
          onChange={(e)=>setFilters({...filters,student:e.target.value})}
        />

        <select
          className="rounded border p-3"
          value={filters.status}
          onChange={(e)=>setFilters({...filters,status:e.target.value})}
        >
          {STATUS.map(s=>(
            <option key={s} value={s}>{s || "All Status"}</option>
          ))}
        </select>

        <button
          onClick={loadData}
          className="rounded bg-blue-600 text-white"
        >
          Apply
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">#</th>
                <th>Student</th>
                <th>Teacher</th>
                <th>Batch</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r._id} className="border-b">
                    <td className="p-3">{i + 1}</td>
                    <td>
                      {r.student?.fullName}
                      <div className="text-xs text-slate-500">
                        {r.student?.email}
                      </div>
                    </td>
                    <td>{r.teacher?.fullName}</td>
                    <td>{r.batch?.batchName}</td>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.status}</td>
                    <td>{r.remarks || "-"}</td>
                    <td className="space-x-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => removeRecord(r._id)}
                        className="rounded bg-red-600 px-3 py-1 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 space-y-4">
            <h2 className="text-xl font-bold">Edit Attendance</h2>

            <select
              value={editStatus}
              onChange={(e)=>setEditStatus(e.target.value)}
              className="w-full rounded border p-3"
            >
              {STATUS.filter(Boolean).map(s=>(
                <option key={s}>{s}</option>
              ))}
            </select>

            <textarea
              rows="4"
              value={remarks}
              onChange={(e)=>setRemarks(e.target.value)}
              className="w-full rounded border p-3"
              placeholder="Remarks"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={()=>setSelected(null)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={saveEdit}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default AttendanceHistory;