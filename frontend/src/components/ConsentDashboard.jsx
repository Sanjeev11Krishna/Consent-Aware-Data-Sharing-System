import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { consentAPI, auditAPI } from '../services/api';
import ConsentForm from './ConsentForm';
import ConsentList from './ConsentList';
import ConsentRequests from './ConsentRequests';
import AuditLog from './AuditLog';

const ConsentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [consents, setConsents] = useState([]);
  const [grantedConsents, setGrantedConsents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [consentStats, setConsentStats] = useState({
    activeConsentsAsRequester: 0,
    revokedConsentsAsRequester: 0,
    activeConsentsAsGranter: 0,
    revokedConsentsAsGranter: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track visited pages
  useEffect(() => {
    const trackPageVisit = () => {
      // Get current page URL
      const currentPage = window.location.origin + window.location.pathname;
      
      // Get existing visited pages from localStorage
      let visitedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
      
      // Add current page to the beginning of the array if it's not already the first item
      if (visitedPages[0] !== currentPage) {
        visitedPages.unshift(currentPage);
      }
      
      // Remove duplicates and keep only the last 5 unique pages
      const uniquePages = [];
      const seen = new Set();
      for (const page of visitedPages) {
        if (!seen.has(page)) {
          seen.add(page);
          uniquePages.push(page);
        }
        if (uniquePages.length >= 5) break;
      }
      
      // Store in localStorage
      localStorage.setItem('visitedPages', JSON.stringify(uniquePages));
    };
    
    trackPageVisit();
    
    // Set up interval to track page visits periodically
    const interval = setInterval(trackPageVisit, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [consentsRes, grantedRes, logsRes] = await Promise.all([
          consentAPI.getUserConsents(),
          consentAPI.getGrantedConsents(),
          auditAPI.getUserLogs()
        ]);
        
        setConsents(consentsRes.data);
        setGrantedConsents(grantedRes.data);
        
        // Handle the new response structure
        if (logsRes.data.logs) {
          setAuditLogs(logsRes.data.logs);
          setConsentStats(logsRes.data.consentStats || {
            activeConsentsAsRequester: 0,
            revokedConsentsAsRequester: 0,
            activeConsentsAsGranter: 0,
            revokedConsentsAsGranter: 0,
            expiredConsentsAsRequester: 0,
            expiredConsentsAsGranter: 0
          });
        } else {
          // Fallback for old structure
          setAuditLogs(logsRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestConsent = async (consentData) => {
    try {
      // Add visited pages to consent data if browser data is requested
      if (consentData.dataTypes.includes('browser-data')) {
        const visitedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
        consentData.visitedPages = visitedPages.slice(0, 5); // Limit to 5 pages
      }
      
      const response = await consentAPI.requestConsent(consentData);
      // Refresh audit logs
      const logsRes = await auditAPI.getUserLogs();
      
      // Handle the new response structure
      if (logsRes.data.logs) {
        setAuditLogs(logsRes.data.logs);
        setConsentStats(logsRes.data.consentStats || {
          activeConsentsAsRequester: 0,
          revokedConsentsAsRequester: 0,
          activeConsentsAsGranter: 0,
          revokedConsentsAsGranter: 0,
          expiredConsentsAsRequester: 0,
          expiredConsentsAsGranter: 0
        });
      } else {
        // Fallback for old structure
        setAuditLogs(logsRes.data);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error requesting consent:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to request consent' 
      };
    }
  };

  const handleRevokeConsent = async (consentId) => {
    try {
      await consentAPI.revokeConsent(consentId);
      
      // Update local state
      setGrantedConsents(grantedConsents.map(consent => 
        consent._id === consentId 
          ? { ...consent, status: 'revoked' } 
          : consent
      ));
      
      // Refresh audit logs
      const logsRes = await auditAPI.getUserLogs();
      
      // Handle the new response structure
      if (logsRes.data.logs) {
        setAuditLogs(logsRes.data.logs);
        setConsentStats(logsRes.data.consentStats || {
          activeConsentsAsRequester: 0,
          revokedConsentsAsRequester: 0,
          activeConsentsAsGranter: 0,
          revokedConsentsAsGranter: 0,
          expiredConsentsAsRequester: 0,
          expiredConsentsAsGranter: 0
        });
      } else {
        // Fallback for old structure
        setAuditLogs(logsRes.data);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error revoking consent:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to revoke consent' 
      };
    }
  };

  const handleRequestData = async (requestData) => {
    try {
      console.log('Requesting data with params:', requestData);
      const response = await consentAPI.requestDataAccess(requestData);
      console.log('Data request response:', response.data);
      
      // Refresh audit logs
      const logsRes = await auditAPI.getUserLogs();
      
      // Handle the new response structure
      if (logsRes.data.logs) {
        setAuditLogs(logsRes.data.logs);
        setConsentStats(logsRes.data.consentStats || {
          activeConsentsAsRequester: 0,
          revokedConsentsAsRequester: 0,
          activeConsentsAsGranter: 0,
          revokedConsentsAsGranter: 0,
          expiredConsentsAsRequester: 0,
          expiredConsentsAsGranter: 0
        });
      } else {
        // Fallback for old structure
        setAuditLogs(logsRes.data);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error requesting data:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to access data' 
      };
    }
  };

  if (loading && consents.length === 0) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header>
        <div className="header-content">
          <h1>Consent-Aware Data Sharing System</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      
      <div className="tabs">
        <button 
          className={activeTab === 'requests' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('requests')}
        >
          Consent Requests
        </button>
        <button 
          className={activeTab === 'grant' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('grant')}
        >
          Request Data Access
        </button>
        <button 
          className={activeTab === 'my-consents' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('my-consents')}
        >
          My Data Access ({consents.filter(c => ['active', 'expired'].includes(c.status)).length})
        </button>
        <button 
          className={activeTab === 'granted-consents' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('granted-consents')}
        >
          Data I'm Sharing ({grantedConsents.filter(c => ['active', 'expired'].includes(c.status)).length})
        </button>
        <button 
          className={activeTab === 'audit' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('audit')}
        >
          Activity Log
        </button>
      </div>
      
      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        
        {activeTab === 'requests' && (
          <ConsentRequests />
        )}
        
        {activeTab === 'grant' && (
          <ConsentForm onGrantConsent={handleRequestConsent} />
        )}
        
        {activeTab === 'my-consents' && (
          <ConsentList 
            consents={consents} 
            onRequestData={handleRequestData}
            userType="requester"
          />
        )}
        
        {activeTab === 'granted-consents' && (
          <ConsentList 
            consents={grantedConsents} 
            onRevokeConsent={handleRevokeConsent}
            userType="granter"
          />
        )}
        
        {activeTab === 'audit' && (
          <AuditLog logs={auditLogs} consentStats={consentStats} />
        )}
      </main>
    </div>
  );
};

export default ConsentDashboard;