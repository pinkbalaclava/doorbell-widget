import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, MicOff, Send, X, User, Bot, Phone, PhoneOff, Calendar } from 'lucide-react';
import VoiceInterface from './VoiceInterface';
import ContactForm from './ContactForm';
import { capturePageContent, sendToGPT } from '../utils/visionUtils';
import { checkForInterest } from '../utils/nlpUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ContactDetails {
  name: string;
  phone: string;
  urgency: string;
}

type Mode = 'text' | 'voice';
type Status = 'idle' | 'listening' | 'thinking' | 'error';

const GPTVisionAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('text');
  const [status, setStatus] = useState<Status>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [hasInitialVisionCall, setHasInitialVisionCall] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Call vision webhook on page load
  useEffect(() => {
    const initializeVision = async () => {
      if (!hasInitialVisionCall) {
        try {
          console.log('Initializing vision analysis on page load...');
          
          // Capture page content for initial vision analysis
          const pageData = await capturePageContent();
          
          // Send initial vision data to webhook
          const formData = new FormData();
          formData.append('message', 'INITIAL_PAGE_LOAD');
          formData.append('url', pageData.url);
          formData.append('conversationHistory', JSON.stringify([]));
          formData.append('pageHtml', pageData.textContent);
          
          if (pageData.screenshot) {
            // Convert base64 to blob
            const byteCharacters = atob(pageData.screenshot.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            formData.append('screenshot', blob, 'screenshot.jpg');
          }

          const response = await fetch('https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            console.log('Initial vision analysis completed successfully');
            setHasInitialVisionCall(true);
          } else {
            console.error('Initial vision analysis failed:', response.status);
          }
        } catch (error) {
          console.error('Error during initial vision analysis:', error);
        }
      }
    };

    // Wait a moment for the page to fully load before capturing
    const timer = setTimeout(initializeVision, 1000);
    return () => clearTimeout(timer);
  }, [hasInitialVisionCall]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Check if user expressed interest
    if (role === 'user' && checkForInterest(content)) {
      setTimeout(() => setShowContactForm(true), 1000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, 'user');
    setIsLoading(true);
    setStatus('thinking');

    try {
      // Capture page content for vision analysis
      const pageData = await capturePageContent();
      
      // Send to GPT with vision
      const response = await sendToGPT(userMessage, messages, pageData);
      
      // Simulate typing delay for realism
      setTimeout(() => {
        addMessage(response, 'assistant');
        setIsLoading(false);
        setStatus('idle');
      }, 800);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get response. Please try again.');
      addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      setIsLoading(false);
      setStatus('idle');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceMessage = (message: string) => {
    addMessage(message, 'user');
    // Process voice message same as text
    handleSendMessage();
  };

  const handleCallToggle = () => {
    if (isInCall) {
      // End the call
      setIsInCall(false);
      setMode('text');
      setStatus('idle');
    } else {
      // Start the call
      setIsInCall(true);
      setMode('voice');
      // Don't set status to listening immediately - let VoiceInterface handle it
    }
  };

  const handleContactSubmit = async (contactDetails: ContactDetails) => {
    try {
      const payload = {
        ...contactDetails,
        pageUrl: window.location.href,
        messages: messages.slice(-5), // Last 5 messages for context
        timestamp: new Date().toISOString()
      };

      await fetch('https://hook.eu2.make.com/owvd7lsneuxgx6xve56vzcw5shyymvew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      addMessage('Thank you! Your details have been submitted. Someone will contact you shortly.', 'assistant');
      setShowContactForm(false);
    } catch (error) {
      console.error('Error submitting contact details:', error);
      addMessage('Sorry, there was an error submitting your details. Please try again.', 'assistant');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col"
          >
            {/* Header - Fixed at top */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Doorbell Assistant</h3>
                  <p className="text-xs text-blue-100">
                    {status === 'thinking' ? 'Thinking...' : 
                     status === 'listening' ? 'Listening...' : 
                     isInCall ? 'In Call' :
                     hasInitialVisionCall ? 'Ready to help' : 'Analyzing page...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCallToggle}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isInCall 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200' 
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-200'
                  }`}
                >
                  {isInCall ? <PhoneOff size={16} /> : <Phone size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area - Flexible center section */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot size={32} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Hi! I can help you with questions about properties on this page.</p>
                  <p className="text-xs mt-1">Try asking about pricing, features, or booking a viewing.</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600">
                      💡 Click the <Phone size={12} className="inline mx-1" /> button above to start a voice call
                    </p>
                  </div>
                  {!hasInitialVisionCall && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-600">
                        🔍 Analyzing page content for better assistance...
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-blue-500 ml-2' : 'bg-gray-400 mr-2'
                    }`}>
                      {message.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-white" />}
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white rounded-tr-md' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-md shadow-sm'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center mr-2">
                      <Bot size={12} className="text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0">
              {mode === 'text' ? (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about properties, pricing, or book a viewing..."
                        className="w-full resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24"
                        rows={1}
                        style={{ minHeight: '40px' }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <VoiceInterface
                  onMessage={handleVoiceMessage}
                  status={status}
                  onStatusChange={setStatus}
                  isInCall={isInCall}
                  onCallEnd={() => {
                    setIsInCall(false);
                    setMode('text');
                    setStatus('idle');
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <ContactForm
            onSubmit={handleContactSubmit}
            onClose={() => setShowContactForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default GPTVisionAssistant;