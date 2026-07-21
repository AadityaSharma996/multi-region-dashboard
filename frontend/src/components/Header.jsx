export default function Header({ lastUpdated, onRefresh, loading }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "18px 32px", borderBottom: "1px solid #e5e7eb",
      background: "#fff", position: "sticky", top: 0, zIndex: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
          ☁️ AWS Multi-Region Dashboard
        </h1>
        {lastUpdated && (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          padding: "8px 20px", borderRadius: 8,
          border: "1px solid #d1d5db",
          background: loading ? "#f9fafb" : "#3b82f6",
          color: loading ? "#9ca3af" : "#fff",
          fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          fontSize: 14, transition: "background 0.2s",
        }}
      >
        {loading ? "⟳ Refreshing…" : "⟳ Refresh"}
      </button>
    </div>
  );
}
