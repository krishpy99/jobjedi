import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const createApiInstance = (token?: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
};

// Hook to get authenticated API instance
export const useApiWithAuth = () => {
  const { getToken } = useAuth();
  
  const getApiInstance = async () => {
    const token = await getToken();
    return createApiInstance(token || undefined);
  };
  
  return { getApiInstance };
};

// Public API instance for non-authenticated routes
const publicApi = createApiInstance();

// Google OAuth token interface
interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  token_type: string;
  id_token?: string;
  scope: string;
}

// React hook for getting all jobs with authentication
export const useGetAllJobs = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async () => {
    try {
      const api = await getApiInstance();
      const response = await api.get('/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  };
};

// Get job by ID (with auth hook)
export const useGetJobById = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (jobId: string) => {
    try {
      const api = await getApiInstance();
      const response = await api.get(`/jobs/url/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  };
};

// Delete job (with auth hook)
export const useDeleteJob = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (jobId: string) => {
    try {
      const api = await getApiInstance();
      const response = await api.delete(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };
};

// Search jobs (with auth hook)
export const useSearchJobs = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (query: string) => {
    try {
      const api = await getApiInstance();
      const response = await api.get(`/jobs/search/text?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  };
};

// Semantic search (with auth hook for protected endpoints)
export const useSemanticSearch = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (query: string) => {
    try {
      const api = await getApiInstance();
      const response = await api.post('/jobs/search/semantic', { query });
      return response.data;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  };
};

// Generate cover letter (with auth hook)
export const useGenerateCoverLetter = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (data: {
    jobId: string;
    customInfo?: string;
  }) => {
    try {
      const api = await getApiInstance();
      const response = await api.post('/cover-letters/generate', data);
      return response.data;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  };
};

// Get cover letters by job (with auth hook)
export const useGetCoverLettersByJob = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (jobId: string) => {
    try {
      const api = await getApiInstance();
      const response = await api.get(`/cover-letters/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      throw error;
    }
  };
};

// Create Google Doc from cover letter (with auth hook)
export const useCreateGoogleDoc = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (data: {
    coverLetterId: string;
    templateId: string;
    tokens: GoogleTokens;
  }) => {
    try {
      const api = await getApiInstance();
      const response = await api.post('/cover-letters/google-doc', data);
      return response.data;
    } catch (error) {
      console.error('Error creating Google Doc:', error);
      throw error;
    }
  };
};

// Export cover letter as PDF (with auth hook)
export const useExportAsPdf = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (coverLetterId: string, tokens: GoogleTokens) => {
    try {
      const api = await getApiInstance();
      const response = await api.post(`/cover-letters/${coverLetterId}/export-pdf`, { tokens });
      return response.data;
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      throw error;
    }
  };
};

// Get Google auth URL (with auth hook)
export const useGetGoogleAuthUrl = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async () => {
    try {
      const api = await getApiInstance();
      const response = await api.get('/auth/google/url');
      return response.data;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw error;
    }
  };
};

// Ask a question to the AI (with auth hook)
export const useAskQuestion = () => {
  const { getApiInstance } = useApiWithAuth();
  
  return async (data: { question: string }) => {
    try {
      const api = await getApiInstance();
      const response = await api.post('/chat/ask', data);
      return response.data;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  };
};