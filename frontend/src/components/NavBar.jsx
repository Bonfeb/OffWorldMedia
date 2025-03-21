import { useContext } from "react";
import { Container, Nav, Navbar, Offcanvas, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function NavBar() {
  const { isAuthenticated, userProfilePic, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary mb-3" data-bs-theme="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">OffWorldMedia</Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-lg" />
        <Navbar.Offcanvas id="offcanvasNavbar-expand-lg" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="mx-auto">OffWorldMedia</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="mx-auto align-items-center">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/services">Services</Nav.Link>
              <Nav.Link as={Link} to="/team">Team</Nav.Link>
              <Nav.Link as={Link} to="/contactus">Contact Us</Nav.Link>
            </Nav>
            <Nav className="ms-auto d-flex align-items-center">
              {!isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                </>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle as="div" className="d-flex align-items-center">
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
                    <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/userdashboard">My Dashboard</Dropdown.Item>
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
