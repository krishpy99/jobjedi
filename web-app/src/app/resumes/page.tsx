"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Resume {
  id: string;
  jdText: string;
  resumeText: string;
  alias?: string;
  createdAt: string;
}

interface ResumeSearchResult {
  id: string;
  jdTextExcerpt: string;
  resumeTextExcerpt: string;
  alias?: string;
  similarityScore: number;
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [searchResults, setSearchResults] = useState<ResumeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [alias, setAlias] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('userEmail') || 'demo@example.com';
  
  // Fetch all resumes
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resumes?userEmail=${userEmail}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      const data = await response.json();
      setResumes(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching resumes');
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new resume
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jdText,
          resumeText,
          alias: alias || undefined,
          userEmail,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create resume');
      }
      
      await fetchResumes();
      
      // Reset form
      setJdText('');
      setResumeText('');
      setAlias('');
      
    } catch (err: any) {
      setError(err.message || 'Error creating resume');
    } finally {
      setLoading(false);
    }
  };
  
  // Search resumes
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.length < 5) {
      setError('Search query must be at least 5 characters');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/resumes/search?query=${encodeURIComponent(searchQuery)}&userEmail=${userEmail}`);
      
      if (!response.ok) {
        throw new Error('Failed to search resumes');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setError(err.message || 'Error searching resumes');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a resume
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/resumes/${id}?userEmail=${userEmail}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }
      
      await fetchResumes();
    } catch (err: any) {
      setError(err.message || 'Error deleting resume');
    } finally {
      setLoading(false);
    }
  };
  
  // Load resumes on initial render
  useEffect(() => {
    fetchResumes();
  }, [userEmail]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resume Manager</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          {error}
          <button className="float-right" onClick={() => setError('')}>&times;</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Create Resume Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Resume</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Job Description</label>
              <textarea 
                className="w-full border rounded p-2 min-h-[150px]"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                required
                placeholder="Paste the job description here..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Resume Text</label>
              <textarea 
                className="w-full border rounded p-2 min-h-[200px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
                placeholder="Paste your resume text here..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Alias (Optional)</label>
              <input 
                type="text"
                className="w-full border rounded p-2"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="E.g., Software Engineer - Google"
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Resume'}
            </button>
          </form>
        </div>
        
        {/* Search Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Search Resumes</h2>
          <p className="mb-4 text-gray-600">
            Enter a job description to find the most relevant resume from your collection.
          </p>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Job Description</label>
              <textarea 
                className="w-full border rounded p-2 min-h-[150px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
                placeholder="Paste a job description to search with..."
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              disabled={loading || searchQuery.length < 5}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.id} className="border rounded p-4">
                    <div className="flex justify-between">
                      <span className="font-medium">{result.alias || 'Unnamed Resume'}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
                        Score: {(result.similarityScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{result.resumeTextExcerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Resumes List */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Resumes</h2>
        
        {loading && <p>Loading...</p>}
        
        {!loading && resumes.length === 0 && (
          <p className="text-gray-500">No resumes found. Add your first resume using the form above.</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{resume.alias || 'Unnamed Resume'}</h3>
                <button 
                  onClick={() => handleDelete(resume.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Created: {new Date(resume.createdAt).toLocaleDateString()}
              </p>
              <div className="border-t pt-2 mt-2">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Job Description:</strong> {resume.jdText.substring(0, 100)}...
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Resume:</strong> {resume.resumeText.substring(0, 100)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
