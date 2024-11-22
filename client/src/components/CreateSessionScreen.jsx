//client/src/components/CreateSessionScreen.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateSessionScreen = () => {
  const [sessionName, setSessionName] = useState("");
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [reps, setReps] = useState(4);
  const navigate = useNavigate();

  const handleCreateSession = () => {
    const sessionData = {
      sessionName,
      focusDuration,
      breakDuration,
      reps,
    };
    console.log("Session Created:", sessionData);
  };

  return (
    <div id="create-session-screen">
      <h2>Create New Session</h2>
      <div>
        <label>Session Name:</label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
        />
      </div>
      <div>
        <label>Focus Duration (mins):</label>
        <input
          type="number"
          value={focusDuration}
          onChange={(e) => setFocusDuration(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Break Duration (mins):</label>
        <input
          type="number"
          value={breakDuration}
          onChange={(e) => setBreakDuration(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Number of Reps:</label>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
        />
      </div>
      <button onClick={handleCreateSession}>Create Session</button>
      <button onClick={() => navigate("/")}>Go To Home</button>
    </div>
  );
};

export default CreateSessionScreen;
