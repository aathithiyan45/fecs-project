import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { getCurrentUser } from './services/api';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser(token);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      handleLogout();
    }
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
  };

  if (!token || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      token={token}
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
}

export default App;