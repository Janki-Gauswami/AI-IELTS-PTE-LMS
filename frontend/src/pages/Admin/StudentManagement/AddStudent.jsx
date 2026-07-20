import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

import {createStudent,} from "../../../services/studentService";
import { getAllBatches } from "../../../services/batchService";

const AddStudent = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    // User Information
    name: "",
    email: "",
    password: "",
    phone: "",
    profilePicture: "",

    // Student Information
    enrollmentNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",

    // Study Information
    targetExam: "IELTS",
    targetBand: "",
    targetCountry: "",
    goal: "",

    // Batch
    batchId: "",
  });

  // ==========================================
  // Load Batches
  // ==========================================

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response = await getAllBatches();
      console.log(response);

      if (response.success) {
        setBatches(response.batches);
      }

    } catch (error) {
      console.error(error);
      alert("Failed to load batches.");
    } finally {
      setLoadingBatches(false);
    }
  };

  // ==========================================
  // Handle Change
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // Handle Submit
  // ==========================================
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.enrollmentNumber ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.emergencyContact ||
      !formData.targetExam ||
      formData.targetBand === "" ||
      !formData.targetCountry ||
      !formData.batchId
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (
      formData.targetExam === "IELTS" &&
      (Number(formData.targetBand) < 1 ||
        Number(formData.targetBand) > 9)
    ) {
      alert("IELTS target band must be between 1 and 9.");
      return;
    }

    if (
      formData.targetExam === "PTE" &&
      (Number(formData.targetBand) < 10 ||
        Number(formData.targetBand) > 90)
    ) {
      alert("PTE target score must be between 10 and 90.");
      return;
    }

    console.log("Submitting Student");
    console.log(formData);

    const response = await createStudent(formData);

    console.log(response);

    if (response.success) {
      alert(response.message);
      navigate("/admin/students");
    }

  } catch (error) {
    console.error(error);

    alert(
      error.message ||
      "Failed to create student."
    );
  } finally {
    setLoading(false);
  }
};

    return (
    <DashboardLayout title="Add Student">
      <div className="max-w-7xl mx-auto">

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-8 space-y-8"
        >

          {/* ==========================================
              Personal Information
          ========================================== */}

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block font-medium mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Phone *
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Phone Number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium mb-2">
                  Profile Picture URL
                </label>

                <input
                  type="text"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="https://..."
                />
              </div>

            </div>
          </div>

          {/* ==========================================
              Academic Information
          ========================================== */}

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Academic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block font-medium mb-2">
                  Enrollment Number *
                </label>

                <input
                  type="text"
                  name="enrollmentNumber"
                  value={formData.enrollmentNumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Date of Birth *
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Gender *
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Emergency Contact *
                </label>

                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium mb-2">
                  Address
                </label>

                <textarea
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

            </div>
          </div>
                    {/* ==========================================
              Study Information
          ========================================== */}

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Study Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block font-medium mb-2">
                  Target Exam *
                </label>

                <select
                  name="targetExam"
                  value={formData.targetExam}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="IELTS">IELTS</option>
                  <option value="PTE">PTE</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Target Band / Score *
                </label>

                <input
                  type="number"
                  name="targetBand"
                  value={formData.targetBand}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder={
                    formData.targetExam === "IELTS"
                      ? "1 - 9"
                      : "10 - 90"
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Target Country *
                </label>

                <select
                  name="targetCountry"
                  value={formData.targetCountry}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="">Select Country</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="UK">UK</option>
                  <option value="USA">USA</option>
                  <option value="New Zealand">
                    New Zealand
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Batch *
                </label>

                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  disabled={loadingBatches}
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="">
                    {loadingBatches
                      ? "Loading Batches..."
                      : "Select Batch"}
                  </option>

                  {batches.map((batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium mb-2">
                  Student Goal
                </label>

                <textarea
                  rows={4}
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Student goals..."
                />
              </div>

            </div>
          </div>

          {/* ==========================================
              Buttons
          ========================================== */}

          <div className="flex justify-end gap-4 pt-6 border-t">

            <button
              type="button"
              onClick={() => navigate("/admin/students")}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating Student..." : "Add Student"}
            </button>

          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default AddStudent;