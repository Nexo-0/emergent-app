import axios from "axios";

const rawBaseUrl =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");

export const apiBaseUrl = normalizedBaseUrl
  ? `${normalizedBaseUrl}/api`
  : "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

export default api;
