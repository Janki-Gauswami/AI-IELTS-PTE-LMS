import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DeleteBatchModal from "./DeleteBatchModal";

import useBatches from "../../hooks/useBatches";

const BatchList = () => {

  // =====================================
  // Custom Hook
  // =====================================

  const {
    batches,
    loading,
    error,
    removeBatch,
  } = useBatches();

  // =====================================
  // States
  // =====================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedBatch, setSelectedBatch] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  // Search

  const [searchTerm, setSearchTerm] =
    useState("");

  // Filters

  const [courseFilter, setCourseFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [sessionFilter, setSessionFilter] =
    useState("All");

  // Sorting

  const [sortBy, setSortBy] =
    useState("name");

  // Pagination

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 10;

  // =====================================
  // Statistics
  // =====================================

  const statistics = useMemo(() => {

    return {

      totalBatches: batches.length,

      activeBatches: batches.filter(
        batch => batch.status === "Active"
      ).length,

      inactiveBatches: batches.filter(
        batch => batch.status === "Inactive"
      ).length,

      totalStudents: batches.reduce(
        (total, batch) =>
          total + (batch.currentStrength || 0),
        0
      ),

    };

  }, [batches]);

  // =====================================
  // Search + Filter + Sort
  // =====================================

  const processedBatches = useMemo(() => {

    let data = [...batches];

    // SEARCH

    if (searchTerm.trim()) {

      const search =
        searchTerm.toLowerCase();

      data = data.filter(batch =>
        batch.batchName
          ?.toLowerCase()
          .includes(search) ||

        batch.course
          ?.toLowerCase()
          .includes(search) ||

        batch.status
          ?.toLowerCase()
          .includes(search) ||

        batch.description
          ?.toLowerCase()
          .includes(search)
      );

    }

    // COURSE FILTER

    if (courseFilter !== "All") {

      data = data.filter(
        batch =>
          batch.course === courseFilter
      );

    }

    // STATUS FILTER

    if (statusFilter !== "All") {

      data = data.filter(
        batch =>
          batch.status === statusFilter
      );

    }

    // ===============================
// Session Filter
// ===============================

if (sessionFilter !== "All") {

  data = data.filter((batch) => {

    if (!batch.schedule?.startTime) return false;

    const hour = parseInt(
      batch.schedule.startTime.split(":")[0],
      10
    );

    switch (sessionFilter) {

      case "Morning":
        return hour >= 6 && hour < 12;

      case "Evening":
        return hour >= 12;

      default:
        return true;
    }

  });

}

    // SORT

    switch (sortBy) {

      case "name":

        data.sort((a, b) =>
          a.batchName.localeCompare(
            b.batchName
          )
        );

        break;

      case "startDate":

        data.sort(
          (a, b) =>
            new Date(a.startDate) -
            new Date(b.startDate)
        );

        break;

      case "capacity":

        data.sort(
          (a, b) =>
            b.capacity - a.capacity
        );

        break;

      default:
        break;

    }

    return data;

  }, [
    batches,
    searchTerm,
    courseFilter,
    statusFilter,
    sessionFilter,
    sortBy,
  ]);

  // =====================================
  // Pagination
  // =====================================

  const totalPages = Math.ceil(
    processedBatches.length /
      itemsPerPage
  );

  const paginatedBatches =
    processedBatches.slice(

      (currentPage - 1) *
        itemsPerPage,

      currentPage *
        itemsPerPage

    );

  // =====================================
  // Delete
  // =====================================

  const handleDeleteClick =
    (batch) => {

      setSelectedBatch(batch);

      setShowDeleteModal(true);

    };

  const confirmDelete =
    async () => {

      try {

        setDeleteLoading(true);

        const success =
          await removeBatch(
            selectedBatch._id
          );

        if (success) {

          setShowDeleteModal(false);

          setSelectedBatch(null);

        }

      } catch (error) {

        console.error(error);

      } finally {

        setDeleteLoading(false);

      }

    };
      // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <h2 className="text-xl font-semibold text-slate-600">
            Loading batches...
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================
  // Error
  // =====================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-xl bg-red-100 p-6 text-center text-red-600">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ================= Header ================= */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Batch Management
          </h1>

          <p className="mt-1 text-slate-500">
            Create, organize and manage IELTS & PTE batches.
          </p>

        </div>

        <Link
          to="/admin/batches/add"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <FaPlus />

          Add Batch

        </Link>

      </div>

      {/* ================= Search ================= */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search by batch name, course, status..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

      </div>

      {/* ================= Filters ================= */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        {/* Course */}

        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option>All</option>
          <option>IELTS</option>
          <option>PTE</option>
        </select>

        {/* Status */}

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        {/* Session */}

        <select
          value={sessionFilter}
          onChange={(e) => {
            setSessionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option>All</option>
          <option>Morning</option>
          <option>Evening</option>
        </select>

        {/* Sorting */}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="name">
            Sort by Name
          </option>

          <option value="startDate">
            Sort by Start Date
          </option>

          <option value="capacity">
            Sort by Capacity
          </option>

        </select>

      </div>

      {/* ================= Statistics ================= */}

      <div className="mb-8 grid gap-6 md:grid-cols-4">

        <StatCard
          title="Total Batches"
          value={statistics.totalBatches}
        />

        <StatCard
          title="Active"
          value={statistics.activeBatches}
          color="text-green-600"
        />

        <StatCard
          title="Inactive"
          value={statistics.inactiveBatches}
          color="text-red-600"
        />

        <StatCard
          title="Students"
          value={statistics.totalStudents}
          color="text-blue-600"
        />

      </div>

      {/* ================= Table ================= */}

      <div className="overflow-hidden rounded-2xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-6 py-4 text-left">
                Batch
              </th>

              <th className="px-6 py-4 text-left">
                Course
              </th>

              <th className="px-6 py-4 text-left">
                Teachers
              </th>

              <th className="px-6 py-4 text-left">
                Students
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {paginatedBatches.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="py-20 text-center"
                >

                  <p className="text-lg font-semibold">
                    No batches found.
                  </p>

                  <p className="mt-2 text-slate-500">
                    Try changing your search or filters.
                  </p>

                  <Link
                    to="/admin/batches/add"
                    className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                  >
                    Create Batch
                  </Link>

                </td>

              </tr>

            ) : (              paginatedBatches.map((batch) => (

                <tr
                  key={batch._id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-semibold">
                    {batch.batchName}
                  </td>

                  <td className="px-6 py-4">
                    {batch.course}
                  </td>

                  <td className="px-6 py-4">
                    {batch.teachers?.length || 0}
                  </td>

                  <td className="px-6 py-4">
                    {batch.currentStrength} / {batch.capacity}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        batch.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {batch.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-center gap-3">

                      <Link
                        to={`/admin/batches/${batch._id}`}
                        className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                      >
                        <FaEye />
                      </Link>

                      <Link
                        to={`/admin/batches/edit/${batch._id}`}
                        className="rounded-lg bg-yellow-100 p-2 text-yellow-700 transition hover:bg-yellow-200"
                      >
                        <FaEdit />
                      </Link>

                      <button
                        onClick={() =>
                          handleDeleteClick(batch)
                        }
                        className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ================= Pagination ================= */}

      {totalPages > 1 && (

        <div className="mt-8 flex items-center justify-center gap-3">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => prev - 1)
            }
            className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (

            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-lg px-4 py-2 font-medium transition ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-slate-100"
              }`}
            >
              {page}
            </button>

          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => prev + 1)
            }
            className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>

        </div>

      )}

      {/* ================= Delete Modal ================= */}

      <DeleteBatchModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        batchName={selectedBatch?.batchName}
        loading={deleteLoading}
      />

    </DashboardLayout>
  );
};

// =====================================
// Statistics Card
// =====================================

const StatCard = ({
  title,
  value,
  color = "text-slate-800",
}) => (

  <div className="rounded-2xl bg-white p-6 shadow">

    <p className="text-sm text-slate-500">
      {title}
    </p>

    <h2 className={`mt-3 text-3xl font-bold ${color}`}>
      {value}
    </h2>

  </div>

);

export default BatchList;