import React, { useState, useEffect } from 'react';
import { FiMapPin, FiUser, FiPhone, FiClock, FiUsers } from 'react-icons/fi';
import axios from 'axios';
import './BaseStationView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const BaseStationView = () => {
  const [stationData, setStationData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStationData();
  }, []);

  const fetchStationData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/base-stations/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStationData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching station data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading station data...</div>;
  }

  const stations = Object.keys(stationData);

  if (stations.length === 0) {
    return (
      <div className="base-station-view">
        <h2>Base Station Management</h2>
        <div className="empty-state">
          <FiMapPin size={48} />
          <p>No base stations with registered devices found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="base-station-view">
      <h2>Base Station Management</h2>
      <div className="station-summary">
        <div className="summary-card">
          <FiMapPin className="summary-icon" />
          <div>
            <h3>{stations.length}</h3>
            <p>Active Stations</p>
          </div>
        </div>
        <div className="summary-card">
          <FiUsers className="summary-icon" />
          <div>
            <h3>{Object.values(stationData).reduce((sum, devices) => sum + devices.length, 0)}</h3>
            <p>Total Devices</p>
          </div>
        </div>
      </div>

      <div className="stations-container">
        {stations.map((stationName) => {
          const devices = stationData[stationName];
          return (
            <div key={stationName} className="station-section">
              <div className="station-header">
                <div className="station-title">
                  <FiMapPin className="station-icon" />
                  <h3>{stationName || 'Unassigned Station'}</h3>
                  <span className="device-count">{devices.length} devices</span>
                </div>
              </div>

              <div className="devices-grid">
                {devices.map((device) => (
                  <div key={device.device_id} className="device-card">
                    <div className="device-header-info">
                      <strong>{device.name}</strong>
                      <span className="device-badge">{device.device_id}</span>
                    </div>
                    
                    <div className="device-details">
                      <div className="detail-row">
                        <FiPhone className="detail-icon" />
                        <span>{device.phone_number}</span>
                      </div>
                      <div className="detail-row">
                        <FiUser className="detail-icon" />
                        <span>Registered by: {device.registered_by_emp_id}</span>
                      </div>
                      <div className="detail-row">
                        <FiClock className="detail-icon" />
                        <span>{new Date(device.registered_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BaseStationView;
