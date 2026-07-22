import React from "react";

const TeacherPagination = ({
  pagination,
  setPage,
  setLimit,
}) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const {
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
  } = pagination;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">

      {/* Records Info */}
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold">
          {(currentPage - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold">
          {Math.min(currentPage * pageSize, totalRecords)}
        </span>{" "}
        of{" "}
        <span className="font-semibold">
          {totalRecords}
        </span>{" "}
        teachers
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">

        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
          className={`px-3 py-2 rounded-md border ${
            currentPage === 1
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setPage(index + 1)}
            className={`px-3 py-2 rounded-md border ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {index + 1}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
          className={`px-3 py-2 rounded-md border ${
            currentPage === totalPages
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Next
        </button>

      </div>

      {/* Page Size */}
      <div className="flex items-center gap-2">

        <label className="text-sm">
          Rows:
        </label>

        <select
          value={pageSize}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="border rounded-md px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

      </div>

    </div>
  );
};

export default TeacherPagination;