import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onToggleForm }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      address: '',
      phoneNumber: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('personalInfo.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [fieldName]: value
        }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (isLogin) {
      // Login
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.message);
      } else {
        // Update user's visited pages on successful login
        const visitedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
        // In a real app, we would send this to the backend
        console.log('Visited pages:', visitedPages);
      }
    } else {
      // Register
      if (!formData.name) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      
      // For registration, we need firstName and lastName
      if (!formData.personalInfo.firstName || !formData.personalInfo.lastName) {
        setError('First name and last name are required');
        setLoading(false);
        return;
      }
      
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        personalInfo: formData.personalInfo
      };
      
      const result = await register(registrationData);
      if (!result.success) {
        setError(result.message);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
              
              <div className="personal-info-section">
                <h3>Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="personalInfo.firstName">First Name *</label>
                  <input
                    type="text"
                    id="personalInfo.firstName"
                    name="personalInfo.firstName"
                    value={formData.personalInfo.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="personalInfo.lastName">Last Name *</label>
                  <input
                    type="text"
                    id="personalInfo.lastName"
                    name="personalInfo.lastName"
                    value={formData.personalInfo.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="personalInfo.dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="personalInfo.dateOfBirth"
                    name="personalInfo.dateOfBirth"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="personalInfo.address">Address</label>
                  <input
                    type="text"
                    id="personalInfo.address"
                    name="personalInfo.address"
                    value={formData.personalInfo.address}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="personalInfo.phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="personalInfo.phoneNumber"
                    name="personalInfo.phoneNumber"
                    value={formData.personalInfo.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;