// Chrome Extension Content Script
;(() => {
  const shouldLoadWidget = () => {
    const skipDomains = ["chrome-extension://", "moz-extension://", "about:", "chrome://"];
    const currentUrl = window.location.href;
    return !skipDomains.some(domain => currentUrl.startsWith(domain));
  };

  const loadWidget = () => {
    if (!shouldLoadWidget()) {
      console.log("Skipping widget load on this page");
      return;
    }

    const scriptUrl = "https://pinkbalaclava.github.io/doorbell-widget/widget.js";
    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      console.log("Widget script already loaded");
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      console.log("Doorbell Voice Widget loaded from GitHub");
    };

    script.onerror = (error) => {
      console.error("Failed to load widget from GitHub:", error);
    };

    document.head.appendChild(script);
  };

  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleWidget") {
        const existingWidget = document.getElementById("doorbell-voice-widget");
        if (existingWidget) {
          existingWidget.remove();
          sendResponse({ status: "removed" });
        } else {
          loadWidget();
          sendResponse({ status: "loaded" });
        }
      }

      if (request.action === "checkWidget") {
        const exists = !!document.getElementById("doorbell-voice-widget");
        sendResponse({ status: exists ? "loaded" : "not_loaded" });
      }

      // Required to enable async response
      return true;
    });

    chrome.storage.sync.get(["autoLoad"], (result) => {
      if (result.autoLoad !== false) {
        loadWidget();
      }
    });
  } else {
    console.warn("Chrome runtime environment not detected.");
  }
})();
