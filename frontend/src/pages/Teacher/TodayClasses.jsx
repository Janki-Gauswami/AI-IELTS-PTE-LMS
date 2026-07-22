import { useEffect, useState } from "react";
import { getTodayClasses } from "../../services/teacherDashboardService";

const TodayClasses = () => {
  const [classes, setClasses] = useState([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayClasses();
  }, []);

  const fetchTodayClasses = async () => {
    try {
      setLoading(true);

      const response = await getTodayClasses();

      setClasses(response.data || []);
      setToday(response.today || "");
    } catch (error) {
      console.error("Today's Classes Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Today's Classes
        </h1>

        <p className="text-gray-500 mt-2">
          {today}
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          Loading classes...
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          No classes scheduled today.
        </div>
      ) : (
        <div className="space-y-5">
          {classes.map((item) => (
            <div
              key={item.batchId}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {item.batchName}
                  </h2>

                  <p className="text-gray-500">
                    {item.course} • {item.batchType}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {item.schedule.startTime}
                  </p>

                  <p className="text-gray-500">
                    to {item.schedule.endTime}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayClasses;