const SERVICE_COLORS = {
  ec2:    { bg: "#dbeafe", text: "#1d4ed8" },
  rds:    { bg: "#d1fae5", text: "#065f46" },
  lambda: { bg: "#fef3c7", text: "#92400e" },
  eks:    { bg: "#ede9fe", text: "#5b21b6" },
  elb:    { bg: "#fce7f3", text: "#9d174d" },
  s3:     { bg: "#e0f2fe", text: "#0c4a6e" },
};

export default function ServiceBadge({ service, count }) {
  const style = SERVICE_COLORS[service] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{
      backgroundColor: style.bg, color: style.text,
      borderRadius: 20, padding: "2px 10px",
      fontSize: 12, fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {service.toUpperCase()}
      {count !== undefined && (
        <span style={{
          background: style.text, color: style.bg,
          borderRadius: 10, padding: "0 5px", fontSize: 11,
        }}>
          {count}
        </span>
      )}
    </span>
  );
}
