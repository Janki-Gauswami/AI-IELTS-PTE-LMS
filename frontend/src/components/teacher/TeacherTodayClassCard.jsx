import {
  FaClock,
  FaBookOpen,
  FaCalendarAlt,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

const TeacherTodayClassCard = ({ batch }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6">

      <div className="flex justify-between items-center">

        <h2 className="text-2xl font-bold">
          {batch.batchName}
        </h2>

        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
          Today
        </span>

      </div>

      <div className="mt-6 space-y-5">

        <div className="flex items-center gap-3">
          <FaBookOpen className="text-blue-600 text-lg" />

          <span className="text-lg">
            {batch.course}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-orange-500 text-lg" />

          <span className="text-lg">
            {batch.batchType}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <FaClock className="text-green-600 text-lg" />

          <span className="text-lg">
            {batch.schedule.startTime} - {batch.schedule.endTime}
          </span>
        </div>

        <div>
          <strong>Days :</strong>{" "}
          {batch.schedule.days.join(", ")}
        </div>

      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">

        <button
          onClick={() =>
            navigate(
              `/teacher/my-students?batch=${batch.batchId}`
            )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
        >
          View Students
        </button>

        <button
          onClick={() =>
            navigate(
              `/teacher/attendance?batch=${batch.batchId}`
            )
          }
          className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Take Attendance
        </button>

      </div>

    </div>
  );
};

export default TeacherTodayClassCard;