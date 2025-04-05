<<<<<<< HEAD
function addRandomBee() {
  const container = document.querySelector(".container")
  const bee = document.createElement("img")
  bee.src = "public/bee.png"
  bee.className = "flying-bee"
  bee.style.top = Math.random() * 100 + "%"
  bee.style.animationDuration = 5 + Math.random() * 5 + "s"
  bee.style.animationDelay = Math.random() * 2 + "s"

  container.appendChild(bee)

  // Remove the bee after animation completes
  setTimeout(() => {
    if (bee.parentNode) {
      container.removeChild(bee)
    }
  }, 10000)
}

=======
document.addEventListener('DOMContentLoaded', function() {
  const setLimitButton = document.getElementById('setLimit');
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const timeRemainingSpan = document.getElementById('timeRemaining');

  // Load saved time limit
  chrome.storage.local.get(['timeLimit', 'startTime'], function(data) {
    if (data.timeLimit && data.startTime) {
      console.log('Loaded saved time limit:', data.timeLimit, 'Start time:', data.startTime);
      updateTimeRemaining(data.timeLimit, data.startTime);
    }
  });

  setLimitButton.addEventListener('click', function() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const totalMinutes = (hours * 60) + minutes;

    if (totalMinutes > 0) {
      const timeLimit = totalMinutes * 60 * 1000; // Convert to milliseconds
      const startTime = Date.now();

      console.log('Setting time limit:', timeLimit, 'Start time:', startTime);

      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'setTimeLimit',
        timeLimit: timeLimit,
        startTime: startTime
      }, function(response) {
        console.log('Response from background script:', response);
        
        // Update the UI
        updateTimeRemaining(timeLimit, startTime);
        
        // Show confirmation to user
        const statusDiv = document.querySelector('.status');
        const confirmationMsg = document.createElement('p');
        confirmationMsg.textContent = 'Time limit set successfully!';
        confirmationMsg.style.color = 'green';
        confirmationMsg.style.fontWeight = 'bold';
        
        // Remove any existing confirmation message
        const existingMsg = statusDiv.querySelector('p:not(:first-child)');
        if (existingMsg) {
          statusDiv.removeChild(existingMsg);
        }
        
        statusDiv.appendChild(confirmationMsg);
        
        // Remove the confirmation after 3 seconds
        setTimeout(() => {
          if (confirmationMsg.parentNode) {
            statusDiv.removeChild(confirmationMsg);
          }
        }, 3000);
      });
    } else {
      // Show error if time limit is 0
      const statusDiv = document.querySelector('.status');
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Please set a time limit greater than 0.';
      errorMsg.style.color = 'red';
      errorMsg.style.fontWeight = 'bold';
      
      // Remove any existing error message
      const existingMsg = statusDiv.querySelector('p:not(:first-child)');
      if (existingMsg) {
        statusDiv.removeChild(existingMsg);
      }
      
      statusDiv.appendChild(errorMsg);
      
      // Remove the error after 3 seconds
      setTimeout(() => {
        if (errorMsg.parentNode) {
          statusDiv.removeChild(errorMsg);
        }
      }, 3000);
    }
  });

  function updateTimeRemaining(timeLimit, startTime) {
    const now = Date.now();
    const elapsed = now - startTime;
    const remaining = Math.max(0, timeLimit - elapsed);

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

    timeRemainingSpan.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Update time remaining every second
  setInterval(function() {
    chrome.storage.local.get(['timeLimit', 'startTime'], function(data) {
      if (data.timeLimit && data.startTime) {
        updateTimeRemaining(data.timeLimit, data.startTime);
      }
    });
  }, 1000);
}); 
>>>>>>> parent of db44183 (bee aah)
