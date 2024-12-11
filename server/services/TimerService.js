// File: server/services/TimerService.js

const activeTimers = new Map(); // In-memory map for timers

// Start a new timer for a session
export const startTimer = (sessionId, initialTime, onTick, onComplete) => {
  if (activeTimers.has(sessionId)) {
    throw new Error(`Timer for session ${sessionId} is already running.`);
  }

  let remainingTime = initialTime;

  const timer = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      onTick(remainingTime); // Notify the tick
    } else {
      clearInterval(timer);
      activeTimers.delete(sessionId);
      onComplete(); // Notify completion
    }
  }, 1000);

  activeTimers.set(sessionId, { timer, remainingTime });
};

// Pause the timer for a session
export const pauseTimer = (sessionId) => {
  const timerInfo = activeTimers.get(sessionId);
  if (!timerInfo) {
    throw new Error(`No active timer for session ${sessionId}.`);
  }

  clearInterval(timerInfo.timer);
  activeTimers.set(sessionId, { ...timerInfo, timer: null });
};

// Resume a paused timer
export const resumeTimer = (sessionId, onTick, onComplete) => {
  const timerInfo = activeTimers.get(sessionId);
  if (!timerInfo || timerInfo.timer) {
    throw new Error(`Cannot resume timer for session ${sessionId}.`);
  }

  const { remainingTime } = timerInfo;
  startTimer(sessionId, remainingTime, onTick, onComplete);
};

// Stop and remove a timer
export const stopTimer = (sessionId) => {
  const timerInfo = activeTimers.get(sessionId);
  if (!timerInfo) {
    throw new Error(`No active timer for session ${sessionId}.`);
  }

  clearInterval(timerInfo.timer);
  activeTimers.delete(sessionId);
};

// Get remaining time for a session
export const getRemainingTime = (sessionId) => {
  const timerInfo = activeTimers.get(sessionId);
  if (!timerInfo) {
    return null;
  }
  return timerInfo.remainingTime;
};
