// Global variables
let timeLimit = null;
let startTime = null;
let goOutsideUrl = null;

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  
  // Reset any existing time limit
  chrome.storage.local.remove(['timeLimit', 'startTime']);
  timeLimit = null;
  startTime = null;
  
  // Pre-calculate the go-outside URL
  goOutsideUrl = chrome.runtime.getURL('go-outside.html');
  console.log('Go outside URL:', goOutsideUrl);
  
  // Create the alarm
  chrome.alarms.create('checkTimeLimit', { periodInMinutes: 0.05 }); // Check every 3 seconds
});

// Load saved time limit when extension starts
chrome.storage.local.get(['timeLimit', 'startTime'], (data) => {
  if (data.timeLimit && data.startTime) {
    timeLimit = data.timeLimit;
    startTime = data.startTime;
    console.log('Loaded saved time limit:', timeLimit, 'Start time:', startTime);
    
    // Check if time limit has already been reached
    const now = Date.now();
    const elapsed = now - startTime;
    if (elapsed >= timeLimit) {
      console.log('Time limit already reached, redirecting tabs');
      redirectAllTabs();
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  if (message.action === 'setTimeLimit') {
    timeLimit = message.timeLimit;
    startTime = message.startTime;
    
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

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkTimeLimit') {
    checkTimeLimit();
  }
});

function checkTimeLimit() {
  if (!timeLimit || !startTime) return;

  chrome.storage.local.get(['timeLimit', 'startTime'], (data) => {
    // Use the most recent values from storage
    const currentTimeLimit = data.timeLimit || timeLimit;
    const currentStartTime = data.startTime || startTime;
    
    const now = Date.now();
    const elapsed = now - currentStartTime;
    
    if (elapsed >= currentTimeLimit) {
      console.log('Time limit reached! Redirecting tabs...');
      redirectAllTabs();
    }
  });
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
        chrome.tabs.update(tab.id, { url: goOutsideUrl });
      } catch (error) {
        console.error('Exception redirecting tab:', error);
      }
    });
  });
}

// Handle new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  // Check if time limit has been reached
  if (timeLimit && startTime) {
    const now = Date.now();
    const elapsed = now - startTime;
    
    if (elapsed >= timeLimit) {
      console.log('New tab created after time limit reached:', tab.id);
      
      // Skip chrome:// URLs as they can't be redirected
      if (tab.url && tab.url.startsWith('chrome://')) {
        console.log('Skipping chrome:// URL for new tab:', tab.url);
        return;
      }
      
      // Redirect the new tab
      try {
        chrome.tabs.update(tab.id, { url: goOutsideUrl });
      } catch (error) {
        console.error('Exception redirecting new tab:', error);
      }
    }
  }
});

// Check time limit when a tab is activated
chrome.tabs.onActivated.addListener(() => {
  checkTimeLimit();
});

// Check time limit when a tab is updated
chrome.tabs.onUpdated.addListener(() => {
  checkTimeLimit();
}); 