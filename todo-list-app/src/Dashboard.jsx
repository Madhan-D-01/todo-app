import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar.jsx';
import './tasklist.css';
import './dashboard.css';

const API_URL = 'http://localhost:8090/api/v1/tasks';

function formatDeadline(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return { label: `Today, ${time}`, urgent: true };
  }
  if (isTomorrow) return { label: 'Tomorrow', urgent: false };
  return { label: date.toLocaleDateString([], { month: 'short', day: 'numeric' }), urgent: false };
}

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchTasks = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;
      try {
        const response = await fetch(API_URL, { headers });
        if (handleAuthFailure(response)) return;
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const upcoming = tasks
    .filter((t) => !t.completed && t.startDate)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  const today = new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="settings-loading">Loading...</div>;

  return (
    <div className="app-shell">
      <Sidebar active="dashboard" />
      <div className="main-area">
        <header className="topbar">
          <input className="search-input" type="text" placeholder="Search tasks, projects, or docs..." />
        </header>
        <main className="content">
          <div className="dash-heading">
            <div>
              <h2>Good morning.</h2>
              <p>Here's what's happening with your tasks today.</p>
            </div>
            <span className="dash-date">{today}</span>
          </div>

          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">TOTAL TASKS</span>
              </div>
              <span className="stat-value">{total}</span>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">PENDING</span>
              </div>
              <span className="stat-value">{pending}</span>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">COMPLETED</span>
              </div>
              <span className="stat-value">{completed}</span>
            </div>
            <div className="stat-card productivity-card">
              <span className="stat-label">Productivity</span>
              <div className="week-strip">
                {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                  <span key={i} className={i === 2 ? 'week-day active' : 'week-day'}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="dash-grid">
            <section className="deadlines-card">
              <div className="deadlines-header">
                <h3>Upcoming Deadlines</h3>
                <a href="/">View all</a>
              </div>
              {upcoming.length === 0 ? (
                <p className="empty-message">No upcoming deadlines.</p>
              ) : (
                upcoming.map((t) => {
                  const due = formatDeadline(t.startDate);
                  return (
                    <div key={t.id} className="deadline-row">
                      <input type="checkbox" disabled className="task-checkbox" />
                      <div className="deadline-info">
                        <p className="deadline-title">{t.task}</p>
                        <p className="deadline-sub">{t.category || 'No category'}</p>
                      </div>
                      <span className={due.urgent ? 'deadline-chip urgent' : 'deadline-chip'}>
                        {due.label}
                      </span>
                    </div>
                  );
                })
              )}
            </section>

            <section className="focus-card">
              <h3>Current Focus</h3>
              <div className="focus-placeholder">
                <p>Design System V3</p>
                <p className="focus-sub">UI/UX Team Sync at 2:00 PM</p>
              </div>
              <button className="focus-btn" disabled title="Coming soon">
                ▶ Start Focus Timer
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;