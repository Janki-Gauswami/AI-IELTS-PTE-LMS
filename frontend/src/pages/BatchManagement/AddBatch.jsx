import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import BatchForm from "../../components/BatchManagement/BatchForm";

import { createBatch } from "../../services/batchService";

const AddBatch = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // ==========================================
  // Create Batch
  // ==========================================

  const handleCreateBatch = async (formData) => {
    try {
      setLoading(true);

      const payload = {
        batchName: formData.batchName,
        course: formData.course,
        batchType: formData.batchType,   // <-- ADD THIS
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

      const response = await createBatch(payload);

      alert(response.message || "Batch created successfully.");

      navigate("/admin/batches");

    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Failed to create batch."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <DashboardLayout>

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Add New Batch
        </h1>

        <p className="mt-2 text-slate-500">
          Create a new IELTS or PTE batch.
        </p>

      </div>

      {/* Form */}

      <BatchForm
        onSubmit={handleCreateBatch}
        loading={loading}
      />

    </DashboardLayout>
  );
};

export default AddBatch;