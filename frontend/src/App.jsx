import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import ConsentDashboard from './components/ConsentDashboard';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="App">
      {!user ? (
        <Login />
      ) : (
        <ConsentDashboard />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;