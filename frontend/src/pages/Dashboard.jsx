import { useState } from "react";
import { useAwsData } from "../hooks/useAwsData";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RegionCard from "../components/RegionCard";

export default function Dashboard() {
  const { regions, regionData, loading, error, lastUpdated, refresh } = useAwsData(60000);
  const [selectedRegions, setSelectedRegions] = useState(null);

  const toggleRegion = (region) =>
    setSelectedRegions((previous) => {
      const next = new Set(previous ?? regions);
      next.has(region) ? next.delete(region) : next.add(region);
      return next;
    });

  const effectiveSelection = selectedRegions ?? new Set(regions);
  const visibleRegions =
    selectedRegions === null
      ? regions
      : regions.filter((region) => selectedRegions.has(region));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />

      <div style={{ display: "flex" }}>
        <Sidebar
          regions={regions}
          selectedRegions={effectiveSelection}
          onToggle={toggleRegion}
          onSelectAll={() => setSelectedRegions(null)}
          onClearAll={() => setSelectedRegions(new Set())}
        />

        <main style={{ flex: 1, padding: "24px 32px", minWidth: 0 }}>
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "12px 16px",
              marginBottom: 20, color: "#991b1b", fontSize: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && regions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>
              <div style={{ fontSize: 48 }}>☁️</div>
              <p style={{ marginTop: 12, fontSize: 15 }}>
                Fetching AWS data across all regions…
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {visibleRegions.map((region) => (
                <RegionCard
                  key={region}
                  region={region}
                  data={regionData[region]}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
