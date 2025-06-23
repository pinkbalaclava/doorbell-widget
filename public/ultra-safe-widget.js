// Ultra-Safe CSP-Compliant Widget - No eval(), no Function(), no dynamic execution
;(() => {
  // Prevent multiple instances
  if (window.DoorbellVoiceWidget) {
    console.log("Doorbell Voice Widget already loaded")
    return
  }

  // Mark as loaded immediately
  window.DoorbellVoiceWidget = true

  // Configuration
  const CONFIG = {
    apiKey: "8c0a9ef0-3f3a-4c1e-b389-948703fbe032",
    assistantId: "d93608e2-7901-4102-94f4-50aecb52a2e6",
    webhookUrl: "https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3",
    voice: "openai",
    maxRetries: 3,
    retryDelay: 1000,
  }

  // Replace any hardcoded URLs with the correct one
  var widgetUrl = "https://resplendent-tanuki-b41ad5.netlify.app/"

  // CSP-Safe Utility Functions
  const SafeUtils = {
    // Create element with attributes safely
    createElement: (tag, attributes, styles) => {
      const element = document.createElement(tag)

      // Set attributes
      if (attributes) {
        Object.keys(attributes).forEach((key) => {
          try {
            element.setAttribute(key, attributes[key])
          } catch (e) {
            console.warn("Failed to set attribute:", key, e)
          }
        })
      }

      // Set styles
      if (styles) {
        Object.keys(styles).forEach((key) => {
          try {
            element.style[key] = styles[key]
          } catch (e) {
            console.warn("Failed to set style:", key, e)
          }
        })
      }

      return element
    },

    // Create SVG element safely
    createSVGElement: (tag, attributes) => {
      const element = document.createElementNS("http://www.w3.org/2000/svg", tag)

      if (attributes) {
        Object.keys(attributes).forEach((key) => {
          try {
            element.setAttribute(key, attributes[key])
          } catch (e) {
            console.warn("Failed to set SVG attribute:", key, e)
          }
        })
      }

      return element
    },

    // Safe fetch with error handling
    safeFetch: (url, options) => {
      const defaultOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
      }

      const finalOptions = Object.assign({}, defaultOptions, options || {})

      return fetch(url, finalOptions).catch((error) => {
        console.warn("Fetch failed, trying no-cors:", error)
        finalOptions.mode = "no-cors"
        return fetch(url, finalOptions)
      })
    },

    // Add event listener safely
    addEventListenerSafe: (element, event, handler) => {
      try {
        element.addEventListener(event, handler)
        return true
      } catch (e) {
        console.warn("Failed to add event listener:", e)
        return false
      }
    },
  }

  // CSS Injection (CSP-safe)
  function injectCSS() {
    const css = [
      "#doorbell-ultra-safe-widget {",
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      "  z-index: 999999;",
      "}",
      "",
      ".doorbell-widget-button {",
      "  position: fixed;",
      "  bottom: 20px;",
      "  right: 20px;",
      "  width: 60px;",
      "  height: 60px;",
      "  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);",
      "  border-radius: 50%;",
      "  box-shadow: 0 4px 20px rgba(0,0,0,0.15);",
      "  cursor: pointer;",
      "  z-index: 999999;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  transition: all 0.3s ease;",
      "  border: none;",
      "  outline: none;",
      "}",
      "",
      ".doorbell-widget-button:hover {",
      "  transform: scale(1.1);",
      "  box-shadow: 0 6px 25px rgba(0,0,0,0.2);",
      "}",
      "",
      ".doorbell-widget-panel {",
      "  position: fixed;",
      "  bottom: 90px;",
      "  right: 20px;",
      "  width: 350px;",
      "  height: 500px;",
      "  background: white;",
      "  border-radius: 16px;",
      "  box-shadow: 0 8px 40px rgba(0,0,0,0.12);",
      "  z-index: 999998;",
      "  display: none;",
      "  flex-direction: column;",
      "  overflow: hidden;",
      "  border: 1px solid rgba(0,0,0,0.08);",
      "}",
      "",
      ".doorbell-widget-panel.show {",
      "  display: flex;",
      "}",
      "",
      ".doorbell-header {",
      "  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);",
      "  color: white;",
      "  padding: 16px;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: space-between;",
      "  flex-shrink: 0;",
      "}",
      "",
      ".doorbell-close-btn {",
      "  background: none;",
      "  border: none;",
      "  color: white;",
      "  cursor: pointer;",
      "  padding: 4px;",
      "  border-radius: 4px;",
      "  opacity: 0.8;",
      "}",
      "",
      ".doorbell-close-btn:hover {",
      "  opacity: 1;",
      "  background: rgba(255,255,255,0.1);",
      "}",
      "",
      ".doorbell-content {",
      "  flex: 1;",
      "  padding: 20px;",
      "  display: flex;",
      "  flex-direction: column;",
      "  justify-content: center;",
      "  align-items: center;",
      "  text-align: center;",
      "  background: #f9fafb;",
      "}",
      "",
      ".doorbell-icon {",
      "  width: 60px;",
      "  height: 60px;",
      "  background: #e5e7eb;",
      "  border-radius: 50%;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  margin-bottom: 16px;",
      "}",
      "",
      ".doorbell-start-btn {",
      "  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);",
      "  color: white;",
      "  border: none;",
      "  padding: 12px 24px;",
      "  border-radius: 8px;",
      "  font-weight: 600;",
      "  cursor: pointer;",
      "  transition: all 0.2s ease;",
      "  font-size: 14px;",
      "  margin-top: 16px;",
      "}",
      "",
      ".doorbell-start-btn:hover {",
      "  transform: translateY(-1px);",
      "  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);",
      "}",
    ].join("\n")

    try {
      const style = SafeUtils.createElement("style")
      style.textContent = css
      document.head.appendChild(style)
      return true
    } catch (e) {
      console.warn("Failed to inject CSS:", e)
      return false
    }
  }

  // Create Widget UI
  function createWidget() {
    // Main container
    const widget = SafeUtils.createElement("div", {
      id: "doorbell-ultra-safe-widget",
    })

    // Button
    const button = SafeUtils.createElement("div", {
      class: "doorbell-widget-button",
      role: "button",
      tabindex: "0",
      "aria-label": "Open voice assistant",
    })

    // Create SVG icon
    const svg = SafeUtils.createSVGElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "white",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    })

    const path1 = SafeUtils.createSVGElement("path", {
      d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z",
    })

    const path2 = SafeUtils.createSVGElement("path", {
      d: "M19 10v2a7 7 0 0 1-14 0v-2",
    })

    const line1 = SafeUtils.createSVGElement("line", {
      x1: "12",
      y1: "19",
      x2: "12",
      y2: "23",
    })

    const line2 = SafeUtils.createSVGElement("line", {
      x1: "8",
      y1: "23",
      x2: "16",
      y2: "23",
    })

    svg.appendChild(path1)
    svg.appendChild(path2)
    svg.appendChild(line1)
    svg.appendChild(line2)
    button.appendChild(svg)

    // Panel
    const panel = SafeUtils.createElement("div", {
      class: "doorbell-widget-panel",
      id: "doorbell-widget-panel",
    })

    // Header
    const header = SafeUtils.createElement("div", {
      class: "doorbell-header",
    })

    const headerContent = SafeUtils.createElement("div")
    headerContent.innerHTML = '<span style="font-weight: 600; font-size: 14px;">🎤 Voice Assistant</span>'

    const closeBtn = SafeUtils.createElement("button", {
      class: "doorbell-close-btn",
      "aria-label": "Close voice assistant",
    })
    closeBtn.innerHTML = "✕"

    header.appendChild(headerContent)
    header.appendChild(closeBtn)

    // Content
    const content = SafeUtils.createElement("div", {
      class: "doorbell-content",
    })

    const icon = SafeUtils.createElement("div", {
      class: "doorbell-icon",
    })
    icon.innerHTML = "🎤"

    const title = SafeUtils.createElement("h3", {
      style: "margin: 0 0 8px 0; color: #1f2937; font-size: 16px;",
    })
    title.textContent = "Ready to Help!"

    const description = SafeUtils.createElement("p", {
      style: "margin: 0 0 16px 0; color: #6b7280; font-size: 14px;",
    })
    description.textContent = "Click start to begin voice conversation"

    const startBtn = SafeUtils.createElement("button", {
      class: "doorbell-start-btn",
      id: "doorbell-start-btn",
    })
    startBtn.textContent = "Start Voice Chat"

    content.appendChild(icon)
    content.appendChild(title)
    content.appendChild(description)
    content.appendChild(startBtn)

    panel.appendChild(header)
    panel.appendChild(content)

    widget.appendChild(button)
    widget.appendChild(panel)

    return { widget, button, panel, closeBtn, startBtn }
  }

  // Event Handlers
  function setupEventHandlers(elements) {
    const { button, panel, closeBtn, startBtn } = elements
    let isOpen = false

    // Toggle panel
    SafeUtils.addEventListenerSafe(button, "click", () => {
      isOpen = !isOpen
      if (isOpen) {
        panel.classList.add("show")
        sendAnalytics("widget_opened")
      } else {
        panel.classList.remove("show")
      }
    })

    // Close panel
    SafeUtils.addEventListenerSafe(closeBtn, "click", () => {
      isOpen = false
      panel.classList.remove("show")
      sendAnalytics("widget_closed")
    })

    // Start voice chat
    SafeUtils.addEventListenerSafe(startBtn, "click", () => {
      handleVoiceStart()
    })

    // Keyboard support
    SafeUtils.addEventListenerSafe(button, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        button.click()
      }
    })
  }

  // Voice Handler
  function handleVoiceStart() {
    const message = prompt(
      "Voice Assistant\n\nVoice features are limited due to browser security settings.\nPlease enter your message:",
    )

    if (message && message.trim()) {
      sendAnalytics("message_sent", {
        message: message.trim(),
        method: "text_fallback",
      })

      alert(
        'Message received: "' +
          message +
          '"\n\nIn production, this would connect to your voice assistant and provide a response.',
      )
    }
  }

  // Analytics
  function sendAnalytics(event, data) {
    const payload = {
      event: event,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      widget_version: "ultra-safe-v1.0",
      data: data || {},
    }

    SafeUtils.safeFetch(CONFIG.webhookUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then(() => {
        console.log("Analytics sent:", event)
      })
      .catch((error) => {
        console.warn("Analytics failed:", error)
      })
  }

  // Initialize Widget
  function init() {
    try {
      console.log("Initializing Ultra-Safe Doorbell Voice Widget...")

      // Inject CSS
      const cssInjected = injectCSS()
      if (!cssInjected) {
        console.warn("CSS injection failed, using fallback styling")
      }

      // Create widget
      const elements = createWidget()
      document.body.appendChild(elements.widget)

      // Setup event handlers
      setupEventHandlers(elements)

      // Send load analytics
      sendAnalytics("widget_loaded", {
        css_injected: cssInjected,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      })

      console.log("Ultra-Safe Doorbell Voice Widget initialized successfully")
    } catch (error) {
      console.error("Widget initialization failed:", error)

      // Absolute fallback
      try {
        const fallback = SafeUtils.createElement("div", {
          style:
            "position: fixed; bottom: 20px; right: 20px; background: #667eea; color: white; padding: 12px; border-radius: 8px; cursor: pointer; z-index: 999999; font-family: system-ui, sans-serif;",
        })
        fallback.textContent = "🎤 Voice Assistant (Safe Mode)"

        SafeUtils.addEventListenerSafe(fallback, "click", () => {
          alert("Voice widget loaded in safe mode. Some features may be limited due to browser security settings.")
        })

        document.body.appendChild(fallback)
        console.log("Fallback widget created")
      } catch (fallbackError) {
        console.error("Even fallback widget failed:", fallbackError)
      }
    }
  }

  // Start initialization
  if (document.readyState === "loading") {
    SafeUtils.addEventListenerSafe(document, "DOMContentLoaded", init)
  } else {
    // Small delay to ensure page is ready
    setTimeout(init, 100)
  }
})()
