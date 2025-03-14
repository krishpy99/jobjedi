// Content script for JobJedi Chrome extension
import { extractJobInfo } from './utils/jobExtractor';

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_JOB_INFO') {
    try {
      const jobInfo = extractJobInfo();
      sendResponse({ success: true, data: jobInfo });
    } catch (error) {
      console.error('Error extracting job info:', error);
      sendResponse({ success: false, error: 'Failed to extract job information' });
    }
    return true;
  }
  
  return false;
}); 