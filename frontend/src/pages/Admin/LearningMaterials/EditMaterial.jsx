import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getLearningMaterialById,
  updateLearningMaterial,
} from "../../../services/learningMaterialService";

import { getAllBatches } from "../../../services/batchService";

const EditMaterial = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================
  // State
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
    status: "Active",
  });

  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingBatches, setLoadingBatches] =
    useState(true);

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
  // Fetch Material & Batches
  // ==========================================

  useEffect(() => {
    fetchMaterial();
    fetchBatches();
  }, [id]);

  // ==========================================
  // Fetch Material
  // ==========================================

  const fetchMaterial = async () => {
    try {
      setLoading(true);

      const response =
        await getLearningMaterialById(id);

      const material = response.data;

      if (!material) {
        alert(
          "Learning material not found."
        );

        navigate(
          "/admin/learning-materials"
        );

        return;
      }

      setFormData({
        title: material.title || "",
        description:
          material.description || "",
        materialType:
          material.materialType || "",
        resourceUrl:
          material.resourceUrl || "",
        thumbnail:
          material.thumbnail || "",
        course: material.course || "",
        module: material.module || "",
        batch:
          material.batch?._id ||
          material.batch ||
          "",
        status:
          material.status || "Active",
      });
    } catch (error) {
      console.error(
        "Fetch Learning Material Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load learning material."
      );

      navigate(
        "/admin/learning-materials"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Fetch Batches
  // ==========================================

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response =
        await getAllBatches();

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
  // Handle Change
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

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
  // Submit
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

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

        status:
          formData.status,
      };

      await updateLearningMaterial(
        id,
        materialData
      );

      alert(
        "Learning material updated successfully."
      );

      navigate(
        "/admin/learning-materials"
      );
    } catch (error) {
      console.error(
        "Update Learning Material Error:",
        error
      );

      alert(
        error.message ||
          "Failed to update learning material."
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
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg text-slate-500">
          Loading learning material...
        </p>
      </div>
    );
  }

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">

      {/* ==========================================
          Header
      ========================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Edit Learning Material
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the learning resource information.
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
                required
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                rows={4}
                maxLength={1000}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

          </div>

        </div>

        {/* ==========================================
            Course
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
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

            </div>

          </div>

        </div>

        {/* ==========================================
            Resource
        ========================================== */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Resource Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Type */}

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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

            {/* URL */}

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
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

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
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

          </div>

        </div>

        {/* ==========================================
            Status
        ========================================== */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Material Status
          </h2>

          <div className="max-w-md">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

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
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {saving
              ? "Updating Material..."
              : "Update Material"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditMaterial;