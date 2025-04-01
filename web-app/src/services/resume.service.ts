/**
 * Resume service for interacting with the resume API endpoints
 */

// Resume interfaces
export interface Resume {
  id: string;
  jdText: string;
  resumeText: string;
  alias?: string;
  userId: string;
  createdAt: string;
}

export interface ResumeCreateDTO {
  jdText: string;
  resumeText: string;
  alias?: string;
  userEmail: string;
}

export interface ResumeSearchResult {
  id: string;
  jdTextExcerpt: string;
  resumeTextExcerpt: string;
  alias?: string;
  userId: string;
  similarityScore: number;
}

// API base URL - use environment variable or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Create a new resume
 */
export const createResume = async (resumeData: ResumeCreateDTO): Promise<Resume> => {
  const response = await fetch(`${API_BASE_URL}/api/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resumeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create resume');
  }

  return response.json();
};

/**
 * Get all resumes for a user
 */
export const getResumes = async (userEmail: string): Promise<Resume[]> => {
  const response = await fetch(`${API_BASE_URL}/api/resumes?userEmail=${userEmail}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch resumes');
  }

  return response.json();
};

/**
 * Get a resume by ID
 */
export const getResumeById = async (id: string, userEmail: string): Promise<Resume> => {
  const response = await fetch(`${API_BASE_URL}/api/resumes/${id}?userEmail=${userEmail}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch resume');
  }

  return response.json();
};

/**
 * Delete a resume
 */
export const deleteResume = async (id: string, userEmail: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/resumes/${id}?userEmail=${userEmail}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to delete resume');
  }
};

/**
 * Search resumes with a job description
 */
export const searchResumes = async (
  query: string,
  userEmail: string,
  limit: number = 3
): Promise<ResumeSearchResult[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/resumes/search?query=${encodeURIComponent(query)}&limit=${limit}&userEmail=${userEmail}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search resumes');
  }

  return response.json();
};
