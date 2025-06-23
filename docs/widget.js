(function() {
  'use strict';
  
  // Prevent multiple instances
  if (window.DoorbellVoiceWidget) {
    console.log('Doorbell Voice Widget already loaded');
    return;
  }
  
  // Mark as loaded
  window.DoorbellVoiceWidget = true;
  
  // Configuration
  const CONFIG = {
    apiKey: '8c0a9ef0-3f3a-4c1e-b389-948703fbe032',
    assistantId: 'd93608e2-7901-4102-94f4-50aecb52a2e6',
    webhookUrl: 'https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3',
    voice: 'openai'
  };
  
  // Create widget container with full UI
  const createWidget = () => {
    const widget = document.createElement('div');
    widget.id = 'doorbell-voice-widget';
    widget.innerHTML = `
      <!-- Floating Toggle Button -->
      <div id="doorbell-widget-button" style="
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
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </div>
      
      <!-- Chat Panel -->
      <div id="doorbell-widget-panel" style="
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div id="doorbell-status-dot" style="
              width: 8px;
              height: 8px;
              background: #4ade80;
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
            <span style="font-weight: 600; font-size: 14px;">Voice Assistant</span>
          </div>
          <button id="doorbell-close-btn" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            opacity: 0.8;
            transition: opacity 0.2s;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Messages Area -->
        <div id="doorbell-messages" style="
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
          min-height: 0;
        ">
          <div id="doorbell-welcome" style="
            text-align: center;
            padding: 20px 0;
            color: #6b7280;
          ">
            <div style="
              width: 60px;
              height: 60px;
              background: #e5e7eb;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 12px;
            ">
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
        
        <!-- Voice Controls -->
        <div id="doorbell-controls" style="
          padding: 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        ">
          <div style="text-align: center;">
            <div id="doorbell-voice-indicator" style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #f3f4f6;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 12px;
              transition: all 0.3s ease;
            ">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
            
            <p id="doorbell-status-text" style="
              margin: 0 0 12px 0;
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
            ">Ready to Listen</p>
            
            <button id="doorbell-start-btn" style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              font-size: 14px;
              width: 100%;
            ">
              Start Voice Chat
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes ripple {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      #doorbell-widget-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0,0,0,0.2);
      }
      
      #doorbell-start-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      .doorbell-listening #doorbell-voice-indicator {
        background: #dcfce7 !important;
        animation: ripple 1.5s infinite;
      }
      
      .doorbell-listening #doorbell-voice-indicator svg {
        stroke: #16a34a !important;
      }
      
      .doorbell-thinking #doorbell-voice-indicator {
        background: #dbeafe !important;
        animation: spin 1s linear infinite;
      }
      
      .doorbell-thinking #doorbell-voice-indicator svg {
        stroke: #2563eb !important;
      }
      
      .doorbell-error #doorbell-voice-indicator {
        background: #fee2e2 !important;
      }
      
      .doorbell-error #doorbell-voice-indicator svg {
        stroke: #dc2626 !important;
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
      
      .doorbell-message-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .doorbell-message.user .doorbell-message-avatar {
        background: #667eea;
      }
      
      .doorbell-message.assistant .doorbell-message-avatar {
        background: #6b7280;
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
      
      /* Scrollbar styling */
      #doorbell-messages::-webkit-scrollbar {
        width: 4px;
      }
      
      #doorbell-messages::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      
      #doorbell-messages::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(widget);
    
    return widget;
  };
  
  // Load VAPI SDK
  const loadVapiSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.Vapi) {
        resolve(window.Vapi);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js';
      script.onload = () => {
        setTimeout(() => {
          if (window.Vapi) {
            resolve(window.Vapi);
          } else {
            reject(new Error('VAPI SDK failed to load'));
          }
        }, 100);
      };
      script.onerror = () => reject(new Error('Failed to load VAPI SDK'));
      document.head.appendChild(script);
    });
  };
  
  // Add message to chat
  const addMessage = (content, role = 'assistant') => {
    const messagesContainer = document.getElementById('doorbell-messages');
    const welcome = document.getElementById('doorbell-welcome');
    
    if (!messagesContainer) return;
    
    // Hide welcome message on first message
    if (welcome) {
      welcome.style.display = 'none';
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `doorbell-message ${role}`;
    messageEl.innerHTML = `
      <div class="doorbell-message-avatar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          ${role === 'user' 
            ? '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
            : '<circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6"></path>'
          }
        </svg>
      </div>
      <div class="doorbell-message-content">${content}</div>
    `;
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };
  
  // Update status display
  const updateStatus = (state, title) => {
    const statusText = document.getElementById('doorbell-status-text');
    const statusDot = document.getElementById('doorbell-status-dot');
    const widget = document.getElementById('doorbell-voice-widget');
    
    if (!statusText || !widget) return;
    
    // Remove all state classes
    widget.classList.remove('doorbell-listening', 'doorbell-thinking', 'doorbell-error');
    
    // Add appropriate state class and update status
    switch (state) {
      case 'listening':
        widget.classList.add('doorbell-listening');
        if (statusDot) statusDot.style.background = '#16a34a';
        break;
      case 'thinking':
      case 'processing':
        widget.classList.add('doorbell-thinking');
        if (statusDot) statusDot.style.background = '#2563eb';
        break;
      case 'error':
        widget.classList.add('doorbell-error');
        if (statusDot) statusDot.style.background = '#dc2626';
        break;
      default:
        if (statusDot) statusDot.style.background = '#4ade80';
    }
    
    statusText.textContent = title;
  };
  
  // Send data to webhook
  const sendToWebhook = async (data) => {
    try {
      await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          title: document.title,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to send to webhook:', error);
    }
  };
  
  // Initialize VAPI
  const initializeVapi = async () => {
    try {
      const Vapi = await loadVapiSDK();
      
      const vapi = new Vapi(CONFIG.apiKey);
      
      // Set up event listeners
      vapi.on('call-start', () => {
        console.log('VAPI call started');
        updateStatus('listening', 'Listening...');
        addMessage('Voice chat started! I\'m listening...', 'assistant');
      });
      
      vapi.on('call-end', () => {
        console.log('VAPI call ended');
        updateStatus('idle', 'Ready to Listen');
        addMessage('Voice chat ended. Click start to chat again!', 'assistant');
      });
      
      vapi.on('speech-start', () => {
        console.log('User started speaking');
        updateStatus('listening', 'I hear you...');
      });
      
      vapi.on('speech-end', () => {
        console.log('User stopped speaking');
        updateStatus('processing', 'Processing...');
      });
      
      vapi.on('transcript', (transcript) => {
        console.log('Transcript received:', transcript);
        
        if (transcript.type === 'final' && transcript.transcript) {
          // Add user message to chat
          addMessage(transcript.transcript, 'user');
          
          // Send to webhook
          sendToWebhook({
            type: 'transcript',
            transcript: transcript.transcript,
            role: transcript.role || 'user'
          });
        }
      });
      
      vapi.on('message', (message) => {
        console.log('VAPI message:', message);
        
        if (message.type === 'transcript' && message.role === 'assistant' && message.transcript) {
          // Add assistant response to chat
          addMessage(message.transcript, 'assistant');
          updateStatus('idle', 'Ready to Listen');
        }
      });
      
      vapi.on('error', (error) => {
        console.error('VAPI error:', error);
        updateStatus('error', 'Error Occurred');
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        
        sendToWebhook({
          type: 'error',
          error: error.message || 'Unknown error'
        });
      });
      
      return vapi;
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
      updateStatus('error', 'Failed to Load');
      throw error;
    }
  };
  
  // Set up event handlers
  const setupEventHandlers = (vapi) => {
    const button = document.getElementById('doorbell-widget-button');
    const panel = document.getElementById('doorbell-widget-panel');
    const closeBtn = document.getElementById('doorbell-close-btn');
    const startBtn = document.getElementById('doorbell-start-btn');
    
    let isOpen = false;
    let isCallActive = false;
    
    // Toggle panel
    button.addEventListener('click', () => {
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'flex' : 'none';
      
      if (isOpen) {
        sendToWebhook({ type: 'widget_opened' });
      }
    });
    
    // Close panel
    closeBtn.addEventListener('click', () => {
      isOpen = false;
      panel.style.display = 'none';
      
      if (isCallActive) {
        endCall();
      }
      
      sendToWebhook({ type: 'widget_closed' });
    });
    
    // Start/Stop conversation
    startBtn.addEventListener('click', () => {
      if (isCallActive) {
        endCall();
      } else {
        startCall();
      }
    });
    
    const startCall = async () => {
      try {
        updateStatus('connecting', 'Connecting...');
        
        await vapi.start(CONFIG.assistantId);
        isCallActive = true;
        
        startBtn.textContent = 'End Voice Chat';
        startBtn.style.background = '#ef4444';
        
        sendToWebhook({ type: 'call_started' });
        
      } catch (error) {
        console.error('Failed to start call:', error);
        updateStatus('error', 'Connection Failed');
        addMessage('Failed to start voice chat. Please check your microphone permissions and try again.', 'assistant');
      }
    };
    
    const endCall = () => {
      if (vapi && isCallActive) {
        vapi.stop();
        isCallActive = false;
        
        startBtn.textContent = 'Start Voice Chat';
        startBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        updateStatus('idle', 'Ready to Listen');
        
        sendToWebhook({ type: 'call_ended' });
      }
    };
  };
  
  // Initialize everything
  const init = async () => {
    try {
      console.log('Initializing Doorbell Voice Widget...');
      
      // Create widget UI
      createWidget();
      
      // Initialize VAPI
      const vapi = await initializeVapi();
      
      // Set up event handlers
      setupEventHandlers(vapi);
      
      console.log('Doorbell Voice Widget initialized successfully');
      
      // Send initial load event
      sendToWebhook({
        type: 'widget_loaded',
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });
      
    } catch (error) {
      console.error('Failed to initialize Doorbell Voice Widget:', error);
      
      // Show error state
      const widget = document.getElementById('doorbell-voice-widget');
      if (widget) {
        updateStatus('error', 'Failed to Load');
        addMessage('Voice assistant failed to load. Please refresh the page and try again.', 'assistant');
      }
    }
  };
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();