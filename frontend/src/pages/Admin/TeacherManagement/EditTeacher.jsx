import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTeacherById,
  updateTeacher,
} from "../../../services/teacherService";

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    qualification: "",
    specialization: "",
    experience: "",
    joiningDate: "",
    address: "",
    bio: "",
    status: "",
  });

  // Load Teacher Details
  useEffect(() => {
    const fetchTeacher = async () => {
      try {

          const response = await getTeacherById(id);

          const { user, teacherProfile } = response.data;

          setFormData({
            name: user?.name || "",
            phone: user?.phone || "",

            qualification: teacherProfile?.qualification || "",
            specialization: teacherProfile?.specialization || "",
            experience: teacherProfile?.experience || "",

            joiningDate: teacherProfile?.joiningDate
              ? teacherProfile.joiningDate.split("T")[0]
              : "",

            address: teacherProfile?.address || "",
            bio: teacherProfile?.bio || "",
            status: teacherProfile?.status || "Active",
          });
      } catch (error) {
        console.error(error);
        alert("Unable to load teacher.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  // Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateTeacher(id, formData);

      alert("Teacher updated successfully.");

      navigate("/admin/teachers");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Unable to update teacher."
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading Teacher...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Edit Teacher
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label>Phone</label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label>Qualification</label>

            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label>Specialization</label>

            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">Select</option>
              <option value="IELTS">IELTS</option>
              <option value="PTE">PTE</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div>
            <label>Experience</label>

            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label>Joining Date</label>

            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

        </div>

        <div className="mt-5">
          <label>Address</label>

          <textarea
            rows="3"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div className="mt-5">
          <label>Bio</label>

          <textarea
            rows="4"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div className="flex gap-4 mt-6">

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Update Teacher
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/teachers")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditTeacher;