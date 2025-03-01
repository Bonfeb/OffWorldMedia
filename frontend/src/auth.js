import API from "./api";

const ACCESS_TOKEN_KEY = "accessToken";

// Save access token to local storage
export const saveTokens = (accessToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

// Get access token from local storage
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

// Remove access token from local storage (for logout)
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// Refresh access token using refresh token (sent via cookies)
export const refreshAccessToken = async () => {
  try {
    const response = await API.post("token/refresh/", {}, {
      withCredentials: true, // Sends refresh token via cookies
    });

    const newAccessToken = response.data.access;
    saveTokens(newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    clearTokens();
    return null;
  }
};
