import StatusIndicator from "./StatusIndicator";

export default function AZTable({ azs }) {
  if (!azs?.length)
    return <p style={{ color: "#9ca3af", fontSize: 13 }}>No AZ data available.</p>;

  return (
    <div>
      {azs.map((az) => (
        <div key={az.name} style={{
          marginBottom: 16, border: "1px solid #e5e7eb",
          borderRadius: 8, overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 14px", background: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{az.name}</span>
            <StatusIndicator state={az.state} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {az.instances.length} instance{az.instances.length !== 1 ? "s" : ""}
            </span>
          </div>

          {az.instances.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {["Name", "ID", "Type", "State", "Launch Time"].map((h) => (
                    <th key={h} style={{
                      padding: "6px 14px", textAlign: "left",
                      fontWeight: 500, color: "#374151",
                      borderBottom: "1px solid #e5e7eb",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {az.instances.map((inst) => (
                  <tr key={inst.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "6px 14px" }}>{inst.name}</td>
                    <td style={{ padding: "6px 14px", fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{inst.id}</td>
                    <td style={{ padding: "6px 14px" }}>{inst.type}</td>
                    <td style={{ padding: "6px 14px" }}><StatusIndicator state={inst.state} /></td>
                    <td style={{ padding: "6px 14px", color: "#9ca3af", fontSize: 11 }}>
                      {inst.launchTime ? new Date(inst.launchTime).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
