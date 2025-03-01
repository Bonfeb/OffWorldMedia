import { useState, useEffect } from "react";
import {
  Container,
  Nav,
  Navbar,
  Offcanvas,
  Dropdown,
  Image
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import API from "../api"; // API utility for requests

function NavBar() {
  const expand = "lg";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState("");
  const navigate = useNavigate();

  // Get tokens from local storage
  const getAccessToken = () => localStorage.getItem("access_token");
  const getRefreshToken = () => localStorage.getItem("refresh_token");

  // Save new access token
  const saveAccessToken = (token) => localStorage.setItem("access_token", token);

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      const response = await API.post("token/refresh/", { refresh: getRefreshToken() });
      saveAccessToken(response.data.access);
      return response.data.access;
    } catch (error) {
      console.error("Token refresh failed:", error);
      handleLogout();
      return null;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      const response = await API.get("profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfilePic(response.data.profile_pic);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setIsAuthenticated(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      let token = getAccessToken();
      if (!token) {
        const newToken = await refreshAccessToken();
        if (!newToken) return;
        token = newToken;
      }
      await fetchUserProfile(token);
    };

    checkAuth();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await API.post("logout/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <Navbar key={expand} expand={expand} className="bg-body-tertiary mb-3" data-bs-theme="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">OffWorldMedia</Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
        <Navbar.Offcanvas id={`offcanvasNavbar-expand-${expand}`} placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`} className="mx-auto -items-center">
              OffWorldMedia
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="mx-auto align-items-center">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/services">Services</Nav.Link>
              <Nav.Link as={Link} to="/team">Team</Nav.Link>
            </Nav>
            <Nav className="ms-auto d-flex align-items-center">
              {!isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                </>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle as="div" className="d-flex align-items-center" id="profile-dropdown">
                    <Image
                      src={userProfilePic}
                      roundedCircle
                      width="45"
                      height="45"
                      className="me-2"
                      style={{ cursor: "pointer" }}
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">View Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default NavBar;
