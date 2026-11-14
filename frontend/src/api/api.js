import axios from "axios";

// Read API base URL from Vite environment variable with safe development fallback
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: rawBaseURL.trim().replace(/\/+$/, ""),
});

// Interceptor to inject JWT token into all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;