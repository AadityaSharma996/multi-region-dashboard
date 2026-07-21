import axios from "axios";

const BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const fetchRegions = () =>
  axios.get(`${BASE}/regions`).then((r) => r.data.regions);

export const fetchRegionData = (region) =>
  axios.get(`${BASE}/region/${region}`).then((r) => r.data);

export const fetchAllRegions = () =>
  axios.get(`${BASE}/all`).then((r) => r.data);
