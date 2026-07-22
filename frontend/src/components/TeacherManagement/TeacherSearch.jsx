import React from "react";
import { FaSearch } from "react-icons/fa";

const TeacherSearch = ({ search, setSearch }) => {
  return (
    <div className="flex items-center w-full md:w-96 bg-white border rounded-lg shadow-sm px-3 py-2">

      <FaSearch className="text-gray-500 mr-2" />

      <input
        type="text"
        placeholder="Search by Name, Email or Employee ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full outline-none"
      />

      {search && (
        <button
          onClick={() => setSearch("")}
          className="text-red-500 font-semibold ml-2 hover:text-red-700"
        >
          ✕
        </button>
      )}

    </div>
  );
};

export default TeacherSearch;