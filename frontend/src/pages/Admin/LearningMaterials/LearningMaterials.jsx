import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getLearningMaterials,
  deleteLearningMaterial,
} from "../../../services/learningMaterialService";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

const LearningMaterials = () => {
  const navigate = useNavigate();

  // ==========================================
  // State
  // ==========================================

  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    course: "",
    module: "",
    materialType: "",
    batch: "",
    status: "Active",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    currentRecords: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ==========================================
  // Fetch Materials
  // ==========================================

  useEffect(() => {
    fetchMaterials();
  }, [
    filters.search,
    filters.course,
    filters.module,
    filters.materialType,
    filters.batch,
    filters.status,
    filters.page,
    filters.limit,
  ]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const response =
        await getLearningMaterials(filters);

      setMaterials(response.data || []);

      setPagination(
        response.pagination || {
          totalRecords: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          currentRecords: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
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

  // ==========================================
  // Handle Filter Change
  // ==========================================

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  // ==========================================
  // Clear Filters
  // ==========================================

  const handleClearFilters = () => {
    setFilters({
      search: "",
      course: "",
      module: "",
      materialType: "",
      batch: "",
      status: "Active",
      page: 1,
      limit: 10,
    });
  };

  // ==========================================
  // Delete Material
  // ==========================================

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

      fetchMaterials();
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

  // ==========================================
  // Open Material
  // ==========================================

  const handleOpenMaterial = (url) => {
    if (!url) {
      alert("Resource URL is not available.");
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // Material Type Badge
  // ==========================================

  const getMaterialTypeBadge = (type) => {
    const styles = {
      PDF: "bg-red-100 text-red-700",
      Video: "bg-purple-100 text-purple-700",
      Audio: "bg-green-100 text-green-700",
      Document: "bg-blue-100 text-blue-700",
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

  // ==========================================
  // Course Badge
  // ==========================================

  const getCourseBadge = (course) => {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {course}
      </span>
    );
  };

  // ==========================================
  // Loading State
  // ==========================================

  if (loading && materials.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-lg font-medium text-slate-500">
          Loading learning materials...
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">

      {/* ==========================================
          Page Header
      ========================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Learning Materials
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage IELTS and PTE learning resources.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              "/admin/learning-materials/add"
            )
          }
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Material
        </button>

      </div>

      {/* ==========================================
          Filters
      ========================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-700">
            Search & Filters
          </h2>

          <p className="text-sm text-slate-500">
            Find learning materials quickly.
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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

            <input
              type="text"
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              placeholder="e.g. Reading"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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
              Batch ID
            </label>

            <input
              type="text"
              name="batch"
              value={filters.batch}
              onChange={handleFilterChange}
              placeholder="Enter batch ID"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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

      {/* ==========================================
          Materials Table
      ========================================== */}

      <div className="overflow-hidden rounded-2xl bg-white shadow">

        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-xl font-semibold text-slate-700">
              Materials
            </h2>

            <p className="text-sm text-slate-500">
              {pagination.totalRecords} material
              {pagination.totalRecords !== 1
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
                Try changing your filters or add
                a new material.
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

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                    Uploaded By
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
                        {(pagination.currentPage -
                          1) *
                          pagination.pageSize +
                          index +
                          1}
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
                          <div>
                            <p className="font-medium">
                              {
                                material.batch
                                  .batchName
                              }
                            </p>

                            <p className="text-xs text-slate-400">
                              {
                                material.batch
                                  .batchType
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            All Batches
                          </span>
                        )}

                      </td>

                      {/* Uploaded By */}

                      <td className="px-5 py-4 text-sm text-slate-600">

                        {material.uploadedBy ? (
                          <div>
                            <p className="font-medium">
                              {
                                material
                                  .uploadedBy
                                  .name
                              }
                            </p>

                            <p className="text-xs capitalize text-slate-400">
                              {
                                material
                                  .uploadedBy
                                  .role
                              }
                            </p>
                          </div>
                        ) : (
                          "-"
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
                            title="Open Material"
                            className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-200"
                          >
                            View
                          </button>

                          {/* Edit */}

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/learning-materials/edit/${material._id}`
                              )
                            }
                            title="Edit Material"
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
                            title="Delete Material"
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

        {/* ==========================================
            Pagination
        ========================================== */}

        {pagination.totalPages > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t p-5 sm:flex-row">

            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-700">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex gap-2">

              <button
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }))
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
    </DashboardLayout>
  );
};

export default LearningMaterials;