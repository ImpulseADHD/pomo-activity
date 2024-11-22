//client/src/components/HomeScreen.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeScreen = () => {
  const [backendStatus, setBackendStatus] = useState('Checking connection...');
  const navigate = useNavigate();

  // Simulate a backend connection status
  useEffect(() => {
    setTimeout(() => {
      setBackendStatus('Connected to backend successfully!');
    }, 1000);
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1 className="heading">Pomodoro Group Activity</h1>
        <p>{backendStatus}</p>
        <button className="primary-button" onClick={() => navigate('/session')}>
          Join Session
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
