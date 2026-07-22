import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTeacherProfile,
  updateTeacherProfile,
} from "../../services/teacherDashboardService";

const EditProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    phone: "",
    address: "",
    qualification: "",
    specialization: "",
    experience: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await getTeacherProfile();

      const profile = response.data;

      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        employeeId: profile.employeeId || "",
        phone: profile.phone || "",
        address: profile.address || "",
        qualification: profile.qualification || "",
        specialization: profile.specialization || "",
        experience: profile.experience || "",
        bio: profile.bio || "",
      });
    } catch (error) {
      console.error("Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateTeacherProfile({
        phone: formData.phone,
        address: formData.address,
        qualification: formData.qualification,
        specialization: formData.specialization,
        experience: formData.experience,
        bio: formData.bio,
      });

      alert("Profile updated successfully.");

      navigate("/teacher/profile");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold">
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      <div className="bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold mb-8">
          Edit Profile
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Name
              </label>

              <input
                type="text"
                value={formData.name}
                disabled
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Employee ID
              </label>

              <input
                type="text"
                value={formData.employeeId}
                disabled
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Qualification
              </label>

              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Specialization
              </label>

              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Experience (Years)
              </label>

              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

          </div>

          <div>
            <label className="block mb-2 font-medium">
              Bio
            </label>

            <textarea
              name="bio"
              rows="5"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="flex gap-4">

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/teacher/profile")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditProfile;