// client/src/components/HomeScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateSessionScreen from "./CreateSessionScreen"; // Import the popup component

const HomeScreen = () => {
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false); // State to control popup visibility
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card">
        <h1 className="heading">Pomodoro Group Activity</h1>
        <div className="button-container">
          {/* Join Session Button */}
          <button
            className="primary-button"
            onClick={() => navigate("/session")}
          >
            Join Session
          </button>

          {/* Create New Sesh Button */}
          <button
            className="primary-button create-session-button"
            onClick={() => setIsCreateSessionOpen(true)} // Open the popup
          >
            Create New Session
          </button>
        </div>
      </div>

      {/* Render the Create New Session Popup */}
      {isCreateSessionOpen && (
        <CreateSessionScreen
          onClose={() => setIsCreateSessionOpen(false)} // Close the popup
        />
      )}
    </div>
  );
};

export default HomeScreen;
