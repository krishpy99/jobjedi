'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import JobTable from '@/components/JobTable';
import ChatButton from '@/components/ChatButton';
import { useUser } from '@clerk/nextjs';
import { useGetAllJobs } from '@/services/api';

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getAllJobs = useGetAllJobs();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchJobs();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllJobs();
      if (response.success) {
        setJobs(response.jobs);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">JobJedi</h1>
        <p className="text-gray-600">Your AI-powered job application assistant</p>
      </div>

      {!isLoaded ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : !isSignedIn ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Welcome to JobJedi</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your job applications.</p>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <p className="text-center text-gray-600 mt-4">
            Sign in using the button in the top-right corner to access your job applications.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Job Applications</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user?.primaryEmailAddress?.emailAddress}</span>
                <Link 
                  href="https://chrome.google.com/webstore/detail/jobjedi/placeholder" 
                  target="_blank"
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Get Chrome Extension
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your jobs...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven&apos;t added any jobs yet.</p>
                <p className="text-sm text-gray-500">
                  Use the JobJedi Chrome extension to add jobs from job posting websites.
                </p>
              </div>
            ) : (
              <JobTable jobs={jobs} />
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">How to Use JobJedi</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium mb-2">1. Add Jobs</h3>
                <p className="text-sm text-gray-600">
                  Use our Chrome extension to save job descriptions directly from job posting websites.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium mb-2">2. Generate Cover Letters</h3>
                <p className="text-sm text-gray-600">
                  Create personalized cover letters with AI, export to Google Docs, and download as PDF.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium mb-2">3. Ask AI Assistant</h3>
                <p className="text-sm text-gray-600">
                  Chat with our AI to get insights about your saved job descriptions.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <ChatButton />
    </main>
  );
}
