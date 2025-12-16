import React, { useState } from 'react';

const ConsentForm = ({ onGrantConsent }) => {
  const [formData, setFormData] = useState({
    requesterEmail: '',
    dataTypes: [],
    purpose: '',
    expirationType: 'duration', // 'duration' or 'datetime'
    duration: '1-year',
    expirationDateTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dataTypesOptions = [
    { id: 'personal-info', label: 'Personal Information' },
    { id: 'location-data', label: 'Location Data' },
    { id: 'browser-data', label: 'Browser Data' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          dataTypes: [...prev.dataTypes, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          dataTypes: prev.dataTypes.filter(type => type !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.requesterEmail || formData.dataTypes.length === 0 || !formData.purpose) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate expiration
    if (formData.expirationType === 'datetime' && !formData.expirationDateTime) {
      setError('Please select an expiration date and time');
      return;
    }
    
    // If using datetime, check that it's in the future
    if (formData.expirationType === 'datetime' && new Date(formData.expirationDateTime) <= new Date()) {
      setError('Expiration date and time must be in the future');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Prepare data for submission
    const consentData = {
      requesterEmail: formData.requesterEmail,
      dataTypes: formData.dataTypes,
      purpose: formData.purpose
    };
    
    // Add duration or datetime based on selection
    if (formData.expirationType === 'duration') {
      consentData.duration = formData.duration;
    } else {
      consentData.expirationDateTime = formData.expirationDateTime;
    }
    
    const result = await onGrantConsent(consentData);
    
    if (result.success) {
      setSuccess('Consent request sent successfully!');
      // Reset form
      setFormData({
        requesterEmail: '',
        dataTypes: [],
        purpose: '',
        expirationType: 'duration',
        duration: '1-year',
        expirationDateTime: ''
      });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  // Generate min datetime for the datetime picker (current time)
  const getCurrentDateTimeString = () => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:MM (required by datetime-local input)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="consent-form">
      <h2>Request Data from Another User</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="requesterEmail">User Email *</label>
          <input
            type="email"
            id="requesterEmail"
            name="requesterEmail"
            value={formData.requesterEmail}
            onChange={handleInputChange}
            placeholder="Enter the email of the user you want to request data from"
            required
          />
          <small className="form-help">Enter the email of another user whose data you want to access</small>
        </div>

        <div className="form-group">
          <label>Data Types to Request *</label>
          <div className="checkbox-group">
            {dataTypesOptions.map(option => (
              <div key={option.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={option.id}
                  name="dataTypes"
                  value={option.id}
                  checked={formData.dataTypes.includes(option.id)}
                  onChange={handleInputChange}
                />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>
          
          {formData.dataTypes.includes('location-data') && (
            <div className="location-warning">
              <p>⚠️ Location data will be collected when the user accepts this request.</p>
            </div>
          )}
          
          {formData.dataTypes.includes('browser-data') && (
            <div className="browser-warning">
              <p>⚠️ Browser data will be collected when the user accepts this request.</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Purpose of Data Request *</label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            placeholder="Explain why you need access to this data"
            required
          />
        </div>

        <div className="form-group">
          <label>Expiration Type</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                id="expiration-duration"
                name="expirationType"
                value="duration"
                checked={formData.expirationType === 'duration'}
                onChange={handleInputChange}
              />
              <label htmlFor="expiration-duration">Duration</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                id="expiration-datetime"
                name="expirationType"
                value="datetime"
                checked={formData.expirationType === 'datetime'}
                onChange={handleInputChange}
              />
              <label htmlFor="expiration-datetime">Specific Date & Time</label>
            </div>
          </div>
        </div>

        {formData.expirationType === 'duration' ? (
          <div className="form-group">
            <label htmlFor="duration">Consent Duration</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
            >
              <option value="1-month">1 Month</option>
              <option value="6-months">6 Months</option>
              <option value="1-year">1 Year</option>
              <option value="2-years">2 Years</option>
            </select>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="expirationDateTime">Expiration Date & Time</label>
            <input
              type="datetime-local"
              id="expirationDateTime"
              name="expirationDateTime"
              value={formData.expirationDateTime}
              onChange={handleInputChange}
              min={getCurrentDateTimeString()}
            />
          </div>
        )}

        <button 
          type="submit" 
          className="grant-btn" 
          disabled={loading}
        >
          {loading ? 'Sending Request...' : 'Send Data Request'}
        </button>
      </form>
    </div>
  );
};

export default ConsentForm;