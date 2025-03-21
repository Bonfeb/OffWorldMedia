import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState("");
  const [authTokens, setAuthTokens] = useState(() => {
    const storedTokens = localStorage.getItem("authTokens");
    return storedTokens ? JSON.parse(storedTokens) : null;
  });

  const [user, setUser] = useState(() => {
    const storedTokens = localStorage.getItem("authTokens");
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        if (parsedTokens?.access && typeof parsedTokens.access === "string") {
          return jwtDecode(parsedTokens.access);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  });

  // Check authentication status on mount
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await API.get("profile/");
      setIsAuthenticated(true);
      setUserProfilePic(response.data.profile_pic || "");
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUserProfilePic("");
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await API.post("login/", credentials, {
        withCredentials: true,
      });

      console.log("Login response:", response.data);

      if (!response.data.access_token || typeof response.data.access_token !== "string") {
        throw new Error("Invalid token received");
      }

      setIsAuthenticated(true);
      setUserProfilePic(response.data.profile_pic || "");
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access_token));
      localStorage.setItem("authTokens", JSON.stringify(response.data));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await API.post("logout/");
      setIsAuthenticated(false);
      setUserProfilePic("");
      setAuthTokens(null);
      setUser(null);
      localStorage.removeItem("authTokens");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const contextData = {
    isAuthenticated,
    userProfilePic,
    setUserProfilePic,
    user,
    authTokens,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
}
