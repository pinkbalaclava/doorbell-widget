;(() => {
  // Prevent multiple instances
  if (window.DoorbellVoiceWidget) {
    console.log("Doorbell Voice Widget already loaded")
    return
  }

  // Mark as loaded
  window.DoorbellVoiceWidget = true

  // Enhanced Configuration with fallbacks
  const CONFIG = {
    apiKey: "8c0a9ef0-3f3a-4c1e-b389-948703fbe032",
    assistantId: "d93608e2-7901-4102-94f4-50aecb52a2e6",
    webhookUrl: "https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3",
    voice: "openai",
    // Fallback CDN URLs for VAPI SDK and widget
    vapiUrls: [
      "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js",
      "https://unpkg.com/@vapi-ai/web@latest/dist/index.js",
      "https://cdn.skypack.dev/@vapi-ai/web@latest",
      // Local fallback if hosted
      "./vapi-sdk.js",
    ],
    // Widget fallback URLs
    widgetUrls: [
      "https://resplendent-tanuki-b41ad5.netlify.app/widget.js",
      "https://resplendent-tanuki-b41ad5.netlify.app/failsafe-widget.js",
      "https://cdn.jsdelivr.net/gh/yourusername/doorbell-widget@main/failsafe-widget.js",
    ],
    // CSP-safe inline styles flag
    useInlineStyles: true,
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000,
  }

  // Utility functions for security handling
  const SecurityUtils = {
    // Check if we can use inline styles (CSP)
    canUseInlineStyles: () => {
      try {
        const testEl = document.createElement("div")
        testEl.style.cssText = "display: none;"
        return testEl.style.display === "none"
      } catch (e) {
        return false
      }
    },

    // Check if we can load external scripts
    canLoadExternalScripts: () =>
      new Promise((resolve) => {
        const testScript = document.createElement("script")
        testScript.src = "data:text/javascript,"
        testScript.onload = () => resolve(true)
        testScript.onerror = () => resolve(false)
        document.head.appendChild(testScript)
        document.head.removeChild(testScript)
      }),

    // Safe fetch with CORS handling
    safeFetch: async (url, options = {}) => {
      const corsOptions = {
        ...options,
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      }

      try {
        return await fetch(url, corsOptions)
      } catch (corsError) {
        console.warn("CORS fetch failed, trying no-cors mode:", corsError)
        try {
          return await fetch(url, { ...corsOptions, mode: "no-cors" })
        } catch (noCorsError) {
          console.warn("No-cors fetch also failed:", noCorsError)
          throw noCorsError
        }
      }
    },

    // Create CSP-safe element
    createSafeElement: function (tag, attributes = {}, styles = {}) {
      const element = document.createElement(tag)

      // Set attributes safely
      Object.entries(attributes).forEach(([key, value]) => {
        try {
          element.setAttribute(key, value)
        } catch (e) {
          console.warn(`Failed to set attribute ${key}:`, e)
        }
      })

      // Set styles safely
      if (this.canUseInlineStyles()) {
        Object.entries(styles).forEach(([key, value]) => {
          try {
            element.style[key] = value
          } catch (e) {
            console.warn(`Failed to set style ${key}:`, e)
          }
        })
      } else {
        // Fallback: add CSS class instead
        element.className = (element.className + " doorbell-widget-element").trim()
      }

      return element
    },
  }

  // Enhanced CSS injection with CSP handling
  const injectStyles = () => {
    // Try to inject styles normally first
    if (SecurityUtils.canUseInlineStyles()) {
      const style = document.createElement("style")
      style.textContent = getWidgetCSS()

      try {
        document.head.appendChild(style)
        return true
      } catch (e) {
        console.warn("Failed to inject inline styles:", e)
      }
    }

    // Fallback: Create external stylesheet
    try {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "data:text/css;base64," + btoa(getWidgetCSS())
      document.head.appendChild(link)
      return true
    } catch (e) {
      console.warn("Failed to inject external stylesheet:", e)
    }

    // Last resort: Add basic styles via setAttribute
    return false
  }

  // Get CSS as string
  const getWidgetCSS = () => `
    @keyframes doorbell-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes doorbell-ripple {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    
    @keyframes doorbell-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    #doorbell-voice-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 999999;
      position: fixed;
    }
    
    #doorbell-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      border: none;
      outline: none;
    }
    
    #doorbell-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }
    
    #doorbell-widget-panel {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      z-index: 999998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.08);
    }
    
    .doorbell-listening #doorbell-voice-indicator {
      background: #dcfce7 !important;
      animation: doorbell-ripple 1.5s infinite;
    }
    
    .doorbell-thinking #doorbell-voice-indicator {
      background: #dbeafe !important;
      animation: doorbell-spin 1s linear infinite;
    }
    
    .doorbell-error #doorbell-voice-indicator {
      background: #fee2e2 !important;
    }
    
    .doorbell-message {
      margin-bottom: 12px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    
    .doorbell-message.user {
      flex-direction: row-reverse;
    }
    
    .doorbell-message-content {
      background: white;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      max-width: 80%;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .doorbell-message.user .doorbell-message-content {
      background: #667eea;
      color: white;
    }
    
    /* Fallback styles for CSP-restricted environments */
    .doorbell-widget-element {
      font-family: system-ui, sans-serif;
      box-sizing: border-box;
    }
  `

  // Enhanced widget creation with CSP handling
  const createWidget = () => {
    const widget = SecurityUtils.createSafeElement("div", { id: "doorbell-voice-widget" })

    // Create button
    const button = SecurityUtils.createSafeElement(
      "div",
      { id: "doorbell-widget-button" },
      {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "50%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        cursor: "pointer",
        zIndex: "999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        border: "none",
        outline: "none",
      },
    )

    // Add SVG icon safely
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `

    // Create panel
    const panel = SecurityUtils.createSafeElement(
      "div",
      { id: "doorbell-widget-panel" },
      {
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "350px",
        height: "500px",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        zIndex: "999998",
        display: "none",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
      },
    )

    // Build panel content safely
    panel.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div id="doorbell-status-dot" style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: doorbell-pulse 2s infinite;"></div>
          <span style="font-weight: 600; font-size: 14px;">Voice Assistant</span>
        </div>
        <button id="doorbell-close-btn" style="background: none; border: none; color: white; cursor: pointer; padding: 4px; border-radius: 4px; opacity: 0.8;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div id="doorbell-messages" style="flex: 1; overflow-y: auto; padding: 16px; background: #f9fafb; min-height: 0;">
        <div id="doorbell-welcome" style="text-align: center; padding: 20px 0; color: #6b7280;">
          <div style="width: 60px; height: 60px; background: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
          <p style="margin: 0; font-size: 14px; font-weight: 500;">Ready to help!</p>
          <p style="margin: 4px 0 0; font-size: 12px;">Click start to begin voice conversation</p>
        </div>
      </div>
      
      <div id="doorbell-controls" style="padding: 16px; background: white; border-top: 1px solid #e5e7eb; flex-shrink: 0;">
        <div style="text-align: center;">
          <div id="doorbell-voice-indicator" style="width: 80px; height: 80px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; transition: all 0.3s ease;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
          
          <p id="doorbell-status-text" style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1f2937;">Ready to Listen</p>
          
          <button id="doorbell-start-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-size: 14px; width: 100%;">
            Start Voice Chat
          </button>
        </div>
      </div>
    `

    widget.appendChild(button)
    widget.appendChild(panel)

    return widget
  }

  // Enhanced VAPI SDK loading with multiple fallbacks
  const loadVapiSDK = async () => {
    if (window.Vapi) {
      return window.Vapi
    }

    // Check if we can load external scripts
    const canLoadExternal = await SecurityUtils.canLoadExternalScripts()
    if (!canLoadExternal) {
      throw new Error("External script loading blocked by CSP")
    }

    let lastError

    for (const url of CONFIG.vapiUrls) {
      try {
        console.log(`Attempting to load VAPI SDK from: ${url}`)

        await new Promise((resolve, reject) => {
          const script = document.createElement("script")
          script.src = url
          script.async = true
          script.crossOrigin = "anonymous"

          const timeout = setTimeout(() => {
            reject(new Error("Script load timeout"))
          }, 10000)

          script.onload = () => {
            clearTimeout(timeout)
            setTimeout(() => {
              if (window.Vapi) {
                resolve(window.Vapi)
              } else {
                reject(new Error("VAPI not available after script load"))
              }
            }, 100)
          }

          script.onerror = (error) => {
            clearTimeout(timeout)
            reject(new Error(`Failed to load script: ${error.message || "Unknown error"}`))
          }

          document.head.appendChild(script)
        })

        if (window.Vapi) {
          console.log(`Successfully loaded VAPI SDK from: ${url}`)
          return window.Vapi
        }
      } catch (error) {
        console.warn(`Failed to load VAPI SDK from ${url}:`, error)
        lastError = error
        continue
      }
    }

    throw new Error(`Failed to load VAPI SDK from all sources. Last error: ${lastError?.message}`)
  }

  // Enhanced webhook sending with retry logic
  const sendToWebhook = async (data, retries = CONFIG.maxRetries) => {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      // Add page content for context
      pageContent: {
        headings: Array.from(document.querySelectorAll("h1, h2, h3"))
          .map((h) => h.textContent?.trim())
          .filter(Boolean)
          .slice(0, 10),
        description: document.querySelector('meta[name="description"]')?.content || "",
        keywords: document.querySelector('meta[name="keywords"]')?.content || "",
      },
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await SecurityUtils.safeFetch(CONFIG.webhookUrl, {
          method: "POST",
          body: JSON.stringify(payload),
        })

        // For no-cors mode, we can't check response status
        console.log("Webhook sent successfully")
        return
      } catch (error) {
        console.warn(`Webhook attempt ${attempt + 1} failed:`, error)

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, CONFIG.retryDelay * (attempt + 1)))
        } else {
          console.error("All webhook attempts failed:", error)
        }
      }
    }
  }

  // Enhanced message handling
  const addMessage = (content, role = "assistant") => {
    const messagesContainer = document.getElementById("doorbell-messages")
    const welcome = document.getElementById("doorbell-welcome")

    if (!messagesContainer) return

    if (welcome) {
      welcome.style.display = "none"
    }

    const messageEl = SecurityUtils.createSafeElement("div", { class: `doorbell-message ${role}` })
    messageEl.innerHTML = `
      <div class="doorbell-message-avatar" style="width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: ${role === "user" ? "#667eea" : "#6b7280"};">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          ${
            role === "user"
              ? '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
              : '<circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6"></path>'
          }
        </svg>
      </div>
      <div class="doorbell-message-content" style="background: ${role === "user" ? "#667eea" : "white"}; color: ${role === "user" ? "white" : "black"}; padding: 8px 12px; border-radius: 12px; font-size: 13px; line-height: 1.4; max-width: 80%; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">${content}</div>
    `

    messagesContainer.appendChild(messageEl)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  // Enhanced status updates
  const updateStatus = (state, title) => {
    const statusText = document.getElementById("doorbell-status-text")
    const statusDot = document.getElementById("doorbell-status-dot")
    const widget = document.getElementById("doorbell-voice-widget")

    if (!statusText || !widget) return

    widget.classList.remove("doorbell-listening", "doorbell-thinking", "doorbell-error")

    switch (state) {
      case "listening":
        widget.classList.add("doorbell-listening")
        if (statusDot) statusDot.style.background = "#16a34a"
        break
      case "thinking":
      case "processing":
        widget.classList.add("doorbell-thinking")
        if (statusDot) statusDot.style.background = "#2563eb"
        break
      case "error":
        widget.classList.add("doorbell-error")
        if (statusDot) statusDot.style.background = "#dc2626"
        break
      default:
        if (statusDot) statusDot.style.background = "#4ade80"
    }

    statusText.textContent = title
  }

  // Enhanced VAPI initialization with error handling
  const initializeVapi = async () => {
    try {
      updateStatus("connecting", "Loading...")

      const Vapi = await loadVapiSDK()
      const vapi = new Vapi(CONFIG.apiKey)

      // Enhanced event listeners with error handling
      vapi.on("call-start", () => {
        console.log("VAPI call started")
        updateStatus("listening", "Listening...")
        addMessage("Voice chat started! I'm listening...", "assistant")
        sendToWebhook({ type: "call_started" })
      })

      vapi.on("call-end", () => {
        console.log("VAPI call ended")
        updateStatus("idle", "Ready to Listen")
        addMessage("Voice chat ended. Click start to chat again!", "assistant")
        sendToWebhook({ type: "call_ended" })
      })

      vapi.on("speech-start", () => {
        console.log("User started speaking")
        updateStatus("listening", "I hear you...")
      })

      vapi.on("speech-end", () => {
        console.log("User stopped speaking")
        updateStatus("processing", "Processing...")
      })

      vapi.on("transcript", (transcript) => {
        console.log("Transcript received:", transcript)

        if (transcript.type === "final" && transcript.transcript) {
          addMessage(transcript.transcript, "user")
          sendToWebhook({
            type: "transcript",
            transcript: transcript.transcript,
            role: transcript.role || "user",
          })
        }
      })

      vapi.on("message", (message) => {
        console.log("VAPI message:", message)

        if (message.type === "transcript" && message.role === "assistant" && message.transcript) {
          addMessage(message.transcript, "assistant")
          updateStatus("idle", "Ready to Listen")
        }
      })

      vapi.on("error", (error) => {
        console.error("VAPI error:", error)
        updateStatus("error", "Error Occurred")
        addMessage("Sorry, I encountered an error. Please try again.", "assistant")
        sendToWebhook({
          type: "error",
          error: error.message || "Unknown error",
        })
      })

      updateStatus("idle", "Ready to Listen")
      return vapi
    } catch (error) {
      console.error("Failed to initialize VAPI:", error)
      updateStatus("error", "Failed to Load")

      // Provide fallback functionality
      addMessage("Voice features unavailable due to browser restrictions. You can still chat via text!", "assistant")

      throw error
    }
  }

  // Enhanced event handlers with graceful degradation
  const setupEventHandlers = (vapi) => {
    const button = document.getElementById("doorbell-widget-button")
    const panel = document.getElementById("doorbell-widget-panel")
    const closeBtn = document.getElementById("doorbell-close-btn")
    const startBtn = document.getElementById("doorbell-start-btn")

    if (!button || !panel || !closeBtn || !startBtn) {
      console.error("Required UI elements not found")
      return
    }

    let isOpen = false
    let isCallActive = false

    // Toggle panel
    button.addEventListener("click", () => {
      isOpen = !isOpen
      panel.style.display = isOpen ? "flex" : "none"

      if (isOpen) {
        sendToWebhook({ type: "widget_opened" })
      }
    })

    // Close panel
    closeBtn.addEventListener("click", () => {
      isOpen = false
      panel.style.display = "none"

      if (isCallActive) {
        endCall()
      }

      sendToWebhook({ type: "widget_closed" })
    })

    // Start/Stop conversation
    startBtn.addEventListener("click", () => {
      if (isCallActive) {
        endCall()
      } else {
        startCall()
      }
    })

    const startCall = async () => {
      if (!vapi) {
        addMessage("Voice features are not available. Please check your browser settings and try again.", "assistant")
        return
      }

      try {
        updateStatus("connecting", "Connecting...")

        await vapi.start(CONFIG.assistantId)
        isCallActive = true

        startBtn.textContent = "End Voice Chat"
        startBtn.style.background = "#ef4444"

        sendToWebhook({ type: "call_started" })
      } catch (error) {
        console.error("Failed to start call:", error)
        updateStatus("error", "Connection Failed")
        addMessage("Failed to start voice chat. Please check your microphone permissions and try again.", "assistant")

        sendToWebhook({
          type: "call_start_error",
          error: error.message || "Unknown error",
        })
      }
    }

    const endCall = () => {
      if (vapi && isCallActive) {
        try {
          vapi.stop()
        } catch (error) {
          console.warn("Error stopping call:", error)
        }

        isCallActive = false

        startBtn.textContent = "Start Voice Chat"
        startBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"

        updateStatus("idle", "Ready to Listen")
        sendToWebhook({ type: "call_ended" })
      }
    }
  }

  // Main initialization with comprehensive error handling
  const init = async () => {
    try {
      console.log("Initializing Doorbell Voice Widget (Failsafe Mode)...")

      // Inject styles
      const stylesInjected = injectStyles()
      if (!stylesInjected) {
        console.warn("Styles injection failed, using fallback styling")
      }

      // Create widget UI
      const widget = createWidget()
      document.body.appendChild(widget)

      // Send initial load event
      sendToWebhook({
        type: "widget_loaded",
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        stylesInjected,
        securityRestrictions: {
          canUseInlineStyles: SecurityUtils.canUseInlineStyles(),
          canLoadExternalScripts: await SecurityUtils.canLoadExternalScripts(),
        },
      })

      // Try to initialize VAPI
      let vapi = null
      try {
        vapi = await initializeVapi()
        console.log("VAPI initialized successfully")
      } catch (vapiError) {
        console.warn("VAPI initialization failed, continuing with limited functionality:", vapiError)
        addMessage(
          "Voice features are limited due to browser security settings. The widget is still functional for basic interactions.",
          "assistant",
        )
      }

      // Set up event handlers (works with or without VAPI)
      setupEventHandlers(vapi)

      console.log("Doorbell Voice Widget initialized successfully (Failsafe Mode)")
    } catch (error) {
      console.error("Critical error during widget initialization:", error)

      // Last resort: create minimal widget
      try {
        const fallbackWidget = document.createElement("div")
        fallbackWidget.innerHTML = `
          <div style="position: fixed; bottom: 20px; right: 20px; background: #667eea; color: white; padding: 12px; border-radius: 8px; cursor: pointer; z-index: 999999; font-family: system-ui, sans-serif;" onclick="alert('Voice widget encountered an error. Please refresh the page and try again.')">
            🎤 Voice Assistant (Error)
          </div>
        `
        document.body.appendChild(fallbackWidget)

        sendToWebhook({
          type: "widget_error",
          error: error.message || "Unknown initialization error",
        })
      } catch (fallbackError) {
        console.error("Even fallback widget creation failed:", fallbackError)
      }
    }
  }

  // Enhanced initialization timing
  const startInit = () => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init)
    } else {
      // Add small delay to ensure page is fully rendered
      setTimeout(init, 100)
    }
  }

  // Start the initialization process
  startInit()
})()

