import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import API from "../api";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    setIsAuthenticated(!!accessToken);

    if (accessToken) {
      API.get("profile/", { withCredentials: true })
        .then((response) => {
          setFormData((prevState) => ({
            ...prevState,
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            email: response.data.email,
          }));
        })
        .catch((error) => console.error("Error fetching user details:", error));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    try {
      const response = await API.post("contact/", formData, {
        withCredentials: true,
      });
      setResponseMessage(response.data.message);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setResponseMessage("Error sending message. Please try again.");
    }
  };

  return (
    <Container fluid className="py-5" style={{ background: "linear-gradient(to right,rgb(11, 177, 80),rgb(1, 63, 172))", minHeight: "100vh"}}>
      <h1 className="text-center mb-4">Get in Touch With Us</h1>
      <hr/>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="p-4 shadow h-100 d-flex flex-column justify-content-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.844733880548!2d39.85400177568686!3d-3.6229327963511357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x183fdd77b5e306bd%3A0x29d1cd979d54b312!2sWater%20Sports%20Ground!5e0!3m2!1sen!2ske!4v1742594009117!5m2!1sen!2ske"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            <ListGroup variant="flush" className="mt-3">
              <ListGroup.Item>
                {" "}
                <div className="flex-grow-1">
                  <FontAwesomeIcon icon={faEnvelope} className="text-primary" />{" "}
                  <strong>Email: </strong>
                  <span className="text-muted">
                    <i>offworldmedia@africa.com</i>
                  </span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="flex-grow-1">
                  <FontAwesomeIcon icon={faPhone} className="text-primary" />{" "}
                  <span className="text-muted">
                    <strong>Phone:</strong>
                  </span>
                  <p>
                    <i>+2547-979-8030</i>
                  </p>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="flex-grow-1">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-primary"
                  />{" "}
                  <strong>Address:</strong>
                  <p>
                    <i>
                      500 Office Center Drive, Suite 400, Fort Washington, PA
                      19034
                    </i>
                  </p>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-4 shadow h-100 d-flex flex-column justify-content-center">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subject *</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button variant="success" type="submit">
                Send Message
              </Button>
            </Form>
            {responseMessage && (
              <p className="mt-3 text-success">{responseMessage}</p>
            )}
          </Card>
        </Col>
      </Row>

      {/* Authentication Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Authentication Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You need to log in to send a message.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" href="/login">
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ContactUs;
