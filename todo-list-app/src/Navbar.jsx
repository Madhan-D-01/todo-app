import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import './navbar.css'

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="app-navbar">
            <Link to="/" className="nav-brand">Todo App</Link>
            <div className="nav-links">
                <Link to="/">Tasks</Link>
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
            </div>
        </nav>
    );
}

export default Navbar