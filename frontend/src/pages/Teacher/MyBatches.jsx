import { useEffect, useMemo, useState } from "react";

import TeacherBatchCard from "../../components/teacher/TeacherBatchCard";
import { getMyBatches } from "../../services/teacherDashboardService";

const MyBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetchBatches();
  }, []);

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

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesSearch =
        batch.batchName
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCourse =
        course === "All" ||
        batch.course === course;

      const matchesStatus =
        status === "All" ||
        batch.status === status;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesStatus
      );
    });
  }, [batches, search, course, status]);

  return (
    <div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            My Batches
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage your assigned batches.
          </p>

        </div>

      </div>

      {/* Filters */}

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <div className="grid md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Search batch..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border rounded-lg p-3"
          />

          <select
            value={course}
            onChange={(e) =>
              setCourse(e.target.value)
            }
            className="border rounded-lg p-3"
          >
            <option value="All">All Courses</option>
            <option value="IELTS">IELTS</option>
            <option value="PTE">PTE</option>
          </select>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="border rounded-lg p-3"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

      </div>

      {/* Batch Cards */}

      {loading ? (
        <div className="text-center py-16">
          Loading batches...
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          No batches found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredBatches.map((batch) => (
            <TeacherBatchCard
              key={batch.batchId}
              batch={batch}
            />
          ))}

        </div>
      )}

    </div>
  );
};

export default MyBatches;