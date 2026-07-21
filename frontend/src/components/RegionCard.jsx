import { useState } from "react";
import AZTable from "./AZTable";
import ServiceBadge from "./ServiceBadge";
import StatusIndicator from "./StatusIndicator";

export default function RegionCard({ region, data }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("ec2");

  if (!data) return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 12,
      padding: 20, opacity: 0.5, background: "#fff",
    }}>
      <span style={{ fontWeight: 600 }}>{region}</span>
      <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 10 }}>Loading…</span>
    </div>
  );

  const totalInstances = data.ec2?.azs?.reduce((s, az) => s + az.instances.length, 0) || 0;
  const tabs = ["ec2", "rds", "lambda", "eks", "elb", "s3"];

  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 12,
      overflow: "hidden", background: "#fff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "16px 20px", cursor: "pointer",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", background: expanded ? "#f8fafc" : "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🌍 {region}</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {data.ec2?.azs?.length || 0} AZs · {totalInstances} EC2
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <ServiceBadge service="ec2"    count={totalInstances} />
          <ServiceBadge service="rds"    count={data.rds?.length} />
          <ServiceBadge service="lambda" count={data.lambda?.length} />
          <ServiceBadge service="eks"    count={data.eks?.length} />
          <ServiceBadge service="elb"    count={data.elb?.length} />
          <ServiceBadge service="s3"     count={data.s3?.length} />
        </div>
        <span style={{ fontSize: 18, color: "#9ca3af" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f3f4f6" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, padding: "12px 0" }}>
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "5px 14px", borderRadius: 20, border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: activeTab === tab ? "#3b82f6" : "#f3f4f6",
                color: activeTab === tab ? "#fff" : "#374151",
              }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* EC2 tab */}
          {activeTab === "ec2" && <AZTable azs={data.ec2?.azs} />}

          {/* RDS tab */}
          {activeTab === "rds" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f3f4f6" }}>
                {["ID", "Engine", "Status", "AZ", "Class", "Multi-AZ"].map((h) => (
                  <th key={h} style={{ padding: "7px 14px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(data.rds || []).length === 0
                  ? <tr><td colSpan={6} style={{ padding: 14, color: "#9ca3af" }}>No RDS instances</td></tr>
                  : (data.rds || []).map((db) => (
                    <tr key={db.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "7px 14px", fontFamily: "monospace", fontSize: 11 }}>{db.id}</td>
                      <td style={{ padding: "7px 14px" }}>{db.engine} {db.engineVersion}</td>
                      <td style={{ padding: "7px 14px" }}>
                        <span style={{
                          background: db.status === "available" ? "#d1fae5" : "#fef3c7",
                          color: db.status === "available" ? "#065f46" : "#92400e",
                          borderRadius: 10, padding: "2px 8px", fontSize: 11,
                        }}>{db.status}</span>
                      </td>
                      <td style={{ padding: "7px 14px" }}>{db.az}</td>
                      <td style={{ padding: "7px 14px" }}>{db.instanceClass}</td>
                      <td style={{ padding: "7px 14px" }}>{db.multiAZ ? "✓" : "—"}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

          {/* Lambda tab */}
          {activeTab === "lambda" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f3f4f6" }}>
                {["Name", "Runtime", "Memory", "Timeout", "Last Modified"].map((h) => (
                  <th key={h} style={{ padding: "7px 14px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(data.lambda || []).length === 0
                  ? <tr><td colSpan={5} style={{ padding: 14, color: "#9ca3af" }}>No Lambda functions</td></tr>
                  : (data.lambda || []).map((fn) => (
                    <tr key={fn.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "7px 14px", fontFamily: "monospace", fontSize: 11 }}>{fn.name}</td>
                      <td style={{ padding: "7px 14px" }}>{fn.runtime}</td>
                      <td style={{ padding: "7px 14px" }}>{fn.memory} MB</td>
                      <td style={{ padding: "7px 14px" }}>{fn.timeout}s</td>
                      <td style={{ padding: "7px 14px", color: "#9ca3af", fontSize: 11 }}>
                        {fn.lastModified ? new Date(fn.lastModified).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

          {/* EKS tab */}
          {activeTab === "eks" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
              {(data.eks || []).length === 0
                ? <p style={{ color: "#9ca3af", fontSize: 13 }}>No EKS clusters</p>
                : (data.eks || []).map((c) => (
                  <div key={c.name} style={{
                    border: "1px solid #e5e7eb", borderRadius: 8,
                    padding: "10px 16px", minWidth: 200,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Kubernetes v{c.version}</div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        background: c.status === "ACTIVE" ? "#d1fae5" : "#fef3c7",
                        color: c.status === "ACTIVE" ? "#065f46" : "#92400e",
                        borderRadius: 10, padding: "2px 8px", fontSize: 11,
                      }}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ELB tab */}
          {activeTab === "elb" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f3f4f6" }}>
                {["Name", "Type", "State", "Scheme", "AZs"].map((h) => (
                  <th key={h} style={{ padding: "7px 14px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(data.elb || []).length === 0
                  ? <tr><td colSpan={5} style={{ padding: 14, color: "#9ca3af" }}>No load balancers</td></tr>
                  : (data.elb || []).map((lb) => (
                    <tr key={lb.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "7px 14px" }}>{lb.name}</td>
                      <td style={{ padding: "7px 14px" }}>{lb.type}</td>
                      <td style={{ padding: "7px 14px" }}><StatusIndicator state={lb.state} /></td>
                      <td style={{ padding: "7px 14px" }}>{lb.scheme}</td>
                      <td style={{ padding: "7px 14px", fontSize: 11 }}>{lb.azs?.join(", ")}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

          {/* S3 tab */}
          {activeTab === "s3" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f3f4f6" }}>
                {["Bucket Name", "Created"].map((h) => (
                  <th key={h} style={{ padding: "7px 14px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(data.s3 || []).length === 0
                  ? <tr><td colSpan={2} style={{ padding: 14, color: "#9ca3af" }}>No S3 buckets in this region</td></tr>
                  : (data.s3 || []).map((b) => (
                    <tr key={b.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "7px 14px", fontFamily: "monospace", fontSize: 11 }}>{b.name}</td>
                      <td style={{ padding: "7px 14px", color: "#9ca3af", fontSize: 11 }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

        </div>
      )}
    </div>
  );
}
