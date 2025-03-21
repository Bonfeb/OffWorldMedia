import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Image, Button, Alert } from "react-bootstrap";
import "../assets/css/Service.css";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
function Service() {
  const navigate = useNavigate();

  const { isAuthenticated } = useContext(AuthContext)
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [authAlert, setAuthAlert] = useState(false);
 

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await API.get("/services/"); // Ensure this returns an array
        console.log("Fetched services:", response.data); // Debugging
        setServices(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Error Loading Services");
      } finally {
        setLoading(false);
      }
    };
  
    fetchServices();
  }, []);
  

  const handleFillEventDetails = (serviceId) => {
    if (!isAuthenticated) {
      setAuthAlert(true);
      navigate("/login");
      return;
    }
  
    // Redirect to FillEventDetails page
    navigate(`/event-details/${serviceId}`);
  };
  
  if (loading) return <p>Loading services...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section id="services" className="services">
      <Container className="section-title text-center" fluid>
        <h5
          className="d-inline-block justify-content-lg-center"
          style={{
            backgroundColor: "#e2d6b5",
            width: "120px",
            borderRadius: "30px",
            padding: "5px",
            marginTop: "20px",
            color: "#ffffff",
            fontSize: "18px",
          }}
        >
          SERVICES
        </h5>
        <h2 style={{ color: "#75aadb" }}>
          We Offer Awesome{" "}
          <span style={{ color: "#d12d33" }}>
            <strong>Services</strong>
          </span>
        </h2>
        <p className="d-inline-block" style={{ width: "50%" }}>
          <strong>
            Ut possimus qui ut temporibus culpa velit eveniet modi omnis est
            adipisci expedita at voluptas atque vitae autem.
          </strong>
        </p>

        {showAlert && (
          <Alert variant="success" className="text-center">
            Service added to cart. Go to your dashboard to view and/or book it!
          </Alert>
        )}

        {authAlert && (
          <Alert variant="danger" className="text-center">
            You must be logged in to add services to the cart.{" "}
          </Alert>
        )}

        <Row className="justify-content-center mt-4">
          {services.map((service) => (
            <Col
              xs={12}
              md={6}
              lg={3}
              className="d-flex align-items-stretch mb-4"
              key={service.id}
            >
              <div className="text-center icon-box p-4 shadow-lg">
                <div className="position-absolute top-0 end-0 bg-warning text-white px-3 py-1 rounded-end">
                  KSH {service.price}
                </div>
                <div className="icon mb-3">
                  <Image
                    src={`http://127.0.0.1:8000${service.image}`}
                    className="rounded-circle"
                    style={{ width: "220px", height: "200px" }}
                  />
                </div>
                <h4 className="title">{service.name}</h4>
                <p className="description">{service.description}</p>
                <Button className="w-100 mt-2 bg-primary" onClick={() => handleFillEventDetails(service.id)}>
                  Fill Event Details
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Service;
