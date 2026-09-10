import React, { useEffect, useState } from 'react'
import './register.css'
import { useNavigate } from 'react-router';
import Navbar from './Navbar';

const API_URL = 'http://localhost:8090/api/v1/users';
function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login")
                return;
            }
            try {
                const response = await fetch(`${API_URL}/me`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }
                if (!response.ok) {
                    throw new Error("Failed to load profile");
                }
                const data = await response.json();
                setUser(data);
            }
            catch (err) {
                console.error("Profile fetch error", err);
                setError("Unable to load profile");
            }
            finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;
    return (
        <>
            <Navbar />

            <div className="container">
                <div className="login-box">
                    <h2>
                        Profile
                    </h2>
                    <p><strong>Username:</strong>{user.username}</p>
                    <p><strong>Useremail:</strong>{user.email}</p>
                </div>
            </div>
        </>
    )
}

export default Profile