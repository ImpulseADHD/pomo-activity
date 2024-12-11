// File: server/api/index.js

import express from 'express';
import { createSession, joinSession, leaveSession, getSessions } from '../services/SessionService.js';

const router = express.Router();

router.post('/sessions/create', createSession);
router.post('/sessions/join', joinSession);
router.post('/sessions/leave', leaveSession);
router.get('/sessions/active', getSessions);

export default router;