// Replace the existing widget loader with this CSP-compliant version
const widgetLoader = `
  (function() {
    if (window.DoorbellVoiceWidget) return;
    
    const config = {
      apiKey: '8c0a9ef0-3f3a-4c1e-b389-948703fbe032',
      assistantId: 'd93608e2-7901-4102-94f4-50aecb52a2e6',
      webhookUrl: 'https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3'
    };
    
    // Create widget UI using only DOM methods
    const widget = document.createElement('div');
    widget.id = 'production-widget';
    widget.className = 'widget-demo';
    
    const button = document.createElement('div');
    button.style.cssText = 'width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.2s;';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'white');
    svg.setAttribute('stroke-width', '2');
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z');
    
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M19 10v2a7 7 0 0 1-14 0v-2');
    
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '12');
    line1.setAttribute('y1', '19');
    line1.setAttribute('x2', '12');
    line1.setAttribute('y2', '23');
    
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '8');
    line2.setAttribute('y1', '23');
    line2.setAttribute('x2', '16');
    line2.setAttribute('y2', '23');
    
    svg.appendChild(path1);
    svg.appendChild(path2);
    svg.appendChild(line1);
    svg.appendChild(line2);
    button.appendChild(svg);
    widget.appendChild(button);
    
    button.addEventListener('mouseover', function() {
      this.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseout', function() {
      this.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', function() {
      alert('Production widget clicked! In real implementation, this would start voice chat.');
      
      // Send analytics using fetch (no eval needed)
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'widget_clicked',
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      }).catch(function(error) {
        console.warn('Analytics failed:', error);
      });
    });
    
    document.body.appendChild(widget);
    window.DoorbellVoiceWidget = true;
    
    console.log('Production widget loaded successfully');
  })();
`

// Execute without eval - use script element instead
const scriptElement = document.createElement("script")
scriptElement.textContent = widgetLoader
document.head.appendChild(scriptElement)
