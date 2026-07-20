import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";
import StudentSearch from "../../../components/StudentManagement/StudentSearch";
import StudentFilters from "../../../components/StudentManagement/StudentFilters";
import StudentTable from "../../../components/StudentManagement/StudentTable";
import StudentPagination from "../../../components/StudentManagement/StudentPagination";
import StudentSorting from "../../../components/StudentManagement/StudentSorting";

import * as studentService from "../../../services/studentService";
import * as batchService from "../../../services/batchService";

const StudentList = () => {
  const navigate = useNavigate();

  // =====================================
  // State
  // =====================================

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    targetExam: "",
    targetCountry: "",
    batchId: "",
    status: "",
  });

  const [sort, setSort] = useState({
    sortBy: "joinedDate",
    order: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // =====================================
  // Fetch Students
  // =====================================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const params = {
        search,
        ...filters,
        ...sort,
      };

      const response = await studentService.getAllStudents(params);

      setStudents(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Fetch Batches
  // =====================================

  const fetchBatches = async () => {
    try {
      const response = await batchService.getAllBatches();

      setBatches(response.batches || []);
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================
  // Initial Load
  // =====================================

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  // =====================================
  // Refetch On Search / Filter
  // =====================================

  useEffect(() => {
    fetchStudents();
  }, [search, filters, sort]);

  // =====================================
  // Pagination
  // =====================================

  const totalPages = Math.ceil(
    students.length / studentsPerPage
  );

  const startIndex =
    (currentPage - 1) * studentsPerPage;

  const currentStudents = students.slice(
    startIndex,
    startIndex + studentsPerPage
  );
    // =====================================
  // Render
  // =====================================

  return (
    <DashboardLayout>
      <div className="p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Student Management
          </h1>

          <p className="text-gray-500">
            Manage all students in the institute.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/students/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Student
        </button>

      </div>

      {/* Search */}

      <StudentSearch
        search={search}
        setSearch={setSearch}
      />

      {/* Filters */}

      <StudentFilters
        filters={filters}
        setFilters={setFilters}
        batches={batches}
      />

      {/* Sorting */}
      <StudentSorting
        sort={sort}
        setSort={setSort}
      />
      {/* Error */}

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-4 my-4">
          {error}
        </div>
      )}

      {/* Loading */}

      {loading ? (
        <div className="text-center py-10">
          Loading students...
        </div>
      ) : (
        <>
          {/* Student Table */}

          <StudentTable
            students={currentStudents}
            onView={(id) =>
              navigate(`/admin/students/${id}`)
            }
            onEdit={(id) =>
              navigate(`/admin/students/edit/${id}`)
            }
            onDelete={fetchStudents}
          />

          {/* Pagination */}

          {students.length > studentsPerPage && (
            <StudentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

    </div>
    </DashboardLayout>
  );
};

export default StudentList;