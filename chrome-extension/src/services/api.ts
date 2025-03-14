import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Save job to backend
export const saveJob = async (jobData: {
  companyName: string;
  position: string;
  jobDescription: string;
  jobUrl: string;
}) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

// Generate cover letter
export const generateCoverLetter = async (data: {
  jobId: string;
  customInfo?: string;
}) => {
  try {
    const response = await api.post('/cover-letters/generate', data);
    return response.data;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

// Create Google Doc from cover letter
export const createGoogleDoc = async (data: {
  coverLetterId: string;
  templateId: string;
  tokens: any;
}) => {
  try {
    const response = await api.post('/cover-letters/google-doc', data);
    return response.data;
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
};

// Export cover letter as PDF
export const exportAsPdf = async (coverLetterId: string, tokens: any) => {
  try {
    const response = await api.post(`/cover-letters/${coverLetterId}/export-pdf`, { tokens });
    return response.data;
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    throw error;
  }
};

// Get Google auth URL
export const getGoogleAuthUrl = async () => {
  try {
    const response = await api.get('/auth/google/url');
    return response.data;
  } catch (error) {
    console.error('Error getting Google auth URL:', error);
    throw error;
  }
}; 