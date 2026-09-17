import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './Login.jsx'
import TodoList from './TodoList.jsx'
import SignUp from './SignUp.jsx'
import Profile from './Profile.jsx'
import TaskList from './TaskList.jsx'
import Settings from './Settings.jsx'
import Dashboard from './Dashboard.jsx'
import Calender from './Calender.jsx'
import { ThemeProvider } from './ThemeContext.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    // element: <TodoList />
    element: <TaskList />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/calendar',
    element: <Calender />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
