import React, { useState } from 'react';
import { updateAlertStatus } from '../services/api';
import { FaCheckCircle, FaCheck, FaTimes } from 'react-icons/fa';
import { FiMapPin, FiClock, FiRadio, FiAlertTriangle } from 'react-icons/fi';

function AlertDetailModal({ alert, token, onUpdate, onClose }) {
  const [notes, setNotes] = useState(alert.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await updateAlertStatus(alert.id, newStatus, notes, token);
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const typeColors = {
    emergency: { bg: '#fff1f0', border: '#ff4d4f', badge: '#ff4d4f' },
    high:      { bg: '#fffbe6', border: '#ffa940', badge: '#fa8c16' },
    normal:    { bg: '#f6ffed', border: '#52c41a', badge: '#52c41a' },
  };
  const colors = typeColors[alert.message_type] || typeColors.normal;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="alert-modal"
        style={{ borderTop: `4px solid ${colors.border}`, background: colors.bg }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <FiAlertTriangle style={{ color: colors.badge }} size={20} />
            <span className="modal-device">{alert.device_id}</span>
            <span className="modal-type-badge" style={{ background: colors.badge }}>
              {alert.message_type.toUpperCase()}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body">
          <div className="modal-info-grid">
            <div className="modal-info-item">
              <FiRadio className="modal-info-icon" />
              <div>
                <div className="info-label">Signal Type</div>
                <div className="info-value">{alert.signal_type}</div>
              </div>
            </div>
            <div className="modal-info-item">
              <FiMapPin className="modal-info-icon" />
              <div>
                <div className="info-label">Location</div>
                <div className="info-value">{alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}</div>
              </div>
            </div>
            <div className="modal-info-item">
              <FiClock className="modal-info-icon" />
              <div>
                <div className="info-label">Event Time</div>
                <div className="info-value">{new Date(alert.event_time).toLocaleString()}</div>
              </div>
            </div>
            <div className="modal-info-item">
              <div className="info-label">Status</div>
              <span className={`status-pill ${alert.status}`}>{alert.status}</span>
            </div>
          </div>

          {alert.notes && (
            <div className="modal-existing-notes">
              <strong>Previous Notes:</strong> {alert.notes}
            </div>
          )}

          <div className="modal-notes-section">
            <label className="notes-label">Add / Update Notes</label>
            <textarea
              className="notes-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Enter notes about this alert..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel-modal" onClick={onClose}>Close</button>
          {alert.status === 'pending' && (
            <button className="btn-acknowledge" onClick={() => handleStatusChange('acknowledged')} disabled={isUpdating}>
              <FaCheck /> Acknowledge
            </button>
          )}
          {alert.status === 'acknowledged' && (
            <button className="btn-resolve" onClick={() => handleStatusChange('resolved')} disabled={isUpdating}>
              <FaCheckCircle /> Mark Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertDetailModal;