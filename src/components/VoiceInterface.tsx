import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, AlertCircle, PhoneOff } from 'lucide-react';

interface VoiceInterfaceProps {
  onMessage: (message: string) => void;
  status: 'idle' | 'listening' | 'thinking' | 'error';
  onStatusChange: (status: 'idle' | 'listening' | 'thinking' | 'error') => void;
  isInCall: boolean;
  onCallEnd: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onMessage, 
  status, 
  onStatusChange, 
  isInCall, 
  onCallEnd 
}) => {
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [vapiElement, setVapiElement] = useState<any>(null);
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Check if voice is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsVoiceSupported(false);
      return;
    }

    // Find and initialize the VAPI custom element
    const initializeVapiWidget = () => {
      const element = document.querySelector('vapi-assistant') as any;
      
      if (element) {
        console.log('VAPI widget found');
        setVapiElement(element);
        
        // Check if the widget is ready
        if (element.start && typeof element.start === 'function') {
          console.log('VAPI widget is ready');
          setIsVapiLoaded(true);
          setupVapiListeners(element);
        } else {
          console.log('VAPI widget found but not ready, waiting...');
          // Widget exists but not fully loaded, try again
          setTimeout(initializeVapiWidget, 1000);
        }
      } else {
        console.log('VAPI element not found, retrying...');
        setTimeout(initializeVapiWidget, 1000);
      }
    };

    // Start checking for VAPI widget after a short delay
    const timer = setTimeout(initializeVapiWidget, 500);
    return () => clearTimeout(timer);
  }, []);

  const setupVapiListeners = (element: any) => {
    console.log('Setting up VAPI event listeners');

    try {
      // Handle call start
      const handleCallStart = (event: any) => {
        console.log('VAPI call started', event);
        onStatusChange('listening');
      };

      // Handle call end
      const handleCallEnd = (event: any) => {
        console.log('VAPI call ended', event);
        onStatusChange('idle');
        onCallEnd();
      };

      // Handle messages/transcripts
      const handleMessage = (event: any) => {
        console.log('VAPI message received:', event);
        const data = event.detail || event.data || event;
        
        if (data && data.type === 'transcript' && data.transcriptType === 'final') {
          onMessage(data.transcript);
        }
      };

      // Handle speech events
      const handleSpeechStart = (event: any) => {
        console.log('User started speaking', event);
        onStatusChange('listening');
      };

      const handleSpeechEnd = (event: any) => {
        console.log('User stopped speaking', event);
        onStatusChange('thinking');
      };

      // Handle errors
      const handleError = (event: any) => {
        console.error('VAPI error:', event);
        onStatusChange('error');
      };

      // Add event listeners with multiple possible event names
      const eventMappings = [
        ['call-start', 'callstart', 'callStarted'],
        ['call-end', 'callend', 'callEnded'],
        ['message', 'transcript', 'transcriptReceived'],
        ['speech-start', 'speechstart', 'speechStarted'],
        ['speech-end', 'speechend', 'speechEnded'],
        ['error', 'vapiError']
      ];

      const handlers = [handleCallStart, handleCallEnd, handleMessage, handleSpeechStart, handleSpeechEnd, handleError];

      eventMappings.forEach((events, index) => {
        events.forEach(eventName => {
          try {
            element.addEventListener(eventName, handlers[index]);
          } catch (e) {
            // Ignore if event doesn't exist
          }
        });
      });
      
      console.log('VAPI event listeners attached successfully');
    } catch (error) {
      console.error('Error setting up VAPI listeners:', error);
    }
  };

  // Auto-start call when component mounts and isInCall is true
  useEffect(() => {
    if (isInCall && vapiElement && isVapiLoaded && permissionGranted) {
      startVoiceCall();
    }
  }, [isInCall, vapiElement, isVapiLoaded, permissionGranted]);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      console.log('Requesting microphone permission...');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Microphone permission granted');
      setPermissionGranted(true);
      setMicStream(stream);
      
      // Keep the stream active for VAPI to use
      // Don't stop it immediately as VAPI needs access
      
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
      onStatusChange('error');
      return false;
    }
  };

  const startVoiceCall = async () => {
    console.log('Starting voice call...', { vapiElement, isVapiLoaded, permissionGranted });
    
    if (!vapiElement || !isVapiLoaded) {
      console.error('VAPI widget not ready');
      onStatusChange('error');
      return;
    }
    
    // Request microphone permission if not already granted
    if (permissionGranted !== true) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        console.error('Microphone permission required');
        return;
      }
    }

    try {
      console.log('Starting VAPI call via widget...');
      onStatusChange('listening');
      
      // Call the start method on the VAPI widget
      if (typeof vapiElement.start === 'function') {
        await vapiElement.start();
        console.log('VAPI call started successfully');
      } else {
        console.error('VAPI widget start method not available');
        onStatusChange('error');
      }
    } catch (error) {
      console.error('Failed to start VAPI call:', error);
      onStatusChange('error');
    }
  };

  const stopVoiceCall = () => {
    console.log('Stopping voice call...');
    
    if (vapiElement) {
      try {
        if (typeof vapiElement.stop === 'function') {
          vapiElement.stop();
        } else if (typeof vapiElement.end === 'function') {
          vapiElement.end();
        }
        console.log('VAPI call stopped successfully');
      } catch (error) {
        console.error('Error stopping VAPI call:', error);
      }
    }

    // Clean up microphone stream
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
    }

    onCallEnd();
  };

  // Check for mobile/low-mic devices
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  if (!isVoiceSupported) {
    return (
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="text-center py-6 sm:py-8">
          <AlertCircle className="mx-auto mb-3 text-gray-400" size={28} />
          <p className="text-sm text-gray-500">Voice input is not supported on this device.</p>
          <p className="text-xs text-gray-400 mt-1">Please use text input instead.</p>
        </div>
      </div>
    );
  }

  if (!isVapiLoaded) {
    return (
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="text-center py-6 sm:py-8">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading voice system...</p>
          <p className="text-xs text-gray-400 mt-1">Preparing audio connection</p>
        </div>
      </div>
    );
  }

  if (permissionGranted === false) {
    return (
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="text-center py-6 sm:py-8">
          <MicOff className="mx-auto mb-3 text-red-400" size={28} />
          <p className="text-sm text-gray-500 mb-3">Microphone access required</p>
          {isMobileDevice() && (
            <p className="text-xs text-gray-400 mb-3">
              On mobile devices, please ensure microphone permissions are enabled in your browser settings.
            </p>
          )}
          <button
            onClick={requestMicrophonePermission}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enable Microphone
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="text-center py-6 sm:py-8">
        {/* Animated Voice Indicator */}
        <div className="relative mb-4 sm:mb-6">
          <motion.div
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center relative"
            animate={{
              backgroundColor: 
                status === 'listening' ? '#10B981' :
                status === 'thinking' ? '#3B82F6' :
                status === 'error' ? '#EF4444' : '#6B7280'
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Ripple Effect for Listening */}
            {status === 'listening' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-400"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 0, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />
              </>
            )}
            
            {/* Thinking Animation */}
            {status === 'thinking' && (
              <motion.div
                className="absolute inset-0 rounded-full border-3 sm:border-4 border-blue-300 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
            
            <motion.div
              animate={{
                scale: status === 'listening' ? 1.1 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {status === 'error' ? (
                <AlertCircle size={24} className="text-white sm:w-8 sm:h-8" />
              ) : (
                <Mic size={24} className="text-white sm:w-8 sm:h-8" />
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Status Text */}
        <motion.p
          className="text-sm font-medium mb-4"
          animate={{
            color: 
              status === 'listening' ? '#10B981' :
              status === 'thinking' ? '#3B82F6' :
              status === 'error' ? '#EF4444' : '#6B7280'
          }}
        >
          {status === 'idle' && isInCall && 'Connected - Speak now'}
          {status === 'listening' && 'Listening...'}
          {status === 'thinking' && 'Processing your message...'}
          {status === 'error' && 'Voice unavailable - try text input'}
        </motion.p>

        {/* Manual Start Button (if not in call yet) */}
        {!isInCall && permissionGranted && (
          <button
            onClick={startVoiceCall}
            className="mb-4 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 mx-auto focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Mic size={14} className="sm:w-4 sm:h-4" />
            <span>Start Voice Call</span>
          </button>
        )}

        {/* End Call Button */}
        {isInCall && (
          <button
            onClick={stopVoiceCall}
            disabled={status === 'thinking' || status === 'error'}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <PhoneOff size={14} className="sm:w-4 sm:h-4" />
            <span>End Call</span>
          </button>
        )}

        {/* Call Status */}
        {isInCall && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600">
              🟢 Voice call active - Speak naturally and I'll respond
            </p>
            {isMobileDevice() && (
              <p className="text-xs text-green-500 mt-1">
                📱 Mobile optimized - Hold device close to mouth for best results
              </p>
            )}
          </div>
        )}

        {/* Permission Status */}
        {permissionGranted && !isInCall && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              🎤 Microphone ready - Click the phone button above to start a voice call
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInterface;