import React from "react";

const TeacherTable = ({
  teachers = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        Loading teachers...
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No teachers found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>

            <th className="px-4 py-3 text-left">Name</th>

            <th className="px-4 py-3 text-left">Email</th>

            <th className="px-4 py-3 text-left">Phone</th>

            <th className="px-4 py-3 text-left">Employee ID</th>

            <th className="px-4 py-3 text-left">Qualification</th>

            <th className="px-4 py-3 text-left">Specialization</th>

            <th className="px-4 py-3 text-left">Experience</th>

            <th className="px-4 py-3 text-left">Status</th>

            <th className="px-4 py-3 text-center">
              Assigned Batches
            </th>

            <th className="px-4 py-3 text-center">
              Students
            </th>

            <th className="px-4 py-3 text-center">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>

          {teachers.map((teacher) => (

            <tr
              key={teacher.teacherId}
              className="border-t hover:bg-gray-50"
            >

              <td className="px-4 py-3">
                {teacher.name}
              </td>

              <td className="px-4 py-3">
                {teacher.email}
              </td>

              <td className="px-4 py-3">
                {teacher.phone}
              </td>

              <td className="px-4 py-3">
                {teacher.employeeId}
              </td>

              <td className="px-4 py-3">
                {teacher.qualification}
              </td>

              <td className="px-4 py-3">
                {teacher.specialization}
              </td>

              <td className="px-4 py-3">
                {teacher.experience} Years
              </td>

              <td className="px-4 py-3">

                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    teacher.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {teacher.status}
                </span>

              </td>

              <td className="px-4 py-3 text-center">
                {teacher.assignedBatchCount}
              </td>

              <td className="px-4 py-3 text-center">
                {teacher.studentCount}
              </td>

              <td className="px-4 py-3">

                <div className="flex justify-center gap-2">

                  <button
                    onClick={() => onView(teacher.teacherId)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View
                  </button>

                  <button
                    onClick={() => onEdit(teacher.teacherId)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(teacher.teacherId)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>
      </table>
    </div>
  );
};

export default TeacherTable;