//client/src/components/SessionScreen.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const SessionScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card">
        <h1 className="heading">Pomodoro Session</h1>
        <p>Dummy Timer: 25:00</p>
        <p>Start Time: 10:00 AM</p>
        <p>End Time: 10:25 AM</p>
        <p>Backend Status: Connected to backend successfully!</p>
        <button className="secondary-button" onClick={() => navigate('/')}>
          Go to HomeScreen
        </button>
      </div>
    </div>
  );
};

export default SessionScreen;
