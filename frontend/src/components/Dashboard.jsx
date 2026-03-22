import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Map from './Map';
import AlertList from './AlertList';
import AlertLogs from './AlertLogs';
import UserManagement from './UserManagement';
import DeviceRegistration from './DeviceRegistration';
import BaseStationView from './BaseStationView';
import NetworkPlanner from './NetworkPlanner';
import AlertDetailModal from './AlertDetailModal';
import { getAlerts, getBaseStations } from '../services/api';
import { connectWebSocket } from '../services/websocket';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function Dashboard({ token, currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState([]);
  const [operatorStation, setOperatorStation] = useState(null);
  const [stats, setStats] = useState({ totalOperators: 0, totalAlerts: 0, alertsToday: 0, pendingAlerts: 0, registeredDevices: 0 });
  const [selectedAlert, setSelectedAlert] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    loadAlerts();
    fetchStats();
    loadOperatorStation();
    const ws = connectWebSocket(token, handleNewAlert);
    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadAlerts = async () => {
    try {
      const data = await getAlerts(token);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  const loadOperatorStation = async () => {
    if (!currentUser?.assigned_station) return;
    try {
      const stations = await getBaseStations(token);
      const myStation = stations.find(st => st.name === currentUser.assigned_station);
      if (myStation) setOperatorStation(myStation);
    } catch (err) {
      console.error('Failed to load station:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const alertData = await getAlerts(token);
      const today = new Date().toDateString();
      const alertsToday = alertData.filter(a => new Date(a.received_at).toDateString() === today).length;
      const pendingAlerts = alertData.filter(a => a.status === 'pending' || a.status === 'acknowledged').length;

      let totalOperators = 0;
      if (isAdmin) {
        const statsResp = await axios.get(`${API_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        totalOperators = statsResp.data.totalOperators;
      }

      const devResp = await axios.get(`${API_URL}/device-registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats({
        totalOperators,
        totalAlerts: alertData.length,
        alertsToday,
        pendingAlerts,
        registeredDevices: devResp.data.length
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleNewAlert = (alert) => {
    setAlerts(prev => [alert, ...prev]);
    fetchStats();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-split">
            <div className="overview-map">
              <Map alerts={alerts} baseStation={operatorStation} />
            </div>
            <div className="overview-alerts">
              <AlertList alerts={alerts} token={token} onUpdate={loadAlerts} onSelectAlert={setSelectedAlert} />
            </div>
          </div>
        );
      case 'map':
        return <div className="full-panel"><Map alerts={alerts} baseStation={operatorStation} /></div>;
      case 'alerts':
        return (
          <div className="full-panel padded">
            <AlertList alerts={alerts} token={token} onUpdate={loadAlerts} onSelectAlert={setSelectedAlert} fullView />
          </div>
        );
      case 'logs':
        return <div className="full-panel padded"><AlertLogs /></div>;
      case 'devices':
        return <div className="full-panel padded"><DeviceRegistration /></div>;
      case 'stations':
        return <div className="full-panel padded"><BaseStationView /></div>;
      case 'users':
        return isAdmin ? <div className="full-panel padded"><UserManagement onStatsUpdate={fetchStats} /></div> : null;
      case 'planner':
        return isAdmin ? <div className="full-panel"><NetworkPlanner /></div> : null;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-root">
      <Navbar currentUser={currentUser} onLogout={onLogout} pendingAlerts={stats.pendingAlerts} />
      <div className="dashboard-body">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} pendingAlerts={stats.pendingAlerts} />
        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="stats-bar">
              <div className="stat-chip">
                <span className="stat-num">{stats.pendingAlerts}</span>
                <span className="stat-lbl">Active Alerts</span>
              </div>
              <div className="stat-chip">
                <span className="stat-num">{stats.alertsToday}</span>
                <span className="stat-lbl">Today</span>
              </div>
              <div className="stat-chip">
                <span className="stat-num">{stats.registeredDevices}</span>
                <span className="stat-lbl">Devices</span>
              </div>
              {isAdmin && (
                <div className="stat-chip">
                  <span className="stat-num">{stats.totalOperators}</span>
                  <span className="stat-lbl">Operators</span>
                </div>
              )}
            </div>
          )}
          <div className="content-area">{renderContent()}</div>
        </main>
      </div>
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          token={token}
          onUpdate={() => { loadAlerts(); setSelectedAlert(null); }}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;