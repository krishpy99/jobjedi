import express from 'express';
import { createResume, getAllResumes, getResumeById, getResumeByAlias, deleteResume, searchResumes } from '../controllers/resume.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new resume
router.post('/', createResume);

// Get all resumes for current user
router.get('/', getAllResumes);

// Search resumes
router.get('/search', searchResumes);

// Get resume by alias
router.get('/alias/:alias', getResumeByAlias);

// Get resume by ID
router.get('/:id', getResumeById);

// Delete resume
router.delete('/:id', deleteResume);

export default router;
