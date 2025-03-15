import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';
import { extractJobInfo } from './utils/jobExtractor';
import { saveJob, generateCoverLetter } from './services/api';
import { getUserEmail, saveUserEmail, hasUserEmail } from './utils/storage';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');

  useEffect(() => {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setActiveTab(tabs[0]);
      }
    });

    // Check if user email exists
    const checkUserEmail = async () => {
      const email = await getUserEmail();
      if (email) {
        setUserEmail(email);
      } else {
        setShowEmailForm(true);
      }
    };

    checkUserEmail();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInput || !validateEmail(emailInput)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await saveUserEmail(emailInput);
      setUserEmail(emailInput);
      setShowEmailForm(false);
      setError(null);
      setSuccess('Email saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(`Error saving email: ${err.message}`);
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleExtractJob = async () => {
    if (!activeTab || !activeTab.id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Execute content script to extract job info
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: extractJobInfo,
      });

      if (results && results[0] && results[0].result) {
        setJobInfo(results[0].result);
      } else {
        setError('Could not extract job information from this page.');
      }
    } catch (err: any) {
      setError(`Error extracting job info: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!jobInfo) return;

    // Check if user email exists
    if (!userEmail) {
      setShowEmailForm(true);
      setError('Please enter your email before saving jobs');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await saveJob({
        companyName: jobInfo.companyName,
        position: jobInfo.position,
        jobDescription: jobInfo.description,
        jobUrl: activeTab?.url || '',
        userEmail: userEmail
      });

      if (response.success) {
        setSuccess('Job saved successfully!');
        // Store the job ID for cover letter generation
        setJobInfo({ ...jobInfo, id: response.job.id });
      } else {
        setError('Failed to save job.');
      }
    } catch (err: any) {
      setError(`Error saving job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobInfo || !jobInfo.id) {
      setError('Please save the job first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await generateCoverLetter({
        jobId: jobInfo.id,
      });

      if (response.success) {
        setSuccess('Cover letter generated! View it in the web app.');
        // Open the web app in a new tab
        chrome.tabs.create({ url: 'http://localhost:3000/cover-letters' });
      } else {
        setError('Failed to generate cover letter.');
      }
    } catch (err: any) {
      setError(`Error generating cover letter: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-container">
      <header className="header">
        <h1>JobJedi</h1>
        <p>Your AI Job Application Assistant</p>
      </header>

      <main className="main">
        {loading && <div className="loading">Loading...</div>}
        
        {error && <div className="error">{error}</div>}
        
        {success && <div className="success">{success}</div>}

        {showEmailForm ? (
          <div className="email-form">
            <h2>Enter Your Email</h2>
            <p>Please enter your email to save and manage jobs</p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="email-input"
              />
              <button type="submit" className="button primary">
                Save Email
              </button>
            </form>
          </div>
        ) : (
          <div className="actions">
            <button 
              className="button primary" 
              onClick={handleExtractJob}
              disabled={loading || !activeTab}
            >
              Extract Job Info
            </button>

            {jobInfo && (
              <div className="job-info">
                <h2>Job Information</h2>
                <p><strong>Company:</strong> {jobInfo.companyName}</p>
                <p><strong>Position:</strong> {jobInfo.position}</p>
                <p><strong>Description:</strong> {jobInfo.description.substring(0, 100)}...</p>

                <div className="button-group">
                  <button 
                    className="button secondary" 
                    onClick={handleSaveJob}
                    disabled={loading}
                  >
                    Save Job
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="webapp-link">
          <a href="#" onClick={() => chrome.tabs.create({ url: 'http://localhost:3000' })}>
            Open JobJedi Web App
          </a>
        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Popup />); 