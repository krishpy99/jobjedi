import express from 'express';
import * as coverLetterController from '../controllers/coverLetter.controller';

const router = express.Router();

// POST generate cover letter
router.post('/generate', coverLetterController.generateCoverLetter);

// POST create Google Doc
router.post('/google-doc', coverLetterController.createGoogleDoc);

// POST export as PDF
router.post('/:coverLetterId/export-pdf', coverLetterController.exportAsPdf);

// GET cover letters by job
router.get('/job/:jobId', coverLetterController.getCoverLettersByJob);

export default router; 