import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Carousel, Row, Col, Container, Spinner, Alert } from "react-bootstrap";

function Home() {
  const api_url = "http://127.0.0.1:8000/api/"; // Dynamically set API URL

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const imageContext = import.meta.glob("../assets/images/*.jpg", {
    eager: true,
  });
  const carouselImages = Object.values(imageContext).map((img) => img.default);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("Fetching services...");
        const response = await axios.get(`${api_url}services/`, {
          withCredentials: true, // Just in case API requires cookies
        });
        console.log("API Response:", response.data);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Failed to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading services...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  // No services available
  if (services.length === 0) {
    return <p className="text-center">No services available.</p>;
  }

  // Render services
  return (
    <Container fluid className="p-0">
      {/* Part 1: Hero Section */}
      <section className="hero-section text-center text-white py-5">
        <Container>
          <h1>Relate to Our Creative Designs Beyond Expectations</h1>
          <p>
            Leading digital agency with solid design and development expertise.
          </p>
        </Container>
      </section>

      {/* Part 2: About Section */}
      <section className="about-section py-5">
        <Container>
          <Row className="text-center">
            <h2>About Us</h2>
            <p>
              We are a leading digital agency with expertise in design and
              development. Our team builds readymade websites, mobile
              applications, and online business solutions.
            </p>
          </Row>
        </Container>
      </section>

      {/* Part 3: Studio Work Showcase */}
      <section className="showcase-section py-5 bg-light">
        <Container>
          <Row>
            {/* Left Column - Image Carousel */}
            <Col md={6}>
              <Carousel>
                {carouselImages.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100"
                      src={image}
                      alt={`Studio Image ${index + 1}`}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>

            {/* Right Column - Embedded YouTube Videos */}
            <Col md={6} className="d-flex flex-column gap-3">
              <iframe
                width="895"
                height="503"
                src="https://www.youtube.com/embed/rZTh1m9SDGM"
                title="Gonda - Kidutani"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
              <iframe
                width="895"
                height="503"
                src="https://www.youtube.com/embed/lEO9Tp2EMm4"
                title="Bechi x Nizo Nanga x Baclint - Telephone (Official Dance Video)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Part 4: Services Offered */}
      <section className="services-section py-5">
        <Container>
          <h2 className="text-center mb-4">Services we are Offering</h2>
          <hr/>
          <Row>
            {services.map((service) => (
              <Col md={4} key={service.id} className="mb-4">
                <div className="service-card p-4 shadow rounded text-center">
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </Container>
  );
}

export default Home;
