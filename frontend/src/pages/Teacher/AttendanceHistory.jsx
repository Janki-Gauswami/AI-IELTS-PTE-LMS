import { useEffect, useMemo, useState } from "react";
import {
  getAttendance,
  updateAttendance,
} from "../../services/attendanceService";
import { getMyBatches } from "../../services/teacherDashboardService";

const STATUS = ["Present", "Absent", "Late", "Excused"];

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({
    date: "",
    batch: "",
    student: "",
    page: 1,
    limit: 10,
  });

  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [attendanceRes, batchRes] = await Promise.all([
        getAttendance(filters),
        getMyBatches(),
      ]);

      setRecords(attendanceRes.data || []);
      setBatches(batchRes.data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.page, filters.limit]);

  const applyFilters = () => {
    loadData();
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const key = filters.student.toLowerCase();
      if (!key) return true;
      const name = r.student?.fullName?.toLowerCase() || "";
      const email = r.student?.email?.toLowerCase() || "";
      return name.includes(key) || email.includes(key);
    });
  }, [records, filters.student]);

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
      alert("Attendance updated successfully.");
      setSelected(null);
      loadData();
    } catch (err) {
      alert(err.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance History</h1>
        <p className="text-slate-500">
          View and edit attendance for your assigned batches.
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow grid gap-4 md:grid-cols-4">
        <input
          type="date"
          value={filters.date}
          onChange={(e)=>setFilters({...filters,date:e.target.value})}
          className="border rounded-lg p-3"
        />

        <select
          value={filters.batch}
          onChange={(e)=>setFilters({...filters,batch:e.target.value})}
          className="border rounded-lg p-3"
        >
          <option value="">All Batches</option>
          {batches.map(b=>(
            <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
          ))}
        </select>

        <input
          placeholder="Search Student"
          value={filters.student}
          onChange={(e)=>setFilters({...filters,student:e.target.value})}
          className="border rounded-lg p-3"
        />

        <button
          onClick={applyFilters}
          className="rounded-lg bg-blue-600 text-white"
        >
          Apply Filters
        </button>
      </div>

      <div className="rounded-xl bg-white shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">#</th>
                <th>Student</th>
                <th>Batch</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan="7" className="p-8 text-center">No attendance records found.</td></tr>
              ) : filtered.map((r,i)=>(
                <tr key={r._id} className="border-b">
                  <td className="p-3">{i+1}</td>
                  <td>{r.student?.fullName}<br/><span className="text-xs text-slate-500">{r.student?.email}</span></td>
                  <td>{r.batch?.batchName}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.status}</td>
                  <td>{r.remarks || "-"}</td>
                  <td>
                    <button
                      onClick={()=>openEdit(r)}
                      className="rounded bg-blue-600 px-3 py-1 text-white"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
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
              className="w-full border rounded-lg p-3"
            >
              {STATUS.map(s=>(
                <option key={s}>{s}</option>
              ))}
            </select>

            <textarea
              value={remarks}
              onChange={(e)=>setRemarks(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={4}
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
                onClick={saveEdit}
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
