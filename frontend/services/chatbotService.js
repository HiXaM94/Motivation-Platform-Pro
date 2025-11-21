/**
 * Chatbot Service
 * 
 * Frontend service for communicating with the chatbot API endpoint.
 * Handles all chatbot-related API calls and conversation management.
 */

class ChatbotService {
  constructor() {
    this.apiEndpoint = '/api/chatbot';
    this.conversationHistory = [];
    this.maxHistoryLength = 10; // Keep last 10 messages for context
  }

  /**
   * Send a message to the chatbot
   * @param {string} message - User's message text
   * @param {boolean} includeHistory - Whether to include conversation history
   * @returns {Promise<Object>} Response from the API
   */
  async sendMessage(message, includeHistory = true) {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    try {
      const requestBody = {
        message: message.trim(),
        conversationHistory: includeHistory ? this.conversationHistory : []
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Add to conversation history if successful
      if (includeHistory) {
        this.addToHistory('user', message);
        this.addToHistory('assistant', data.response);
      }

      return {
        success: true,
        response: data.response,
        model: data.model,
        warning: data.warning,
        usage: data.usage
      };

    } catch (error) {
      console.error('Chatbot service error:', error);
      return {
        success: false,
        error: error.message,
        response: 'Sorry, I encountered an error. Please try again later.'
      };
    }
  }

  /**
   * Add a message to conversation history
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content
    });

    // Keep only the most recent messages
    if (this.conversationHistory.length > this.maxHistoryLength * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get current conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Export conversation history
   * @returns {string} JSON string of conversation history
   */
  exportHistory() {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      messages: this.conversationHistory
    }, null, 2);
  }

  /**
   * Import conversation history
   * @param {string} jsonString - JSON string of conversation history
   * @returns {boolean} Success status
   */
  importHistory(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.messages && Array.isArray(data.messages)) {
        this.conversationHistory = data.messages;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * Get quick reply suggestions based on context
   * @returns {Array<string>} Array of suggested quick replies
   */
  getQuickReplies() {
    // TODO: Implement smart quick replies based on conversation context in follow-up PR
    return [
      "Tell me more",
      "How can I start?",
      "Give me an example",
      "What's the next step?"
    ];
  }
}

// Create and export a singleton instance
const chatbotService = new ChatbotService();

// For ES6 modules
export default chatbotService;

// For CommonJS (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = chatbotService;
}
