// client/src/components/HomeScreen.js

import SessionScreen from './SessionScreen.js';

let sessionData = []; 

function HomeScreen(navigateTo, socket) {
  const screen = document.createElement('div');
  screen.id = 'home-screen';
  screen.innerHTML = `<h1>Pomodoro Group Sessions</h1>`;

  const sessionList = document.createElement('div');
  sessionList.id = 'session-list';

  sessionData.forEach((session) => {
    const sessionCard = document.createElement('div');
    sessionCard.className = 'session-card';

    sessionCard.innerHTML = `
      <h2>${session.name}</h2>
      <p>Status: ${session.status}</p>
      <p>Timer: ${Math.floor(session.timer / 60)}:${String(session.timer % 60).padStart(2, '0')}</p>
      <div class="members-list">
        ${session.members.slice(0, 10).map((member) => `<div>${member}</div>`).join('')}
      </div>
      <p>Participants: ${session.members.length} / 10</p>
      <progress max="100" value="${(session.timer / (session.focusDuration * 60)) * 100}"></progress>
    `;

    const joinButton = document.createElement('button');
    joinButton.innerText = 'Join Session';
    joinButton.onclick = () => {
      console.log("Joining session:", session.name);
      socket.send(JSON.stringify({ type: 'JOIN_SESSION', sessionId: session.id, username: 'User' }));
      navigateTo(() => SessionScreen(navigateTo, socket, session));
    };

    sessionCard.appendChild(joinButton);
    sessionList.appendChild(sessionCard);
  });

  screen.appendChild(sessionList);
  return screen;
}

HomeScreen.updateSessions = (sessions) => {
  sessionData = sessions;
  console.log("Session data updated in HomeScreen:", sessions);
};

export default HomeScreen;
