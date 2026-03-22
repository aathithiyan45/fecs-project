import React from 'react';
import { FaTree, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { FiMapPin, FiUser } from 'react-icons/fi';

function Navbar({ currentUser, onLogout, pendingAlerts }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <FaTree className="brand-icon" />
        <span className="brand-name">FECS</span>
        <span className="brand-sub">Forest Early-Warning Control System</span>
      </div>
      <div className="navbar-right">
        {pendingAlerts > 0 && (
          <div className="alert-indicator">
            <FaBell className="bell-icon ringing" />
            <span className="alert-badge">{pendingAlerts}</span>
          </div>
        )}
        <div className="user-info">
          {currentUser?.assigned_station && (
            <span className="station-pill">
              <FiMapPin size={12} /> {currentUser.assigned_station}
            </span>
          )}
          <span className="user-pill">
            <FiUser size={12} />
            {currentUser?.username}
            <span className={`role-dot ${currentUser?.role}`}>{currentUser?.role}</span>
          </span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;