import React from 'react'
import { useState } from 'react';
import './auth.css'
import { Link, useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:8090/api/v1/users';

function Login() {
  const [useremail, setUseremail] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: useremail,
          password: userpassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data.message || Object.values(data.errors || {})[0] || "Login failed";
        throw new Error(message);
      }
      localStorage.setItem("token", data.token);
      console.log("logged in:", data);
      navigate("/");
    }
    catch (error) {
      console.error("Login Error", error);
      setError(error.message || "Invalid email or password");
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-brand">
          <h1>TaskMaster Pro</h1>
          <p>Productivity Workspace</p>
        </div>
        <h2>Welcome back</h2>
        <form onSubmit={handleLogin}>
          <div>
            <input type="email"
              onChange={(e) => setUseremail(e.target.value)}
              value={useremail} placeholder="Enter your email" required />
          </div>
          <div className="password-field">
            <input
              type={showpassword ? "text" : "password"}
              onChange={(e) => setUserpassword(e.target.value)}
              value={userpassword}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowpassword(!showpassword)}
            >
              {showpassword ? (
                <i className="bi bi-eye-slash"></i>
              ) : (
                <i className="bi bi-eye"></i>
              )}
            </button>
          </div>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="auth-switch">
          <span>Don't have an account?</span>
          <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login