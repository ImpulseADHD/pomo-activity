// client/src/components/CreateSessionScreen.js

import HomeScreen from './HomeScreen.js';

function CreateSessionScreen(navigateTo, socket) {
  const screen = document.createElement('div');
  screen.innerHTML = `
    <h2>Create Pomodoro Session</h2>
    <label>Session Name:</label>
    <input type="text" id="session-name" placeholder="Enter session name" />
    
    <label>Focus Duration (mins):</label>
    <div class="interval-controls">
      <button id="focus-dec">-</button>
      <span id="focus-duration">25</span>
      <button id="focus-inc">+</button>
    </div>
    
    <label>Break Duration (mins):</label>
    <div class="interval-controls">
      <button id="break-dec">-</button>
      <span id="break-duration">5</span>
      <button id="break-inc">+</button>
    </div>
    
    <label>Number of Reps:</label>
    <div class="interval-controls">
      <button id="reps-dec">-</button>
      <span id="reps">4</span>
      <button id="reps-inc">+</button>
    </div>
    
    <button id="invite-button">Invite Members</button>
    <button id="start-session">Start Session</button>
  `;

  const updateValue = (element, delta, min = 1, max = 120) => {
    const currentValue = parseInt(element.innerText);
    element.innerText = Math.max(min, Math.min(currentValue + delta, max));
  };

  screen.querySelector('#focus-inc').onclick = () => updateValue(screen.querySelector('#focus-duration'), 2);
  screen.querySelector('#focus-dec').onclick = () => updateValue(screen.querySelector('#focus-duration'), -2);
  screen.querySelector('#break-inc').onclick = () => updateValue(screen.querySelector('#break-duration'), 2);
  screen.querySelector('#break-dec').onclick = () => updateValue(screen.querySelector('#break-duration'), -2);
  screen.querySelector('#reps-inc').onclick = () => updateValue(screen.querySelector('#reps'), 1);
  screen.querySelector('#reps-dec').onclick = () => updateValue(screen.querySelector('#reps'), -1);

  // Create Session Button
  screen.querySelector('#start-session').onclick = () => {
    const sessionName = screen.querySelector('#session-name').value;
    const focusDuration = parseInt(screen.querySelector('#focus-duration').innerText);
    const breakDuration = parseInt(screen.querySelector('#break-duration').innerText);
    const reps = parseInt(screen.querySelector('#reps').innerText);

    socket.send(JSON.stringify({
      type: 'CREATE_SESSION',
      name: sessionName,
      focusDuration,
      breakDuration,
      reps
    }));

    navigateTo(() => HomeScreen(navigateTo, socket));
  };

  return screen;
}

export default CreateSessionScreen;
