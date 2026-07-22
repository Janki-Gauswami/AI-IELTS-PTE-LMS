import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllTeachers,
  deleteTeacher,
} from "../../../services/teacherService";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

import TeacherTable from "../../../components/TeacherManagement/TeacherTable";
import TeacherSearch from "../../../components/TeacherManagement/TeacherSearch";
import TeacherFilters from "../../../components/TeacherManagement/TeacherFilters";
import TeacherSorting from "../../../components/TeacherManagement/TeacherSorting";
import TeacherPagination from "../../../components/TeacherManagement/TeacherPagination";

const TeacherList = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Filters
  const [status, setStatus] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  // Fetch Teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);

      const response = await getAllTeachers({
        page,
        limit,
        search,
        status,
        specialization,
        qualification,
        sortBy,
        order,
      });

      setTeachers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error(error);
      alert("Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [
    page,
    limit,
    search,
    status,
    specialization,
    qualification,
    sortBy,
    order,
  ]);

  // View
  const handleView = (teacherId) => {
    navigate(`/admin/teachers/${teacherId}`);
  };

  // Edit
  const handleEdit = (teacherId) => {
    navigate(`/admin/teachers/edit/${teacherId}`);
  };

  // Delete
  const handleDelete = async (teacherId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmDelete) return;

    try {
      await deleteTeacher(teacherId);

      alert("Teacher deleted successfully.");

      fetchTeachers();
    } catch (error) {
      console.error(error);
      alert("Unable to delete teacher.");
    }
  };

  return (
    <DashboardLayout>
    <div className="p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Teacher Management
        </h1>

        <button
          onClick={() => navigate("/admin/teachers/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Teacher
        </button>

      </div>

      {/* Search */}

      <div className="mb-4">
        <TeacherSearch
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* Filters */}

      <div className="mb-4">
        <TeacherFilters
          status={status}
          setStatus={setStatus}
          specialization={specialization}
          setSpecialization={setSpecialization}
          qualification={qualification}
          setQualification={setQualification}
        />
      </div>

      {/* Sorting */}

      <div className="mb-4">
        <TeacherSorting
          sortBy={sortBy}
          setSortBy={setSortBy}
          order={order}
          setOrder={setOrder}
        />
      </div>

      {/* Table */}

      <TeacherTable
        teachers={teachers}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}

      <TeacherPagination
        pagination={pagination}
        setPage={setPage}
        setLimit={setLimit}
      />

    </div>
    </DashboardLayout>
  );
};

export default TeacherList;