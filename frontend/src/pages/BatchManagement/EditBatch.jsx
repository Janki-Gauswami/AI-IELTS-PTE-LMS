import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import BatchForm from "../../components/BatchManagement/BatchForm";

import {
  getBatchById,
  updateBatch,
} from "../../services/batchService";

const EditBatch = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [batchData, setBatchData] = useState(null);

  // ==========================================
  // Fetch Batch
  // ==========================================

  useEffect(() => {
    fetchBatch();
  }, []);

  const fetchBatch = async () => {
    try {
      const response = await getBatchById(id);

      const batch = response.batch;

      setBatchData({
        batchName: batch.batchName,

        course: batch.course,

        teachers: batch.teachers || [],

        days: batch.schedule?.days || [],

        startTime: batch.schedule?.startTime || "",

        endTime: batch.schedule?.endTime || "",

        startDate: batch.startDate
          ? batch.startDate.substring(0, 10)
          : "",

        endDate: batch.endDate
          ? batch.endDate.substring(0, 10)
          : "",

        capacity: batch.capacity,

        description: batch.description,

        status: batch.status,
      });

    } catch (error) {

      console.error(error);

      alert(
        error.message || "Failed to load batch."
      );

    } finally {

      setPageLoading(false);

    }
  };

  // ==========================================
  // Update Batch
  // ==========================================

  const handleUpdateBatch = async (formData) => {
    try {

      setLoading(true);

      const payload = {
        batchName: formData.batchName,

        course: formData.course,

        teachers: formData.teachers,

        schedule: {
          days: formData.days,
          startTime: formData.startTime,
          endTime: formData.endTime,
        },

        startDate: formData.startDate,

        endDate: formData.endDate,

        capacity: Number(formData.capacity),

        description: formData.description,

        status: formData.status,
      };

      const response = await updateBatch(id, payload);

      alert(
        response.message || "Batch updated successfully."
      );

      navigate("/admin/batches");

    } catch (error) {

      console.error(error);

      alert(
        error.message || "Failed to update batch."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // Loading Screen
  // ==========================================

  if (pageLoading) {
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

  return (
    <DashboardLayout>

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Edit Batch
        </h1>

        <p className="mt-2 text-slate-500">
          Update the batch information.
        </p>

      </div>

      <BatchForm
        initialValues={batchData}
        onSubmit={handleUpdateBatch}
        loading={loading}
      />

    </DashboardLayout>
  );
};

export default EditBatch;