import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createLearningMaterial } from "../../../services/learningMaterialService";
import { getAllBatches } from "../../../services/batchService";


import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

const AddMaterial = () => {
  const navigate = useNavigate();

  // ==========================================
  // Form State
  // ==========================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    materialType: "",
    resourceUrl: "",
    thumbnail: "",
    course: "",
    module: "",
    batch: "",
  });

  const [batches, setBatches] = useState([]);

  const [loadingBatches, setLoadingBatches] = useState(true);

  const [saving, setSaving] = useState(false);

  // ==========================================
  // Module Options
  // ==========================================

  const ieltsModules = [
    "Listening",
    "Reading",
    "Speaking",
    "Writing",
  ];

  const pteModules = [
    "Speaking",
    "Writing",
    "Reading",
    "Listening",
  ];

  // ==========================================
  // Fetch Batches
  // ==========================================

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response = await getAllBatches();

      setBatches(response.data || []);
    } catch (error) {
      console.error(
        "Fetch Batches Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load batches."
      );
    } finally {
      setLoadingBatches(false);
    }
  };

  // ==========================================
  // Handle Input Change
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If course changes, reset module and batch
    if (name === "course") {
      setFormData((prev) => ({
        ...prev,
        course: value,
        module: "",
        batch: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // Reset Form
  // ==========================================

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      materialType: "",
      resourceUrl: "",
      thumbnail: "",
      course: "",
      module: "",
      batch: "",
    });
  };

  // ==========================================
  // Submit Form
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // Basic Validation
    // ==========================================

    if (
      !formData.title ||
      !formData.materialType ||
      !formData.resourceUrl ||
      !formData.course ||
      !formData.module
    ) {
      alert(
        "Please fill all required fields."
      );

      return;
    }

    try {
      setSaving(true);

      const materialData = {
        title: formData.title.trim(),

        description:
          formData.description.trim(),

        materialType:
          formData.materialType,

        resourceUrl:
          formData.resourceUrl.trim(),

        thumbnail:
          formData.thumbnail.trim(),

        course:
          formData.course,

        module:
          formData.module,

        batch:
          formData.batch || null,
      };

      await createLearningMaterial(
        materialData
      );

      alert(
        "Learning material created successfully."
      );

      navigate(
        "/admin/learning-materials"
      );
    } catch (error) {
      console.error(
        "Create Learning Material Error:",
        error
      );

      alert(
        error.message ||
          "Failed to create learning material."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Filter Batches By Course
  // ==========================================

  const filteredBatches = batches.filter(
    (batch) =>
      !formData.course ||
      batch.course === formData.course
  );

  // ==========================================
  // Render
  // ==========================================

  return (
    <DashboardLayout>
    <div className="space-y-6">

      {/* ==========================================
          Header
      ========================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Add Learning Material
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new IELTS or PTE learning resource.
        </p>
      </div>

      {/* ==========================================
          Form
      ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow"
      >

        {/* ==========================================
            Basic Information
        ========================================== */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Title */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Material Title
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter material title"
                required
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

            {/* Description */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a short description"
                rows={4}
                maxLength={1000}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

          </div>

        </div>

        {/* ==========================================
            Course Information
        ========================================== */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Course Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Course */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >

                <option value="">
                  -- Select Course --
                </option>

                <option value="IELTS">
                  IELTS
                </option>

                <option value="PTE">
                  PTE
                </option>

              </select>

            </div>

            {/* Module */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Module
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="module"
                value={formData.module}
                onChange={handleChange}
                required
                disabled={!formData.course}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >

                <option value="">
                  -- Select Module --
                </option>

                {formData.course ===
                  "IELTS" &&
                  ieltsModules.map(
                    (module) => (
                      <option
                        key={module}
                        value={module}
                      >
                        {module}
                      </option>
                    )
                  )}

                {formData.course ===
                  "PTE" &&
                  pteModules.map(
                    (module) => (
                      <option
                        key={module}
                        value={module}
                      >
                        {module}
                      </option>
                    )
                  )}

              </select>

            </div>

            {/* Batch */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Batch
              </label>

              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                disabled={
                  !formData.course ||
                  loadingBatches
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >

                <option value="">
                  All {formData.course || ""}
                  {" "}Batches
                </option>

                {filteredBatches.map(
                  (batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.batchName}
                    </option>
                  )
                )}

              </select>

              <p className="mt-1 text-xs text-slate-400">
                Leave empty if the material should
                be available to all batches of the
                selected course.
              </p>

            </div>

          </div>

        </div>

        {/* ==========================================
            Resource Information
        ========================================== */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Resource Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Material Type */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Material Type
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="materialType"
                value={formData.materialType}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >

                <option value="">
                  -- Select Type --
                </option>

                <option value="PDF">
                  PDF
                </option>

                <option value="Video">
                  Video
                </option>

                <option value="Audio">
                  Audio
                </option>

                <option value="Document">
                  Document
                </option>

                <option value="Link">
                  Link
                </option>

              </select>

            </div>

            {/* Resource URL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Resource URL
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="url"
                name="resourceUrl"
                value={formData.resourceUrl}
                onChange={handleChange}
                placeholder="https://example.com/resource"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-slate-400">
                Enter the URL of the PDF, video,
                audio, document, or external resource.
              </p>

            </div>

            {/* Thumbnail */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Thumbnail URL
                <span className="text-xs font-normal text-slate-400">
                  {" "}(Optional)
                </span>
              </label>

              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

          </div>

        </div>

        {/* ==========================================
            Preview
        ========================================== */}

        {(formData.title ||
          formData.materialType ||
          formData.course ||
          formData.module) && (
          <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-5">

            <h2 className="mb-4 text-lg font-semibold text-slate-700">
              Material Preview
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Title
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {formData.title ||
                    "Untitled Material"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Course
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {formData.course || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Module
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {formData.module || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Type
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {formData.materialType ||
                    "-"}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            Buttons
        ========================================== */}

        <div className="flex flex-col justify-end gap-3 border-t pt-6 sm:flex-row">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/learning-materials"
              )
            }
            disabled={saving}
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {saving
              ? "Saving Material..."
              : "Save Material"}
          </button>

        </div>

      </form>

    </div>
    </DashboardLayout>
  );
};

export default AddMaterial;