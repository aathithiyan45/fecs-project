import React, { useState, useEffect } from 'react';
import { login, getCurrentUser } from '../services/api';
import { FaTree, FaLock } from 'react-icons/fa';
import './Login.css';

function Login({ onLogin }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        setIsAdminMode(prev => !prev);
        setError('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const container = document.querySelector('.login-container');
    if (!container) return;

    const fireflyCount = 20;
    const fireflies = [];

    for (let i = 0; i < fireflyCount; i++) {
      const firefly = document.createElement('div');
      firefly.className = 'firefly';
      firefly.style.left = `${Math.random() * 100}%`;
      firefly.style.top = `${Math.random() * 60}%`;
      firefly.style.animationDelay = `${Math.random() * 5}s`;
      firefly.style.animationDuration = `${3 + Math.random() * 4}s`;
      container.appendChild(firefly);
      fireflies.push(firefly);
    }

    return () => {
      fireflies.forEach(f => f.remove());
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(employeeId, password);
      const token = data.access_token;
      
      const user = await getCurrentUser(token);
      
      if (isAdminMode && user.role !== 'admin') {
        setError('Access denied: Admin credentials required for Admin Portal');
        return;
      }
      if (!isAdminMode && user.role !== 'operator') {
        setError('Access denied: Operator credentials required for Operator Dashboard');
        return;
      }

      onLogin(token, { username: user.username });
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid employee ID or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${isAdminMode ? 'admin' : 'operator'}`}>
      <div className="stars"></div>
      <div className="login-box">
        <div className="login-logo">
          {/* <FaTree /> */}
        </div>
        <h1>Forest Emergency System</h1>
        <div className={`login-mode-header ${isAdminMode ? 'admin' : 'operator'}`}>
          {isAdminMode ? (
            <>
              <FaLock className="mode-icon" /> ADMIN LOGIN
            </>
          ) : (
            <>
              <FaTree className="mode-icon" /> OPERATOR LOGIN
            </>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g., EMP001"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            className={isAdminMode ? 'admin-btn' : 'operator-btn'}
          >
            {loading ? 'Logging in...' : (
              isAdminMode ? (
                <>
                  <FaLock className="btn-icon" /> Login as Admin
                </>
              ) : (
                <>
                  <FaTree className="btn-icon" /> Login as Operator
                </>
              )
            )}
          </button>
        </form>
        {/* <div className="login-hint">
          {isAdminMode ? 'Press Ctrl+1 to switch to Operator mode' : 'Press Ctrl+1 for Admin access'}
        </div> */}
        {/* <div className="login-footer">Forest Department - 2024</div> */}
      </div>
    </div>
  );
}

export default Login;
