import express from 'express';
import * as jobController from '../controllers/job.controller';

const router = express.Router();

// GET all jobs (requires userEmail as query parameter)
router.get('/', jobController.getAllJobs);

// GET job by URL (requires userEmail as query parameter)
router.get('/url/:jobUrl', jobController.getJobById);

// POST add new job
router.post('/', jobController.addJob);

// DELETE job by URL (requires userEmail as query parameter)
router.delete('/url/:jobUrl', jobController.deleteJob);

// GET search jobs by text (requires userEmail as query parameter)
router.get('/search/text', jobController.searchJobs);

// POST semantic search
router.post('/search/semantic', jobController.semanticSearch);

export default router; 