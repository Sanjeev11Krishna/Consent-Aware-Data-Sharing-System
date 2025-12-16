import React, { useState, useEffect } from 'react';
import { consentAPI } from '../services/api';

const ConsentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(null);

  // Fetch pending consent requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await consentAPI.getPendingRequests();
        setRequests(response.data);
      } catch (err) {
        setError('Failed to fetch consent requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getLocationData = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const getBrowserData = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };

  const getVisitedPages = () => {
    // Get visited pages from localStorage
    const visitedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    return visitedPages.slice(0, 5); // Limit to 5 pages
  };

  const handleAccept = async (consentId, requestDataTypes) => {
    try {
      setProcessingRequest(consentId);
      
      // Collect location data if requested
      let locationData = null;
      if (requestDataTypes.includes('location-data')) {
        try {
          locationData = await getLocationData();
          console.log('Location data collected:', locationData);
        } catch (err) {
          setError(`Failed to get location: ${err.message}`);
          setProcessingRequest(null);
          return;
        }
      }
      
      // Collect browser data if requested
      let browserData = null;
      let visitedPages = null;
      if (requestDataTypes.includes('browser-data')) {
        browserData = getBrowserData();
        visitedPages = getVisitedPages();
        console.log('Browser data collected:', browserData);
        console.log('Visited pages collected:', visitedPages);
      }
      
      // Prepare data for acceptance
      const acceptData = {};
      if (locationData) {
        acceptData.locationData = locationData;
      }
      if (browserData) {
        acceptData.browserData = browserData;
      }
      if (visitedPages) {
        acceptData.visitedPages = visitedPages;
      }
      
      await consentAPI.acceptConsentRequest(consentId, acceptData);
      
      // Remove the accepted request from the list
      setRequests(requests.filter(request => request._id !== consentId));
      setShowDetails(null);
    } catch (err) {
      setError('Failed to accept consent request');
      console.error(err);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDecline = async (consentId) => {
    try {
      setProcessingRequest(consentId);
      await consentAPI.declineConsentRequest(consentId);
      
      // Remove the declined request from the list
      setRequests(requests.filter(request => request._id !== consentId));
      setShowDetails(null);
    } catch (err) {
      setError('Failed to decline consent request');
      console.error(err);
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDataTypesDescription = (dataTypes) => {
    const descriptions = {
      'personal-info': 'Personal Information (Name, Address, etc.)',
      'location-data': 'Location Data (GPS coordinates)',
      'browser-data': 'Browser Data (User agent, visited sites)'
    };
    
    return dataTypes.map(type => descriptions[type] || type).join(', ');
  };

  const showRequestDetails = (request) => {
    setShowDetails(request);
  };

  const closePopup = () => {
    setShowDetails(null);
  };

  if (loading && requests.length === 0) {
    return <div className="loading">Loading consent requests...</div>;
  }

  return (
    <div className="consent-requests">
      <h2>Pending Consent Requests</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Popup Window for Request Details */}
      {showDetails && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-window large" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Consent Request Details</h3>
              <button onClick={closePopup} className="close-popup-btn">×</button>
            </div>
            <div className="popup-content">
              <div className="request-detail">
                <h4>Requester Information</h4>
                <div className="data-field">
                  <span className="field-label">Name:</span>
                  <span className="field-value">{showDetails.requester?.name || 'Not provided'}</span>
                </div>
                <div className="data-field">
                  <span className="field-label">Email:</span>
                  <span className="field-value">{showDetails.requester?.email || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="request-detail">
                <h4>Request Details</h4>
                <div className="data-field">
                  <span className="field-label">Purpose:</span>
                  <span className="field-value">{showDetails.purpose}</span>
                </div>
                <div className="data-field">
                  <span className="field-label">Data Types:</span>
                  <span className="field-value">{getDataTypesDescription(showDetails.dataTypes)}</span>
                </div>
                <div className="data-field">
                  <span className="field-label">Requested:</span>
                  <span className="field-value">{formatDate(showDetails.createdAt)}</span>
                </div>
                <div className="data-field">
                  <span className="field-label">Expires:</span>
                  <span className="field-value">{formatDate(showDetails.expiresAt)}</span>
                </div>
              </div>
              
              {showDetails.dataTypes.includes('location-data') && (
                <div className="location-warning">
                  <p>⚠️ By accepting this request, you will be prompted to share your current GPS location.</p>
                  <p>Please ensure location services are enabled for this browser.</p>
                </div>
              )}
              
              {showDetails.dataTypes.includes('browser-data') && (
                <div className="browser-warning">
                  <p>⚠️ By accepting this request, you will share information about your browser and recently visited websites.</p>
                </div>
              )}
              
              <div className="request-description">
                <p>
                  <strong>{showDetails.requester?.name || showDetails.requester?.email}</strong> is requesting access to your data 
                  for the purpose stated above. Please review the request and accept or decline.
                </p>
              </div>
            </div>
            <div className="popup-footer">
              <button 
                className="decline-btn"
                onClick={() => handleDecline(showDetails._id)}
                disabled={processingRequest === showDetails._id}
              >
                {processingRequest === showDetails._id ? 'Declining...' : 'Decline'}
              </button>
              <button 
                className="accept-btn"
                onClick={() => handleAccept(showDetails._id, showDetails.dataTypes)}
                disabled={processingRequest === showDetails._id}
              >
                {processingRequest === showDetails._id ? 'Accepting...' : 'Accept & Share Data'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {requests.length === 0 ? (
        <p>No pending consent requests.</p>
      ) : (
        <div className="requests-container">
          {requests.map(request => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h3>Consent Request</h3>
                <div className="requester-info">
                  <strong>From:</strong> {request.requester?.name || request.requester?.email}
                </div>
              </div>
              
              <div className="request-summary">
                <div className="summary-row">
                  <span className="summary-label">Purpose:</span>
                  <span className="summary-value">{request.purpose}</span>
                </div>
                
                <div className="summary-row">
                  <span className="summary-label">Data Types:</span>
                  <span className="summary-value">{request.dataTypes.join(', ')}</span>
                </div>
              </div>
              
              <div className="request-actions">
                <button 
                  className="details-btn"
                  onClick={() => showRequestDetails(request)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsentRequests;