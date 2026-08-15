import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createLearningMaterial } from "../../services/learningMaterialService";
import { getMyBatches } from "../../services/teacherDashboardService";

const AddLearningMaterial = () => {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // ======================================================
  // Load Teacher Batches
  // ======================================================

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

      alert(
        error.message ||
          "Failed to load assigned batches."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Input Change
  // ======================================================

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

  // ======================================================
  // Submit
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.materialType ||
      !formData.resourceUrl ||
      !formData.course ||
      !formData.module ||
      !formData.batch
    ) {
      alert(
        "Please fill all required fields and select a batch."
      );

      return;
    }

    try {
      setSaving(true);

      await createLearningMaterial({
        title: formData.title.trim(),
        description:
          formData.description.trim(),
        materialType:
          formData.materialType,
        resourceUrl:
          formData.resourceUrl.trim(),
        thumbnail:
          formData.thumbnail.trim(),
        course: formData.course,
        module: formData.module,
        batch: formData.batch,
      });

      alert(
        "Learning material created successfully."
      );

      navigate(
        "/teacher/learning-materials"
      );
    } catch (error) {
      console.error(
        "Create Teacher Material Error:",
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

  // ======================================================
  // Filter Batches
  // ======================================================

  const filteredBatches = batches.filter(
    (batch) =>
      !formData.course ||
      batch.course === formData.course
  );

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Add Learning Material
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a learning resource for your assigned batch.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow"
      >

        {/* Basic Information */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Material Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Enter material title"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter description"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

        </div>

        {/* Course */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Course Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course *
              </label>

              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Module *
              </label>

              <select
                name="module"
                value={formData.module}
                onChange={handleChange}
                required
                disabled={!formData.course}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 disabled:bg-slate-100"
              >
                <option value="">
                  -- Select Module --
                </option>

                {formData.course === "IELTS" &&
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

                {formData.course === "PTE" &&
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

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assigned Batch *
              </label>

              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                required
                disabled={
                  !formData.course ||
                  loading
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 disabled:bg-slate-100"
              >
                <option value="">
                  -- Select Assigned Batch --
                </option>

                {filteredBatches.map(
                  (batch) => (
                    <option
                      key={
                        batch.batchId ||
                        batch._id
                      }
                      value={
                        batch.batchId ||
                        batch._id
                      }
                    >
                      {batch.batchName}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

        </div>

        {/* Resource */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Resource Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Material Type *
              </label>

              <select
                name="materialType"
                value={formData.materialType}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Resource URL *
              </label>

              <input
                type="url"
                name="resourceUrl"
                value={formData.resourceUrl}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Thumbnail URL
              </label>

              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>

          </div>

        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3 border-t pt-6">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/teacher/learning-materials"
              )
            }
            disabled={saving}
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving
              ? "Saving..."
              : "Save Material"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default AddLearningMaterial;