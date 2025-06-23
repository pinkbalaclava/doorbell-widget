// CSP Analysis and Bypass Detection Tool
class CSPAnalyzer {
  constructor() {
    this.cspHeader = null
    this.cspMeta = null
    this.restrictions = {}
    this.bypassTechniques = []
    this.init()
  }

  init() {
    this.detectCSP()
    this.analyzeRestrictions()
    this.findBypassTechniques()
    this.generateReport()
  }

  detectCSP() {
    // Check for CSP in meta tags
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (metaCSP) {
      this.cspMeta = metaCSP.content
    }

    // Check for CSP in HTTP headers (if available)
    if (typeof window.cspHeader !== "undefined") {
      this.cspHeader = window.cspHeader
    }

    console.log("CSP Detection:", {
      meta: this.cspMeta,
      header: this.cspHeader,
    })
  }

  analyzeRestrictions() {
    const csp = this.cspMeta || this.cspHeader || ""

    this.restrictions = {
      scriptSrc: this.parseDirective(csp, "script-src"),
      styleSrc: this.parseDirective(csp, "style-src"),
      connectSrc: this.parseDirective(csp, "connect-src"),
      imgSrc: this.parseDirective(csp, "img-src"),
      fontSrc: this.parseDirective(csp, "font-src"),
      objectSrc: this.parseDirective(csp, "object-src"),
      mediaSrc: this.parseDirective(csp, "media-src"),
      frameSrc: this.parseDirective(csp, "frame-src"),
      workerSrc: this.parseDirective(csp, "worker-src"),
      defaultSrc: this.parseDirective(csp, "default-src"),

      // Special flags
      hasUnsafeInline: csp.includes("'unsafe-inline'"),
      hasUnsafeEval: csp.includes("'unsafe-eval'"),
      hasStrictDynamic: csp.includes("'strict-dynamic'"),
      upgradeInsecureRequests: csp.includes("upgrade-insecure-requests"),
      blockAllMixedContent: csp.includes("block-all-mixed-content"),
    }

    console.log("CSP Restrictions:", this.restrictions)
  }

  parseDirective(csp, directive) {
    const regex = new RegExp(`${directive}\\s+([^;]+)`, "i")
    const match = csp.match(regex)
    return match ? match[1].trim().split(/\s+/) : []
  }

  findBypassTechniques() {
    this.bypassTechniques = []

    // Check for script-src bypasses
    if (this.canBypassScriptSrc()) {
      this.bypassTechniques.push({
        type: "script-injection",
        method: "External script loading",
        feasibility: "high",
        description: "Can load external scripts from allowed domains",
      })
    }

    if (this.restrictions.hasUnsafeInline) {
      this.bypassTechniques.push({
        type: "inline-script",
        method: "Inline script execution",
        feasibility: "high",
        description: "Can execute inline scripts",
      })
    }

    if (this.restrictions.hasUnsafeEval) {
      this.bypassTechniques.push({
        type: "dynamic-execution",
        method: "eval() and Function() constructor",
        feasibility: "high",
        description: "Can execute dynamically generated code",
      })
    }

    // Check for data URI bypasses
    if (this.canUseDataUris()) {
      this.bypassTechniques.push({
        type: "data-uri",
        method: "Data URI script injection",
        feasibility: "medium",
        description: "Can use data: URIs for script injection",
      })
    }

    // Check for blob URL bypasses
    if (this.canUseBlobUrls()) {
      this.bypassTechniques.push({
        type: "blob-url",
        method: "Blob URL script injection",
        feasibility: "medium",
        description: "Can create and execute blob URLs",
      })
    }

    // Check for iframe bypasses
    if (this.canUseIframes()) {
      this.bypassTechniques.push({
        type: "iframe-bypass",
        method: "Iframe sandboxing",
        feasibility: "medium",
        description: "Can use iframes to bypass restrictions",
      })
    }

    // Check for DOM manipulation bypasses
    if (this.canManipulateDOM()) {
      this.bypassTechniques.push({
        type: "dom-manipulation",
        method: "DOM-based injection",
        feasibility: "low",
        description: "Can manipulate DOM to inject content",
      })
    }

    // Check for service worker bypasses
    if (this.canUseServiceWorkers()) {
      this.bypassTechniques.push({
        type: "service-worker",
        method: "Service Worker proxy",
        feasibility: "low",
        description: "Can use service workers to proxy requests",
      })
    }

    console.log("Bypass Techniques:", this.bypassTechniques)
  }

  canBypassScriptSrc() {
    const scriptSrc = this.restrictions.scriptSrc
    if (scriptSrc.length === 0) return true // No restrictions

    // Check for common CDNs
    const allowedDomains = ["cdn.jsdelivr.net", "unpkg.com", "cdnjs.cloudflare.com"]
    return allowedDomains.some((domain) =>
      scriptSrc.some((src) => src.includes(domain) || src === "*" || src === "'self'"),
    )
  }

  canUseDataUris() {
    const scriptSrc = this.restrictions.scriptSrc
    return scriptSrc.includes("data:") || scriptSrc.length === 0
  }

  canUseBlobUrls() {
    const scriptSrc = this.restrictions.scriptSrc
    return scriptSrc.includes("blob:") || scriptSrc.length === 0
  }

  canUseIframes() {
    const frameSrc = this.restrictions.frameSrc
    return frameSrc.length === 0 || frameSrc.includes("'self'") || frameSrc.includes("*")
  }

