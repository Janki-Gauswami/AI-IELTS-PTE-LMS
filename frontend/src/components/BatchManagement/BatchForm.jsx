import { useState } from "react";

const BatchForm = ({ initialValues, onSubmit, loading }) => {
  const [formData, setFormData] = useState(
    initialValues || {
      batchName: "",
      course: "IELTS",
      batchType: "Regular",
      teachers: [],
      days: [],
      startTime: "",
      endTime: "",
      startDate: "",
      endDate: "",
      capacity: "",
      description: "",
      status: "Inactive",
    }
  );

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDayChange = (day) => {
    if (formData.days.includes(day)) {
      setFormData({
        ...formData,
        days: formData.days.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        days: [...formData.days, day],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow p-8 space-y-6"
    >
      {/* Batch Name */}

      <div>
        <label className="font-semibold">
          Batch Name
        </label>

        <input
          type="text"
          name="batchName"
          value={formData.batchName}
          onChange={handleChange}
          className="w-full mt-2 border rounded-lg p-3"
          required
        />
      </div>

      {/* Course */}

      <div>
        <label className="font-semibold">
          Course
        </label>

        <select
          name="course"
          value={formData.course}
          onChange={handleChange}
          className="w-full mt-2 border rounded-lg p-3"
        >
          <option>IELTS</option>
          <option>PTE</option>
        </select>
      </div>

      {/* Batch Type */}

      <div>

        <label className="font-semibold">
          Batch Type
        </label>

        <select
          name="batchType"
          value={formData.batchType}
          onChange={handleChange}
          className="w-full mt-2 border rounded-lg p-3"
        >
          <option value="Regular">Regular</option>
          <option value="Weekend">Weekend</option>
          <option value="Crash Course">Crash Course</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>

      </div>

      {/* Schedule */}

      <div>

        <label className="font-semibold">
          Schedule
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">

          {weekDays.map((day) => (
            <label
              key={day}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={formData.days.includes(day)}
                onChange={() => handleDayChange(day)}
              />

              {day}

            </label>
          ))}

        </div>

      </div>

      {/* Time */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label>Start Time</label>

          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full mt-2 border rounded-lg p-3"
          />

        </div>

        <div>

          <label>End Time</label>

          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full mt-2 border rounded-lg p-3"
          />

        </div>

      </div>

      {/* Dates */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label>Start Date</label>

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full mt-2 border rounded-lg p-3"
          />

        </div>

        <div>

          <label>End Date</label>

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full mt-2 border rounded-lg p-3"
          />

        </div>

      </div>

      {/* Capacity */}

      <div>

        <label>Maximum Capacity</label>

        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          className="w-full mt-2 border rounded-lg p-3"
        />

      </div>

      {/* Description */}

      <div>

        <label>Description</label>

        <textarea
          rows="4"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full mt-2 border rounded-lg p-3"
        />

      </div>

      {/* Status */}

      <div>

        <label>Status</label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full mt-2 border rounded-lg p-3"
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

      </div>

      {/* Button */}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
      >
        {loading ? "Saving..." : "Save Batch"}
      </button>

    </form>
  );
};

export default BatchForm;