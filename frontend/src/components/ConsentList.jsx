import React, { useState } from 'react';

const ConsentList = ({ consents, onRevokeConsent, onRequestData, userType }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [popupData, setPopupData] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'revoked': return 'status-revoked';
      case 'expired': return 'status-expired';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'revoked': return 'Revoked';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const handleRequestData = async (granterId, dataType, consentId) => {
    setLoading(true);
    setError('');
    setSelectedConsent(consentId);
    
    console.log('Requesting data:', { granterId, dataType, consentId });
    
    const result = await onRequestData({ granterId, dataType });
    
    console.log('Data request result:', result);
    
    if (result.success) {
      setPopupData({
        dataType: dataType,
        data: result.data.data
      });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
    setSelectedConsent(null);
  };

  const closePopup = () => {
    setPopupData(null);
  };

  const renderDataFriendly = (data, dataType) => {
    if (!data) return <p>No data available</p>;
    
    switch (dataType) {
      case 'personal-info':
        return (
          <div className="data-friendly">
            <h4>Personal Information</h4>
            <div className="data-field">
              <span className="field-label">First Name:</span>
              <span className="field-value">{data.firstName || 'Not provided'}</span>
            </div>
            <div className="data-field">
              <span className="field-label">Last Name:</span>
              <span className="field-value">{data.lastName || 'Not provided'}</span>
            </div>
            <div className="data-field">
              <span className="field-label">Date of Birth:</span>
              <span className="field-value">
                {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </span>
            </div>
            <div className="data-field">
              <span className="field-label">Address:</span>
              <span className="field-value">{data.address || 'Not provided'}</span>
            </div>
            <div className="data-field">
              <span className="field-label">Phone Number:</span>
              <span className="field-value">{data.phoneNumber || 'Not provided'}</span>
            </div>
          </div>
        );
      
      case 'location-data':
        return (
          <div className="data-friendly">
            <h4>Location Information</h4>
            {data.currentLocation ? (
              <>
                <div className="data-field">
                  <span className="field-label">Latitude:</span>
                  <span className="field-value">{data.currentLocation.latitude}</span>
                </div>
                <div className="data-field">
                  <span className="field-label">Longitude:</span>
                  <span className="field-value">{data.currentLocation.longitude}</span>
                </div>
                <div className="data-field">
                  <span className="field-label">Timestamp:</span>
                  <span className="field-value">
                    {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Not available'}
                  </span>
                </div>
              </>
            ) : (
              <p>Location data not available</p>
            )}
            <div className="data-field">
              <span className="field-label">Home Address:</span>
              <span className="field-value">{data.homeAddress || 'Not provided'}</span>
            </div>
          </div>
        );
      
      case 'browser-data':
        return (
          <div className="data-friendly">
            <h4>Browser Information</h4>
            <div className="data-field">
              <span className="field-label">User Agent:</span>
              <span className="field-value">{data.userAgent || 'Not provided'}</span>
            </div>
            <div className="data-field">
              <span className="field-label">Language:</span>
              <span className="field-value">{data.language || 'Not provided'}</span>
            </div>
            <div className="data-field">
              <span className="field-label">Platform:</span>
              <span className="field-value">{data.platform || 'Not provided'}</span>
            </div>
            <div className="data-field">
              <span className="field-label">Cookies Enabled:</span>
              <span className="field-value">{data.cookiesEnabled ? 'Yes' : 'No'}</span>
            </div>
            <div className="data-field">
              <span className="field-label">Screen Size:</span>
              <span className="field-value">
                {data.screenSize ? `${data.screenSize.width} x ${data.screenSize.height}` : 'Not provided'}
              </span>
            </div>
            <div className="data-field">
              <span className="field-label">Timezone:</span>
              <span className="field-value">{data.timezone || 'Not provided'}</span>
            </div>
            {data.recentWebsites && data.recentWebsites.length > 0 && (
              <div className="data-field">
                <span className="field-label">Recent Websites:</span>
                <ul className="websites-list">
                  {data.recentWebsites.map((site, index) => (
                    <li key={index}>{site}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="data-friendly">
            <h4>Data Information</h4>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="consent-list">
      <h2>{userType === 'requester' ? 'Data Access Permissions' : 'Data Sharing Agreements'}</h2>
      <p className="section-description">
        {userType === 'requester' 
          ? 'These are the users who have granted you access to their data' 
          : 'These are the users you have granted access to your data'}
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Popup Window for Data Display */}
      {popupData && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-window" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Requested Data: {popupData.dataType}</h3>
              <button onClick={closePopup} className="close-popup-btn">×</button>
            </div>
            <div className="popup-content">
              {renderDataFriendly(popupData.data, popupData.dataType)}
            </div>
            <div className="popup-footer">
              <button onClick={closePopup} className="close-popup-btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {consents.length === 0 ? (
        <p>No consents found.</p>
      ) : (
        <div className="consents-container">
          {consents.map(consent => (
            <div key={consent._id} className="consent-card">
              <div className="consent-header">
                <div className="consent-parties">
                  {userType === 'requester' ? (
                    <>
                      <div className="party-info">
                        <strong>{consent.granter?.name || consent.granter?.email || 'Unknown User'}</strong>
                        <span className="party-role">Data Provider</span>
                      </div>
                      <div className="arrow">→</div>
                      <div className="party-info">
                        <strong>You</strong>
                        <span className="party-role">Data Receiver</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="party-info">
                        <strong>You</strong>
                        <span className="party-role">Data Provider</span>
                      </div>
                      <div className="arrow">→</div>
                      <div className="party-info">
                        <strong>{consent.requester?.name || consent.requester?.email || 'Unknown User'}</strong>
                        <span className="party-role">Data Receiver</span>
                      </div>
                    </>
                  )}
                </div>
                <span className={`status ${getStatusColor(consent.status)}`}>
                  {getStatusText(consent.status)}
                </span>
              </div>
              
              <div className="consent-details">
                <div className="detail-row">
                  <span className="detail-label">Purpose:</span>
                  <span className="detail-value">{consent.purpose}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Data Types:</span>
                  <span className="detail-value">{consent.dataTypes.join(', ')}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Granted:</span>
                  <span className="detail-value">{consent.grantedAt ? formatDateTime(consent.grantedAt) : 'N/A'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Expires:</span>
                  <span className="detail-value">{consent.expiresAt ? formatDateTime(consent.expiresAt) : 'N/A'}</span>
                </div>
                
                {consent.status === 'expired' && consent.expiresAt && (
                  <div className="detail-row">
                    <span className="detail-label">Expired:</span>
                    <span className="detail-value">{formatDateTime(consent.expiresAt)}</span>
                  </div>
                )}
              </div>
              
              {userType === 'requester' && consent.status === 'active' && (
                <div className="data-request">
                  <h4>Access Data:</h4>
                  <div className="data-types">
                    {consent.dataTypes.map(dataType => (
                      <button
                        key={`${consent._id}-${dataType}`}
                        onClick={() => handleRequestData(consent.granter._id, dataType, consent._id)}
                        disabled={loading && selectedConsent === consent._id}
                        className="data-type-btn"
                      >
                        {loading && selectedConsent === consent._id ? 'Accessing...' : dataType}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {userType === 'requester' && consent.status === 'expired' && (
                <div className="data-request expired-message">
                  <p>This consent has expired and data access is no longer available.</p>
                </div>
              )}
              
              {userType === 'granter' && consent.status === 'active' && (
                <button 
                  className="revoke-btn"
                  onClick={() => onRevokeConsent(consent._id)}
                  disabled={loading}
                >
                  {loading ? 'Revoking...' : 'Revoke Access'}
                </button>
              )}
              
              {userType === 'granter' && consent.status === 'expired' && (
                <div className="expired-message">
                  <p>This consent has expired.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsentList;