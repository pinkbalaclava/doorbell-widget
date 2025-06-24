// Chrome Extension Popup Script
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleWidget");
  const autoLoadCheckbox = document.getElementById("autoLoad");

  // Load current settings
  chrome.storage.sync.get(["autoLoad"], (result) => {
    autoLoadCheckbox.checked = result.autoLoad !== false;
  });

  // Check widget status and update button label
  const updateButtonLabel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "checkWidget" }, (response) => {
        if (response && response.status === "loaded") {
          toggleButton.textContent = "Remove Widget";
        } else {
          toggleButton.textContent = "Add Widget";
        }
      });
    });
  };

  updateButtonLabel(); // Set initial label

  // Toggle widget on current tab
  toggleButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleWidget" }, (response) => {
        if (response && response.status) {
          toggleButton.textContent = response.status === "loaded" ? "Remove Widget" : "Add Widget";
        } else {
          toggleButton.textContent = "Add Widget";
        }
      });
    });
  });

  // Save auto-load setting
  autoLoadCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ autoLoad: autoLoadCheckbox.checked });
  });
});
