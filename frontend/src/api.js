import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true, // ✅ Automatically send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

API.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("accessToken"); // ✅ Store in sessionStorage (not localStorage)
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(API(originalRequest)); // Retry request after refresh
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await API.post("token/refresh/"); // ✅ No need to send refresh token manually
        const newAccessToken = response.data.access_token;
        sessionStorage.setItem("accessToken", newAccessToken); // ✅ Store access token temporarily
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        onRefreshed(newAccessToken);
        return API(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        isRefreshing = false;
        sessionStorage.removeItem("accessToken"); // 🔴 Clear session if refresh fails
        window.location.href = "/login"; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
