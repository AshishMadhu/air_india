import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import SignupPage from "./SignupPage";
import Bot from "./Bot";
import { AuthProvider } from "./AuthenticationContext";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="/">Air India</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav"></Navbar.Collapse>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/bot" element={<Bot />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
