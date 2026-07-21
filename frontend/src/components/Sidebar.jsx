export default function Sidebar({ regions, selectedRegions, onToggle, onSelectAll, onClearAll }) {
  return (
    <aside style={{
      width: 230, minHeight: "100vh", borderRight: "1px solid #e5e7eb",
      padding: "20px 16px", background: "#f9fafb", flexShrink: 0,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: "#6b7280",
        marginBottom: 10, textTransform: "uppercase", letterSpacing: 1,
      }}>
        Regions ({regions.length})
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button onClick={onSelectAll} style={{
          flex: 1, padding: "5px 0", fontSize: 11, borderRadius: 6,
          border: "1px solid #d1d5db", background: "#fff",
          cursor: "pointer", fontWeight: 500,
        }}>All</button>
        <button onClick={onClearAll} style={{
          flex: 1, padding: "5px 0", fontSize: 11, borderRadius: 6,
          border: "1px solid #d1d5db", background: "#fff",
          cursor: "pointer", fontWeight: 500,
        }}>None</button>
      </div>

      {regions.map((r) => (
        <label key={r} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 8px", borderRadius: 6, cursor: "pointer",
          background: selectedRegions.has(r) ? "#dbeafe" : "transparent",
          marginBottom: 2, transition: "background 0.15s",
        }}>
          <input
            type="checkbox"
            checked={selectedRegions.has(r)}
            onChange={() => onToggle(r)}
            style={{ accentColor: "#3b82f6" }}
          />
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "#374151" }}>{r}</span>
        </label>
      ))}
    </aside>
  );
}
