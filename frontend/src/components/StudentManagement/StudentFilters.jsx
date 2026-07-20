import React from "react";

import {
  examOptions,
  countryOptions,
  statusOptions,
} from "../../data/studentFilters";

const StudentFilters = ({
  filters,
  setFilters,
  batches = [],
}) => {

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Exam Filter */}

      <select
        name="targetExam"
        value={filters.targetExam}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        {examOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Country Filter */}

      <select
        name="targetCountry"
        value={filters.targetCountry}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        {countryOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Status Filter */}

      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        {statusOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Batch Filter */}

      <select
        name="batchId"
        value={filters.batchId}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">All Batches</option>

        {batches.map((batch) => (
          <option
            key={batch._id}
            value={batch._id}
          >
            {batch.batchName}
          </option>
        ))}
      </select>

    </div>
  );
};

export default StudentFilters;