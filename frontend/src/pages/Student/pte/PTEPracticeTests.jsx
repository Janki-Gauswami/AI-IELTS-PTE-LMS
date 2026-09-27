import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

import {
  getPracticeTests,
} from "../../../services/ptePracticeTestService";

const PTEPracticeTests = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // Load PTE Practice Tests
  // ======================================================

  const loadTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPracticeTests();

      console.log("PTE Practice Tests Response:", response);

      setTests(response?.data || []);
    } catch (err) {
      console.error(
        "PTE Practice Tests Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load PTE practice tests."
      );

      setTests([]);
    } finally {
      loadTestsFinished();
    }
  };

  const loadTestsFinished = () => {
    setLoading(false);
  };

  // ======================================================
  // Initial Load
  // ======================================================

  useEffect(() => {
    loadTests();
  }, []);

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading PTE practice tests...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ======================================================
  // Page
  // ======================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            PTE Practice Tests
          </h1>

          <p className="mt-1 text-slate-500">
            Practice PTE sections and improve your performance.
          </p>
        </div>


        {/* Error */}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}


        {/* No Tests */}

        {!error && tests.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <span className="text-2xl">
                📝
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              No Practice Tests Available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New PTE practice tests will appear here
              once they are published.
            </p>

          </div>
        )}


        {/* Test Cards */}

        {tests.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {tests.map((test) => (
              <div
                key={test._id}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Test Header */}

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <h2 className="text-lg font-semibold text-slate-800">
                      {test.title}
                    </h2>

                    {test.description && (
                      <p className="mt-2 text-sm text-slate-500">
                        {test.description}
                      </p>
                    )}

                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    Published
                  </span>

                </div>


                {/* Test Information */}

                <div className="mt-5 space-y-2">

                  {test.section && (
                    <div className="flex justify-between text-sm">

                      <span className="text-slate-500">
                        Section
                      </span>

                      <span className="font-medium text-slate-700">
                        {test.section}
                      </span>

                    </div>
                  )}


                  {test.duration && (
                    <div className="flex justify-between text-sm">

                      <span className="text-slate-500">
                        Duration
                      </span>

                      <span className="font-medium text-slate-700">
                        {test.duration} minutes
                      </span>

                    </div>
                  )}


                  {test.questions && (
                    <div className="flex justify-between text-sm">

                      <span className="text-slate-500">
                        Questions
                      </span>

                      <span className="font-medium text-slate-700">
                        {test.questions.length}
                      </span>

                    </div>
                  )}

                </div>


                {/* Start Button */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/student/pte/tests/${test._id}`
                    )
                  }
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Start Practice Test
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PTEPracticeTests;