// File: server/utils/db.js

// utils/db.js
import { Session } from './models/sessionModel.js';

// Create a new session
export const createSession = async (data) => {
  const session = new Session(data);
  return await session.save();
};

// Get session by ID
export const getSessionById = async (id) => {
  return await Session.findById(id).exec();
};

// Update session
export const updateSession = async (id, updates) => {
  return await Session.findByIdAndUpdate(id, updates, { new: true }).exec();
};

// Delete session
export const deleteSession = async (id) => {
  return await Session.findByIdAndDelete(id).exec();
};

// Get active sessions
export const getActiveSessions = async () => {
  return await Session.find({ state: 'Active' }).exec();
};

// Add member to session
export const addMemberToSession = async (sessionId, userId) => {
  return await Session.findByIdAndUpdate(
    sessionId,
    { $addToSet: { members: userId } },
    { new: true }
  ).exec();
};
