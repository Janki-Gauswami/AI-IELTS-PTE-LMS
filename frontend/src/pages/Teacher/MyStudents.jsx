import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getMyStudents } from "../../services/teacherDashboardService";

const MyStudents = () => {
  const [searchParams] = useSearchParams();

  const batchId = searchParams.get("batch");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batchId) {
      fetchStudents();
    }
  }, [batchId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await getMyStudents(batchId);

      setStudents(response.students || []);
    } catch (error) {
      console.error("Fetch Students Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          My Students
        </h1>

        <p className="text-gray-500 mt-2">
          View students enrolled in the selected batch.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Selected Batch
        </h2>

        <p className="text-blue-600 break-all">
          {batchId}
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          Loading students...
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          No students found in this batch.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr
                  key={student.studentId}
                  className="border-t"
                >
                  <td className="p-4">
                    {student.name}
                  </td>

                  <td className="p-4">
                    {student.email}
                  </td>

                  <td className="p-4">
                    {student.phone || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyStudents;