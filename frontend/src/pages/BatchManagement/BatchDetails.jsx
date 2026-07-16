import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";

import { getBatchById } from "../../services/batchService";

const BatchDetails = () => {
  const { id } = useParams();

  const [batch, setBatch] = useState(null);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // Fetch Batch
  // ==========================================

  useEffect(() => {
    fetchBatch();
  }, []);

  const fetchBatch = async () => {
    try {
      const response = await getBatchById(id);

      setBatch(response.batch);
    } catch (error) {
      console.error(error);

      alert(
        error.message || "Failed to fetch batch."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <h2 className="text-xl font-semibold text-slate-600">
            Loading Batch...
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // Not Found
  // ==========================================

  if (!batch) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <h2 className="text-2xl font-bold text-red-600">
            Batch Not Found
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            {batch.batchName}
          </h1>

          <p className="mt-2 text-slate-500">
            Batch Details
          </p>

        </div>

        <Link
          to={`/admin/batches/edit/${batch._id}`}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Edit Batch
        </Link>

      </div>

      {/* Information */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Batch Information */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-semibold">
            Batch Information
          </h2>

          <Info
            label="Course"
            value={batch.course}
          />

          <Info
            label="Status"
            value={batch.status}
          />

          <Info
            label="Capacity"
            value={batch.capacity}
          />

          <Info
            label="Current Strength"
            value={batch.currentStrength}
          />

          <Info
            label="Start Date"
            value={new Date(
              batch.startDate
            ).toLocaleDateString()}
          />

          <Info
            label="End Date"
            value={new Date(
              batch.endDate
            ).toLocaleDateString()}
          />

        </div>

        {/* Schedule */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-semibold">
            Schedule
          </h2>

          <Info
            label="Days"
            value={batch.schedule?.days?.join(", ")}
          />

          <Info
            label="Start Time"
            value={batch.schedule?.startTime}
          />

          <Info
            label="End Time"
            value={batch.schedule?.endTime}
          />

        </div>

      </div>

      {/* Teachers */}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-5 text-xl font-semibold">
          Assigned Teachers
        </h2>

        {batch.teachers?.length > 0 ? (

          <div className="space-y-3">

            {batch.teachers.map((teacher) => (

              <div
                key={teacher._id}
                className="rounded-lg border p-4"
              >

                <h3 className="font-semibold">
                  {teacher.name}
                </h3>

                <p className="text-sm text-slate-500">
                  {teacher.email}
                </p>

              </div>

            ))}

          </div>

        ) : (

          <p className="text-slate-500">
            No teachers assigned.
          </p>

        )}

      </div>

      {/* Description */}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-5 text-xl font-semibold">
          Description
        </h2>

        <p className="leading-7 text-slate-600">
          {batch.description || "No description available."}
        </p>

      </div>

    </DashboardLayout>
  );
};

// ==========================================
// Reusable Info Component
// ==========================================

const Info = ({ label, value }) => (
  <div className="flex justify-between border-b py-3">

    <span className="font-medium text-slate-600">
      {label}
    </span>

    <span className="font-semibold text-slate-800">
      {value || "-"}
    </span>

  </div>
);

export default BatchDetails;