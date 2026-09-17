import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ darkMode: false, setDarkMode: () => { } });

const API_URL = 'http://localhost:8090/api/v1/users';

export function ThemeProvider({ children }) {
    const [darkMode, setDarkModeState] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) {
                    setDarkModeState(!!data.darkMode);
                    document.body.classList.toggle('dark-mode', !!data.darkMode);
                }
            })
            .catch((err) => console.error("Failed to load theme", err));
    }, []);

    const setDarkMode = (value) => {
        setDarkModeState(value);
        document.body.classList.toggle('dark-mode', value);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}