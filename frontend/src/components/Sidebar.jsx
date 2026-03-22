import React from 'react';
import { FaMapMarkedAlt, FaBell, FaClipboardList, FaUsers, FaMobileAlt, FaBroadcastTower, FaNetworkWired, FaHome } from 'react-icons/fa';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: FaHome, roles: ['admin', 'operator'] },
  { id: 'map',      label: 'Map',      icon: FaMapMarkedAlt, roles: ['admin', 'operator'] },
  { id: 'alerts',   label: 'Alerts',   icon: FaBell, roles: ['admin', 'operator'], badge: true },
  { id: 'logs',     label: 'Logs',     icon: FaClipboardList, roles: ['admin', 'operator'] },
  { id: 'devices',  label: 'Devices',  icon: FaMobileAlt, roles: ['admin', 'operator'] },
  { id: 'stations', label: 'Stations', icon: FaBroadcastTower, roles: ['admin', 'operator'] },
  { id: 'users',    label: 'Users',    icon: FaUsers, roles: ['admin'] },
  { id: 'planner',  label: 'Planner',  icon: FaNetworkWired, roles: ['admin'] },
];

function Sidebar({ activeTab, onTabChange, isAdmin, pendingAlerts }) {
  const role = isAdmin ? 'admin' : 'operator';
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={item.label}
            >
              <div className="sidebar-icon-wrap">
                <Icon className="sidebar-icon" />
                {item.badge && pendingAlerts > 0 && (
                  <span className="sidebar-badge">{pendingAlerts}</span>
                )}
              </div>
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;