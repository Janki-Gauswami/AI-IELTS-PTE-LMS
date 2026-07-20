import { useState, useEffect, useCallback } from "react";
import * as studentService from "../services/studentService";

const useStudents = (filters = {}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await studentService.getAllStudents(filters);

      setStudents(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    fetchStudents,
    setStudents,
  };
};

export default useStudents;