import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Container, Card, Form, Button, Modal } from "react-bootstrap";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use login function from context

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked! Submitting form...");

    try {
      await login(credentials); // Use context login function
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Login error:", error.message);
      setErrorMessage(error.message || "Login failed. Please try again.");
      setShowFailureModal(true);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100 login-container"
    >
      <Card className="p-4 shadow-lg login-card">
        <Card.Body>
          <h4 className="text-center mb-4">Login</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>

          <p className="text-center mt-3">
            Don't have an account?{" "}
            <span className="register-link" onClick={() => navigate("/register")}>
              Register
            </span>
          </p>
        </Card.Body>
      </Card>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => navigate("/userdashboard")} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>Login Successful! You can now book.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigate("/userdashboard")}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Failure Modal */}
      <Modal show={showFailureModal} onHide={() => setShowFailureModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFailureModal(false)}>
            Try Again
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Login;
