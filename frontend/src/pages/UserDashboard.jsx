import React, { useState, useEffect } from "react";
import {
  Tab,
  Nav,
  Card,
  Button,
  Row,
  Col,
  Container,
  ListGroup,
  Table,
  Alert,
  Modal,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState({
    pending: [],
    completed: [],
    cancelled: [],
  });
  const [cart, setCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);

  const [modalData, setModalData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDashboard();
  }, []);

  useEffect(() => {
    console.log("Cart State Updated:");
  }, [cart]);

  const fetchUserDashboard = async () => {
    try {
      const response = await API.get("userdashboard/", {
        withCredentials: true,
      });
      //console.log("Full API Response:", JSON.stringify(response.data, null, 2)); // Debugging

      const updatedCart = response.data.cart.map((item) => ({
        ...item,
        event_date: item.event_date || null,
        event_time: item.event_time || null,
        event_location: item.event_location || null,
      }));

      setUser(response.data.user);
      setBookings(response.data.bookings);
      setCart([...updatedCart]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleShowRemoveModal = (service) => {
    if (!service || !service.service) {
      console.error("❌ Error: Service ID is missing or invalid!", service);
      return;
    }
    setModalData({ service });
    setShowRemoveModal(true);
  };

  const handleShowCancelModal = (booking) => {
    setModalData({ booking });
    setShowCancelModal(true);
  };

  const handleConfirmRemove = async () => {
    setShowRemoveModal(false);

    console.log("🚀 Debug: modalData object:", modalData);
    console.log("🚀 Debug: modalData.id:", modalData?.service);
    console.log("🚀 Debug: modalData.service.id:", modalData?.service?.id);

    if (!modalData?.service?.id) {
      console.error("Error: service id is undefined");
      return;
    }

    try {
      const serviceId = modalData.service.id;
      console.log(`Attempting to remove service ID: ${serviceId}`);
      const response = await API.delete(`userdashboard/${serviceId}/`);
      setCart(response.data.cart);
      fetchUserDashboard();
      console.log("🚀 Updated Cart Data in State:", cart);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false); // Close the modal

    // Debugging: Log the modalData object and its properties
    console.log("🚀 Debug: modalData object:", modalData);
    console.log("🚀 Debug: modalData.id:", modalData?.id);
    console.log("🚀 Debug: modalData.booking.id:", modalData?.booking?.id);

    // Check if the booking ID is valid
    if (!modalData?.booking?.id) {
      console.error("Error: booking id is undefined");
      return;
    }

    try {
      const bookingId = modalData.booking.id;
      console.log(`Attempting to cancel booking ID: ${bookingId}`);

      // Make a DELETE request to the backend to cancel the booking
      const response = await API.delete(`booking/${bookingId}/`, {
        withCredentials: true,
      });
      console.log("🚀 API Response after deletion:", response.data);

      // Update the state with the updated data (if applicable)
      setBookings(response.data.bookings); // Assuming the response contains updated bookings
      fetchUserDashboard(); // Refresh the dashboard or bookings list

      console.log("🚀 Updated Bookings Data in State:", bookings);
    } catch (error) {
      console.error("Error canceling booking:", error);
      // If error is 403, show permission error modal
      if (error.response && error.response.status === 403) {
        setShowPermissionError(true);
      }
    }
  };

  const handleBookService = async (serviceId) => {
    console.log("Cart content:", cart);
    console.log("Looking for service_id:", serviceId);

    const cartItem = cart.find((item) => item.service === serviceId);
    console.log("🔍 Found Cart Item:", cartItem);

    if (!serviceId) {
      console.error("Invalid serviceId:", serviceId);
      setShowFailureModal(true);
      return;
    }

    if (!cartItem) {
      console.error("Service not found in cart:", serviceId);
      setShowFailureModal(true);
      return;
    }

    const { event_date, event_location, event_time } = cartItem;
    console.log("Cart item found:", { event_date, event_location, event_time });

    const bookingData = {
      event_date,
      event_time,
      event_location,
    };

    if (
      !bookingData.event_date ||
      !bookingData.event_time ||
      !bookingData.event_location
    ) {
      console.error("Missing event details:", bookingData);
      setShowFailureModal(true);
      return;
    }

    try {
      const response = await API.post(
        `/booking/${serviceId}/`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setSuccessMessage("Service successfully booked!");
        setShowSuccessModal(true);
        fetchUserDashboard();
      } else {
        console.error("Unexpected response status:", response.status);
        setShowFailureModal(true);
      }
    } catch (error) {
      console.error("Error booking service:", error.response?.data || error);
      setShowFailureModal(true);
    }
  };

  const handleToUpdateBooking = (booking, serviceId) => {
    console.log("Updating booking:", booking);
    navigate(`/event-details/${serviceId}/${booking.id}`);
  };

  return (
    <Container fluid className="mt-4 py-4" style={{ background: "linear-gradient(to right,rgb(82, 68, 68),rgb(112, 106, 102), rgb(97, 58, 58))", minHeight: "100vh"}}>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <Row className="mb-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="text-center mb-3">Your Cart</h5>
            {cart.length === 0 ? (
              <p className="text-muted text-center">Your cart is empty.</p>
            ) : (
              <ListGroup>
                {cart.map((item, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex align-items-center"
                  >
                    <img
                      src={item.service_image}
                      alt={item.service_name}
                      width="50"
                      height="50"
                      className="me-3 rounded"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <strong>{item.service_name}</strong>
                      <p className="mb-0">KSH {item.service_price}</p>
                    </div>
                    <div className="flex-grow-1">
                      <strong>Added At</strong>
                      <p className="text-muted">
                        <i>{item.added_at}</i>
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleShowRemoveModal(item)}
                    >
                      Remove
                    </Button>
                    <span className="mx-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          console.log("Item data:", item);
                          console.log("Service object:", item.service);
                          console.log("Booking service ID:", item.service);
                          handleBookService(item.service);
                        }}
                      >
                        Book
                      </Button>
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container defaultActiveKey="pending">
                <Nav variant="tabs" className="d-flex justify-content-between">
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
                      <Card className="mb-2">
                        <Card.Body>
                          {!bookings?.[status]?.length === 0 ? (
                            <p className="text-muted text-center">
                              No bookings found.
                            </p>
                          ) : (
                            <Table striped hover responsive>
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Service Name</th>
                                  <th>Event Date</th>
                                  <th>Event Location</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bookings[status].map((booking, index) => (
                                  <tr key={booking.id}>
                                    <td>{index + 1}</td>
                                    <td>{booking.service.name}</td>
                                    <td className="text-muted">
                                      <i>{booking.event_date}</i>
                                    </td>
                                    <td className="text-muted">
                                      <i>{booking.event_location}</i>
                                    </td>
                                    {status === "pending" ? (
                                      <td>
                                        <Button
                                          className="btn-sm btn-danger"
                                          onClick={() =>
                                            handleShowCancelModal(booking)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                        <span className="mx-3">
                                          <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() =>
                                              handleToUpdateBooking(
                                                booking,
                                                booking.service.id
                                              )
                                            }
                                          >
                                            Update
                                          </Button>
                                        </span>
                                      </td>
                                    ) : (
                                      <td>
                                        <Button
                                          className="btn-sm btn-success"
                                          onClick={() =>
                                            console.log(
                                              "View Details",
                                              booking.id
                                            )
                                          }
                                        >
                                          View Details
                                        </Button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </Card.Body>
                      </Card>
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this item from your cart?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmRemove}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancel</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this booking?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Booking Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>Your service has been successfully booked!</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showFailureModal} onHide={() => setShowFailureModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Booking Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          There was an issue booking your service. Please try again.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowFailureModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showPermissionError}
        onHide={() => setShowPermissionError(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Permission Denied</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            You do not have permission to delete this booking. Only the booking
            owner or an admin can delete it.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPermissionError(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserDashboard;
