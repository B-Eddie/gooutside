// Global variables to track time limit
let timeLimit = null;
let startTime = null;
let isRedirecting = false;
let goOutsideUrl = null;

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  // Reset any existing time limit
  chrome.storage.local.remove(['timeLimit', 'startTime']);
  timeLimit = null;
  startTime = null;
  isRedirecting = false;
  
  // Pre-calculate the go-outside URL
  goOutsideUrl = chrome.runtime.getURL('go-outside.html');
  console.log('Extension installed, go-outside URL:', goOutsideUrl);
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  if (message.action === 'setTimeLimit') {
    timeLimit = message.timeLimit;
    startTime = message.startTime;
    isRedirecting = false;
    
    // Save to storage for persistence
    chrome.storage.local.set({
      timeLimit: timeLimit,
      startTime: startTime
    }, () => {
      console.log('Time limit set:', timeLimit, 'Start time:', startTime);
      checkTimeLimit();
    });
    
    // Send response back to popup
    sendResponse({status: 'success'});
  }
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});

// Check time limit every second
setInterval(checkTimeLimit, 1000);

function checkTimeLimit() {
  if (!timeLimit || !startTime || isRedirecting) return;

  const now = Date.now();
  const elapsed = now - startTime;
  
  if (elapsed >= timeLimit) {
    console.log('Time limit reached! Redirecting tabs...');
    isRedirecting = true;
    redirectAllTabs();
  }
}

function redirectAllTabs() {
  // Make sure we have the go-outside URL
  if (!goOutsideUrl) {
    goOutsideUrl = chrome.runtime.getURL('go-outside.html');
  }
  
  console.log('Redirecting to:', goOutsideUrl);
  
  // Query all tabs
  chrome.tabs.query({}, function(tabs) {
    console.log('Found', tabs.length, 'tabs to potentially redirect');
    
    // Redirect each tab
    tabs.forEach(tab => {
      // Skip tabs that are already on the go-outside page
      if (tab.url && tab.url.includes('go-outside.html')) {
        console.log('Skipping tab already on go-outside page:', tab.id);
        return;
      }
      
      // Skip chrome:// URLs as they can't be redirected
      if (tab.url && tab.url.startsWith('chrome://')) {
        console.log('Skipping chrome:// URL:', tab.url);
        return;
      }
      
      console.log('Redirecting tab:', tab.id, 'from', tab.url);
      
      // Use a more direct approach to redirect
      try {
        chrome.tabs.update(tab.id, { url: goOutsideUrl }, (updatedTab) => {
          if (chrome.runtime.lastError) {
            console.error('Error redirecting tab:', chrome.runtime.lastError);
          } else {
            console.log('Tab redirected successfully:', updatedTab.id);
          }
        });
      } catch (error) {
        console.error('Exception redirecting tab:', error);
      }
    });
  });
}

// Check time limit when a tab is activated
chrome.tabs.onActivated.addListener(() => {
  checkTimeLimit();
});

// Check time limit when a tab is updated
chrome.tabs.onUpdated.addListener(() => {
  checkTimeLimit();
});

// Handle new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  // Check if time limit has been reached
  if (timeLimit && startTime) {
    const now = Date.now();
    const elapsed = now - startTime;
    
    if (elapsed >= timeLimit) {
      console.log('Time limit reached! Redirecting new tab:', tab.id);
      
      // Make sure we have the go-outside URL
      if (!goOutsideUrl) {
        goOutsideUrl = chrome.runtime.getURL('go-outside.html');
      }
      
      // Skip chrome:// URLs as they can't be redirected
      if (tab.url && tab.url.startsWith('chrome://')) {
        console.log('Skipping chrome:// URL for new tab:', tab.url);
        return;
      }
      
      // Redirect the new tab
      try {
        chrome.tabs.update(tab.id, { url: goOutsideUrl }, (updatedTab) => {
          if (chrome.runtime.lastError) {
            console.error('Error redirecting new tab:', chrome.runtime.lastError);
          } else {
            console.log('New tab redirected successfully:', updatedTab.id);
          }
        });
      } catch (error) {
        console.error('Exception redirecting new tab:', error);
      }
    }
  }
}); 