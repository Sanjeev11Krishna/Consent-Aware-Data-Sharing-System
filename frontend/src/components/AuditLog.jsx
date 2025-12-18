import React, { useState } from 'react';

const AuditLog = ({ logs, consentStats }) => {
  const [selectedLog, setSelectedLog] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatExpirationStatus = (log) => {
    if (log.consentExpiration) {
      const expirationDate = new Date(log.consentExpiration);
      const now = new Date();
      if (expirationDate < now) {
        return `Expired on ${formatDate(expirationDate)}`;
      } else {
        return `Expires on ${formatDate(expirationDate)}`;
      }
    }
    return 'No expiration';
  };

  const getActionText = (action) => {
    switch (action) {
      case 'REQUESTED': return 'Consent Requested';
      case 'GRANTED': return 'Consent Granted';
      case 'DECLINED': return 'Consent Declined';
      case 'REVOKED': return 'Consent Revoked';
      case 'ACCESSED': return 'Data Accessed';
      case 'EXPIRED': return 'Consent Expired';
      case 'REGISTERED': return 'User Registered';
      default: return action;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'REQUESTED': return 'action-requested';
      case 'GRANTED': return 'action-granted';
      case 'DECLINED': return 'action-declined';
      case 'REVOKED': return 'action-revoked';
      case 'ACCESSED': return 'action-accessed';
      case 'EXPIRED': return 'action-expired';
      case 'REGISTERED': return 'action-registered';
      default: return '';
    }
  };

  const getDataTypeDescription = (dataType) => {
    const descriptions = {
      'personal-info': 'Personal Information',
      'location-data': 'Location Data',
      'browser-data': 'Browser Data'
    };
    
    if (dataType) {
      return descriptions[dataType] || dataType;
    }
    return 'N/A';
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
  };

  const closePopup = () => {
    setSelectedLog(null);
  };

  // Default consent stats if not provided
  const stats = consentStats || {
    activeConsentsAsRequester: 0,
    revokedConsentsAsRequester: 0,
    activeConsentsAsGranter: 0,
    revokedConsentsAsGranter: 0,
    expiredConsentsAsRequester: 0,
    expiredConsentsAsGranter: 0
  };

  return (
    <div className="audit-log">
      <h2>Audit Trail</h2>
      
      {/* Consent Statistics */}
      <div className="consent-stats">
        <h3>Consent Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.activeConsentsAsRequester}</div>
            <div className="stat-label">Active Consents (Received)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.revokedConsentsAsRequester}</div>
            <div className="stat-label">Revoked Consents (Received)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.expiredConsentsAsRequester}</div>
            <div className="stat-label">Expired Consents (Received)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeConsentsAsGranter}</div>
            <div className="stat-label">Active Consents (Given)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.revokedConsentsAsGranter}</div>
            <div className="stat-label">Revoked Consents (Given)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.expiredConsentsAsGranter}</div>
            <div className="stat-label">Expired Consents (Given)</div>
          </div>
        </div>
      </div>
      
      {/* Popup Window for Log Details */}
      {selectedLog && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-window" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Activity Details</h3>
              <button onClick={closePopup} className="close-popup-btn">×</button>
            </div>
            <div className="popup-content">
              <div className="log-detail">
                <h4>Activity Information</h4>
                <div className="data-field">
                  <span className="field-label">Action:</span>
                  <span className={`field-value action ${getActionColor(selectedLog.action)}`}>
                    {getActionText(selectedLog.action)}
                  </span>
                </div>
                <div className="data-field">
                  <span className="field-label">Timestamp:</span>
                  <span className="field-value">{formatDate(selectedLog.timestamp)}</span>
                </div>
                <div className="data-field">
                  <span className="field-label">IP Address:</span>
                  <span className="field-value">{selectedLog.ipAddress || 'Not available'}</span>
                </div>
              </div>
              
              <div className="log-detail">
                <h4>User Information</h4>
                <div className="data-field">
                  <span className="field-label">User:</span>
                  <span className="field-value">
                    {selectedLog.userId?.name || selectedLog.userId?.email || 'Unknown'}
                  </span>
                </div>
                {selectedLog.requesterId && (
                  <div className="data-field">
                    <span className="field-label">Requester:</span>
                    <span className="field-value">
                      {selectedLog.requesterId.name || selectedLog.requesterId.email || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
              
              {selectedLog.purpose && (
                <div className="log-detail">
                  <h4>Request Details</h4>
                  <div className="data-field">
                    <span className="field-label">Purpose:</span>
                    <span className="field-value">{selectedLog.purpose}</span>
                  </div>
                  {selectedLog.dataType && (
                    <div className="data-field">
                      <span className="field-label">Data Type:</span>
                      <span className="field-value">{getDataTypeDescription(selectedLog.dataType)}</span>
                    </div>
                  )}
                  {selectedLog.consentExpiration && (
                    <div className="data-field">
                      <span className="field-label">Expiration:</span>
                      <span className="field-value">{formatExpirationStatus(selectedLog)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="popup-footer">
              <button onClick={closePopup} className="close-popup-btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {logs.length === 0 ? (
        <p>No audit logs available.</p>
      ) : (
        <div className="logs-container">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className="log-entry"
              onClick={() => showLogDetails(log)}
            >
              <div className="log-header">
                <span className={`action ${getActionColor(log.action)}`}>
                  {getActionText(log.action)}
                </span>
                <span className="timestamp">{formatDate(log.timestamp)}</span>
              </div>
              <div className="log-preview">
                <div className="log-preview-row">
                  <span className="preview-label">User:</span>
                  <span className="preview-value">{log.userId?.name || log.userId?.email || 'Unknown'}</span>
                </div>
                {log.requesterId && (
                  <div className="log-preview-row">
                    <span className="preview-label">Requester:</span>
                    <span className="preview-value">{log.requesterId.name || log.requesterId.email || 'Unknown'}</span>
                  </div>
                )}
                {log.consentExpiration && (
                  <div className="log-preview-row">
                    <span className="preview-label">Expiration:</span>
                    <span className="preview-value">
                      {new Date(log.consentExpiration) < new Date() ? 'Expired' : 'Active'}
                    </span>
                  </div>
                )}
              </div>
              <div className="log-link">
                <span>Click to view details</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLog;