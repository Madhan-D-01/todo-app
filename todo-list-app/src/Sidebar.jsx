import React from 'react';
import { useNavigate } from "react-router-dom";
import './sidebar.css';

const CATEGORY_COLORS = {
    Personal: '#e8720c',
    Work: '#2563eb',
    Shopping: '#434655',
};
const DEFAULT_CATEGORY_COLOR = '#916f6a';

function Sidebar({ active, categories = [], categoryFilter = 'all', onCategoryClick, onCreateTask }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h1>TaskMaster Pro</h1>
                <p>Productivity Workspace</p>
            </div>

            {onCreateTask && (
                <button className="create-task-btn" onClick={onCreateTask}>
                    + Create Task
                </button>
            )}

            <nav className="sidebar-nav">
                <a href="/dashboard" className={active === 'dashboard' ? 'nav-item active' : 'nav-item'}>Dashboard</a>
                <a href="/" className={active === 'tasks' ? 'nav-item active' : 'nav-item'}>Tasks</a>
                <a href="/calendar" className={active === 'calendar' ? 'nav-item active' : 'nav-item'}>Calendar</a>
            </nav>

            {categories.length > 0 && (
                <div className="sidebar-categories">
                    <p className="sidebar-section-label">Categories</p>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`category-item ${categoryFilter === cat ? 'active' : ''}`}
                            onClick={() => onCategoryClick && onCategoryClick(cat)}
                        >
                            <span
                                className="category-dot"
                                style={{ background: CATEGORY_COLORS[cat] || DEFAULT_CATEGORY_COLOR }}
                            ></span>
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="sidebar-footer">
                <a href="/settings" className={active === 'settings' ? 'nav-item active' : 'nav-item'}>Settings</a>
                <button className="nav-item logout-item" onClick={handleLogout}>Logout</button>
            </div>
        </aside>
    );
}

export default Sidebar;