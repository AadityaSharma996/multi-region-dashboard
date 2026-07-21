require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.disable("x-powered-by");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "aws-dashboard-backend",
  });
});

app.use("/api", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled backend error:", err);

  res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
});
