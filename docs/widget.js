(function() {
  'use strict';

  if (window.DoorbellVoiceWidget) {
    console.log('Doorbell Voice Widget already loaded');
    return;
  }
  window.DoorbellVoiceWidget = true;

  const CONFIG = {
    apiKey: 'ea8d1f1c-1934-4892-a079-174123957cf1',
    assistantId: 'd93608e2-7901-4102-94f4-50aecb52a2e6',
    webhookUrl: 'https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3',
    voice: 'openai'
  };

  const loadVapiSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.Vapi) {
        resolve(window.Vapi);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@vapi-ai/web@latest/dist/vapi.umd.js';
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

  // Add the rest of your widget.js code (createWidget, addMessage, updateStatus, sendToWebhook, initializeVapi, etc.) below

  // For example:
  const createWidget = () => {
    console.log("Widget scaffold goes here...");
    // Insert the rest of your implementation
  };

  const init = async () => {
    try {
      console.log('Initializing Doorbell Voice Widget...');
      createWidget();
      const vapi = await loadVapiSDK();
      console.log('VAPI loaded successfully:', vapi);
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
