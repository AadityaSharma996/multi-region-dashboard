import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

export const fetchRegions = () =>
  axios.get(`${BASE}/regions`).then((response) => response.data.regions);

export const fetchRegionData = (region) =>
  axios
    .get(`${BASE}/region/${encodeURIComponent(region)}`)
    .then((response) => response.data);

export const fetchAllRegions = () =>
  axios.get(`${BASE}/all`).then((response) => response.data);
