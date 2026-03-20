import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OperatorDashboard from './components/OperatorDashboard';
import { getCurrentUser } from './services/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUserRole = async () => {
    try {
      const userData = await getCurrentUser(token);
      setUserRole(userData.role);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  };

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <OperatorDashboard onLogout={handleLogout} />;
}

export default App;
