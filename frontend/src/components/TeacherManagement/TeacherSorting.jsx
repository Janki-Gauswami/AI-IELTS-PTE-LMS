import React from "react";

const TeacherSorting = ({
  sortBy,
  setSortBy,
  order,
  setOrder,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap gap-4 items-end">

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Sort By
        </label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 w-52"
        >
          <option value="name">Name</option>
          <option value="experience">Experience</option>
          <option value="joiningDate">Joining Date</option>
        </select>
      </div>

      {/* Order */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Order
        </label>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border rounded-lg px-3 py-2 w-44"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Reset Sorting */}
      <div>
        <button
          onClick={() => {
            setSortBy("name");
            setOrder("asc");
          }}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600"
        >
          Reset Sorting
        </button>
      </div>

    </div>
  );
};

export default TeacherSorting;