import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8002",
});

export const fetchDashboardStats  = ()       => api.get("/dashboard/stats");
export const postLoginLogout      = (body)   => api.post("/loginlogout", body);
export const fetchActivity = (params = {}) => {
  const query = {};
  if (params.date_from?.trim()) query.date_from = params.date_from.trim();
  if (params.date_to?.trim())   query.date_to   = params.date_to.trim();
  return api.get("/activity", { params: query });
};
export const fetchUSB             = ()           => api.get("/usb");

// Supports optional { username } filter
export const fetchApplications = (params = {}) => {
  const query = {};
  if (params.username?.trim()) query.username = params.username.trim();
  return api.get("/applications", { params: query });
};

// Supports optional { hostname, username, status } filters
export const fetchLoginLogout = (params = {}) => {
  const query = {};
  if (params.hostname?.trim()) query.hostname = params.hostname.trim();
  if (params.username?.trim()) query.username = params.username.trim();
  if (params.status?.trim())   query.status   = params.status.trim();
  return api.get("/loginlogout", { params: query });
};
