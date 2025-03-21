// src/pages/UpdateBooking.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Button,
  Container,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import API from "../api";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    service: "",
    date: "",
    time: "",
    location: "",
  });

  useEffect(() => {
    console.log("Fetching:", `${API}/booking/${id}/`);
    axios
      .get(`${API}/booking/${id}/`)
      .then((response) => {
        console.log("Booking Details:", response.data);
        setBooking(response.data);
        setFormData({
          service: response.data.service,
          date: response.data.date,
          time: response.data.time,
          location: response.data.location,
        });
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load booking details.");
        setLoading(false);
      });
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!eventDate || !eventTime) {
      alert("Please Select Both Date and Time for the Event!");
      setSubmitting(false);
      return;
    }

    try {
      await API.post(
        "bookings/",
        {
          service: serviceId,
          event_date: eventDate,
          event_time: eventTime,
          price: service.price, // ✅ Send price but keep it read-only
          description: service.description, // ✅ Send description but read-only
        },
        { withCredentials: true }
      );
      setShowSuccessModal(true);
    } catch (error) {
      setShowFailureModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${API}/booking/${id}/`, formData)
      .then(() => navigate("/bookings"))
      .catch((error) => setError("Failed to update booking."));
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <h2>Book Service</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="service">
          <Form.Label>Service</Form.Label>
          <Form.Control
            type="text"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="time">
          <Form.Label>Time</Form.Label>
          <Form.Control
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="location">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3 btn-success">
          Book Service
        </Button>
      </Form>

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onHide={() => navigate("/userdashboard")}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Booking Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Booking successfully created! View your dashboard for status updates.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigate("/userdashboard")}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Failure Modal */}
      <Modal
        show={showFailureModal}
        onHide={() => setShowFailureModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Booking Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>Failed to Book. Please try again.</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowFailureModal(false)}
          >
            Try Again
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Booking;
