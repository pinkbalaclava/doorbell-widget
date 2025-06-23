// Adaptive Widget Loader - Chooses best loading strategy based on CSP analysis
class AdaptiveWidgetLoader {
  constructor(config = {}) {
    this.config = {
      apiKey: "8c0a9ef0-3f3a-4c1e-b389-948703fbe032",
      assistantId: "d93608e2-7901-4102-94f4-50aecb52a2e6",
      webhookUrl: "https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3",
      fallbackUrls: [
        "https://resplendent-tanuki-b41ad5.netlify.app/widget.js",
        "https://resplendent-tanuki-b41ad5.netlify.app/failsafe-widget.js",
        "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js",
      ],
      ...config,
    }

    this.cspAnalyzer = window.cspAnalyzer || new CSPAnalyzer()
    this.loadingStrategy = null
    this.widget = null
  }

  async load() {
    console.log("🚀 Starting adaptive widget loading...")

    // Analyze CSP restrictions
    const cspReport = this.cspAnalyzer.generateReport()
    console.log("CSP Analysis:", cspReport)

    // Choose loading strategy based on restrictions
    this.loadingStrategy = this.chooseStrategy(cspReport)
    console.log("Selected strategy:", this.loadingStrategy)

    // Execute loading strategy
    try {
      await this.executeStrategy()
      console.log("✅ Widget loaded successfully")
      return true
    } catch (error) {
      console.error("❌ Widget loading failed:", error)
      await this.fallbackStrategy()
      return false
    }
  }

  chooseStrategy(cspReport) {
    const { restrictionLevel, bypassTechniques } = cspReport

    switch (restrictionLevel) {
      case "none":
      case "loose":
        return {
          type: "full-external",
          description: "Load full widget with all features",
          method: "external-script",
        }

      case "medium":
        if (bypassTechniques.some((t) => t.type === "script-injection")) {
          return {
            type: "cdn-fallback",
            description: "Load from allowed CDNs with fallbacks",
            method: "progressive-loading",
          }
        } else {
          return {
            type: "inline-widget",
            description: "Create widget using DOM manipulation",
            method: "dom-creation",
          }
        }

      case "strict":
        if (bypassTechniques.some((t) => t.type === "iframe-bypass")) {
          return {
            type: "iframe-widget",
            description: "Load widget in sandboxed iframe",
            method: "iframe-sandbox",
          }
        } else {
          return {
            type: "minimal-widget",
            description: "Create minimal CSS-only widget",
            method: "css-only",
          }
        }

      default:
        return {
          type: "fallback",
          description: "Use most basic widget implementation",
          method: "basic-dom",
        }
    }
  }

  async executeStrategy() {
    switch (this.loadingStrategy.method) {
      case "external-script":
        return await this.loadExternalScript()

      case "progressive-loading":
        return await this.loadWithFallbacks()

      case "dom-creation":
        return await this.createDOMWidget()

      case "iframe-sandbox":
        return await this.createIframeWidget()

      case "css-only":
        return await this.createCSSOnlyWidget()

      case "basic-dom":
        return await this.createBasicWidget()

      default:
        throw new Error("Unknown loading strategy")
    }
  }

