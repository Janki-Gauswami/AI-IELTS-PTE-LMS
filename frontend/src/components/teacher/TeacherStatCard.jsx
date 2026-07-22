import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";

const TeacherStatCard = ({ title, value }) => {
  let icon;
  let iconBg;
  let iconColor;

  switch (title) {
    case "Assigned Batches":
      icon = <FaChalkboardTeacher size={26} />;
      iconBg = "bg-blue-100";
      iconColor = "text-blue-600";
      break;

    case "Students":
      icon = <FaUserGraduate size={26} />;
      iconBg = "bg-green-100";
      iconColor = "text-green-600";
      break;

    case "Today's Classes":
      icon = <FaCalendarAlt size={26} />;
      iconBg = "bg-orange-100";
      iconColor = "text-orange-600";
      break;

    case "Upcoming Tests":
      icon = <FaClipboardList size={26} />;
      iconBg = "bg-purple-100";
      iconColor = "text-purple-600";
      break;

    default:
      iconBg = "bg-slate-100";
      iconColor = "text-slate-600";
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            {value}
          </h2>

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

export default TeacherStatCard;