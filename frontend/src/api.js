import axios from "axios";
import { getAccessToken, refreshAccessToken, clearTokens } from "./auth";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true, // Allows sending cookies (refresh token)
});

// Attach access token to all requests
API.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();

    if (!token) {
      token = await refreshAccessToken(); // Try refreshing token
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors by refreshing token automatically
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return API.request(error.config);
      }
      clearTokens();
    }
    return Promise.reject(error);
  }
);

export default API;
