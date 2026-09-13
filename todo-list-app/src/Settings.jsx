import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar.jsx';
import './tasklist.css';
import './settings.css';

const API_URL = 'http://localhost:8090/api/v1/users';

function Settings() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleAuthFailure = (response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;
      try {
        const response = await fetch(`${API_URL}/me`, { headers });
        if (handleAuthFailure(response)) return;
        if (!response.ok) throw new Error("Failed to load profile");
        const data = await response.json();
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setAvatarUrl(data.avatarUrl || '');
      } catch (err) {
        console.error("Profile fetch error", err);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);

    const headers = getAuthHeaders();
    if (!headers) { setSaving(false); return; }

    try {
      const response = await fetch(`${API_URL}/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ firstName, lastName, email })
      });
      if (handleAuthFailure(response)) return;
      const data = await response.json();
      if (!response.ok) {
        const message = data.message || Object.values(data.errors || {})[0] || "Failed to save changes";
        throw new Error(message);
      }
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setEmail(data.email || '');
      setSaved(true);
    } catch (err) {
      console.error("Save profile error", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="settings-loading">Loading...</div>;

  return (
    <div className="app-shell">
      <Sidebar active="settings" />
      <div className="main-area">
        <header className="topbar">
          <input className="search-input" type="text" placeholder="Search settings..." />
        </header>
        <main className="settings-page">
          <div className="settings-heading">
            <h1>Settings</h1>
            <p>Manage your account settings, preferences, and notifications.</p>
          </div>

          <div className="settings-grid">
            <section className="settings-card profile-card">
              <h3>Profile Information</h3>
              <p className="card-subtitle">Update your personal details.</p>

              <form onSubmit={handleSave} className="profile-form">
                <div className="avatar-block">
                  <div className="avatar-circle">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile avatar" />
                    ) : (
                      <span className="avatar-fallback">
                        {(firstName?.[0] || '') + (lastName?.[0] || '')}
                      </span>
                    )}
                  </div>
                  <button type="button" className="change-avatar-link" disabled title="Coming soon">
                    Change Avatar
                  </button>
                </div>

                <div className="form-fields">
                  <div className="name-row">
                    <div className="field">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="form-error">{error}</p>}
                  {saved && <p className="form-success">Changes saved.</p>}

                  <div className="save-row">
                    <button type="submit" className="save-btn" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <div className="settings-side">
              <section className="settings-card">
                <h3>Appearance</h3>
                <p className="card-subtitle">Customize your UI theme.</p>

                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <p className="toggle-title">Light Mode</p>
                    <p className="toggle-desc">Default bright theme</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!darkMode}
                      onChange={() => setDarkMode(false)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row dimmed">
                  <div className="toggle-label-group">
                    <p className="toggle-title">Dark Mode</p>
                    <p className="toggle-desc">Easier on the eyes</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={() => setDarkMode(true)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </section>

              <section className="settings-card">
                <h3>Notifications</h3>
                <p className="card-subtitle">Manage your alerts.</p>

                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <p className="toggle-title">Email Notifications</p>
                    <p className="toggle-desc">Daily digests and updates</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={() => setEmailNotifs(!emailNotifs)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <hr />
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <p className="toggle-title">Push Notifications</p>
                    <p className="toggle-desc">Instant alerts on your device</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={pushNotifs}
                      onChange={() => setPushNotifs(!pushNotifs)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;