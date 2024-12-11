// File: server/services/sessionService.js

import {
    startTimer,
    pauseTimer,
    stopTimer,
    getRemainingTime,
  } from './TimerService.js';
  import {
    createSession as dbCreateSession,
    updateSession as dbUpdateSession,
    getSessionById,
    deleteSession as dbDeleteSession,
  } from '../utils/db.js';
  
  const activeSessions = new Map(); // Stores active sessions with their state and timer info
  
  // Generate a ModeQueue for a session
  const generateModeQueue = (focusDuration, shortBreakDuration, longBreakDuration, reps) => {
    const queue = [{ mode: 'Idle', duration: 0 }]; // Initial Idle state
  
    for (let i = 0; i < reps; i++) {
      queue.push({ mode: 'Focus', duration: focusDuration * 60 });
      if (i < reps - 1) {
        queue.push({ mode: 'ShortBreak', duration: shortBreakDuration * 60 });
      }
    }
  
    queue.push({ mode: 'LongBreak', duration: longBreakDuration * 60 });
    queue.push({ mode: 'Idle', duration: 0 }); // Final Idle state
  
    return queue;
  };
  
  // Create a new session
  export const createSession = async (req, res) => {
    try {
      const data = req.body;
  
      const modeQueue = generateModeQueue(
        data.focusDuration,
        data.shortBreakDuration,
        data.longBreakDuration,
        data.reps
      );
  
      // Save session in DB
      const session = await dbCreateSession({
        ...data,
        state: 'Inactive', // Default state
        mode: 'Idle', // Default mode
        modeQueue, // Precomputed mode sequence
        currentModeIndex: 0, // Start at the beginning of the queue
      });
  
      // Add session to memory
      activeSessions.set(session._id.toString(), {
        ...session.toObject(),
        timer: null,
        remainingTime: 0,
      });
  
      res.status(201).json({ message: 'Session created successfully', session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Start the session timer
  export const startSession = async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = activeSessions.get(sessionId);
  
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
  
      const currentMode = session.modeQueue[session.currentModeIndex];
      if (!currentMode || session.state !== 'Inactive') {
        return res.status(400).json({ error: 'Cannot start session in the current state' });
      }
  
      // Update session state
      session.state = 'Active';
      session.mode = currentMode.mode;
      session.remainingTime = currentMode.duration;
  
      // Update DB
      await dbUpdateSession(sessionId, {
        state: 'Active',
        mode: currentMode.mode,
      });
  
      // Start the timer
      startTimer(
        sessionId,
        session.remainingTime,
        async (remainingTime) => {
          // Update remaining time in DB
          await dbUpdateSession(sessionId, { remainingTime });
        },
        async () => {
          // Move to the next mode
          await transitionToNextMode(sessionId);
        }
      );
  
      res.status(200).json({ message: 'Session started', session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Transition to the next mode in the queue
  const transitionToNextMode = async (sessionId) => {
    const session = activeSessions.get(sessionId);
  
    if (!session) return;
  
    session.currentModeIndex++;
    if (session.currentModeIndex >= session.modeQueue.length) {
      // End the session (Final Idle state reached)
      session.state = 'Inactive';
      session.mode = 'Idle';
      stopTimer(sessionId);
      activeSessions.delete(sessionId);
      await dbUpdateSession(sessionId, { state: 'Inactive', mode: 'Idle' });
    } else {
      // Start the next mode
      const nextMode = session.modeQueue[session.currentModeIndex];
      session.mode = nextMode.mode;
      session.remainingTime = nextMode.duration;
  
      // Update DB
      await dbUpdateSession(sessionId, {
        mode: nextMode.mode,
        remainingTime: nextMode.duration,
      });
  
      // Restart timer for the next mode
      startTimer(
        sessionId,
        session.remainingTime,
        async (remainingTime) => {
          await dbUpdateSession(sessionId, { remainingTime });
        },
        async () => {
          await transitionToNextMode(sessionId);
        }
      );
    }
  };
  
  // Pause the session
  export const pauseSession = async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = activeSessions.get(sessionId);
  
      if (!session || session.state !== 'Active') {
        return res.status(400).json({ error: 'Session is not active' });
      }
  
      pauseTimer(sessionId);
      session.state = 'Paused';
  
      // Update DB
      await dbUpdateSession(sessionId, { state: 'Paused' });
  
      res.status(200).json({ message: 'Session paused', session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Resume the session
  export const resumeSession = async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = activeSessions.get(sessionId);
  
      if (!session || session.state !== 'Paused') {
        return res.status(400).json({ error: 'Session is not paused' });
      }
  
      session.state = 'Active';
  
      // Update DB
      await dbUpdateSession(sessionId, { state: 'Active' });
  
      // Resume the timer
      startTimer(
        sessionId,
        session.remainingTime,
        async (remainingTime) => {
          await dbUpdateSession(sessionId, { remainingTime });
        },
        async () => {
          await transitionToNextMode(sessionId);
        }
      );
  
      res.status(200).json({ message: 'Session resumed', session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Stop the session
  export const stopSession = async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = activeSessions.get(sessionId);
  
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
  
      stopTimer(sessionId);
      session.state = 'Inactive';
      session.mode = 'Idle';
  
      // Update DB
      await dbUpdateSession(sessionId, { state: 'Inactive', mode: 'Idle' });
      activeSessions.delete(sessionId);
  
      res.status(200).json({ message: 'Session stopped', session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
  /**
   * Just repeat after me, I'll continue the work tomorrow
   * 1. I was working on the Session flow logic - and I was reviewing the code you sent.
   * 2. The default state is Active - 
   * 3. Check 
   */