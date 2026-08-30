import React from 'react'
import { useState } from 'react';
import './register.css'
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
    e.preventDefault(),

      setError('')
    setLoading(true)

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
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed");
      }
      const data = await response.json();
      console.log("Registered user:", data);
      navigate("/login");
    }
    catch (error) {
      console.error("Signup Error", error);
      setError("Unable to register, Please Try Again");
    }
    finally {
      setLoading(false);
    }

  }

  return (
    <div>
      <div className="container">
        <div className="login-box">
          <h2>SignUp</h2>
          <form onSubmit={handlesignup}>
            <div>
              <input type="text"
                onChange={(e) => setUsername(e.target.value)}
                value={username} placeholder="Enter your name" required />
            </div>
            <div>
              <input type="type"
                onChange={(e) => setUseremail(e.target.value)}
                value={useremail} placeholder="Enter your email" required />
            </div>
            <div className="password-field">
              <input
                type={showpassword ? "text" : "password"}
                onChange={(e) => setUserpassword(e.target.value)}
                value={userpassword}
                placeholder="Enter your Password" required
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
              <p style={{ color: "red" }}>
                {error}
              </p>
            )}

            <div>
              <button type="submit" className="btn btn-danger" disabled={loading} >{loading ? "Signing up..." : "Signup"}
              </button>
            </div>
          </form>
          <div className="signup-text">
            <p>If you have an account </p>
            <Link to="/login">Login</Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default SignUp