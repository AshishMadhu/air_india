import React from "react";
import { Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useAuth } from "./AuthenticationContext";

const HomePage: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/bot" />;
    }

    return (
        <Container className="text-center mt-5">
            <h1>Welcome to the Dashboard</h1>
            <p>You are successfully logged in!</p>
            <button className="btn btn-danger" onClick={logout}>
                Logout
            </button>
        </Container>
    );
};

export default HomePage;
