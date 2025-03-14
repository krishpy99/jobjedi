// Background script for JobJedi Chrome extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('JobJedi extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_JOB_INFO') {
    // This will be handled by the content script
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'OPEN_WEBAPP') {
    // Open the web app in a new tab
    chrome.tabs.create({ url: 'http://localhost:3000' });
    sendResponse({ success: true });
    return true;
  }
  
  return false;
}); 