import React from "react";

const TeacherFilters = ({
  status,
  setStatus,
  specialization,
  setSpecialization,
  qualification,
  setQualification,
}) => {

  const resetFilters = () => {
    setStatus("");
    setSpecialization("");
    setQualification("");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">

      {/* Status */}

      <div>
        <label className="block text-sm font-medium mb-1">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-md px-3 py-2 w-44"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Specialization */}

      <div>
        <label className="block text-sm font-medium mb-1">
          Specialization
        </label>

        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="border rounded-md px-3 py-2 w-44"
        >
          <option value="">All Specializations</option>
          <option value="IELTS">IELTS</option>
          <option value="PTE">PTE</option>
          <option value="Both">Both</option>
        </select>
      </div>

      {/* Qualification */}

      <div>
        <label className="block text-sm font-medium mb-1">
          Qualification
        </label>

        <input
          type="text"
          placeholder="e.g. M.Tech"
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          className="border rounded-md px-3 py-2 w-52"
        />
      </div>

      {/* Reset Button */}

      <div className="mt-6">
        <button
          onClick={resetFilters}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Reset Filters
        </button>
      </div>

    </div>
  );
};

export default TeacherFilters;