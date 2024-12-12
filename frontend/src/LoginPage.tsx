import React, { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "./AuthenticationContext";
import { useNavigate, Navigate } from "react-router-dom";

interface LoginFormProps {
  onLogin?: (username: string, password: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (onLogin) {
      onLogin(username, password);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card className="w-100" style={{ maxWidth: "400px" }}>
        <Card.Body>
          <h2 className="text-center mb-4">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p className="mt-2">
              Don't have an account? <a href="/signup">Sign up</a>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    login(email, password);
    if (isAuthenticated) {
      navigate("/");
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/bot" />;
  }

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;
