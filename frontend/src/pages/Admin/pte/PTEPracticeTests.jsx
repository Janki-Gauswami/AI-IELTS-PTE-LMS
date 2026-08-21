import React, {
  useEffect,
  useState,
} from "react";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaUpload,
  FaDownload,
} from "react-icons/fa";

import {
  getPTEPracticeTests,
  deletePTEPracticeTest,
  publishPTEPracticeTest,
  unpublishPTEPracticeTest,
} from "../../../services/ptePracticeTestService";

import {
  useNavigate,
} from "react-router-dom";

const PTEPracticeTests = () => {
  const navigate = useNavigate();

  const [tests, setTests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [section, setSection] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("");

  // ====================================================
  // LOAD TESTS
  // ====================================================

  const loadTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPTEPracticeTests({
          search,
          section,
          status,
          difficulty,
        });

      setTests(
        response.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data
          ?.message ||
          "Failed to load PTE practice tests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [
    search,
    section,
    status,
    difficulty,
  ]);

  // ====================================================
  // DELETE / ARCHIVE
  // ====================================================

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to archive this practice test?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deletePTEPracticeTest(
        id
      );

      await loadTests();
    } catch (err) {
      alert(
        err?.response?.data
          ?.message ||
          "Failed to archive test."
      );
    }
  };

  // ====================================================
  // PUBLISH
  // ====================================================

  const handlePublish = async (
    id
  ) => {
    try {
      await publishPTEPracticeTest(
        id
      );

      await loadTests();
    } catch (err) {
      alert(
        err?.response?.data
          ?.message ||
          "Failed to publish test."
      );
    }
  };

  // ====================================================
  // UNPUBLISH
  // ====================================================

  const handleUnpublish = async (
    id
  ) => {
    try {
      await unpublishPTEPracticeTest(
        id
      );

      await loadTests();
    } catch (err) {
      alert(
        err?.response?.data
          ?.message ||
          "Failed to unpublish test."
      );
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="p-6">
        Loading PTE practice tests...
      </div>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold">
            PTE Practice Tests
          </h1>

          <p className="text-gray-500 mt-1">
            Create and manage PTE practice tests.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              "/admin/pte/tests/create"
            )
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <FaPlus />
          Create Test
        </button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="bg-white rounded-xl shadow p-4 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Search */}

          <div className="relative">

            <FaSearch className="absolute left-3 top-3 text-gray-400" />

            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full border rounded-lg pl-10 pr-3 py-2"
            />

          </div>

          {/* Section */}

          <select
            value={section}
            onChange={(e) =>
              setSection(
                e.target.value
              )
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="">
              All Sections
            </option>

            <option value="Speaking & Writing">
              Speaking & Writing
            </option>

            <option value="Reading">
              Reading
            </option>

            <option value="Listening">
              Listening
            </option>

            <option value="Full Test">
              Full Test
            </option>
          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="">
              All Status
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Published">
              Published
            </option>

            <option value="Archived">
              Archived
            </option>
          </select>

          {/* Difficulty */}

          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value
              )
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="">
              All Difficulty
            </option>

            <option value="Easy">
              Easy
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Hard">
              Hard
            </option>
          </select>

        </div>

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Test Name
              </th>

              <th className="text-left p-4">
                Section
              </th>

              <th className="text-left p-4">
                Questions
              </th>

              <th className="text-left p-4">
                Duration
              </th>

              <th className="text-left p-4">
                Total Marks
              </th>

              <th className="text-left p-4">
                Status
              </th>

              <th className="text-left p-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {tests.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center p-8 text-gray-500"
                >
                  No PTE practice tests found.
                </td>

              </tr>

            ) : (

              tests.map(
                (test) => (

                  <tr
                    key={test._id}
                    className="border-t"
                  >

                    <td className="p-4 font-medium">
                      {test.title}
                    </td>

                    <td className="p-4">
                      {test.section}
                    </td>

                    <td className="p-4">
                      {test.questions?.length ||
                        0}
                    </td>

                    <td className="p-4">
                      {test.duration} min
                    </td>

                    <td className="p-4">
                      {test.totalMarks}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          test.status ===
                          "Published"
                            ? "bg-green-100 text-green-700"
                            : test.status ===
                              "Archived"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {test.status}
                      </span>

                    </td>

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          title="View"
                          onClick={() =>
                            navigate(
                              `/admin/pte/tests/${test._id}`
                            )
                          }
                          className="p-2 bg-gray-100 rounded"
                        >
                          <FaEye />
                        </button>

                        <button
                          title="Edit"
                          onClick={() =>
                            navigate(
                              `/admin/pte/tests/${test._id}/edit`
                            )
                          }
                          className="p-2 bg-blue-100 text-blue-600 rounded"
                        >
                          <FaEdit />
                        </button>

                        {test.status ===
                          "Published" ? (

                          <button
                            onClick={() =>
                              handleUnpublish(
                                test._id
                              )
                            }
                            className="p-2 bg-yellow-100 text-yellow-700 rounded"
                            title="Unpublish"
                          >
                            <FaDownload />
                          </button>

                        ) : test.status !==
                          "Archived" ? (

                          <button
                            onClick={() =>
                              handlePublish(
                                test._id
                              )
                            }
                            className="p-2 bg-green-100 text-green-700 rounded"
                            title="Publish"
                          >
                            <FaUpload />
                          </button>

                        ) : null}

                        {test.status !==
                          "Archived" && (

                          <button
                            title="Archive"
                            onClick={() =>
                              handleDelete(
                                test._id
                              )
                            }
                            className="p-2 bg-red-100 text-red-600 rounded"
                          >
                            <FaTrash />
                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default PTEPracticeTests;