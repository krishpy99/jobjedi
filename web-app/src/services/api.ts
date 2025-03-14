import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Google OAuth token interface
interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  token_type: string;
  id_token?: string;
  scope: string;
}

// Get all jobs
export const getAllJobs = async () => {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Get job by ID
export const getJobById = async (jobId: string) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

// Delete job
export const deleteJob = async (jobId: string) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// Search jobs
export const searchJobs = async (query: string) => {
  try {
    const response = await api.get(`/jobs/search/text?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};

// Semantic search
export const semanticSearch = async (query: string) => {
  try {
    const response = await api.post('/jobs/search/semantic', { query });
    return response.data;
  } catch (error) {
    console.error('Error performing semantic search:', error);
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

// Get cover letters by job
export const getCoverLettersByJob = async (jobId: string) => {
  try {
    const response = await api.get(`/cover-letters/job/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    throw error;
  }
};

// Create Google Doc from cover letter
export const createGoogleDoc = async (data: {
  coverLetterId: string;
  templateId: string;
  tokens: GoogleTokens;
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
export const exportAsPdf = async (coverLetterId: string, tokens: GoogleTokens) => {
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

// Ask a question to the AI
export const askQuestion = async (data: { question: string }) => {
  try {
    const response = await api.post('/chat/ask', data);
    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
}; 