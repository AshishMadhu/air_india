import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import axios from "axios";
import { BASE_URL } from "./constants";
import { useNavigate } from "react-router-dom";

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  signup: (username: string, email: string, password: string) => void;
  logout: () => void;
}
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(BASE_URL + "/login/", {
        username,
        password,
      });
      const email = response.data.email;
      setIsAuthenticated(true);
      setUser({ username: "TestUser", email });
      setError(null);
      localStorage.setItem("token", response.data.token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    if (email && username && password) {
      try {
        await axios.post(BASE_URL + "/signup/", {
          username,
          email,
          password,
        });
        navigate("/login");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Something went wrong");
      }
    } else {
      setError("Signup failed. Please try again.");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const authContext: AuthContextType = {
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          style={{
            position: "fixed",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          {error}
        </Alert>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
