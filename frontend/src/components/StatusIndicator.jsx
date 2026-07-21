export default function StatusIndicator({ state }) {
  const colors = {
    running:    "#22c55e",
    available:  "#22c55e",
    active:     "#22c55e",
    stopped:    "#ef4444",
    terminated: "#6b7280",
    pending:    "#f59e0b",
    starting:   "#f59e0b",
    stopping:   "#f59e0b",
  };
  const color = colors[state?.toLowerCase()] || "#6b7280";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 9, height: 9, borderRadius: "50%",
        backgroundColor: color, display: "inline-block",
        boxShadow: `0 0 4px ${color}66`,
      }} />
      <span style={{ fontSize: 12, color: "#6b7280" }}>{state || "unknown"}</span>
    </span>
  );
}
