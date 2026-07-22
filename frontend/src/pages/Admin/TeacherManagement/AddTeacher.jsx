import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeacher } from "../../../services/teacherService";

const AddTeacher = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    employeeId: "",
    qualification: "",
    specialization: "",
    experience: "",
    joiningDate: "",
    address: "",
    bio: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      employeeId: "",
      qualification: "",
      specialization: "",
      experience: "",
      joiningDate: "",
      address: "",
      bio: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTeacher(formData);

      alert("Teacher created successfully.");

      navigate("/admin/teachers");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Unable to create teacher."
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Add Teacher
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
              required
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 mt-1"
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
            <label>Employee ID</label>

            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
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
            <label>Experience (Years)</label>

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
            Save Teacher
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/teachers")}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
};

export default AddTeacher;