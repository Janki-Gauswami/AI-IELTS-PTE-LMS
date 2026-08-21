import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getPTEPracticeTestById,
} from "../../../services/ptePracticeTestService";

const PTEPracticeTestDetails =
  () => {
    const {
      id,
    } = useParams();

    const navigate =
      useNavigate();

    const [test, setTest] =
      useState(null);

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    useEffect(() => {
      const loadTest =
        async () => {
          try {
            const response =
              await getPTEPracticeTestById(
                id
              );

            setTest(
              response.data
            );
          } catch (err) {
            console.error(err);

            setError(
              err?.response?.data
                ?.message ||
                "Failed to load test details."
            );
          } finally {
            setLoading(false);
          }
        };

      loadTest();
    }, [id]);

    if (loading) {
      return (
        <div className="p-6">
          Loading test details...
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">

          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>

        </div>
      );
    }

    if (!test) {
      return (
        <div className="p-6">
          Test not found.
        </div>
      );
    }

    return (
      <div className="p-6">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h1 className="text-2xl font-bold">
              {test.title}
            </h1>

            <p className="text-gray-500 mt-1">
              {test.description}
            </p>

          </div>

          <button
            onClick={() =>
              navigate(
                `/admin/pte/tests/${id}/edit`
              )
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Edit Test
          </button>

        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="grid md:grid-cols-5 gap-4 mb-6">

          <div className="bg-white shadow rounded-xl p-4">

            <div className="text-gray-500">
              Section
            </div>

            <div className="font-semibold mt-1">
              {test.section}
            </div>

          </div>

          <div className="bg-white shadow rounded-xl p-4">

            <div className="text-gray-500">
              Questions
            </div>

            <div className="font-semibold mt-1">
              {
                test.questions
                  ?.length || 0
              }
            </div>

          </div>

          <div className="bg-white shadow rounded-xl p-4">

            <div className="text-gray-500">
              Duration
            </div>

            <div className="font-semibold mt-1">
              {test.duration} minutes
            </div>

          </div>

          <div className="bg-white shadow rounded-xl p-4">

            <div className="text-gray-500">
              Total Marks
            </div>

            <div className="font-semibold mt-1">
              {test.totalMarks}
            </div>

          </div>

          <div className="bg-white shadow rounded-xl p-4">

            <div className="text-gray-500">
              Status
            </div>

            <div className="font-semibold mt-1">
              {test.status}
            </div>

          </div>

        </div>

        {/* ==================================================
            DETAILS
        ================================================== */}

        <div className="bg-white shadow rounded-xl p-6 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Test Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <strong>
                Test Type:
              </strong>{" "}
              {test.testType}
            </div>

            <div>
              <strong>
                Difficulty:
              </strong>{" "}
              {test.difficulty}
            </div>

            <div>
              <strong>
                Created By:
              </strong>{" "}
              {test.createdBy?.name ||
                "Unknown"}
            </div>

            <div>
              <strong>
                Created:
              </strong>{" "}
              {test.createdAt
                ? new Date(
                    test.createdAt
                  ).toLocaleDateString()
                : "-"}
            </div>

            <div>
              <strong>
                Published:
              </strong>{" "}
              {test.publishedAt
                ? new Date(
                    test.publishedAt
                  ).toLocaleDateString()
                : "Not published"}
            </div>

          </div>

        </div>

        {/* ==================================================
            QUESTIONS
        ================================================== */}

        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-xl font-semibold mb-4">
            Questions
          </h2>

          {!test.questions ||
          test.questions.length ===
            0 ? (

            <p className="text-gray-500">
              No questions added.
            </p>

          ) : (

            <div className="space-y-4">

              {test.questions.map(
                (
                  question,
                  index
                ) => (

                  <div
                    key={
                      question._id ||
                      index
                    }
                    className="border rounded-lg p-4"
                  >

                    <div className="font-semibold">
                      Question{" "}
                      {index + 1}
                    </div>

                    <div className="text-sm text-blue-600 mt-1">
                      {
                        question.questionType
                      }
                    </div>

                    <p className="mt-2">
                      {
                        question.questionText
                      }
                    </p>

                    <div className="text-sm text-gray-500 mt-2">
                      Section:{" "}
                      {
                        question.section
                      }
                      {" • "}
                      Marks:{" "}
                      {
                        question.marks
                      }
                      {" • "}
                      Difficulty:{" "}
                      {
                        question.difficulty
                      }
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>
    );
  };

export default PTEPracticeTestDetails;