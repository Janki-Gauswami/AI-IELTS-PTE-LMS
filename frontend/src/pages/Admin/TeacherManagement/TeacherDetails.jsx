import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTeacherById,
  getAssignedBatches,
} from "../../../services/teacherService";

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherDetails();
  }, []);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);

      const teacherResponse = await getTeacherById(id);
      const batchResponse = await getAssignedBatches(id);

      const data = teacherResponse.data;
      

      setTeacher({
        teacherId: data.teacherProfile._id,

        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,

        employeeId: data.teacherProfile.employeeId,
        qualification: data.teacherProfile.qualification,
        specialization: data.teacherProfile.specialization,
        experience: data.teacherProfile.experience,
        joiningDate: data.teacherProfile.joiningDate,

        address: data.teacherProfile.address,
        bio: data.teacherProfile.bio,

        status: data.teacherProfile.status,

        totalStudents: data.totalStudents,
        totalAssignedBatches: data.totalAssignedBatches,
      });

      setBatches(batchResponse.data || []);
    } catch (error) {
      console.error(error);
      alert("Unable to load teacher details.");
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading Teacher Details...
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        Teacher not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Teacher Details
          </h1>

          <p className="text-gray-500">
            View complete teacher profile and assigned batches.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/teachers")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
        >
          ← Back
        </button>

      </div>

      {/* Profile Card */}

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">

        <div className="flex items-center gap-6">

          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
            {teacher.name?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">

            <h2 className="text-2xl font-bold">
              {teacher.name}
            </h2>

            <p className="text-gray-600">
              {teacher.email}
            </p>

            <p className="text-gray-600">
              {teacher.phone}
            </p>

            <span
              className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${
                teacher.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {teacher.status}
            </span>

          </div>

        </div>

      </div>
            {/* Information Cards */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Personal Information */}

        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Personal Information
          </h3>

          <div className="space-y-3">

            <div>
              <strong>Name :</strong> {teacher.name}
            </div>

            <div>
              <strong>Email :</strong> {teacher.email}
            </div>

            <div>
              <strong>Phone :</strong> {teacher.phone}
            </div>

            <div>
              <strong>Employee ID :</strong> {teacher.employeeId}
            </div>

          </div>

        </div>

        {/* Professional Information */}

        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Professional Information
          </h3>

          <div className="space-y-3">

            <div>
              <strong>Qualification :</strong> {teacher.qualification || "-"}
            </div>

            <div>
              <strong>Specialization :</strong> {teacher.specialization || "-"}
            </div>

            <div>
              <strong>Experience :</strong> {teacher.experience ?? 0} Years
            </div>

            <div>
              <strong>Joining Date :</strong>{" "}
              {teacher.joiningDate
                ? new Date(teacher.joiningDate).toLocaleDateString()
                : "-"}
            </div>

          </div>

        </div>

      </div>

      {/* Address & Bio */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Address
          </h3>

          <p className="text-gray-700">
            {teacher.address || "No Address Available"}
          </p>

        </div>

        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Bio
          </h3>

          <p className="text-gray-700">
            {teacher.bio || "No Bio Available"}
          </p>

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        <div className="bg-blue-600 text-white rounded-lg p-6 shadow">

          <h4 className="text-lg font-semibold">
            Assigned Batches
          </h4>

          <p className="text-4xl font-bold mt-3">
            {teacher.totalAssignedBatches || 0}
          </p>

        </div>

        <div className="bg-green-600 text-white rounded-lg p-6 shadow">

          <h4 className="text-lg font-semibold">
            Total Students
          </h4>

          <p className="text-4xl font-bold mt-3">
            {teacher.totalStudents || 0}
          </p>

        </div>

      </div>
            {/* Assigned Batches */}

      <div className="bg-white rounded-lg shadow p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-2xl font-semibold">
            Assigned Batches
          </h2>

          <button
            onClick={() =>
              navigate(`/admin/teachers/assign-batch?teacherId=${teacher.teacherId}`)
            }
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
          >
            Assign Batch
          </button>

        </div>

        {batches.length === 0 ? (

          <div className="text-center text-gray-500 py-10">
            No batches assigned to this teacher.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full border border-gray-200">

              <thead className="bg-gray-100">

                <tr>

                  <th className="border px-4 py-3 text-left">
                    Batch Name
                  </th>

                  <th className="border px-4 py-3 text-left">
                    Course
                  </th>

                  <th className="border px-4 py-3 text-left">
                    Batch Type
                  </th>

                  <th className="border px-4 py-3 text-left">
                    Schedule
                  </th>

                  <th className="border px-4 py-3 text-center">
                    Students
                  </th>

                  <th className="border px-4 py-3 text-center">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>
  {batches.map((batch) => {
    console.log(batch);
    console.log(Object.keys(batch));

    return (
      <tr
        key={batch.batchId}
        className="hover:bg-gray-50"
      >
        <td className="border px-4 py-3">
          {batch.batchName}
        </td>

        <td className="border px-4 py-3">
          {batch.course}
        </td>

        <td className="border px-4 py-3">
          {batch.batchType}
        </td>

        <td className="border px-4 py-3">
          {batch.schedule
            ? `${Array.isArray(batch.schedule.days)
                ? batch.schedule.days.join(", ")
                : batch.schedule.days
              } | ${batch.schedule.startTime} - ${batch.schedule.endTime}`
            : "-"}
        </td>

        <td className="border px-4 py-3 text-center">
          {batch.currentStudents}
        </td>

        <td className="border px-4 py-3 text-center">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              batch.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {batch.status}
          </span>
        </td>
      </tr>
    );
  })}
</tbody>

            </table>

          </div>

        )}

      </div>

      {/* Action Buttons */}

      <div className="flex justify-end gap-4 mt-6">

        <button
          onClick={() =>
            navigate(`/admin/teachers/edit/${teacher.teacherId}`)
          }
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg"
        >
          Edit Teacher
        </button>

        <button
          onClick={() => navigate("/admin/teachers")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
        >
          Back to Teacher List
        </button>

      </div>

    </div>
  );
};

export default TeacherDetails;