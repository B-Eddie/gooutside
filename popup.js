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

