import React from 'react'
import { useState } from 'react';
import './auth.css'
import { Link, useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:8090/api/v1/users';

function SignUp() {
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handlesignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: useremail,
          password: userpassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data.message || Object.values(data.errors || {})[0] || "Registration failed";
        throw new Error(message);
      }

      console.log("Registered user:", data);
      navigate("/login");
    }
    catch (error) {
      console.error("Signup Error", error);
      setError(error.message || "Unable to register, Please Try Again");
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
        <h2>Create your account</h2>
        <form onSubmit={handlesignup}>
          <div>
            <input type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username} placeholder="Choose a username" required />
          </div>
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
              placeholder="Create a password (min. 8 characters)" required
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

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <div className="auth-switch">
          <span>Already have an account?</span>
          <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp