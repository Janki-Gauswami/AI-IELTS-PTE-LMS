import React from "react";
import { FaSearch } from "react-icons/fa";

const StudentSearch = ({
  search,
  setSearch,
  placeholder = "Search by Name, Email or Enrollment Number...",
}) => {
  return (
    <div className="relative w-full">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
};

export default StudentSearch;