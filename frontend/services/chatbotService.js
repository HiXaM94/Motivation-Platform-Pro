/**
 * Chatbot Service
 * 
 * Frontend service for interacting with the chatbot proxy endpoint.
 * Sends user messages to the server and receives AI-generated responses.
 * 
 * Usage:
 *   import { sendMessage, sendMessageWithHistory } from './services/chatbotService.js';
 *   
 *   const response = await sendMessage("Help me stay motivated");
 *   console.log(response.response); // AI response text
 *   console.log(response.mock); // true if using mock data
 */

/**
 * Base API URL - can be configured via environment or defaults to relative path
 */
const API_BASE_URL = window.location.origin;

/**
 * Send a message to the chatbot
 * 
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Response object with { success, response, mock, notice? }
 */
export async function sendMessage(message) {
  return sendMessageWithHistory(message, []);
}

/**
 * Send a message with conversation history
 * 
 * @param {string} message - The user's message
 * @param {Array<Object>} conversationHistory - Array of previous messages [{role: 'user'|'assistant', content: string}]
 * @returns {Promise<Object>} Response object with { success, response, mock, notice? }
 */
export async function sendMessageWithHistory(message, conversationHistory = []) {
  try {
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Call the chatbot proxy endpoint
    const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message.trim(),
        conversationHistory
      })
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to get response from chatbot');
    }

    return data;

  } catch (error) {
    console.error('Chatbot service error:', error);
    
    // Return a fallback response on network error
    return {
      success: false,
      response: "I'm having trouble connecting right now. Please try again in a moment.",
      mock: true,
      error: error.message
    };
  }
}

/**
 * Check if chatbot is using mock responses
 * 
 * @returns {Promise<boolean>} True if using mock responses
 */
export async function isMockMode() {
  try {
    const response = await sendMessage("test");
    return response.mock === true;
  } catch (error) {
    return true; // Assume mock mode on error
  }
}

/**
 * Get chatbot status information
 * 
 * @returns {Promise<Object>} Status object with { available, mock, notice? }
 */
export async function getChatbotStatus() {
  try {
    const testResponse = await sendMessage("ping");
    return {
      available: testResponse.success,
      mock: testResponse.mock,
      notice: testResponse.notice
    };
  } catch (error) {
    return {
      available: false,
      mock: true,
      notice: 'Chatbot service is currently unavailable'
    };
  }
}

// Export default object for convenience
export default {
  sendMessage,
  sendMessageWithHistory,
  isMockMode,
  getChatbotStatus
};
