// client/src/components/CreateNewSessionScreen.jsx
import React, { useState } from "react";
import "../styles.css";

const CreateNewSessionScreen = ({ onClose }) => {
  const [sessionDetails, setSessionDetails] = useState({
    sessionName: "",
    focusDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    reps: 3,
  });
  const [isSessionCreated, setIsSessionCreated] = useState(false); // State for the second modal

  const handleInputChange = (key, value) => {
    setSessionDetails((prevDetails) => ({
      ...prevDetails,
      [key]: value,
    }));
  };

  const incrementValue = (key) => {
    setSessionDetails((prevDetails) => ({
      ...prevDetails,
      [key]: prevDetails[key] + 1,
    }));
  };

  const decrementValue = (key) => {
    setSessionDetails((prevDetails) => ({
      ...prevDetails,
      [key]: Math.max(1, prevDetails[key] - 1),
    }));
  };

  const handleCreateSesh = () => {
    setIsSessionCreated(true); // Show the session info modal
  };

  return (
    <>
      {!isSessionCreated && (
        <div className="modal-overlay">
          <div className="modal-content create-session-layout">
            {/* Main Content */}
            <div className="main-content">
              <h2 className="title">Create New Session</h2>

              <div className="form-container">
                {/* Name of the Session */}
                <div className="form-row">
                  <label htmlFor="sessionName">Name of the Session:</label>
                  <input
                    type="text"
                    id="sessionName"
                    value={sessionDetails.sessionName}
                    onChange={(e) =>
                      handleInputChange("sessionName", e.target.value)
                    }
                    placeholder="Enter session name"
                  />
                </div>

                {/* Focus Duration */}
                <div className="form-row">
                  <label>Focus Duration:</label>
                  <div className="number-input">
                    <button onClick={() => decrementValue("focusDuration")}>
                      -
                    </button>
                    <input
                      type="number"
                      value={sessionDetails.focusDuration}
                      readOnly
                    />
                    <button onClick={() => incrementValue("focusDuration")}>
                      +
                    </button>
                  </div>
                </div>

                {/* Short Break */}
                <div className="form-row">
                  <label>Short Break:</label>
                  <div className="number-input">
                    <button onClick={() => decrementValue("shortBreak")}>
                      -
                    </button>
                    <input
                      type="number"
                      value={sessionDetails.shortBreak}
                      readOnly
                    />
                    <button onClick={() => incrementValue("shortBreak")}>
                      +
                    </button>
                  </div>
                </div>

                {/* Long Break */}
                <div className="form-row">
                  <label>Long Break:</label>
                  <div className="number-input">
                    <button onClick={() => decrementValue("longBreak")}>
                      -
                    </button>
                    <input
                      type="number"
                      value={sessionDetails.longBreak}
                      readOnly
                    />
                    <button onClick={() => incrementValue("longBreak")}>
                      +
                    </button>
                  </div>
                </div>

                {/* Repeat / Reps */}
                <div className="form-row">
                  <label>Repeat / Reps:</label>
                  <div className="number-input">
                    <button onClick={() => decrementValue("reps")}>-</button>
                    <input type="number" value={sessionDetails.reps} readOnly />
                    <button onClick={() => incrementValue("reps")}>+</button>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <div className="form-footer">
                <button className="btn-create-sesh" onClick={handleCreateSesh}>
                  Start Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSessionCreated && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Session Created!</h2>
            <p>
              <strong>Name:</strong> {sessionDetails.sessionName || "Unnamed"}
            </p>
            <p>
              <strong>Focus Duration:</strong> {sessionDetails.focusDuration}{" "}
              mins
            </p>
            <p>
              <strong>Short Break:</strong> {sessionDetails.shortBreak} mins
            </p>
            <p>
              <strong>Long Break:</strong> {sessionDetails.longBreak} mins
            </p>
            <p>
              <strong>Reps:</strong> {sessionDetails.reps}
            </p>
            <button className="btn-create-sesh" onClick={onClose}>
              Go to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNewSessionScreen;
