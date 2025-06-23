import html2canvas from 'html2canvas';

export interface PageData {
  url: string;
  title: string;
  screenshot?: string;
  textContent: string;
  timestamp: string;
}

export const capturePageContent = async (): Promise<PageData> => {
  try {
    // Capture screenshot
    let screenshot: string | undefined;
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 0.5, // Reduce size for faster processing
        height: window.innerHeight,
        scrollX: 0,
        scrollY: 0
      });
      screenshot = canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.warn('Failed to capture screenshot:', error);
    }

    // Extract text content
    const textContent = extractPageText();

    return {
      url: window.location.href,
      title: document.title,
      screenshot,
      textContent,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error capturing page content:', error);
    throw new Error('Failed to capture page content');
  }
};

const extractPageText = (): string => {
  // Remove script and style elements
  const clonedDoc = document.cloneNode(true) as Document;
  const scripts = clonedDoc.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());

  // Get text content and clean it up
  let text = clonedDoc.body?.textContent || '';
  
  // Clean up whitespace and formatting
  text = text
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();

  // Limit text length to avoid token limits
  if (text.length > 5000) {
    text = text.substring(0, 5000) + '...';
  }

  return text;
};

export const sendToGPT = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  pageData: PageData
): Promise<string> => {
  try {
    const payload = {
      message,
      conversationHistory: JSON.stringify(conversationHistory.slice(-5)), // Last 5 messages
      pageHtml: pageData.textContent,
      url: pageData.url,
      screenshot: pageData.screenshot ? {
        data: pageData.screenshot.split(',')[1], // Remove data:image/jpeg;base64, prefix
        filename: 'screenshot.jpg'
      } : undefined
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'screenshot' && typeof value === 'object') {
          // Convert base64 to blob for screenshot
          const byteCharacters = atob(value.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          formData.append('screenshot', blob, 'screenshot.jpg');
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const response = await fetch('https://hook.eu2.make.com/vi3b8idpjq4hsyk8n1gqu1ywf6iutku3', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    return result || 'I apologize, but I encountered an issue processing your request. Please try asking your question again.';
    
  } catch (error) {
    console.error('Error sending to GPT:', error);
    throw new Error('Failed to get AI response');
  }
};