import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://full-stack-attendance-management-system.onrender.com/api",
});

// attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// handle 401/403 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      console.warn("Auth error → logging out");
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default API;