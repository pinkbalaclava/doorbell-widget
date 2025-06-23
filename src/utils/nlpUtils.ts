// Simple NLP utilities for detecting user intent

const INTEREST_KEYWORDS = [
  'interested', 'viewing', 'visit', 'see', 'tour', 'appointment',
  'book', 'schedule', 'arrange', 'contact', 'call', 'phone',
  'details', 'info', 'information', 'more', 'tell me more',
  'price', 'cost', 'available', 'when', 'how much'
];

const CONTACT_KEYWORDS = [
  'contact', 'call', 'phone', 'email', 'reach', 'get in touch',
  'speak to', 'talk to', 'agent', 'seller', 'owner'
];

export const checkForInterest = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  
  // Check for direct interest expressions
  const hasInterestKeyword = INTEREST_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Check for contact-related requests
  const hasContactKeyword = CONTACT_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Check for question patterns that suggest interest
  const questionPatterns = [
    /can i (see|visit|view|tour)/,
    /when (can|could) i/,
    /how do i (contact|reach|get in touch)/,
    /who (can|should) i (contact|call|speak to)/,
    /what.*price/,
    /how much/,
    /is it available/,
    /still available/
  ];
  
  const hasQuestionPattern = questionPatterns.some(pattern => 
    pattern.test(lowerMessage)
  );
  
  return hasInterestKeyword || hasContactKeyword || hasQuestionPattern;
};

export const extractContactIntent = (message: string): {
  wantsViewing: boolean;
  wantsContact: boolean;
  urgency: 'high' | 'medium' | 'low';
} => {
  const lowerMessage = message.toLowerCase();
  
  const wantsViewing = /view|visit|see|tour|appointment|schedule/.test(lowerMessage);
  const wantsContact = /contact|call|phone|email|reach|agent/.test(lowerMessage);
  
  let urgency: 'high' | 'medium' | 'low' = 'medium';
  
  if (/asap|urgent|soon|today|tomorrow|this week/.test(lowerMessage)) {
    urgency = 'high';
  } else if (/flexible|sometime|eventually|later/.test(lowerMessage)) {
    urgency = 'low';
  }
  
  return { wantsViewing, wantsContact, urgency };
};