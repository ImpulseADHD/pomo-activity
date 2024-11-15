// client/src/components/SessionScreen.js

import HomeScreen from './HomeScreen.js';
import Timer from '../Timer.js';

function SessionScreen(navigateTo, socket, session) {
  const screen = document.createElement('div');
  screen.id = 'session-screen';

  let currentPhase = 'Not Started';

  screen.innerHTML = `
    <h2>${session.name}</h2>
    <p>Status: <span id="status">${currentPhase}</span></p>
    
    <!-- Timer Display with Countdown Ring -->
    <div id="countdown-container">
      <svg class="countdown-ring" viewBox="0 0 100 100">
        <circle class="countdown-ring-bg" cx="50" cy="50" r="45"></circle>
        <circle class="countdown-ring-progress" cx="50" cy="50" r="45"></circle>
      </svg>
      <div id="timer-display">00:00</div>
    </div>

    <h3>Participants:</h3>
    <div class="members-list">
      ${session.members.map((member) => `<div>${member === "User" ? "<strong>" + member + "</strong>" : member}</div>`).join('')}
    </div>

    <button id="control-button">Start</button>
    <button id="leave-session">Leave Session</button>
    <button id="end-session">End Session</button>
  `;

  const timerDisplay = screen.querySelector('#timer-display');
  const statusDisplay = screen.querySelector('#status');
  const controlButton = screen.querySelector('#control-button');
  const progressCircle = screen.querySelector('.countdown-ring-progress');

  const timer = new Timer(timerDisplay, () => {
    if (currentPhase === 'Focus') {
      currentPhase = 'Break';
      statusDisplay.innerText = 'Break';
      controlButton.innerText = 'Start Next';
      timer.start(session.breakDuration * 60);
    } else {
      currentPhase = 'Focus';
      statusDisplay.innerText = 'Focus';
      controlButton.innerText = 'Pause';
      timer.start(session.focusDuration * 60);
    }
  });

  const setRingProgress = (remainingTime, totalTime) => {
    const progress = (remainingTime / totalTime) * 283; // 283 is the circumference of the ring
    progressCircle.style.strokeDasharray = `${progress} 283`;
  };

  controlButton.onclick = () => {
    if (currentPhase === 'Not Started' || currentPhase === 'Break') {
      currentPhase = 'Focus';
      statusDisplay.innerText = 'Focus';
      controlButton.innerText = 'Pause';
      timer.start(session.focusDuration * 60);
    } else if (currentPhase === 'Focus') {
      timer.pause();
      controlButton.innerText = 'Resume';
    } else if (controlButton.innerText === 'Resume') {
      timer.resume();
      controlButton.innerText = 'Pause';
    }
  };

  screen.querySelector('#leave-session').onclick = () => {
    console.log("Leaving session:", session.name);
    socket.send(JSON.stringify({ type: 'LEAVE_SESSION', sessionId: session.id, username: 'User' }));
    navigateTo(() => HomeScreen(navigateTo, socket));
  };

  screen.querySelector('#end-session').onclick = () => {
    console.log("Ending session:", session.name);
    socket.send(JSON.stringify({ type: 'END_SESSION', sessionId: session.id }));
    navigateTo(() => HomeScreen(navigateTo, socket));
  };

  timer.onTick = (remainingTime, totalTime) => {
    setRingProgress(remainingTime, totalTime);
  };

  return screen;
}

export default SessionScreen;
