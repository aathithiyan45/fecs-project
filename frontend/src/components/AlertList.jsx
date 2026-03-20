import React from 'react';
import AlertDetail from './AlertDetail';
import { MdNotificationsActive } from 'react-icons/md';
import './AlertList.css';

function AlertList({ alerts, token, onUpdate }) {
  return (
    <div className="alert-list">
      <h2>
        <MdNotificationsActive className="alert-list-icon" />
        Active Alerts ({alerts.length})
      </h2>
      {alerts.length === 0 ? (
        <p className="no-alerts">No alerts to display</p>
      ) : (
        alerts.map((alert) => (
          <AlertDetail key={alert.id} alert={alert} token={token} onUpdate={onUpdate} />
        ))
      )}
    </div>
  );
}

export default AlertList;
