// CSP-Safe Bookmarklet Generator
;(() => {
  // Enhanced bookmarklet that works around CSP restrictions
  const createCSPSafeBookmarklet = () => {
    const bookmarkletCode = `
      javascript:(function(){
        // Check if already loaded
        if(window.DoorbellVoiceWidget) {
          console.log('Widget already loaded');
          return;
        }
        
        // Create script element with multiple fallback URLs
        const urls = [
          'https://doorbell-widget.netlify.app/failsafe-widget.js',
          'https://cdn.jsdelivr.net/gh/yourusername/doorbell-widget@main/failsafe-widget.js',
          'data:text/javascript;base64,' + btoa(/* Inline widget code here */)
        ];
        
        let loaded = false;
        
        const tryLoadScript = (urlIndex) => {
          if (urlIndex >= urls.length || loaded) return;
          
          const script = document.createElement('script');
          script.src = urls[urlIndex];
          script.async = true;
          script.crossOrigin = 'anonymous';
          
          script.onload = () => {
            loaded = true;
            console.log('Widget loaded from:', urls[urlIndex]);
          };
          
          script.onerror = () => {
            console.warn('Failed to load from:', urls[urlIndex]);
            tryLoadScript(urlIndex + 1);
          };
          
          // Try to append script
          try {
            document.head.appendChild(script);
          } catch (e) {
            console.warn('Script injection blocked, trying next URL');
            tryLoadScript(urlIndex + 1);
          }
        };
        
        tryLoadScript(0);
        
        // Fallback: If all external loads fail, create minimal widget
        setTimeout(() => {
          if (!loaded && !window.DoorbellVoiceWidget) {
            console.log('Creating fallback widget');
            
            const widget = document.createElement('div');
            widget.innerHTML = '<div style="position:fixed;bottom:20px;right:20px;background:#667eea;color:white;padding:12px;border-radius:8px;cursor:pointer;z-index:999999;font-family:system-ui,sans-serif" onclick="alert(\\'Voice widget is loading. Please wait a moment and try again.\\')">🎤 Loading...</div>';
            document.body.appendChild(widget);
            
            // Keep trying to load the full widget
            const retryInterval = setInterval(() => {
              if (window.DoorbellVoiceWidget) {
                clearInterval(retryInterval);
                widget.remove();
              }
            }, 1000);
          }
        }, 3000);
      })();
    `

    return bookmarkletCode
  }

  // Update the bookmarklet on the page
  const updateBookmarkletLink = () => {
    const bookmarkletLink = document.querySelector('a[href^="javascript:"]')
    if (bookmarkletLink) {
      bookmarkletLink.href = createCSPSafeBookmarklet()
    }
  }

  // Run when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateBookmarkletLink)
  } else {
    updateBookmarkletLink()
  }
})()