  canManipulateDOM() {
    // DOM manipulation is usually always possible unless very strict CSP
    return !this.restrictions.hasStrictDynamic
  }

  canUseServiceWorkers() {
    const workerSrc = this.restrictions.workerSrc
    return workerSrc.length === 0 || workerSrc.includes("'self'")
  }

  generateReport() {
    const report = {
      cspDetected: !!(this.cspMeta || this.cspHeader),
      restrictionLevel: this.getRestrictionLevel(),
      restrictions: this.restrictions,
      bypassTechniques: this.bypassTechniques,
      recommendations: this.getRecommendations(),
    }

    console.log("CSP Analysis Report:", report)
    return report
  }

  getRestrictionLevel() {
    if (!this.cspMeta && !this.cspHeader) return "none"

    const restrictiveCount = [
      !this.restrictions.hasUnsafeInline,
      !this.restrictions.hasUnsafeEval,
      this.restrictions.scriptSrc.length > 0 && !this.restrictions.scriptSrc.includes("*"),
      this.restrictions.connectSrc.length > 0 && !this.restrictions.connectSrc.includes("*"),
      this.restrictions.styleSrc.length > 0 && !this.restrictions.styleSrc.includes("*"),
    ].filter(Boolean).length

    if (restrictiveCount >= 4) return "strict"
    if (restrictiveCount >= 2) return "medium"
    return "loose"
  }

  getRecommendations() {
    const recommendations = []
    const level = this.getRestrictionLevel()

    switch (level) {
      case "strict":
        recommendations.push("Use minimal DOM-only widget")
        recommendations.push("Implement CSS-only fallback")
        recommendations.push("Consider iframe-based solution")
        recommendations.push("Use postMessage for communication")
        break

      case "medium":
        recommendations.push("Load widget from allowed CDNs")
        recommendations.push("Use inline styles if allowed")
        recommendations.push("Implement progressive enhancement")
        recommendations.push("Test external API connectivity")
        break

      case "loose":
      case "none":
        recommendations.push("Full widget functionality available")
        recommendations.push("Use all advanced features")
        recommendations.push("Implement complete VAPI integration")
        recommendations.push("Enable all analytics and tracking")
        break
    }

    return recommendations
  }

  // Test specific bypass techniques
  async testBypassTechniques() {
    const results = {}

    for (const technique of this.bypassTechniques) {
      try {
        const result = await this.testTechnique(technique)
        results[technique.type] = result
      } catch (error) {
        results[technique.type] = { success: false, error: error.message }
      }
    }

    return results
  }

  async testTechnique(technique) {
    switch (technique.type) {
      case "script-injection":
        return this.testScriptInjection()

      case "inline-script":
        return this.testInlineScript()

      case "data-uri":
        return this.testDataUri()

      case "blob-url":
        return this.testBlobUrl()

      case "iframe-bypass":
        return this.testIframeBypass()

      default:
        return { success: false, error: "Unknown technique" }
    }
  }

  testScriptInjection() {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
      script.onload = () => resolve({ success: true, message: "External script loaded" })
      script.onerror = () => resolve({ success: false, message: "External script blocked" })
      document.head.appendChild(script)
    })
  }

  testInlineScript() {
    try {
      const script = document.createElement("script")
      script.textContent = "window.cspTestInline = true;"
      document.head.appendChild(script)
      return { success: !!window.cspTestInline, message: "Inline script test" }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  testDataUri() {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "data:text/javascript,window.cspTestDataUri=true;"
      script.onload = () => resolve({ success: !!window.cspTestDataUri, message: "Data URI executed" })
      script.onerror = () => resolve({ success: false, message: "Data URI blocked" })
      document.head.appendChild(script)
    })
  }

  testBlobUrl() {
    return new Promise((resolve) => {
      try {
        const blob = new Blob(["window.cspTestBlob = true;"], { type: "text/javascript" })
        const blobUrl = URL.createObjectURL(blob)
        const script = document.createElement("script")
        script.src = blobUrl
        script.onload = () => {
          URL.revokeObjectURL(blobUrl)
          resolve({ success: !!window.cspTestBlob, message: "Blob URL executed" })
        }
        script.onerror = () => {
          URL.revokeObjectURL(blobUrl)
          resolve({ success: false, message: "Blob URL blocked" })
        }
        document.head.appendChild(script)
      } catch (error) {
        resolve({ success: false, message: error.message })
      }
    })
  }

  testIframeBypass() {
    return new Promise((resolve) => {
      try {
        const iframe = document.createElement("iframe")
        iframe.style.display = "none"
        iframe.srcdoc = '<script>parent.postMessage("iframe-test", "*");</script>'

        const messageHandler = (event) => {
          if (event.data === "iframe-test") {
            window.removeEventListener("message", messageHandler)
            iframe.remove()
            resolve({ success: true, message: "Iframe bypass successful" })
          }
        }

        window.addEventListener("message", messageHandler)
        document.body.appendChild(iframe)

        // Timeout after 2 seconds
        setTimeout(() => {
          window.removeEventListener("message", messageHandler)
          iframe.remove()
          resolve({ success: false, message: "Iframe bypass timeout" })
        }, 2000)
      } catch (error) {
        resolve({ success: false, message: error.message })
      }
    })
  }
}

// Auto-initialize CSP analyzer
if (typeof window !== "undefined") {
  window.CSPAnalyzer = CSPAnalyzer
  window.cspAnalyzer = new CSPAnalyzer()
}
