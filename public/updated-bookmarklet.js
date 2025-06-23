// Updated CSP-Compliant Bookmarklet with correct URL
javascript: (() => {
  // Check if already loaded
  if (window.DoorbellVoiceWidget) {
    console.log("Widget already loaded")
    return
  }

  // Configuration with correct URL
  var config = {
    apiKey: "8c0a9ef0-3f3a-4c1e-b389-948703fbe032",
    webhookUrl: "https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3",
    widgetUrl: "https://resplendent-tanuki-b41ad5.netlify.app/",
    fallbackUrls: [
      "https://resplendent-tanuki-b41ad5.netlify.app/widget.js",
      "https://resplendent-tanuki-b41ad5.netlify.app/failsafe-widget.js",
      "https://resplendent-tanuki-b41ad5.netlify.app/ultra-safe-widget.js",
    ],
  }

  // Try to load the full widget first
  var tryLoadWidget = (urlIndex) => {
    if (urlIndex >= config.fallbackUrls.length) {
      // All URLs failed, create manual widget
      createManualWidget()
      return
    }

    var script = document.createElement("script")
    script.src = config.fallbackUrls[urlIndex]
    script.async = true
    script.crossOrigin = "anonymous"

    script.onload = () => {
      console.log("Widget loaded from:", config.fallbackUrls[urlIndex])
      window.DoorbellVoiceWidget = true
    }

    script.onerror = () => {
      console.warn("Failed to load from:", config.fallbackUrls[urlIndex])
      tryLoadWidget(urlIndex + 1)
    }

    try {
      document.head.appendChild(script)
    } catch (e) {
      console.warn("Script injection blocked, trying next URL")
      tryLoadWidget(urlIndex + 1)
    }
  }

  // Manual widget creation as fallback
  var createManualWidget = () => {
    // Mark as loaded
    window.DoorbellVoiceWidget = true

    // Create widget without any dynamic code execution
    var widget = document.createElement("div")
    widget.id = "bookmarklet-voice-widget"
    widget.style.cssText =
      "position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; cursor: pointer; z-index: 999999; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.2s ease;"

    // Create SVG icon
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "24")
    svg.setAttribute("height", "24")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("fill", "none")
    svg.setAttribute("stroke", "white")
    svg.setAttribute("stroke-width", "2")

    var path1 = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path1.setAttribute("d", "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z")

    var path2 = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path2.setAttribute("d", "M19 10v2a7 7 0 0 1-14 0v-2")

    var line1 = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line1.setAttribute("x1", "12")
    line1.setAttribute("y1", "19")
    line1.setAttribute("x2", "12")
    line1.setAttribute("y2", "23")

    var line2 = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line2.setAttribute("x1", "8")
    line2.setAttribute("y1", "23")
    line2.setAttribute("x2", "16")
    line2.setAttribute("y2", "23")

    svg.appendChild(path1)
    svg.appendChild(path2)
    svg.appendChild(line1)
    svg.appendChild(line2)
    widget.appendChild(svg)

    // Add hover effects
    widget.addEventListener("mouseover", function () {
      this.style.transform = "scale(1.1)"
    })

    widget.addEventListener("mouseout", function () {
      this.style.transform = "scale(1)"
    })

    // Add click handler
    widget.addEventListener("click", () => {
      var message = prompt(
        "Voice Assistant (Bookmarklet)\n\nVoice features are limited due to browser security.\nPlease enter your message:",
      )

      if (message && message.trim()) {
        // Send to webhook
        fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "bookmarklet_message",
            message: message.trim(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            title: document.title,
            source: "bookmarklet_fallback",
          }),
        }).catch((error) => {
          console.warn("Webhook failed:", error)
        })

        alert('Message sent: "' + message + '"\n\nIn production, this would connect to your voice assistant.')
      }
    })

    // Add to page
    document.body.appendChild(widget)
    console.log("Manual CSP-compliant voice widget loaded via bookmarklet")
  }

  // Start loading process
  tryLoadWidget(0)

  // Fallback timeout
  setTimeout(() => {
    if (!window.DoorbellVoiceWidget) {
      console.log("Widget loading timeout, creating manual widget")
      createManualWidget()
    }
  }, 5000)
})()
