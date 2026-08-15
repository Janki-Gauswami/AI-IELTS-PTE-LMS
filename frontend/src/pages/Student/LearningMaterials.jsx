import { useEffect, useState } from "react";

import {
  getLearningMaterials,
} from "../../services/learningMaterialService";


import DashboardLayout from "../../components/Dashboard/DashboardLayout";

const LearningMaterials = () => {
  // ======================================================
  // State
  // ======================================================

  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    course: "",
    module: "",
    materialType: "",
  });

  // ======================================================
  // Fetch Materials
  // ======================================================

  useEffect(() => {
    fetchMaterials();
  }, [
    filters.search,
    filters.course,
    filters.module,
    filters.materialType,
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
          status: "Active",
        });

      setMaterials(response.data || []);
    } catch (error) {
      console.error(
        "Fetch Student Learning Materials Error:",
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
  // Filter Change
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
    });
  };

  // ======================================================
  // Open Resource
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
  // Material Type Information
  // ======================================================

  const getMaterialTypeInfo = (type) => {
    const types = {
      PDF: {
        icon: "📄",
        style:
          "bg-red-100 text-red-700",
      },

      Video: {
        icon: "🎥",
        style:
          "bg-purple-100 text-purple-700",
      },

      Audio: {
        icon: "🎧",
        style:
          "bg-green-100 text-green-700",
      },

      Document: {
        icon: "📝",
        style:
          "bg-blue-100 text-blue-700",
      },

      Link: {
        icon: "🔗",
        style:
          "bg-gray-100 text-gray-700",
      },
    };

    return (
      types[type] || {
        icon: "📚",
        style:
          "bg-gray-100 text-gray-700",
      }
    );
  };

  // ======================================================
  // Course Style
  // ======================================================

  const getCourseStyle = (course) => {
    if (course === "IELTS") {
      return "bg-blue-100 text-blue-700";
    }

    if (course === "PTE") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-gray-100 text-gray-700";
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
    <DashboardLayout>
    <div className="space-y-6">

      {/* ==================================================
          Header
      ================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Learning Materials
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Access your IELTS and PTE learning resources.
        </p>
      </div>

      {/* ==================================================
          Filters
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-700">
            Find Learning Materials
          </h2>

          <p className="text-sm text-slate-500">
            Search and filter the resources available to you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* Search */}

          <div className="lg:col-span-1">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search materials..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

        </div>

        {/* Clear */}

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
          Materials
      ================================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-semibold text-slate-700">
              Available Materials
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {materials.length} material
              {materials.length !== 1
                ? "s"
                : ""}{" "}
              available
            </p>

          </div>

          {loading && (
            <span className="text-sm text-slate-400">
              Updating...
            </span>
          )}

        </div>

        {/* ==================================================
            Empty State
        ================================================== */}

        {materials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">

            <div className="mb-4 text-5xl">
              📚
            </div>

            <h3 className="text-lg font-semibold text-slate-700">
              No learning materials found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No learning materials match your current
              filters. Try changing the filters or check
              again later.
            </p>

          </div>
        ) : (

          /* ==================================================
             Material Grid
          ================================================== */

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

            {materials.map(
              (material) => {
                const typeInfo =
                  getMaterialTypeInfo(
                    material.materialType
                  );

                return (
                  <div
                    key={material._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Thumbnail */}

                    <div className="relative h-44 overflow-hidden bg-slate-100">

                      {material.thumbnail ? (
                        <img
                          src={
                            material.thumbnail
                          }
                          alt={
                            material.title
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100">

                          <span className="text-6xl">
                            {typeInfo.icon}
                          </span>

                        </div>
                      )}

                      {/* Type */}

                      <div className="absolute left-3 top-3">

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${typeInfo.style}`}
                        >
                          <span>
                            {typeInfo.icon}
                          </span>

                          {
                            material.materialType
                          }
                        </span>

                      </div>

                    </div>

                    {/* Content */}

                    <div className="p-5">

                      {/* Course + Module */}

                      <div className="mb-3 flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getCourseStyle(
                            material.course
                          )}`}
                        >
                          {material.course}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {material.module}
                        </span>

                      </div>

                      {/* Title */}

                      <h3 className="line-clamp-2 text-lg font-semibold text-slate-800">
                        {material.title}
                      </h3>

                      {/* Description */}

                      <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
                        {material.description ||
                          "No description available."}
                      </p>

                      {/* Batch */}

                      {material.batch && (
                        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">

                          <p className="text-xs text-slate-400">
                            Batch
                          </p>

                          <p className="text-sm font-medium text-slate-600">
                            {
                              material.batch
                                .batchName
                            }
                          </p>

                        </div>
                      )}

                      {/* Button */}

                      <button
                        onClick={() =>
                          handleOpenMaterial(
                            material.resourceUrl
                          )
                        }
                        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                      >
                        Open Material
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
    </DashboardLayout>
  );
};

export default LearningMaterials;