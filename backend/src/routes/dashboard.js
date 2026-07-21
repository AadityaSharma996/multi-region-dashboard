const express = require("express");
const router = express.Router();
const { getAllRegions, getRegionData } = require("../services/awsServices");
const { cacheMiddleware } = require("../middleware/cache");

// GET /api/regions — list all enabled AWS regions
router.get("/regions", async (req, res) => {
  try {
    const regions = await getAllRegions();
    res.json({ regions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/region/:region — full data for one region
router.get(
  "/region/:region",
  cacheMiddleware((req) => `region:${req.params.region}`),
  async (req, res) => {
    try {
      const data = await getRegionData(req.params.region);
      res.sendCached(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/all — all regions in parallel
router.get("/all", async (req, res) => {
  try {
    const regions = await getAllRegions();
    const results = await Promise.allSettled(
      regions.map((r) => getRegionData(r))
    );
    res.json({
      timestamp: new Date().toISOString(),
      regions: results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
