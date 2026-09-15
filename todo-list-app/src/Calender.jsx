import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar.jsx';
import './tasklist.css';
import './calendar.css';

const API_URL = 'http://localhost:8090/api/v1/tasks';
const CATEGORY_COLORS = {
  Personal: '#e8720c',
  Work: '#2563eb',
  Shopping: '#434655',
};
const DEFAULT_CATEGORY_COLOR = '#916f6a';

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function startWeekday(year, month) {
  return new Date(year, month, 1).getDay();
}

function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(new Date());
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

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleDateString([], { month: 'long', year: 'numeric' });

  const tasksByDay = {};
  tasks.forEach((t) => {
    if (!t.startDate) return;
    const d = new Date(t.startDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const totalDays = daysInMonth(year, month);
  const firstWeekday = startWeekday(year, month);
  const prevMonthDays = daysInMonth(year, month - 1 < 0 ? 11 : month - 1);

  const cells = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, muted: true, tasks: [] });
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, muted: false, tasks: tasksByDay[d] || [] });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (firstWeekday + totalDays) + 1, muted: true, tasks: [] });
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));

  if (loading) return <div className="settings-loading">Loading...</div>;

  return (
    <div className="app-shell">
      <Sidebar active="calendar" />
      <div className="main-area">
        <header className="topbar">
          <input className="search-input" type="text" placeholder="Search tasks, events..." />
        </header>
        <main className="content">
          <div className="cal-heading">
            <div className="cal-title-row">
              <h2>{monthLabel}</h2>
              <div className="cal-nav">
                <button onClick={goPrev}>&lsaquo;</button>
                <button onClick={goNext}>&rsaquo;</button>
              </div>
            </div>
            <button className="cal-today-btn" onClick={() => setCursor(new Date())}>
              Today
            </button>
          </div>

          <div className="cal-grid">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <div key={d} className="cal-weekday">{d}</div>
            ))}
            {cells.map((cell, i) => {
              const isToday = isCurrentMonth && !cell.muted && cell.day === today.getDate();
              const visible = cell.tasks.slice(0, 2);
              const overflow = cell.tasks.length - visible.length;
              return (
                <div key={i} className={cell.muted ? 'cal-cell muted' : 'cal-cell'}>
                  <span className={isToday ? 'cal-day-num today' : 'cal-day-num'}>
                    {cell.day}
                  </span>
                  <div className="cal-chips">
                    {visible.map((t) => (
                      <span
                        key={t.id}
                        className="cal-chip"
                        style={{
                          background: `${categoryColorBg(t.category)}`,
                          color: categoryColor(t.category),
                        }}
                        title={t.task}
                      >
                        {t.task}
                      </span>
                    ))}
                    {overflow > 0 && (
                      <span className="cal-chip-more">+{overflow} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

function categoryColor(category) {
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
}
function categoryColorBg(category) {
  const hex = categoryColor(category);
  return hexToRgba(hex, 0.12);
}
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default Calendar;