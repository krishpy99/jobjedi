import express from 'express';
import * as jobController from '../controllers/job.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Protected routes (require authentication)

// GET all jobs (email now extracted from auth token)
router.get('/', authenticateToken, jobController.getAllJobs);

// GET job by URL (email now extracted from auth token)
router.get('/:jobId', authenticateToken, jobController.getJobById);

// POST add new job
router.post('/', authenticateToken, jobController.addJob);

// DELETE job by URL (email now extracted from auth token)
router.delete('/:jobId', authenticateToken, jobController.deleteJob);

// GET search jobs by text (email now extracted from auth token)
router.get('/search/text', authenticateToken, jobController.searchJobs);

// POST semantic search (can be used without authentication)
router.post('/search/semantic', jobController.semanticSearch);

export default router; 