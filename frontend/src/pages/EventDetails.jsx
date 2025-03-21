import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { Card, Form, Button, Container, Row, Col, Image, Alert } from "react-bootstrap";

const EventDetails = () => {
  const { serviceId, bookingId } = useParams(); // Get service and booking IDs
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);
  const [formData, setFormData] = useState({
    event_date: "",
    event_time: "",
    event_location: "",
    service_id: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchServiceDetails();
    if (bookingId) {
      fetchBookingDetails(); // Fetch booking details if updating
    }
  }, [bookingId]);

  const fetchServiceDetails = async () => {
    try {
      const response = await API.get(`/service-details/${serviceId}/`);
      setServiceData(response.data);
    } catch (error) {
      console.error("Error fetching service details:", error);
      setErrorMessage("Failed to load service details.");
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const response = await API.get(`/booking/${bookingId}/`);
      setFormData(prevState => ({
        ...prevState,  // ✅ Preserve existing state
        event_date: response.data.event_date || "",
        event_time: response.data.event_time || "",
        event_location: response.data.event_location || "",
        service_id: response.data.service || prevState.service_id || serviceId,  // ✅ Ensure service_id is not lost
      }));
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setErrorMessage("Failed to load booking details.");
    }
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending event details:", formData);

    try {
      const { event_date, event_time, event_location, service_id} = formData;
      
      if (bookingId) {
        console.log("Updating booking:", bookingId);
        console.log("Payload:", { event_date, event_time, event_location, service_id});
        // Update existing booking
        const response = await API.put(`/booking/${bookingId}/`, {
          service_id: serviceId,
          event_date,
          event_time,
          event_location,
        }, { withCredentials: true });

        console.log("Response:", response);

        if (response.status === 200) {
          setSuccessMessage("Booking updated successfully!");
          setTimeout(() => navigate("/userdashboard"), 2000);
        }
      } else {
        // Add to cart
        const response = await API.post("/userdashboard/", {
          service_id: serviceId,
          event_date,
          event_time,
          event_location,
        }, { withCredentials: true });

        if (response.status === 201) {
          setSuccessMessage("Service added to cart successfully!");
          setTimeout(() => navigate("/userdashboard"), 2000);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setErrorMessage("Failed to process your request.");
    }
  };

  if (!serviceData) {
    return <p className="text-center mt-5">Loading service details...</p>;
  }

  return (
    <Container fluid className="mt-0 py-5" style={{ background: "linear-gradient(to right,rgb(24, 44, 11),rgb(8, 148, 148), rgb(23, 66, 20))", minHeight: "100vh"}}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="text-center">
              <h4>{bookingId ? "Update Booking" : "Fill Event Details"}</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center">
                  <Image
                    src={`http:127.0.0.1:8000/api/media/${serviceData.image_url}`}
                    alt={serviceData.name}
                    width="100%"
                    height="150px"
                    className="rounded"
                    style={{ objectFit: "cover" }}
                  />
                </Col>
                <Col md={8}>
                  <h5>{serviceData.name}</h5>
                  <p><strong>Price:</strong> KSH {serviceData.price}</p>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group>
                  <Form.Label>Event Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Event Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Event Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="event_location"
                    value={formData.event_location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3 w-100">
                  {bookingId ? "Update Booking" : "Add To Cart"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetails;
