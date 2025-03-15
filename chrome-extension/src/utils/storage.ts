// Storage utility functions for Chrome extension

// Save user email to Chrome storage
export const saveUserEmail = async (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set({ userEmail: email }, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Get user email from Chrome storage
export const getUserEmail = async (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get('userEmail', (result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
        } else {
          resolve(result.userEmail || null);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Check if user email exists in Chrome storage
export const hasUserEmail = async (): Promise<boolean> => {
  const email = await getUserEmail();
  return email !== null && email !== '';
}; 