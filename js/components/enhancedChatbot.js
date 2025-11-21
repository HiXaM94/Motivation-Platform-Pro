/**
 * EnhancedChatbot - Interactive chatbot with rich messages, quick replies, and smart responses
 */
class EnhancedChatbot {
    constructor(options = {}) {
        this.container = options.container;
        this.messagesContainer = options.messagesContainer;
        this.inputElement = options.inputElement;
        this.onMessage = options.onMessage || (() => {});
        
        this.conversationHistory = [];
        this.quickReplies = this.getDefaultQuickReplies();
        this.isTyping = false;
    }

    /**
     * Send user message and get bot response
     */
    async sendMessage(text) {
        if (!text || this.isTyping) return;
        
        // Add user message
        this.addMessage({
            type: 'user',
            text: text,
            timestamp: new Date().toISOString()
        });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate response with delay
        await this.delay(800 + Math.random() * 700);
        
        const response = this.generateResponse(text);
        this.hideTypingIndicator();
        
        // Add bot response
        this.addMessage(response);
        
        // Update conversation history
        this.conversationHistory.push({
            user: text,
            bot: response,
            timestamp: new Date().toISOString()
        });
        
        this.onMessage(text, response);
    }

    /**
     * Add message to chat (supports rich content)
     */
    addMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${message.type}-message`;
        
        if (message.type === 'user') {
            messageEl.innerHTML = this.renderUserMessage(message);
        } else {
            messageEl.innerHTML = this.renderBotMessage(message);
        }
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(messageEl);
            this.scrollToBottom();
        }
        
        return messageEl;
    }

    /**
     * Render user message
     */
    renderUserMessage(message) {
        return `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${Utils.escapeHtml(message.text)}</p>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;
    }

    /**
     * Render bot message with rich content support
     */
    renderBotMessage(message) {
        let content = '';
        
        // Handle rich message cards
        if (message.richCard) {
            content = this.renderRichCard(message.richCard);
        }
        // Handle video embeds
        else if (message.videoId) {
            content = this.renderVideoEmbed(message);
        }
        // Handle image
        else if (message.image) {
            content = this.renderImageMessage(message);
        }
        // Handle link preview
        else if (message.link) {
            content = this.renderLinkPreview(message);
        }
        // Regular text message
        else {
            content = `<p>${this.formatText(message.text)}</p>`;
        }
        
        // Add quick replies if present
        let quickRepliesHtml = '';
        if (message.quickReplies && message.quickReplies.length > 0) {
            quickRepliesHtml = this.renderQuickReplies(message.quickReplies);
        }
        
        return `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                ${content}
                ${quickRepliesHtml}
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;
    }

    /**
     * Render rich card with title, description, image, and CTA
     */
    renderRichCard(card) {
        return `
            <div class="rich-card">
                ${card.image ? `<img src="${card.image}" alt="${Utils.escapeHtml(card.title)}" class="rich-card-image">` : ''}
                <div class="rich-card-content">
                    <h4 class="rich-card-title">${Utils.escapeHtml(card.title)}</h4>
                    <p class="rich-card-description">${Utils.escapeHtml(card.description)}</p>
                    ${card.cta ? `
                        <button class="rich-card-cta" data-action="${card.cta.action}" data-value="${card.cta.value || ''}">
                            ${card.cta.icon ? `<i class="fas fa-${card.cta.icon}"></i>` : ''}
                            ${Utils.escapeHtml(card.cta.text)}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render video embed (YouTube)
     */
    renderVideoEmbed(message) {
        return `
            <div class="video-embed">
                <iframe 
                    width="100%" 
                    height="200" 
                    src="https://www.youtube.com/embed/${message.videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                ></iframe>
                ${message.text ? `<p class="video-caption">${Utils.escapeHtml(message.text)}</p>` : ''}
            </div>
        `;
    }

    /**
     * Render image message
     */
    renderImageMessage(message) {
        return `
            <div class="image-message">
                <img src="${message.image}" alt="${Utils.escapeHtml(message.text || 'Image')}" class="message-image">
                ${message.text ? `<p class="image-caption">${Utils.escapeHtml(message.text)}</p>` : ''}
            </div>
        `;
    }

    /**
     * Render link preview
     */
    renderLinkPreview(message) {
        return `
            <div class="link-preview">
                <a href="${message.link.url}" target="_blank" rel="noopener noreferrer" class="link-preview-card">
                    ${message.link.image ? `<img src="${message.link.image}" alt="Preview" class="link-preview-image">` : ''}
                    <div class="link-preview-content">
                        <h5 class="link-preview-title">${Utils.escapeHtml(message.link.title)}</h5>
                        <p class="link-preview-description">${Utils.escapeHtml(message.link.description)}</p>
                        <span class="link-preview-url">${Utils.escapeHtml(new URL(message.link.url).hostname)}</span>
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * Render quick reply buttons
     */
    renderQuickReplies(replies) {
        return `
            <div class="quick-replies">
                ${replies.map(reply => `
                    <button class="quick-reply-btn" data-reply="${Utils.escapeHtml(reply.value || reply.text)}">
                        ${reply.icon ? `<i class="fas fa-${reply.icon}"></i>` : ''}
                        ${Utils.escapeHtml(reply.text)}
                    </button>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate intelligent response based on user input
     */
    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const timestamp = new Date().toISOString();
        
        // Intent detection
        if (this.matchesIntent(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
            return {
                type: 'bot',
                text: "Hello! 👋 I'm your Motivation Assistant. I'm here to help you stay motivated, track your progress, and achieve your goals!",
                timestamp,
                quickReplies: [
                    { text: 'Set a goal', value: 'set goal', icon: 'bullseye' },
                    { text: 'Get inspired', value: 'show inspiration', icon: 'fire' },
                    { text: 'Start daily journey', value: 'daily journey', icon: 'book' },
                    { text: 'Export my data', value: 'export data', icon: 'download' }
                ]
            };
        }
        
        if (this.matchesIntent(lowerMessage, ['goal', 'objective', 'set goal'])) {
            return {
                type: 'bot',
                richCard: {
                    title: 'Goal Setting',
                    description: 'Setting clear goals is the first step to success. Let\'s create a goal that\'s specific, measurable, and achievable!',
                    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80',
                    cta: {
                        text: 'Create Goal',
                        action: 'create_goal',
                        icon: 'plus-circle'
                    }
                },
                timestamp,
                quickReplies: [
                    { text: 'View my goals', value: 'show goals', icon: 'list' },
                    { text: 'Goal tips', value: 'goal tips', icon: 'lightbulb' }
                ]
            };
        }
        
        if (this.matchesIntent(lowerMessage, ['motivation', 'inspire', 'inspiration'])) {
            return {
                type: 'bot',
                text: "You've got this! 💪 Remember, every small step forward is progress. Keep pushing, keep believing!",
                timestamp,
                quickReplies: [
                    { text: 'Show inspirational videos', value: 'show videos', icon: 'play-circle' },
                    { text: 'Get a quote', value: 'quote', icon: 'quote-left' },
                    { text: 'Daily challenge', value: 'challenge', icon: 'trophy' }
                ]
            };
        }
        
        if (this.matchesIntent(lowerMessage, ['stress', 'anxious', 'worried', 'overwhelmed'])) {
            return {
                type: 'bot',
                richCard: {
                    title: 'Managing Stress',
                    description: 'Take a deep breath. You\'re stronger than you think. Here are some techniques to help you relax and refocus.',
                    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
                    cta: {
                        text: 'Start Breathing Exercise',
                        action: 'breathing_exercise',
                        icon: 'wind'
                    }
                },
                timestamp,
                quickReplies: [
                    { text: 'Start focus timer', value: 'focus timer', icon: 'clock' },
                    { text: 'Journal my thoughts', value: 'journal', icon: 'pen' }
                ]
            };
        }
        
        if (this.matchesIntent(lowerMessage, ['daily', 'journey', 'checklist', 'tasks'])) {
            return {
                type: 'bot',
                text: "Great! Your daily journey helps you build consistency and track your progress. Let's make today count! 🌟",
                timestamp,
                quickReplies: [
                    { text: 'View today\'s checklist', value: 'show checklist', icon: 'check-square' },
                    { text: 'Track my mood', value: 'track mood', icon: 'smile' },
                    { text: 'View my streak', value: 'show streak', icon: 'fire' }
                ]
            };
        }
        
        if (this.matchesIntent(lowerMessage, ['export', 'backup', 'download', 'save data'])) {
            return {
                type: 'bot',
                richCard: {
                    title: 'Export Your Data',
                    description: 'Download a complete backup of your goals, journal entries, and progress. Your data stays private and secure.',
                    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
                    cta: {
                        text: 'Export Now',
                        action: 'export_data',
                        icon: 'download'
                    }
                },
                timestamp,
                quickReplies: [
                    { text: 'Import data', value: 'import data', icon: 'upload' },
                    { text: 'View backups', value: 'show backups', icon: 'database' }
                ]
            };
        }
        
        if (this.matchesIntent(lowerMessage, ['video', 'watch', 'youtube'])) {
            // Return a sample motivational video
            return {
                type: 'bot',
                text: "Here's an inspiring video to fuel your motivation!",
                videoId: 'dQw4w9WgXcQ', // Mock YouTube ID
                timestamp
            };
        }
        
        if (this.matchesIntent(lowerMessage, ['help', 'what can you do', 'features'])) {
            return {
                type: 'bot',
                text: "I can help you with:\n\n📌 Goal setting and tracking\n🔥 Daily inspiration and motivation\n📝 Journaling and mood tracking\n✅ Daily checklists and streaks\n📊 Progress analytics\n💾 Data export and backup\n\nWhat would you like to do?",
                timestamp,
                quickReplies: this.getDefaultQuickReplies()
            };
        }
        
        // Default response
        return {
            type: 'bot',
            text: "I'm here to support your journey! 😊 How can I help you stay motivated and productive today?",
            timestamp,
            quickReplies: this.getDefaultQuickReplies()
        };
    }

    /**
     * Check if message matches any intent keywords
     */
    matchesIntent(message, keywords) {
        return keywords.some(keyword => message.includes(keyword.toLowerCase()));
    }

    /**
     * Get default quick reply options
     */
    getDefaultQuickReplies() {
        return [
            { text: 'Set a goal', value: 'set goal', icon: 'bullseye' },
            { text: 'Get inspired', value: 'show inspiration', icon: 'fire' },
            { text: 'Daily journey', value: 'daily journey', icon: 'book' },
            { text: 'Export data', value: 'export data', icon: 'download' }
        ];
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-message bot-message typing-message';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(typingEl);
            this.scrollToBottom();
        }
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
            typingEl.remove();
        }
    }

    /**
     * Format text with basic markdown-like formatting
     */
    formatText(text) {
        // Convert newlines to <br>
        text = Utils.escapeHtml(text).replace(/\n/g, '<br>');
        
        // Bold: **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic: *text*
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return text;
    }

    /**
     * Format timestamp
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
        }
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear conversation
     */
    clearConversation() {
        this.conversationHistory = [];
        if (this.messagesContainer) {
            // Keep only the welcome message
            const messages = this.messagesContainer.querySelectorAll('.chat-message');
            messages.forEach((msg, index) => {
                if (index > 0) msg.remove();
            });
        }
    }

    /**
     * Handle CTA button clicks
     */
    handleCtaClick(action, value) {
        const handlers = {
            create_goal: () => {
                // Trigger goal creation UI
                const event = new CustomEvent('chatbot:action', { 
                    detail: { action: 'create_goal' }
                });
                document.dispatchEvent(event);
            },
            export_data: () => {
                const event = new CustomEvent('chatbot:action', { 
                    detail: { action: 'export_data' }
                });
                document.dispatchEvent(event);
            },
            breathing_exercise: () => {
                const event = new CustomEvent('chatbot:action', { 
                    detail: { action: 'breathing_exercise' }
                });
                document.dispatchEvent(event);
            }
        };
        
        if (handlers[action]) {
            handlers[action]();
        }
    }
}
