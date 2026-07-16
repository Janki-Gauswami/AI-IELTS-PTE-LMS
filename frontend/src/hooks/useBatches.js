import { useEffect, useState } from "react";

import {
  getAllBatches,
  deleteBatch,
} from "../services/batchService";

const useBatches = () => {
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ======================================
  // Fetch All Batches
  // ======================================

  const fetchBatches = async () => {
    try {
      setLoading(true);

      const data = await getAllBatches();

      setBatches(data.batches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // Delete Batch
  // ======================================

  const removeBatch = async (id) => {
    try {
      await deleteBatch(id);

      setBatches((prev) =>
        prev.filter((batch) => batch._id !== id)
      );

      return true;
    } catch (err) {
      setError(err.message);

      return false;
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return {
    batches,
    loading,
    error,
    fetchBatches,
    removeBatch,
  };
};

export default useBatches;