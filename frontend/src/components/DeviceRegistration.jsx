import React, { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMapPin, FiClock, FiCheck, FiX, FiEdit2 } from 'react-icons/fi';
import axios from 'axios';
import { getUnmappedDevices, registerDevice, getRegisteredDevices, updateDeviceRegistration, deactivateDeviceRegistration } from '../services/api';
import './DeviceRegistration.css';

const DeviceRegistration = () => {
  const [unmappedDevices, setUnmappedDevices] = useState([]);
  const [registeredDevices, setRegisteredDevices] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    device_id: '',
    name: '',
    phone_number: ''
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchData();
  }, []);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:8000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [unmapped, registered] = await Promise.all([
        getUnmappedDevices(token),
        getRegisteredDevices(token)
      ]);
      setUnmappedDevices(unmapped);
      setRegisteredDevices(registered);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleRegister = (device) => {
    setFormData({
      device_id: device.device_id,
      name: '',
      phone_number: ''
    });
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (device) => {
    setFormData({
      device_id: device.device_id,
      name: device.name,
      phone_number: device.phone_number
    });
    setIsEdit(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      if (isEdit) {
        await updateDeviceRegistration(formData.device_id, {
          device_id: formData.device_id,
          name: formData.name,
          phone_number: formData.phone_number
        }, token);
        alert('Device registration updated successfully!');
      } else {
        await registerDevice(formData, token);
        alert('Device registered successfully!');
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Error saving registration');
    }
  };

  const handleDeactivate = async (deviceId) => {
    if (!window.confirm('Are you sure you want to deactivate this device registration?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await deactivateDeviceRegistration(deviceId, token);
      alert('Device registration deactivated');
      fetchData();
    } catch (error) {
      alert('Error deactivating registration');
    }
  };

  return (
    <div className="device-registration">
      <div className="registration-header">
        <h2>Device Registration</h2>
        {currentUser && currentUser.assigned_station && (
          <div className="station-badge">
            <FiMapPin /> {currentUser.assigned_station}
          </div>
        )}
      </div>

      {/* Unmapped Devices */}
      <div className="section">
        <h3>Unregistered Devices ({unmappedDevices.length})</h3>
        {unmappedDevices.length === 0 ? (
          <p className="empty-message">No unregistered devices</p>
        ) : (
          <div className="device-grid">
            {unmappedDevices.map((device) => (
              <div key={device.device_id} className="device-card unmapped">
                <div className="device-header">
                  <strong>{device.device_id}</strong>
                </div>
                <div className="device-info">
                  <div className="info-row">
                    <FiMapPin /> {device.last_latitude.toFixed(4)}, {device.last_longitude.toFixed(4)}
                  </div>
                  <div className="info-row">
                    <FiClock /> {new Date(device.last_event_time).toLocaleString()}
                  </div>
                </div>
                <button className="btn-register" onClick={() => handleRegister(device)}>
                  <FiUser /> Register Device
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registered Devices */}
      <div className="section">
        <h3>
          Registered Devices ({registeredDevices.length})
          {currentUser && currentUser.assigned_station && (
            <span className="filter-note"> - {currentUser.assigned_station} only</span>
          )}
        </h3>
        {registeredDevices.length === 0 ? (
          <p className="empty-message">No registered devices</p>
        ) : (
          <div className="device-grid">
            {registeredDevices.map((device) => (
              <div key={device.device_id} className="device-card registered">
                <div className="device-header">
                  <strong>{device.name}</strong>
                  <span className="device-id">{device.device_id}</span>
                </div>
                <div className="device-info">
                  <div className="info-row">
                    <FiPhone /> {device.phone_number}
                  </div>
                  <div className="info-row">
                    <FiClock /> Registered: {new Date(device.registered_at).toLocaleDateString()}
                  </div>
                  <div className="info-row">
                    <FiUser /> By: {device.registered_by_emp_id}
                  </div>
                </div>
                <div className="device-actions">
                  <button className="btn-edit" onClick={() => handleEdit(device)}>
                    <FiEdit2 /> Edit
                  </button>
                  <button className="btn-deactivate" onClick={() => handleDeactivate(device.device_id)}>
                    <FiX /> Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{isEdit ? 'Edit Device Registration' : 'Register Device'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Device ID</label>
                <input
                  type="text"
                  value={formData.device_id}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <div className="form-group">
                <label>User Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter user name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  <FiCheck /> {isEdit ? 'Update' : 'Register'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceRegistration;
