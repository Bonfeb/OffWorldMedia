import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Container, Card, Form, Row, Col, Button, Modal } from "react-bootstrap";

const Register = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    profile_pic: null, // Now handling file uploads correctly
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUserData({ ...userData, profile_pic: e.target.files[0] }); // Properly handling file selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password !== userData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setShowFailureModal(true);
      return;
    }

    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      formData.append(key, userData[key]);
    });

    try {
      await API.post("register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data || "Registration failed. Please try again.");
      setShowFailureModal(true);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center register-container">
      <Card className="p-4 shadow-sm" style={{ width: "500px" }}>
        <Card.Body>
          <h3 className="text-center mb-4">Create an Account</h3>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={userData.first_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={userData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="username"
                placeholder="Username"
                value={userData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                name="email"
                placeholder="Email Address"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat Password"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={userData.phone}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="address"
                placeholder="Address"
                value={userData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* File Upload for Profile Picture */}
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                name="profile_pic"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Register Account
            </Button>
          </Form>

          <p className="text-center mt-3">
            Already have an account?{" "}
            <span className="login-link" onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </Card.Body>
      </Card>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => navigate("/login")} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your account has been created successfully. You can now log in.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Failure Modal */}
      <Modal show={showFailureModal} onHide={() => setShowFailureModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registration Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFailureModal(false)}>
            Try Again
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Register;
