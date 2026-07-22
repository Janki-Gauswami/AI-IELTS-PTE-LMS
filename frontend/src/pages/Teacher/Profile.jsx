import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

import { getTeacherProfile } from "../../services/teacherDashboardService";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    fetchProfile();
  }, []);


const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const response = await getTeacherProfile();

      setProfile(response.data);
    } catch (error) {
      console.error("Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-semibold">
          Loading Profile...
        </h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-red-500">
          Profile not found.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}

      <div className="bg-white rounded-2xl shadow-lg p-8">

        <div className="flex flex-col md:flex-row items-center gap-6">

          <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-5xl font-bold">
            {profile.name?.charAt(0).toUpperCase()}
          </div>

          <div>

            <h1 className="text-3xl font-bold">
              {profile.name}
            </h1>

            <p className="text-gray-600 mt-1">
              {profile.specialization} Trainer
            </p>

            <span
              className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${
                profile.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {profile.status}
            </span>

          </div>

        </div>

      </div>

      {/* Information */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        {/* Personal */}

        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-bold mb-5">
            Personal Information
          </h2>

          <div className="space-y-3">

            <p>
              <strong>Name:</strong> {profile.name}
            </p>

            <p>
              <strong>Email:</strong> {profile.email}
            </p>

            <p>
              <strong>Phone:</strong> {profile.phone || "-"}
            </p>

            <p>
              <strong>Address:</strong> {profile.address || "-"}
            </p>

          </div>

        </div>

        {/* Professional */}

        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-bold mb-5">
            Professional Information
          </h2>

          <div className="space-y-3">

            <p>
              <strong>Employee ID:</strong> {profile.employeeId}
            </p>

            <p>
              <strong>Qualification:</strong> {profile.qualification}
            </p>

            <p>
              <strong>Specialization:</strong> {profile.specialization}
            </p>

            <p>
              <strong>Experience:</strong> {profile.experience} Years
            </p>

            <p>
              <strong>Joining Date:</strong>{" "}
              {profile.joiningDate
                ? new Date(profile.joiningDate).toLocaleDateString()
                : "-"}

            </p>

          </div>

        </div>

      </div>

      {/* About */}

      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

        <h2 className="text-xl font-bold mb-4">
          About
        </h2>

        <p className="text-gray-700">
          {profile.bio || "No bio available."}
        </p>

      </div>

      {/* Button */}

      <div className="mt-8">

        <button
          onClick={() => navigate("/teacher/edit-profile")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition"
        >
          Edit Profile
        </button>

      </div>

    </div>
  );
};

export default Profile;