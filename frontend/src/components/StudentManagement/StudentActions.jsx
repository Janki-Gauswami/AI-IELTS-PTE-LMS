import React from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import * as studentService from "../../services/studentService";

const StudentActions = ({
  studentId,
  onView,
  onEdit,
  onDelete,
}) => {

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to deactivate this student?"
    );

    if (!confirmDelete) return;

    try {
      await studentService.deleteStudent(studentId);

      alert("Student deactivated successfully.");

      if (onDelete) {
        onDelete();
      }

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete student."
      );
    }
  };

  return (
    <div className="flex justify-center items-center gap-3">

      {/* View */}

      <button
        onClick={() => onView(studentId)}
        className="text-blue-600 hover:text-blue-800"
        title="View Student"
      >
        <FaEye size={18} />
      </button>

      {/* Edit */}

      <button
        onClick={() => onEdit(studentId)}
        className="text-green-600 hover:text-green-800"
        title="Edit Student"
      >
        <FaEdit size={18} />
      </button>

      {/* Delete */}

      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800"
        title="Deactivate Student"
      >
        <FaTrash size={18} />
      </button>

    </div>
  );
};

export default StudentActions;