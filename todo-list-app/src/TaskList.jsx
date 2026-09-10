import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './tasklist.css';

const API_URL = 'http://localhost:8090/api/v1/tasks';
const USER_URL = 'http://localhost:8090/api/v1/users/me';

const CATEGORY_COLORS = {
    Personal: '#e8720c',
    Work: '#2563eb',
    Shopping: '#434655',
};
const DEFAULT_CATEGORY_COLOR = '#916f6a';

function categoryColor(category) {
    return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
}

function priorityClass(priority) {
    if (priority === 'HIGH') return 'priority-chip priority-high';
    if (priority === 'MEDIUM') return 'priority-chip priority-medium';
    return 'priority-chip priority-low';
}

function formatDue(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all'); // all | todo | done
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // date | priority
    const [showModal, setShowModal] = useState(false);

    const [formTask, setFormTask] = useState('');
    const [formCategory, setFormCategory] = useState('Personal');
    const [formPriority, setFormPriority] = useState('MEDIUM');
    const [formStart, setFormStart] = useState('');
    const [formEnd, setFormEnd] = useState('');
    const [formError, setFormError] = useState('');

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
        fetchTasks();
    }, []);

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

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const openCreateModal = () => {
        setFormTask('');
        setFormCategory('Personal');
        setFormPriority('MEDIUM');
        setFormStart('');
        setFormEnd('');
        setFormError('');
        setShowModal(true);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formTask.trim()) {
            setFormError('Task description is required');
            return;
        }
        if (formStart && formEnd && formEnd < formStart) {
            setFormError('End date cannot be before start date');
            return;
        }

        const headers = getAuthHeaders();
        if (!headers) return;

        const newTask = {
            task: formTask,
            completed: false,
            startDate: formStart || null,
            endDate: formEnd || null,
            priority: formPriority,
            category: formCategory,
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers,
                body: JSON.stringify(newTask)
            });
            if (handleAuthFailure(response)) return;
            const data = await response.json();
            if (!response.ok) {
                const message = data.message || Object.values(data.errors || {})[0] || "Failed to create task";
                throw new Error(message);
            }
            setTasks((prev) => [...prev, data]);
            setShowModal(false);
        } catch (error) {
            console.error('Error creating task:', error);
            setFormError(error.message);
        }
    };

    const handleToggle = async (task) => {
        const headers = getAuthHeaders();
        if (!headers) return;

        const updated = {
            task: task.task,
            completed: !task.completed,
            startDate: task.startDate,
            endDate: task.endDate,
            priority: task.priority,
            category: task.category,
        };

        try {
            const response = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(updated)
            });
            if (handleAuthFailure(response)) return;
            if (!response.ok) throw new Error("Failed to update task");
            const saved = await response.json();
            setTasks((prev) => prev.map((t) => (t.id === task.id ? saved : t)));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDelete = async (id) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers
            });
            if (handleAuthFailure(response)) return;
            if (!response.ok) throw new Error('Failed to delete task');
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))];

    let visibleTasks = tasks.filter((t) => {
        if (tab === 'todo' && t.completed) return false;
        if (tab === 'done' && !t.completed) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (search && !t.task.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    visibleTasks = [...visibleTasks].sort((a, b) => {
        if (sortBy === 'priority') {
            return (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3);
        }
        const aDate = a.startDate ? new Date(a.startDate) : new Date(8640000000000000);
        const bDate = b.startDate ? new Date(b.startDate) : new Date(8640000000000000);
        return aDate - bDate;
    });

    const pendingCount = tasks.filter((t) => !t.completed).length;

    return (
        <div className="app-shell">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <h1>TaskMaster Pro</h1>
                    <p>Productivity Workspace</p>
                </div>

                <button className="create-task-btn" onClick={openCreateModal}>
                    + Create Task
                </button>

                <nav className="sidebar-nav">
                    <a href="/dashboard" className="nav-item">Dashboard</a>
                    <a href="/" className="nav-item active">Tasks</a>
                    <a href="/calendar" className="nav-item">Calendar</a>
                </nav>

                {categories.length > 0 && (
                    <div className="sidebar-categories">
                        <p className="sidebar-section-label">Categories</p>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`category-item ${categoryFilter === cat ? 'active' : ''}`}
                                onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                            >
                                <span className="category-dot" style={{ background: categoryColor(cat) }}></span>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                <div className="sidebar-footer">
                    <a href="/settings" className="nav-item">Settings</a>
                    <button className="nav-item logout-item" onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            {/* Main content */}
            <div className="main-area">
                <header className="topbar">
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search tasks, categories, or projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </header>

                <main className="content">
                    <div className="page-heading">
                        <div>
                            <h2>My Tasks</h2>
                            <p>You have {pendingCount} task{pendingCount !== 1 ? 's' : ''} to do.</p>
                        </div>
                        <div className="heading-actions">
                            <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="all">All categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="date">Sort by date</option>
                                <option value="priority">Sort by priority</option>
                            </select>
                        </div>
                    </div>

                    <div className="tabs">
                        <button className={tab === 'all' ? 'tab active' : 'tab'} onClick={() => setTab('all')}>All Tasks</button>
                        <button className={tab === 'todo' ? 'tab active' : 'tab'} onClick={() => setTab('todo')}>To Do</button>
                        <button className={tab === 'done' ? 'tab active' : 'tab'} onClick={() => setTab('done')}>Done</button>
                    </div>

                    {loading ? (
                        <p className="empty-message">Loading...</p>
                    ) : visibleTasks.length === 0 ? (
                        <p className="empty-message">No tasks here yet.</p>
                    ) : (
                        <ul className="task-list">
                            {visibleTasks.map((t) => (
                                <li key={t.id} className="task-card">
                                    <input
                                        type="checkbox"
                                        checked={t.completed}
                                        onChange={() => handleToggle(t)}
                                        className="task-checkbox"
                                    />
                                    <div className="task-main">
                                        <span className={t.completed ? 'task-title completed' : 'task-title'}>
                                            {t.task}
                                        </span>
                                        <div className="task-meta">
                                            {t.startDate && <span className="task-date">{formatDue(t.startDate)}</span>}
                                            {t.category && (
                                                <span className="task-category">
                                                    <span className="category-dot" style={{ background: categoryColor(t.category) }}></span>
                                                    {t.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {t.priority && (
                                        <span className={priorityClass(t.priority)}>
                                            {t.priority.charAt(0) + t.priority.slice(1).toLowerCase()}
                                        </span>
                                    )}
                                    <button className="delete-icon-btn" onClick={() => handleDelete(t.id)} title="Delete task">
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>
            </div>

            {/* Create Task Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Create Task</h3>
                        <form onSubmit={handleCreateTask}>
                            <label>Task</label>
                            <input
                                type="text"
                                value={formTask}
                                onChange={(e) => setFormTask(e.target.value)}
                                placeholder="Enter a task..."
                                required
                            />

                            <div className="modal-row">
                                <div>
                                    <label>Category</label>
                                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                                        <option value="Personal">Personal</option>
                                        <option value="Work">Work</option>
                                        <option value="Shopping">Shopping</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Priority</label>
                                    <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)}>
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-row">
                                <div>
                                    <label>Start</label>
                                    <input type="datetime-local" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
                                </div>
                                <div>
                                    <label>End</label>
                                    <input type="datetime-local" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
                                </div>
                            </div>

                            {formError && <p className="form-error">{formError}</p>}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskList;