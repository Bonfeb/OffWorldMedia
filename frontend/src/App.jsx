import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Service from "./pages/Service";
import Login from "./components/Login";
import Register from "./components/Register";
import "./assets/css/Login.css";
import "./assets/css/Register.css";
import Profile from "./pages/Profile";
import ProfileUpdate from "./pages/ProfileUpdate";
import UserDashboard from "./pages/UserDashboard";
import Booking from "./pages/Booking";

function App() {
  return (
    <>
      <Router>
        <NavBar />
        <div>
          <Routes>
            <Route path="/" element={ <Register/> } />
            <Route path="/login" element={ <Login/> } />
            <Route path="/profile" element={ <Profile/> } />
            <Route path="/profile/update" element={ <ProfileUpdate/> } />
            <Route path="/userdashboard" element={ <UserDashboard/> } />
            <Route path="/booking" element={ <Booking/> } />
            <Route path="/home" element={ <Home/> } />
            <Route path="/team" element={ <Team/> } />
            <Route path="/services" element={ <Service/> } />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
