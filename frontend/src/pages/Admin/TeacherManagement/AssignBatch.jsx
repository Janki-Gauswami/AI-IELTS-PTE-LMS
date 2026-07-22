import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  getAllTeachers,
  assignBatch,
  getAssignedBatches,
  removeBatch,
  changeTeacher,
} from "../../../services/teacherService";

import { getAllBatches } from "../../../services/batchService";

const AssignBatch = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const teacherIdFromURL = searchParams.get("teacherId");

  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [assignedBatches, setAssignedBatches] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState(
    teacherIdFromURL || ""
  );

  const [selectedBatch, setSelectedBatch] = useState("");

  const [changeData, setChangeData] = useState({
    batchId: "",
    oldTeacherId: "",
    newTeacherId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      loadAssignedBatches(selectedTeacher);
    } else {
      setAssignedBatches([]);
    }
  }, [selectedTeacher]);

  // Load Teachers
  const loadTeachers = async () => {
    try {
      const response = await getAllTeachers({
        page: 1,
        limit: 1000,
      });
      console.log("Teachers:", response.data);
      setTeachers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Load Batches
    const loadBatches = async () => {
      try {
        const response = await getAllBatches();

        setBatches(response.batches || []);
      } catch (error) {
        console.error(error);
        setBatches([]);
      }
    };

  // Load Assigned Batches
  const loadAssignedBatches = async (teacherId) => {
    try {
      setLoading(true);

      const response = await getAssignedBatches(teacherId);

      setAssignedBatches(response.data.data || []);
    } catch (error) {
      console.error(error);
      setAssignedBatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Assign Batch
  const handleAssign = async () => {
    if (!selectedTeacher || !selectedBatch) {
      return alert("Please select both Teacher and Batch.");
    }

    try {
      await assignBatch(selectedTeacher, selectedBatch);

      alert("Batch assigned successfully.");

      setSelectedBatch("");

      loadAssignedBatches(selectedTeacher);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to assign batch."
      );
    }
  };

  // Remove Batch
  const handleRemove = async (batchId) => {
    if (
      !window.confirm(
        "Remove this batch from teacher?"
      )
    )
      return;

    try {
      await removeBatch(selectedTeacher, batchId);

      alert("Batch removed successfully.");

      loadAssignedBatches(selectedTeacher);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to remove batch."
      );
    }
  };
    // Change Teacher
  const handleChangeTeacher = async () => {
    const { batchId, oldTeacherId, newTeacherId } = changeData;

    if (!batchId || !oldTeacherId || !newTeacherId) {
      return alert("Please fill all fields.");
    }

    try {
      await changeTeacher(changeData);

      alert("Teacher changed successfully.");

      setChangeData({
        batchId: "",
        oldTeacherId: "",
        newTeacherId: "",
      });

      if (selectedTeacher) {
        loadAssignedBatches(selectedTeacher);
      }
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to change teacher."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Assign Batch
          </h1>

          <p className="text-gray-500">
            Assign, remove and manage teacher batches.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/teachers")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
        >
          Back
        </button>

      </div>

      {/* Assign Batch Card */}

      <div className="bg-white shadow rounded-lg p-6 mb-6">

        <h2 className="text-xl font-semibold mb-5">
          Assign Batch to Teacher
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Teacher */}

          <div>

            <label className="block mb-2 font-medium">
              Teacher
            </label>

            <select
              value={selectedTeacher}
              onChange={(e) =>
                setSelectedTeacher(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Select Teacher
              </option>

              {teachers.map((teacher) => (

                <option
                  key={teacher.teacherId}
                  value={teacher.teacherId}
                >
                  {teacher.name}
                </option>

              ))}

            </select>

          </div>

          {/* Batch */}

          <div>

            <label className="block mb-2 font-medium">
              Batch
            </label>

            <select
              value={selectedBatch}
              onChange={(e) =>
                setSelectedBatch(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Select Batch
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

        </div>

        <button
          onClick={handleAssign}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Assign Batch
        </button>

      </div>

      {/* Assigned Batches */}

      <div className="bg-white shadow rounded-lg p-6 mb-6">

        <h2 className="text-xl font-semibold mb-5">
          Assigned Batches
        </h2>

        {loading ? (

          <div className="text-center py-8">
            Loading...
          </div>

        ) : assignedBatches.length === 0 ? (

          <div className="text-center text-gray-500 py-8">
            No batches assigned.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full border">

              <thead className="bg-gray-100">

                <tr>

                  <th className="border px-4 py-3">
                    Batch Name
                  </th>

                  <th className="border px-4 py-3">
                    Course
                  </th>

                  <th className="border px-4 py-3">
                    Batch Type
                  </th>

                  <th className="border px-4 py-3">
                    Schedule
                  </th>

                  <th className="border px-4 py-3">
                    Students
                  </th>

                  <th className="border px-4 py-3">
                    Status
                  </th>

                  <th className="border px-4 py-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>
                                {assignedBatches.map((batch) => (

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
                      {batch.schedule}
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

                    <td className="border px-4 py-3 text-center">

                      <button
                        onClick={() =>
                          handleRemove(batch.batchId)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Remove
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Change Teacher */}

      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="text-xl font-semibold mb-5">
          Change Teacher
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Batch */}

          <div>

            <label className="block mb-2 font-medium">
              Batch
            </label>

            <select
              value={changeData.batchId}
              onChange={(e) =>
                setChangeData({
                  ...changeData,
                  batchId: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Select Batch
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

          {/* Current Teacher */}

          <div>

            <label className="block mb-2 font-medium">
              Current Teacher
            </label>

            <select
              value={changeData.oldTeacherId}
              onChange={(e) =>
                setChangeData({
                  ...changeData,
                  oldTeacherId: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Select Current Teacher
              </option>

              {teachers.map((teacher) => (

                <option
                  key={teacher.teacherId}
                  value={teacher.teacherId}
                >
                  {teacher.name}
                </option>

              ))}

            </select>

          </div>

          {/* New Teacher */}

          <div>

            <label className="block mb-2 font-medium">
              New Teacher
            </label>

            <select
              value={changeData.newTeacherId}
              onChange={(e) =>
                setChangeData({
                  ...changeData,
                  newTeacherId: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Select New Teacher
              </option>

              {teachers.map((teacher) => (

                <option
                  key={teacher.teacherId}
                  value={teacher.teacherId}
                >
                  {teacher.name}
                </option>

              ))}

            </select>

          </div>

        </div>

        <button
          onClick={handleChangeTeacher}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          Change Teacher
        </button>

      </div>

    </div>
  );
};

export default AssignBatch;