import { useState, useEffect, useCallback } from "react";
import { fetchRegions, fetchRegionData } from "../api/dashboardApi";

export function useAwsData(refreshInterval = 60000) {
  const [regions, setRegions] = useState([]);
  const [regionData, setRegionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const regionList = await fetchRegions();
      setRegions(regionList);

      const results = await Promise.allSettled(
        regionList.map((r) => fetchRegionData(r))
      );

      const dataMap = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") dataMap[regionList[i]] = r.value;
      });

      setRegionData(dataMap);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadData();
    }, 0);

    const refreshTimer = window.setInterval(() => {
      void loadData();
    }, refreshInterval);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadData, refreshInterval]);

  return { regions, regionData, loading, error, lastUpdated, refresh: loadData };
}
