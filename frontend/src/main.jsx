import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext"; // Ensure this path is correct
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap for styling

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
        <App />
    </AuthProvider>
  </React.StrictMode>
);