  async loadExternalScript() {
    console.log("Loading external script...")

    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = this.config.fallbackUrls[0]
      script.async = true
      script.crossOrigin = "anonymous"

      script.onload = () => {
        console.log("External script loaded successfully")
        resolve()
      }

      script.onerror = (error) => {
        console.error("External script failed to load")
        reject(error)
      }

      document.head.appendChild(script)
    })
  }

  async loadWithFallbacks() {
    console.log("Loading with CDN fallbacks...")

    for (const url of this.config.fallbackUrls) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script")
          script.src = url
          script.async = true
          script.crossOrigin = "anonymous"

          const timeout = setTimeout(() => {
            reject(new Error("Script load timeout"))
          }, 5000)

          script.onload = () => {
            clearTimeout(timeout)
            resolve()
          }

          script.onerror = () => {
            clearTimeout(timeout)
            reject(new Error("Script load failed"))
          }

          document.head.appendChild(script)
        })

        console.log(`Successfully loaded from: ${url}`)
        return
      } catch (error) {
        console.warn(`Failed to load from ${url}:`, error)
        continue
      }
    }

    throw new Error("All fallback URLs failed")
  }

  async createDOMWidget() {
    console.log("Creating DOM-based widget...")

    // Create widget structure
    const widget = document.createElement("div")
    widget.id = "adaptive-voice-widget"
    widget.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        cursor: pointer;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </div>
      
      <div id="widget-panel" style="
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 300px;
        height: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 999998;
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.1);
      ">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; font-weight: 600;">
          🎤 Voice Assistant
          <button onclick="this.closest('#adaptive-voice-widget').querySelector('#widget-panel').style.display='none'" style="float: right; background: none; border: none; color: white; cursor: pointer;">✕</button>
        </div>
        <div style="flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
          <div style="margin-bottom: 16px; font-size: 48px;">🎵</div>
          <p style="margin: 0 0 16px 0; color: #666;">Voice features limited due to browser security settings.</p>
          <button onclick="handleVoiceClick()" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Start Text Chat
          </button>
        </div>
      </div>
    `

    // Add click handlers
    const button = widget.querySelector("div")
    const panel = widget.querySelector("#widget-panel")

    button.onclick = () => {
      panel.style.display = panel.style.display === "none" ? "flex" : "none"
      this.sendAnalytics("widget_opened")
    }

    // Add global handler for voice click
    window.handleVoiceClick = () => {
      const message = prompt("Enter your message:")
      if (message) {
        this.sendAnalytics("message_sent", { message })
        alert("Message sent! (In production, this would connect to your voice assistant)")
      }
    }

    document.body.appendChild(widget)
    this.widget = widget

    return widget
  }

  async createIframeWidget() {
    console.log("Creating iframe-based widget...")

    const iframe = document.createElement("iframe")
    iframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 50%;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    `

    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
          }
          body:hover {
            transform: scale(1.1);
          }
        </style>
      </head>
      <body onclick="parent.postMessage('widget-clicked', '*')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </body>
      </html>
    `

    // Listen for iframe messages
    window.addEventListener("message", (event) => {
      if (event.data === "widget-clicked") {
        this.handleIframeWidgetClick()
      }
    })

    document.body.appendChild(iframe)
    this.widget = iframe

    return iframe
  }

  handleIframeWidgetClick() {
    const message = prompt("Voice Assistant (Iframe Mode)\n\nEnter your message:")
    if (message) {
      this.sendAnalytics("iframe_message_sent", { message })
      alert("Message received! The assistant would respond here in production.")
    }
  }

  async createCSSOnlyWidget() {
    console.log("Creating CSS-only widget...")

    // Inject CSS
    const style = document.createElement("style")
    style.textContent = `
      .css-voice-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        cursor: pointer;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
      }
      
      .css-voice-widget:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0,0,0,0.2);
      }
      
      .css-voice-widget:active {
        transform: scale(0.95);
      }
      
      .css-voice-widget::before {
        content: "🎤";
        font-size: 24px;
        color: white;
      }
      
      .css-voice-widget:hover::before {
        content: "🎵";
      }
    `

    document.head.appendChild(style)

    // Create widget element
    const widget = document.createElement("div")
    widget.className = "css-voice-widget"
    widget.title = "Voice Assistant (Limited Mode)"
    widget.onclick = () => {
      const message = prompt("CSS-Only Voice Widget\n\nEnter your message:")
      if (message) {
        this.sendAnalytics("css_message_sent", { message })
        alert("Message sent via CSS widget!")
      }
    }

    document.body.appendChild(widget)
    this.widget = widget

    return widget
  }

  async createBasicWidget() {
    console.log("Creating basic fallback widget...")

    const widget = document.createElement("button")
    widget.textContent = "🎤 Voice"
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 20px;
      cursor: pointer;
      z-index: 999999;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `

    widget.onclick = () => {
      alert(
        "Voice Assistant\n\nThis is a basic fallback widget. Full functionality is limited due to browser security restrictions.",
      )
      this.sendAnalytics("basic_widget_clicked")
    }

    document.body.appendChild(widget)
    this.widget = widget

    return widget
  }

  async fallbackStrategy() {
    console.log("Executing fallback strategy...")

    try {
      await this.createBasicWidget()
      console.log("Fallback widget created successfully")
    } catch (error) {
      console.error("Even fallback strategy failed:", error)

      // Last resort: create minimal text widget
      const lastResort = document.createElement("div")
      lastResort.innerHTML = "🎤"
      lastResort.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 999999;
        font-size: 20px;
      `
      lastResort.onclick = () => alert("Voice widget (minimal mode)")
      document.body.appendChild(lastResort)
    }
  }

  async sendAnalytics(event, data = {}) {
    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        strategy: this.loadingStrategy?.type,
        ...data,
      }

      await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.warn("Analytics failed:", error)
    }
  }

  remove() {
    if (this.widget) {
      this.widget.remove()
      this.widget = null
    }
  }
}

// Auto-initialize if not in test environment
if (typeof window !== "undefined" && !window.location.href.includes("test-pages")) {
  window.AdaptiveWidgetLoader = AdaptiveWidgetLoader

  // Auto-load widget
  const loader = new AdaptiveWidgetLoader()
  loader
    .load()
    .then(() => {
      console.log("🎉 Adaptive widget loading complete")
    })
    .catch((error) => {
      console.error("🚨 Adaptive widget loading failed:", error)
    })
}
