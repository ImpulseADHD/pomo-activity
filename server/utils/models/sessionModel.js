// File: server/utils/models/sessionModel.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  guildId: String,
  name: String,
  focusDuration: Number,
  shortBreakDuration: Number,
  longBreakDuration: Number,
  reps: Number,
  members: [String],
  vcChannel: String,
  state: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
  mode: { type: String, enum: ['Idle', 'Focus', 'Break'], default: 'Idle' },
  createdAt: { type: Date, default: Date.now },
});

export const Session = mongoose.model('Session', sessionSchema);
