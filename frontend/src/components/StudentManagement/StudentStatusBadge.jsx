import React from "react";

const StudentStatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border border-green-300";

      case "Inactive":
        return "bg-red-100 text-red-700 border border-red-300";

      case "Suspended":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";

      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StudentStatusBadge;