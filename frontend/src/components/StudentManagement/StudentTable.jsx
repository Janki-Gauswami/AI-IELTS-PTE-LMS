import React from "react";
import StudentActions from "./StudentActions";
import StudentStatusBadge from "./StudentStatusBadge";

const StudentTable = ({
  students,
  onView,
  onEdit,
  onDelete,
}) => {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No students found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">

      <table className="min-w-full border-collapse">

        <thead className="bg-gray-100">

          <tr>

            <th className="px-4 py-3 text-left">Photo</th>

            <th className="px-4 py-3 text-left">
              Name
            </th>

            <th className="px-4 py-3 text-left">
              Enrollment
            </th>

            <th className="px-4 py-3 text-left">
              Email
            </th>

            <th className="px-4 py-3 text-left">
              Batch
            </th>

            <th className="px-4 py-3 text-left">
              Exam
            </th>

            <th className="px-4 py-3 text-left">
              Country
            </th>

            <th className="px-4 py-3 text-left">
              Target
            </th>

            <th className="px-4 py-3 text-left">
              Status
            </th>

            <th className="px-4 py-3 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {students.map((student) => {

            const user = student.user;
            const profile = student.profile;
            const enrollment = student.enrollment;

            return (

              <tr
                key={user._id}
                className="border-t hover:bg-gray-50"
              >

                {/* Photo */}

                <td className="px-4 py-3">

                  <img
                    src={
                      user.profilePicture ||
                      "https://placehold.co/40x40"
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                </td>

                {/* Name */}

                <td className="px-4 py-3">
                  {user.name}
                </td>

                {/* Enrollment */}

                <td className="px-4 py-3">
                  {profile.enrollmentNumber}
                </td>

                {/* Email */}

                <td className="px-4 py-3">
                  {user.email}
                </td>

                {/* Batch */}

                <td className="px-4 py-3">
                  {enrollment?.batch?.batchName|| "-"}
                </td>

                {/* Exam */}

                <td className="px-4 py-3">
                  {profile.targetExam}
                </td>

                {/* Country */}

                <td className="px-4 py-3">
                  {profile.targetCountry}
                </td>

                {/* Target Band */}

                <td className="px-4 py-3">
                  {profile.targetBand}
                </td>

                {/* Status */}

                <td className="px-4 py-3">

                 <StudentStatusBadge
                    status={profile.status}
                />

                </td>

                {/* Actions */}

                <td className="px-4 py-3 text-center">

                  <StudentActions
                    studentId={user._id}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>
  );
};

export default StudentTable;