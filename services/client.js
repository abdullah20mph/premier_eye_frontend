import axios from "axios";
import { getToken } from "./authTokenHelper";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: false,
});
console.log("🔍 Using API URL:", import.meta.env.VITE_API_URL);

// Attach Authorization header on every request
api.interceptors.request.use((config) => {
  const token = getToken();  // get from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠ No token found when calling API:", config.url);
  }
  return config;
});

export default api;
