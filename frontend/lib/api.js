import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Attach the JWT saved at login to every outgoing request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Send an expired/invalid session back to the login screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("companyName");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
