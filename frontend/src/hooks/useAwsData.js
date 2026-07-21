import { useState, useEffect, useCallback, useRef } from "react";
import { fetchRegions, fetchRegionData } from "../api/dashboardApi";

export function useAwsData(refreshInterval = 60000) {
  const [regions, setRegions] = useState([]);
  const [regionData, setRegionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const requestInFlight = useRef(false);

  const loadData = useCallback(async () => {
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const regionList = await fetchRegions();
      setRegions(regionList);

      const results = await Promise.allSettled(
        regionList.map((region) => fetchRegionData(region))
      );

      const dataMap = {};
      const failedRegions = [];

      results.forEach((result, index) => {
        const region = regionList[index];

        if (result.status === "fulfilled") {
          dataMap[region] = result.value;
        } else {
          failedRegions.push(region);
        }
      });

      setRegionData(dataMap);
      setLastUpdated(new Date());

      if (failedRegions.length > 0) {
        setError(`Failed to load: ${failedRegions.join(", ")}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load AWS data");
    } finally {
      requestInFlight.current = false;
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
