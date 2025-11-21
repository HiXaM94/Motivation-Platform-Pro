/**
 * Chatbot Service
 * 
 * Frontend service wrapper for chatbot API proxy.
 * Handles communication with POST /api/chatbot endpoint.
 */

class ChatbotService {
    constructor(baseUrl = '', options = {}) {
        // Use relative path if no baseUrl provided (works for same-origin)
        // For different origins, set baseUrl to server URL
        this.baseUrl = baseUrl;
        this.conversationHistory = [];
        // Allow configurable history limit, default to 20 messages (10 exchanges)
        this.maxHistoryLength = options.maxHistoryLength || 20;
    }

    /**
     * Send a message to the chatbot
     * 
     * @param {string} message - User message
     * @param {boolean} includeHistory - Whether to include conversation history
     * @returns {Promise<Object>} Response from chatbot
     */
    async sendMessage(message, includeHistory = true) {
        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new Error('Message must be a non-empty string');
        }

        try {
            const requestBody = {
                message: message.trim(),
                conversationHistory: includeHistory ? this.conversationHistory : []
            };

            const response = await fetch(`${this.baseUrl}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Update conversation history if successful
            if (data.success && includeHistory) {
                this.conversationHistory.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: data.response }
                );

                // Limit history to configured max length
                if (this.conversationHistory.length > this.maxHistoryLength) {
                    this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
                }
            }

            return data;

        } catch (error) {
            console.error('[Chatbot Service] Error:', error);
            throw error;
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
     * 
     * @returns {Array} Conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Set conversation history (useful for restoring sessions)
     * 
     * @param {Array} history - Conversation history to set
     */
    setHistory(history) {
        if (!Array.isArray(history)) {
            throw new Error('History must be an array');
        }
        this.conversationHistory = [...history];
    }
}

// Export for ES6 modules
export default ChatbotService;

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotService;
}
