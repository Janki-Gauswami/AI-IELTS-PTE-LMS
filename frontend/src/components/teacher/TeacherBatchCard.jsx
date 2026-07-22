import { FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const TeacherBatchCard = ({ batch }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6">

      <div className="flex justify-between items-center">

        <h2 className="text-xl font-bold">
          {batch.batchName}
        </h2>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            batch.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {batch.status}
        </span>

      </div>

      <div className="mt-5 space-y-3">

        <p>
          <strong>Course:</strong>{" "}
          {batch.course}
        </p>

        <p>
          <strong>Batch Type:</strong>{" "}
          {batch.batchType}
        </p>

        <p>
          <strong>Capacity:</strong>{" "}
          {batch.capacity}
        </p>

        <div className="flex items-center gap-2">

          <FaUsers />

          <span>
            {batch.currentStudents} Students
          </span>

        </div>

      </div>

      <div className="mt-6">

<button
  onClick={() => {
    console.log(batch);
    navigate(`/teacher/my-students?batch=${batch.batchId}`);
  }}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition"
>
  View Students
</button>

      </div>

    </div>
  );
};

export default TeacherBatchCard;