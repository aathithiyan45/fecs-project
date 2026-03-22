import React from 'react';
import { MdNotificationsActive } from 'react-icons/md';
import { FiMapPin, FiClock, FiAlertTriangle, FiCheckCircle, FiClock as FiPending } from 'react-icons/fi';
import './AlertList.css';

function AlertList({ alerts, token, onUpdate, onSelectAlert, fullView }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'emergency': return '#ff4d4f';
      case 'high':      return '#fa8c16';
      case 'normal':    return '#52c41a';
      default:          return '#8c8c8c';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':      return <FiPending className="status-icon pending" />;
      case 'acknowledged': return <FiAlertTriangle className="status-icon acknowledged" />;
      case 'resolved':     return <FiCheckCircle className="status-icon resolved" />;
      default:             return null;
    }
  };

  return (
    <div className="alert-list">
      <div className="alert-list-header">
        <MdNotificationsActive className="alert-list-icon" />
        <h2>Alerts <span className="alert-count">({alerts.length})</span></h2>
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <FiCheckCircle size={32} />
          <p>All clear — no active alerts</p>
        </div>
      ) : (
        <div className="alert-items">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-row ${alert.message_type} ${alert.status}`}
              onClick={() => onSelectAlert && onSelectAlert(alert)}
              style={{ cursor: onSelectAlert ? 'pointer' : 'default' }}
            >
              <div className="alert-type-strip" style={{ background: getTypeColor(alert.message_type) }} />
              <div className="alert-row-body">
                <div className="alert-row-top">
                  <strong className="alert-device">{alert.device_id}</strong>
                  <span className="alert-type-label" style={{ color: getTypeColor(alert.message_type) }}>
                    {alert.message_type.toUpperCase()}
                  </span>
                  {getStatusIcon(alert.status)}
                </div>
                <div className="alert-row-meta">
                  <span><FiMapPin size={11} /> {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                  <span><FiClock size={11} /> {new Date(alert.event_time).toLocaleTimeString()}</span>
                </div>
              </div>
              {onSelectAlert && <div className="alert-row-caret">›</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertList;