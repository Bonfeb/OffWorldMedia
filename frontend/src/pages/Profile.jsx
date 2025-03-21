import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Form, Button, Image, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import API from "../api"; // Import Axios instance

function Profile() {
  const { userProfilePic, setUserProfilePic, isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch Profile Data Automatically on Mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await API.get("profile/");
        setUser(response.data);
        setUserProfilePic(response.data.profile_pic);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, setUserProfilePic]);

  // Handle Input Changes
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle Profile Update Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    const formData = new FormData();
    Object.keys(user).forEach((key) => {
      formData.append(key, user[key]);
    });

    if (selectedFile) {
      formData.append("profile_pic", selectedFile);
    }

    try {
      const response = await API.put("profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(response.data);
      setUserProfilePic(response.data.profile_pic);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  if (loading) return <Spinner animation="border" className="mt-3" />;
  if (!isAuthenticated) return <p className="text-center mt-3">You need to log in to view this page.</p>;

  return (
    <Container fluid className="mt-4">
      <Row className="gutters">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Image
                src={userProfilePic || "/default-profile.png"}
                roundedCircle
                width="120"
                height="120"
                className="mb-3"
              />
              <h5>{user?.first_name} {user?.last_name}</h5>
              <p className="text-muted">{user?.email}</p>
              <Form.Group controlId="profilePic">
                <Form.Label>Change Profile Picture</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="h-100">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={user?.first_name || ""}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={user?.last_name || ""}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control type="text" value={user?.username || ""} disabled />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={user?.email || ""} disabled />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={user?.phone || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={user?.address || ""}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end">
                  <Button variant="secondary" className="me-2" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Update
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
