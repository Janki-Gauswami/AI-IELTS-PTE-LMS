import React from "react";

const StudentSorting = ({ sort, setSort }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSort((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4 mb-6">

      {/* Sort By */}

      <div className="flex-1">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Sort By
        </label>

        <select
          name="sortBy"
          value={sort.sortBy}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="joinedDate">Joined Date</option>
          <option value="targetBand">Target Band</option>
        </select>
      </div>

      {/* Order */}

      <div className="flex-1">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Order
        </label>

        <select
          name="order"
          value={sort.order}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

    </div>
  );
};

export default StudentSorting;