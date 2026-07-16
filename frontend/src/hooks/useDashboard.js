import { useEffect, useState } from "react";

import {
  getAdminDashboard,
} from "../services/dashboardService";

const useDashboard = () => {

  const [statistics, setStatistics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchDashboard =
    async () => {

      try {

        const data =
          await getAdminDashboard();

        setStatistics(data.statistics);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

  useEffect(() => {

    fetchDashboard();

  }, []);

  return {

    statistics,

    loading,

    error,

    refresh: fetchDashboard,

  };

};

export default useDashboard;