import express from 'express';
import googleDriveService from '../services/googleDrive.service';

const router = express.Router();

// GET Google auth URL
router.get('/google/url', (req, res) => {
  try {
    const authUrl = googleDriveService.getAuthUrl();
    res.json({ success: true, authUrl });
  } catch (error: any) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET Google auth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const tokens = await googleDriveService.getTokens(code as string);
    
    // Return tokens to the client (typically you would set a session or cookie)
    res.json({ success: true, tokens });
  } catch (error: any) {
    console.error('Error getting tokens:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router; 