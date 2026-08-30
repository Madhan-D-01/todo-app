import React from 'react'
import { useState } from 'react';
import './register.css'
import { Link } from "react-router-dom";
function Login() {
  const [useremail, setUseremail] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  return (
    <div>
      <div className="container">
        <div className="login-box">
          <h2>Login</h2>
          <div>
            <input type="email"
              onChange={(e) => setUseremail(e.target.value)}
              value={useremail} placeholder="Enter your email" />
          </div>
          <div className="password-field">
            <input
              type={showpassword ? "text" : "password"}
              onChange={(e) => setUserpassword(e.target.value)}
              value={userpassword}
              placeholder="Enter your Password"
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
          <div>
            <button className="btn btn-danger">Login</button>
          </div>
          <div className="signup-text">
            <p>Don't have an account?</p><Link to="/signup">Signup</Link>

          </div>

        </div>
      </div>

    </div>
  );
}

export default Login