// Chrome Extension Popup Script
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleWidget")
  const autoLoadCheckbox = document.getElementById("autoLoad")

  // Load current settings
  chrome.storage.sync.get(["autoLoad"], (result) => {
    autoLoadCheckbox.checked = result.autoLoad !== false
  })

  // Toggle widget on current tab
  toggleButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleWidget" }, (response) => {
        if (response) {
          toggleButton.textContent = response.status === "loaded" ? "Remove Widget" : "Add Widget"
        }
      })
    })
  })

  // Save auto-load setting
  autoLoadCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ autoLoad: autoLoadCheckbox.checked })
  })
})
