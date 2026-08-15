import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getLearningMaterials,
  deleteLearningMaterial,
} from "../../services/learningMaterialService";

import {
  getMyBatches,
} from "../../services/teacherDashboardService";

const LearningMaterials = () => {
  const navigate = useNavigate();

  // ======================================================
  // State
  // ======================================================

  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBatches, setLoadingBatches] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  // ======================================================
  // Filters
  // ======================================================

  const [filters, setFilters] = useState({
    search: "",
    course: "",
    module: "",
    materialType: "",
    batch: "",
    status: "Active",
  });

  // ======================================================
  // Fetch Teacher Batches
  // ======================================================

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response = await getMyBatches();

      setBatches(response.data || []);
    } catch (error) {
      console.error(
        "Fetch Teacher Batches Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load assigned batches."
      );
    } finally {
      setLoadingBatches(false);
    }
  };

  // ======================================================
  // Fetch Materials
  // ======================================================

  useEffect(() => {
    if (!loadingBatches) {
      fetchMaterials();
    }
  }, [
    filters.search,
    filters.course,
    filters.module,
    filters.materialType,
    filters.batch,
    filters.status,
    loadingBatches,
  ]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const response =
        await getLearningMaterials({
          search: filters.search,
          course: filters.course,
          module: filters.module,
          materialType:
            filters.materialType,
          batch: filters.batch,
          status: filters.status,
        });

      setMaterials(response.data || []);
    } catch (error) {
      console.error(
        "Fetch Learning Materials Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load learning materials."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Handle Filter Change
  // ======================================================

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // Clear Filters
  // ======================================================

  const handleClearFilters = () => {
    setFilters({
      search: "",
      course: "",
      module: "",
      materialType: "",
      batch: "",
      status: "Active",
    });
  };

  // ======================================================
  // Open Material
  // ======================================================

  const handleOpenMaterial = (url) => {
    if (!url) {
      alert(
        "Resource URL is not available."
      );
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ======================================================
  // Delete Material
  // ======================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this learning material?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteLearningMaterial(id);

      alert(
        "Learning material deleted successfully."
      );

      await fetchMaterials();
    } catch (error) {
      console.error(
        "Delete Learning Material Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete learning material."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // Material Type Badge
  // ======================================================

  const getMaterialTypeBadge = (type) => {
    const styles = {
      PDF: "bg-red-100 text-red-700",
      Video: "bg-purple-100 text-purple-700",
      Audio: "bg-green-100 text-green-700",
      Document:
        "bg-blue-100 text-blue-700",
      Link: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          styles[type] ||
          "bg-gray-100 text-gray-700"
        }`}
      >
        {type}
      </span>
    );
  };

  // ======================================================
  // Course Badge
  // ======================================================

  const getCourseBadge = (course) => {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {course}
      </span>
    );
  };

  // ======================================================
  // Loading
  // ======================================================

  if (
    loading &&
    materials.length === 0
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-medium text-slate-500">
          Loading learning materials...
        </p>
      </div>
    );
  }

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="space-y-6">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Learning Materials
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage learning resources for your assigned batches.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              "/teacher/learning-materials/add"
            )
          }
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Material
        </button>

      </div>

      {/* ==================================================
          Assigned Batch Information
      ================================================== */}

      <div className="rounded-2xl bg-blue-50 p-5">

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-semibold text-blue-800">
              Your Assigned Batches
            </h2>

            <p className="text-sm text-blue-600">
              Materials can be managed for your assigned batches.
            </p>
          </div>

          <div className="font-semibold text-blue-700">
            {batches.length} Batch
            {batches.length !== 1
              ? "es"
              : ""}
          </div>

        </div>

      </div>

      {/* ==================================================
          Filters
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-700">
            Search & Filters
          </h2>

          <p className="text-sm text-slate-500">
            Find materials from your assigned batches.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {/* Search */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search material..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Course */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Course
            </label>

            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                All Courses
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
            </label>

            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                All Modules
              </option>

              <option value="Listening">
                Listening
              </option>

              <option value="Reading">
                Reading
              </option>

              <option value="Speaking">
                Speaking
              </option>

              <option value="Writing">
                Writing
              </option>
            </select>
          </div>

          {/* Material Type */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Material Type
            </label>

            <select
              name="materialType"
              value={filters.materialType}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                All Types
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

          {/* Batch */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Batch
            </label>

            <select
              name="batch"
              value={filters.batch}
              onChange={handleFilterChange}
              disabled={loadingBatches}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
            >
              <option value="">
                All Assigned Batches
              </option>

              {batches.map((batch) => (
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
              ))}
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

              <option value="">
                All Status
              </option>
            </select>
          </div>

        </div>

        <div className="mt-5 flex justify-end">

          <button
            onClick={handleClearFilters}
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Clear Filters
          </button>

        </div>

      </div>

      {/* ==================================================
          Materials Table
      ================================================== */}

      <div className="overflow-hidden rounded-2xl bg-white shadow">

        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-xl font-semibold text-slate-700">
              My Learning Materials
            </h2>

            <p className="text-sm text-slate-500">
              {materials.length} material
              {materials.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {loading && (
            <span className="text-sm text-slate-400">
              Updating...
            </span>
          )}

        </div>

        <div className="overflow-x-auto">

          {materials.length === 0 ? (
            <div className="p-12 text-center">

              <div className="mb-3 text-5xl">
                📚
              </div>

              <h3 className="text-lg font-semibold text-slate-700">
                No learning materials found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing the filters or add a new material.
              </p>

            </div>
          ) : (
            <table className="min-w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                    Material
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                    Course
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                    Module
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                    Batch
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {materials.map(
                  (material, index) => (
                    <tr
                      key={material._id}
                      className="border-b transition hover:bg-slate-50"
                    >

                      {/* Number */}

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      {/* Material */}

                      <td className="max-w-xs px-5 py-4">

                        <div className="flex items-center gap-3">

                          {material.thumbnail ? (
                            <img
                              src={
                                material.thumbnail
                              }
                              alt={
                                material.title
                              }
                              className="h-12 w-12 rounded-lg border object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl">
                              📚
                            </div>
                          )}

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-700">
                              {material.title}
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {material.description ||
                                "No description"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Course */}

                      <td className="px-5 py-4">
                        {getCourseBadge(
                          material.course
                        )}
                      </td>

                      {/* Module */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {material.module}
                      </td>

                      {/* Type */}

                      <td className="px-5 py-4">
                        {getMaterialTypeBadge(
                          material.materialType
                        )}
                      </td>

                      {/* Batch */}

                      <td className="px-5 py-4 text-sm text-slate-600">

                        {material.batch ? (
                          <span className="font-medium">
                            {
                              material.batch
                                .batchName
                            }
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            All Batches
                          </span>
                        )}

                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-2">

                          {/* View */}

                          <button
                            onClick={() =>
                              handleOpenMaterial(
                                material.resourceUrl
                              )
                            }
                            className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-200"
                          >
                            View
                          </button>

                          {/* Edit */}

                          <button
                            onClick={() =>
                              navigate(
                                `/teacher/learning-materials/edit/${material._id}`
                              )
                            }
                            className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-200"
                          >
                            Edit
                          </button>

                          {/* Delete */}

                          <button
                            onClick={() =>
                              handleDelete(
                                material._id
                              )
                            }
                            disabled={
                              deletingId ===
                              material._id
                            }
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            material._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </div>

    </div>
  );
};

export default LearningMaterials;