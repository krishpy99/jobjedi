import express from 'express';
import * as chatController from '../controllers/chat.controller';

const router = express.Router();

// POST ask a question
router.post('/ask', chatController.askQuestion);

export default router; 