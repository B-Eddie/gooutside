document.addEventListener("DOMContentLoaded", () => {
  const setLimitButton = document.getElementById("setLimit")
  const hoursInput = document.getElementById("hours")
  const minutesInput = document.getElementById("minutes")
  const timeRemainingSpan = document.getElementById("timeRemaining")

  // Bee Movie quotes
  const beeQuotes = [
    "According to all known laws of aviation, there is no way a bee should be able to fly.",
    "Ya like jazz?",
    "You'll be happy to know that bees, as a species, haven't had one day off in 27 million years.",
    "Bees have 100 percent employment, but we do jobs like taking the crud out.",
    "I'm just an ordinary bee from a bee family.",
    "Thinking bee! Thinking bee! Thinking bee!",
    "This is stealing! A lot of stealing!",
    "We're the only ones who make honey, and we're the only ones who protect it.",
    "Why does his life have any less value than yours?",
    "They have no way to communicate with the humans. I can't do that.",
  ]

  // Randomly select a quote on load
  const quoteElement = document.querySelector(".bee-quote")
  quoteElement.textContent = beeQuotes[Math.floor(Math.random() * beeQuotes.length)]

  // Load saved time limit
  chrome.storage.local.get(["timeLimit", "startTime"], (data) => {
    if (data.timeLimit && data.startTime) {
      console.log("Loaded saved time limit:", data.timeLimit, "Start time:", data.startTime)
      updateTimeRemaining(data.timeLimit, data.startTime)
    }
  })

  setLimitButton.addEventListener("click", () => {
    const hours = Number.parseInt(hoursInput.value) || 0
    const minutes = Number.parseInt(minutesInput.value) || 0
    const totalMinutes = hours * 60 + minutes

    if (totalMinutes > 0) {
      const timeLimit = totalMinutes * 60 * 1000 // Convert to milliseconds
      const startTime = Date.now()

      console.log("Setting time limit:", timeLimit, "Start time:", startTime)

      // Send message to background script
      chrome.runtime.sendMessage(
        {
          action: "setTimeLimit",
          timeLimit: timeLimit,
          startTime: startTime,
        },
        (response) => {
          console.log("Response from background script:", response)

          // Update the UI
          updateTimeRemaining(timeLimit, startTime)

          // Show confirmation to user
          const statusDiv = document.querySelector(".status")
          const confirmationMsg = document.createElement("p")
          confirmationMsg.textContent = "Buzz time set successfully!"
          confirmationMsg.style.color = "#000000"
          confirmationMsg.style.fontWeight = "bold"
          confirmationMsg.style.backgroundColor = "#ffc107"
          confirmationMsg.style.padding = "5px"
          confirmationMsg.style.borderRadius = "4px"

          // Remove any existing confirmation message
          const existingMsg = statusDiv.querySelector("p:not(:first-child)")
          if (existingMsg) {
            statusDiv.removeChild(existingMsg)
          }

          statusDiv.appendChild(confirmationMsg)

          // Remove the confirmation after 3 seconds
          setTimeout(() => {
            if (confirmationMsg.parentNode) {
              statusDiv.removeChild(confirmationMsg)
            }
          }, 3000)

          // Change the quote to a celebratory one
          quoteElement.textContent = "Thinking bee! Thinking bee! Thinking bee!"
        },
      )
    } else {
      // Show error if time limit is 0
      const statusDiv = document.querySelector(".status")
      const errorMsg = document.createElement("p")
      errorMsg.textContent = "Please set a buzz time greater than 0."
      errorMsg.style.color = "#ffffff"
      errorMsg.style.fontWeight = "bold"
      errorMsg.style.backgroundColor = "#e74c3c"
      errorMsg.style.padding = "5px"
      errorMsg.style.borderRadius = "4px"

      // Remove any existing error message
      const existingMsg = statusDiv.querySelector("p:not(:first-child)")
      if (existingMsg) {
        statusDiv.removeChild(existingMsg)
      }

      statusDiv.appendChild(errorMsg)

      // Remove the error after 3 seconds
      setTimeout(() => {
        if (errorMsg.parentNode) {
          statusDiv.removeChild(errorMsg)
        }
      }, 3000)
    }
  })

  function updateTimeRemaining(timeLimit, startTime) {
    const now = Date.now()
    const elapsed = now - startTime
    const remaining = Math.max(0, timeLimit - elapsed)

    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000)

    timeRemainingSpan.textContent = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    // If time is almost up, change the style
    if (remaining < 300000) {
      // Less than 5 minutes
      timeRemainingSpan.style.backgroundColor = "#e74c3c"
      timeRemainingSpan.style.color = "#ffffff"
    }
  }

  // Update time remaining every second
  setInterval(() => {
    chrome.storage.local.get(["timeLimit", "startTime"], (data) => {
      if (data.timeLimit && data.startTime) {
        updateTimeRemaining(data.timeLimit, data.startTime)
      }
    })
  }, 1000)

  // Add a random flying bee
  function addRandomBee() {
    const container = document.querySelector(".container")
    const bee = document.createElement("span")
    bee.textContent = "🐝"
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

  // Add a bee every 5 seconds
  setInterval(addRandomBee, 5000)
  addRandomBee() // Add one immediately
})

