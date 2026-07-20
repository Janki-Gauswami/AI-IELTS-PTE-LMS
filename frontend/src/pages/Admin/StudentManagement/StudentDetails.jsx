import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as studentService from "../../../services/studentService";
import StudentStatusBadge from "../../../components/StudentManagement/StudentStatusBadge";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      setLoading(true);

      const response = await studentService.getStudentById(id);

      setStudent(response.data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load student."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        Student not found.
      </div>
    );
  }

  const { user, profile, enrollment } = student;

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Student Details
        </h1>

        <button
          onClick={() => navigate("/admin/students")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Back
        </button>

      </div>

      {/* Profile Card */}

      <div className="bg-white shadow rounded-lg p-6 mb-6">

        <div className="flex items-center gap-6">

          <img
            src={
              user.profilePicture ||
              "https://placehold.co/120x120"
            }
            alt={user.name}
            className="w-28 h-28 rounded-full object-cover border"
          />

          <div>

            <h2 className="text-2xl font-bold">
              {user.name}
            </h2>

            <p>{user.email}</p>

            <p>{user.phone}</p>

            <div className="mt-3">
              <StudentStatusBadge status={profile.status} />
            </div>

          </div>

        </div>

      </div>

      {/* Academic Information */}

      <div className="bg-white shadow rounded-lg p-6 mb-6">

        <h3 className="text-xl font-semibold mb-4">
          Academic Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <Detail
            label="Enrollment Number"
            value={profile.enrollmentNumber}
          />

          <Detail
            label="Batch"
            value={enrollment?.batch?.batchName || "-"}
          />

          <Detail
            label="Target Exam"
            value={profile.targetExam}
          />

          <Detail
            label="Target Band"
            value={profile.targetBand}
          />

          <Detail
            label="Target Country"
            value={profile.targetCountry}
          />

          <Detail
            label="Goal"
            value={profile.goal || "-"}
          />

        </div>

      </div>

      {/* Personal Information */}

      <div className="bg-white shadow rounded-lg p-6">

        <h3 className="text-xl font-semibold mb-4">
          Personal Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <Detail
            label="Gender"
            value={profile.gender}
          />

          <Detail
            label="Date of Birth"
            value={
              profile.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString()
                : "-"
            }
          />

          <Detail
            label="Emergency Contact"
            value={profile.emergencyContact}
          />

          <Detail
            label="Address"
            value={profile.address || "-"}
          />

        </div>

      </div>

    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">
      {label}
    </p>

    <p className="font-semibold">
      {value}
    </p>
  </div>
);

export default StudentDetails;