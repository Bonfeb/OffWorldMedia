import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardHeader, Container, Spinner, Alert } from "react-bootstrap";

function Home() {
  const api_url = "http://127.0.0.1:8000/api"; // Ensure this matches your backend

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${api_url}/services/`, {
          withCredentials: true, // Ensure authentication cookies are sent
        });
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error.response || error.message);
        setError(error.response?.data?.detail || "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [api_url]);

  return (
    <Container fluid className="mt-4">
      <section>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 150 }}>
          <Card className="p-3 shadow-lg">
            <CardHeader className="mb-3 text-center">
              <h3>Services Offered</h3>
            </CardHeader>

            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading services...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="text-center">{error}</Alert>
            ) : (
              <ul className="list-unstyled">
                {services.length > 0 ? (
                  services.map((service) => (
                    <li key={service.id} className="mb-3">
                      <h4>{service.name}</h4>
                      <p>{service.description}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-center">No services available.</p>
                )}
              </ul>
            )}
          </Card>
        </motion.div>
      </section>
    </Container>
  );
}

export default Home;
