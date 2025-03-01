import { useState, useEffect } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import API from "../api"; // Axios instance for API calls
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

function ProfileUpdate() {
  const [cookies] = useCookies(["access_token"]);
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_pic: null,
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await API.get("profile/");
      setUser(response.data);
      setPreview(response.data.profile_pic);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUser({ ...user, profile_pic: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("first_name", user.first_name);
    formData.append("last_name", user.last_name);
    formData.append("email", user.email);
    if (user.profile_pic instanceof File) {
      formData.append("profile_pic", user.profile_pic);
    }

    try {
      await API.put("profile/edit/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4">Edit Profile</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={user.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={user.last_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 rounded-circle"
                style={{ width: "100px", height: "100px" }}
              />
            )}
          </Form.Group>
          <Button variant="primary" type="submit">Save Changes</Button>
        </Form>
      </Card>
    </Container>
  );
}

export default ProfileUpdate;
