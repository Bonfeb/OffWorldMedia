import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import API from "../api";

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}services/${serviceId}/`)
      .then((response) => {
        setService(response.data);
      })
      .catch(() => {
        setShowFailureModal(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [serviceId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(
        `${API}bookings/`,
        { service: serviceId, event_date: eventDate, event_time: eventTime },
        { withCredentials: true }
      );
      setShowSuccessModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Book Service</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          {service && (
            <>
              <h4>{service.name}</h4>
              <p>{service.description}</p>
              <Form onSubmit={handleBooking}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Date of the Event</Form.Label>
                  <Form.Control
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                  <br />
                  <Form.Label>Select Time of the Event</Form.Label>
                  <Form.Control
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit" disabled={submitting}>
                  {submitting ? "Booking..." : "Book Now"}
                </Button>
              </Form>
            </>
          )}
        </>
      )}

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
