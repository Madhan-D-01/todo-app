import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"

const API_URL = 'http://localhost:8090/api/v1/tasks';
const USER_URL = 'http://localhost:8090/api/v1/users/me';

function TodoList() {

    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filter, setFilter] = useState('all');
    const [userId, setUserId] = useState(null);
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
        const init = async () => {
            const headers = getAuthHeaders();
            if (!headers) return;

            try {
                const meResponse = await fetch(USER_URL, { headers });
                if (handleAuthFailure(meResponse)) return;
                if (!meResponse.ok) throw new Error("Failed to load user");

                const me = await meResponse.json();
                setUserId(me.id);

                await fetchTodos(headers);
            } catch (error) {
                console.error("Error initializing todo list", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [])

    // Get tasks from Spring Boot when the component loads
    const fetchTodos = async (headers) => {
        const authHeaders = headers || getAuthHeaders();
        if (!authHeaders) return;

        try {
            const response = await fetch(API_URL, { headers: authHeaders });
            if (handleAuthFailure(response)) return;
            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }
            const data = await response.json();
            setTodos(data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
    };
    // Add task
    const handleAdd = async () => {
        if (!input.trim()) return;
        if (!startDate || !endDate) {
            alert("Please select a start date and end date");
            return;
        }
        if (endDate < startDate) {
            alert("End date cannot be before start date");
            return;
        }
        if (!userId) {
            console.error("No userId loaded yet");
            return;
        }
        const headers = getAuthHeaders();
        if (!headers) return;

        const newTask = {
            task: input,
            completed: false,
            startDate: startDate,
            endDate: endDate,
            userId: userId
        };
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(newTask)
            });
            if (handleAuthFailure(response)) return;
            if (!response.ok) {
                throw new Error('Failed to create task');
            }
            const createdTask = await response.json();
            setTodos((prevTodos) => [...prevTodos, createdTask]);
            setInput('');
            setStartDate('');
            setEndDate('');
        }
        catch (error) {
            console.error('Error creating task:', error);
        }
    };
    // Complete / Undo task

    const handleToggle = async (id) => {
        const todo = todos.find((todo) => todo.id === id);
        if (!todo) {
            console.error("Todo not found:", id);
            return;
        }
        const headers = getAuthHeaders();
        if (!headers) return;
        const updatedTask = {
            task: todo.task,
            completed: !todo.completed,
            startDate: todo.startDate,
            endDate: todo.endDate,
            userId: userId
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(updatedTask)
            });
            if (handleAuthFailure(response)) return;
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error("Failed to update task");
            }
            const savedTask = await response.json();
            setTodos(
                todos.map((todo) =>
                    todo.id === id
                        ? savedTask : todo
                )
            );
        }
        catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // Delete task

    const handleDelete = async (id) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            if (handleAuthFailure(response)) return;
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            setTodos(todos.filter((todo) => todo.id !== id));
        }
        catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const filteredTodos = todos.filter((todo) => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });
    if (loading) return <div className="todo-container"><p>Loading...</p></div>;
    return (
        <div className="todo-container">
            <h1>Todo List</h1>

            <div className="input-section">
                <input
                    type="text"
                    value={input}
                    placeholder="Enter a task..."
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd();
                    }}
                />
                <input type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)} />
                <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button className="add-btn" onClick={handleAdd}>
                    Add
                </button>
            </div>

            <div className="filter-section">
                <button
                    className={filter === 'all' ? 'active-filter' : ''}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>

                <button
                    className={filter === 'active' ? 'active-filter' : ''}
                    onClick={() => setFilter('active')}
                >
                    Active
                </button>

                <button
                    className={filter === 'completed' ? 'active-filter' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>

            <ul className="todo-list">
                {filteredTodos.map((todo) => (
                    <li className="todo-item" key={todo.id}>
                        <span
                            className={todo.completed ? 'completed' : ''}
                        >
                            {todo.task}
                        </span>
                        <div className="task-dates">
                            <small>
                                Start: {todo.startDate
                                    ? new Date(todo.startDate).toLocaleString([], {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })
                                    : ''}
                            </small>

                            <small>
                                End: {todo.endDate
                                    ? new Date(todo.endDate).toLocaleString([], {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })
                                    : ''}
                            </small>
                        </div>


                        <div className="todo-actions">
                            <button
                                className="complete-btn"
                                onClick={() => handleToggle(todo.id)}
                            >
                                {todo.completed ? 'Undo' : 'Complete'}
                            </button>

                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(todo.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoList;
