import React, { useState, useEffect } from "react";
import { Tab, Nav, Card, Button, Modal, Form, Row, Col, Container } from "react-bootstrap";
import axios from "axios";
import API from "../api"


const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserBookings();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get("profile/");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await API.get("bookings/");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleEditProfile = () => {
    // Navigate to profile edit page
    window.location.href = "/profile/update";
  };

  const handleEditBooking = (booking) => {
    if (booking.status !== "Pending" && booking.status !== "Cancelled") {
      alert("Only pending or cancelled bookings can be edited.");
      return;
    }
    setEditedBooking(booking);
    setEditing(true);
    setShowModal(true);
  };

  const handleSaveBooking = async () => {
    try {
      await API.put(`bookings/${editedBooking.id}/`, {
        date: editedBooking.date,
      });

      setEditing(false);
      setShowModal(false);
      fetchUserBookings(); // Refresh bookings
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await API.delete(`bookings/${id}/`);
        fetchUserBookings(); // Refresh list
        setShowModal(false);
      } catch (error) {
        console.error("Failed to delete booking:", error);
      }
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        {/* User Profile Section */}
        <Col md={4}>
          <Card className="shadow-sm text-center p-3">
            {user && (
              <>
                <Card.Img
                  variant="top"
                  src={user.profile_image}
                  className="rounded-circle mx-auto"
                  style={{ width: "120px", height: "120px" }}
                />
                <Card.Body>
                  <Card.Title>{user.username}</Card.Title>
                  <Card.Text>{user.email}</Card.Text>
                  <Button variant="primary" onClick={handleEditProfile}>
                    Edit Profile
                  </Button>
                </Card.Body>
              </>
            )}
          </Card>
        </Col>

        {/* Booking Section */}
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container defaultActiveKey="pending">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="pending">Pending</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="completed">Completed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="cancelled">Cancelled</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="mt-3">
                  {["pending", "completed", "cancelled"].map((status) => (
                    <Tab.Pane eventKey={status} key={status}>
                      {bookings
                        .filter((booking) => booking.status.toLowerCase() === status)
                        .map((booking) => (
                          <Card className="mb-2" key={booking.id} onClick={() => setSelectedBooking(booking)}>
                            <Card.Body>
                              <Row>
                                <Col>
                                  <strong>{booking.service.name}</strong>
                                  <p>Date: {booking.date}</p>
                                  <p>Status: <strong>{booking.status}</strong></p>
                                </Col>
                                <Col className="text-end">
                                  {status !== "completed" && (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleEditBooking(booking)}
                                    >
                                      Edit
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteBooking(booking.id)}
                                  >
                                    Delete
                                  </Button>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editing ? (
            <Form.Group>
              <Form.Label>Booking Date</Form.Label>
              <Form.Control
                type="date"
                value={editedBooking.date}
                onChange={(e) => setEditedBooking({ ...editedBooking, date: e.target.value })}
              />
            </Form.Group>
          ) : (
            <>
              <p><strong>Service:</strong> {selectedBooking?.service.name}</p>
              <p><strong>Date:</strong> {selectedBooking?.date}</p>
              <p><strong>Status:</strong> {selectedBooking?.status}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {editing ? (
            <Button variant="success" onClick={handleSaveBooking}>Save</Button>
          ) : (
            <>
              {selectedBooking?.status !== "Completed" && (
                <Button variant="primary" onClick={() => setEditing(true)}>Edit</Button>
              )}
              <Button variant="danger" onClick={() => handleDeleteBooking(selectedBooking?.id)}>Delete</Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserDashboard;
