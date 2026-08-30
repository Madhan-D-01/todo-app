import React from 'react'
import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8090/api/v1/tasks';

function TodoList() {

    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filter, setFilter] = useState('all');
    // Get tasks from Spring Boot when the component loads
    useEffect(() => {
        fetchTodos();
    }, []);
    const fetchTodos = async () => {
        try {
            const response = await fetch(API_URL);
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

        const newTask = {
            task: input,
            completed: false,
            startDate: startDate,
            endDate: endDate
        };
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });
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
        const updatedTask = {
            task: todo.task,
            completed: !todo.completed,
            startDate: todo.startDate,
            endDate: todo.endDate
        };
        console.log("Sending PUT request:", updatedTask);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTask)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error("Failed to update task");
            }
            console.log("PUT status:", response.status);
            const savedTask = await response.json();
            console.log("Saved task:", savedTask);
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
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

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
