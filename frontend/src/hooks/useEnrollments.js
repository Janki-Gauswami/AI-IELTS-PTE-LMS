import { useEffect, useState } from "react";

import {
  getStudentsByBatch,
  assignStudent,
  removeStudent,
  transferStudent,
} from "../services/enrollmentService";

const useEnrollments = (batchId) => {
  // ======================================
  // States
  // ======================================

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ======================================
  // Fetch Students
  // ======================================

  const fetchStudents = async () => {
    if (!batchId) return;

    try {
      setLoading(true);

      const response = await getStudentsByBatch(batchId);

      setStudents(response.students || []);

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to fetch students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // Assign Student
  // ======================================

  const assign = async (studentId) => {
    try {
      setLoading(true);

      const response = await assignStudent({
        student: studentId,
        batch: batchId,
      });

      await fetchStudents();

      return response;
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to assign student."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // Remove Student
  // ======================================

  const remove = async (enrollmentId) => {
    try {
      setLoading(true);

      const response = await removeStudent(
        enrollmentId
      );

      await fetchStudents();

      return response;
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to remove student."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // Transfer Student
  // ======================================

  const transfer = async (
    studentId,
    fromBatch,
    toBatch
  ) => {
    try {
      setLoading(true);

      const response = await transferStudent({
        student: studentId,
        fromBatch,
        toBatch,
      });

      await fetchStudents();

      return response;
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to transfer student."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // Initial Load
  // ======================================

  useEffect(() => {
    fetchStudents();
  }, [batchId]);

  // ======================================
  // Exports
  // ======================================

  return {
    students,
    loading,
    error,

    fetchStudents,

    assign,

    remove,

    transfer,
  };
};

export default useEnrollments;