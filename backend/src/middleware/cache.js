const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 60 });

function cacheMiddleware(keyFn) {
  return async (req, res, next) => {
    const key = keyFn(req);
    const cached = cache.get(key);
    if (cached) return res.json({ ...cached, fromCache: true });
    res.sendCached = (data) => {
      cache.set(key, data);
      res.json(data);
    };
    next();
  };
}

module.exports = { cacheMiddleware };
