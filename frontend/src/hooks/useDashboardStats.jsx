import { useState, useEffect, useCallback } from "react";
import { getDashboardStats, checkBackendHealth } from "../api/client";

export function useDashboardStats(contextMode) {
  const [stats, setStats] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [healthData, statsData] = await Promise.all([
        checkBackendHealth(),
        getDashboardStats(contextMode)
      ]);
      setBackendStatus(healthData.status === "healthy" ? "healthy" : "offline");
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setBackendStatus("offline");
    } finally {
      setLoading(false);
    }
  }, [contextMode]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 12000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, backendStatus, loading, refreshStats: fetchStats };
}
