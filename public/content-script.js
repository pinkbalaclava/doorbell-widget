// Chrome Extension Content Script
;(() => {
  // Check if widget should be loaded on this site
  const shouldLoadWidget = () => {
    // Skip on extension pages and certain domains
    const skipDomains = ["chrome-extension://", "moz-extension://", "about:", "chrome://"]
    const currentUrl = window.location.href

    return !skipDomains.some((domain) => currentUrl.startsWith(domain))
  }

  // Load the widget with extension privileges
  const loadWidget = () => {
    if (!shouldLoadWidget()) {
      console.log("Skipping widget load on this page")
      return
    }

    // Get the widget script URL from the extension
    const scriptUrl = chrome.runtime.getURL("failsafe-widget.js")

    const script = document.createElement("script")
    script.src = scriptUrl
    script.async = true

    script.onload = () => {
      console.log("Doorbell Voice Widget loaded via Chrome extension")
    }

    script.onerror = (error) => {
      console.error("Failed to load widget via extension:", error)
    }

    document.head.appendChild(script)
  }

  // Listen for messages from popup
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleWidget") {
        const existingWidget = document.getElementById("doorbell-voice-widget")
        if (existingWidget) {
          existingWidget.remove()
          sendResponse({ status: "removed" })
        } else {
          loadWidget()
          sendResponse({ status: "loaded" })
        }
      }
    })

    // Auto-load widget (can be controlled via extension settings)
    chrome.storage.sync.get(["autoLoad"], (result) => {
      if (result.autoLoad !== false) {
        // Default to true
        loadWidget()
      }
    })
  } else {
    console.warn("Chrome runtime environment not detected.")
  }
})()
