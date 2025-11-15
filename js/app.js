// Utility Functions
class Utils {
    static setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    }

    static getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    }

    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Goals Manager
class GoalsManager {
    constructor() {
        this.goals = this.loadGoals();
        this.categories = this.loadCategories();
        this.stats = this.loadStats();
        this.deletedGoals = this.loadDeletedGoals();
    }

    addGoal(text, category = 'general', priority = 'medium') {
        const goal = {
            id: Date.now().toString(),
            text: text.trim(),
            category: category,
            priority: priority,
            progress: 0,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.goals.push(goal);
        this.saveGoals();
        return goal;
    }

    getGoal(id) {
        return this.goals.find(goal => goal.id === id);
    }

    updateGoal(id, updates) {
        const goalIndex = this.goals.findIndex(goal => goal.id === id);
        if (goalIndex !== -1) {
            this.goals[goalIndex] = {
                ...this.goals[goalIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveGoals();
        }
    }

    toggleGoalCompletion(id) {
        const goal = this.getGoal(id);
        if (goal) {
            const newProgress = goal.completed ? 0 : 100;
            this.updateGoal(id, {
                completed: !goal.completed,
                progress: newProgress
            });
        }
    }

    updateGoalProgress(id, progress) {
        const numericProgress = parseInt(progress);
        this.updateGoal(id, {
            progress: numericProgress,
            completed: numericProgress === 100
        });
    }

    deleteGoal(id) {
        const goalIndex = this.goals.findIndex(goal => goal.id === id);
        if (goalIndex !== -1) {
            const deletedGoal = this.goals.splice(goalIndex, 1)[0];
            deletedGoal.deletedAt = new Date().toISOString();
            this.deletedGoals.push(deletedGoal);
            this.saveGoals();
            this.saveDeletedGoals();
        }
    }

    restoreGoal(id) {
        const goalIndex = this.deletedGoals.findIndex(goal => goal.id === id);
        if (goalIndex !== -1) {
            const restoredGoal = this.deletedGoals.splice(goalIndex, 1)[0];
            delete restoredGoal.deletedAt;
            this.goals.push(restoredGoal);
            this.saveGoals();
            this.saveDeletedGoals();
        }
    }

    filterGoals(filters = {}) {
        let filtered = [...this.goals];

        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(goal => goal.category === filters.category);
        }

        if (filters.status && filters.status !== 'all') {
            switch (filters.status) {
                case 'active':
                    filtered = filtered.filter(goal => !goal.completed && goal.progress < 100);
                    break;
                case 'completed':
                    filtered = filtered.filter(goal => goal.completed);
                    break;
                case 'in-progress':
                    filtered = filtered.filter(goal => !goal.completed && goal.progress > 0);
                    break;
            }
        }

        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(goal => goal.priority === filters.priority);
        }

        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    getOverallProgress() {
        if (this.goals.length === 0) return 0;
        const totalProgress = this.goals.reduce((sum, goal) => sum + goal.progress, 0);
        return Math.round(totalProgress / this.goals.length);
    }

    getStats() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(goal => goal.completed).length;
        const progress = this.getOverallProgress();
        
        return {
            totalGoals,
            completedGoals,
            productivityScore: progress,
            streak: 7,
            goalsCompleted: completedGoals
        };
    }

    getCategories() {
        return this.categories;
    }

    addCategory(name) {
        const category = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name.trim(),
            color: '#7c3aed'
        };
        
        this.categories.push(category);
        this.saveCategories();
        return category;
    }

    loadGoals() {
        try {
            const stored = localStorage.getItem('motivationHub_goals');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading goals:', error);
            return [];
        }
    }

    loadCategories() {
        try {
            const stored = localStorage.getItem('motivationHub_categories');
            return stored ? JSON.parse(stored) : [
                { id: 'general', name: 'General', color: '#7c3aed' },
                { id: 'work', name: 'Work', color: '#ec4899' },
                { id: 'personal', name: 'Personal', color: '#06b6d4' }
            ];
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    }

    loadStats() {
        try {
            const stored = localStorage.getItem('motivationHub_stats');
            return stored ? JSON.parse(stored) : {
                currentStreak: 7,
                totalGoalsCompleted: 0,
                productivityScore: 0
            };
        } catch (error) {
            console.error('Error loading stats:', error);
            return {};
        }
    }

    loadDeletedGoals() {
        try {
            const stored = localStorage.getItem('motivationHub_deletedGoals');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading deleted goals:', error);
            return [];
        }
    }

    saveGoals() {
        localStorage.setItem('motivationHub_goals', JSON.stringify(this.goals));
    }

    saveCategories() {
        localStorage.setItem('motivationHub_categories', JSON.stringify(this.categories));
    }

    saveStats() {
        localStorage.setItem('motivationHub_stats', JSON.stringify(this.stats));
    }

    saveDeletedGoals() {
        localStorage.setItem('motivationHub_deletedGoals', JSON.stringify(this.deletedGoals));
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.applyTheme(this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.saveTheme(this.currentTheme);
        this.updateToggleButton();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (this.currentTheme === 'light') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('motivationHub_theme');
        return savedTheme || 'dark';
    }

    saveTheme(theme) {
        localStorage.setItem('motivationHub_theme', theme);
    }
}

// Focus Timer
class FocusTimer {
    constructor() {
        this.isRunning = false;
        this.timeLeft = 25 * 60;
        this.intervalId = null;
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');

        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        this.updateButtons();
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.updateButtons();
    }

    reset() {
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.timeLeft = 25 * 60;
        this.updateDisplay();
        this.updateButtons();
    }

    tick() {
        this.timeLeft--;
        
        if (this.timeLeft <= 0) {
            this.completeSession();
            return;
        }
        
        this.updateDisplay();
    }

    completeSession() {
        clearInterval(this.intervalId);
        this.isRunning = false;
        this.showNotification('Session Complete', 'Focus session completed!');
        this.updateButtons();
    }

    updateDisplay() {
        const display = document.getElementById('timerDisplay');
        if (display) {
            display.textContent = this.formatTime(this.timeLeft);
        }
    }

    updateButtons() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');

        if (startBtn) {
            startBtn.disabled = this.isRunning;
            startBtn.innerHTML = this.isRunning ? 
                '<i class="fas fa-play"></i> Running' : 
                '<i class="fas fa-play"></i> Start';
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.isRunning;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showNotification(title, message) {
        // Simple notification implementation
        console.log(`${title}: ${message}`);
    }
}

// Main Application
class MotivationApp {
    constructor() {
        this.goalsManager = new GoalsManager();
        this.themeManager = new ThemeManager();
        this.focusTimer = new FocusTimer();
        
        this.currentFilters = {
            category: 'all',
            status: 'all',
            priority: 'all'
        };

        this.journalEntriesData = [];
        
        console.log('🚀 Starting MotivationApp...');
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindAllEvents();
        this.initialRender();
        console.log('✅ MotivationApp initialized');
    }

    cacheDOM() {
        // Chat Elements
        this.chatBotContainer = document.getElementById('chatBotContainer');
        this.chatToggleBtn = document.getElementById('chatToggleBtn');
        this.chatCloseBtn = document.getElementById('chatCloseBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatSendBtn = document.getElementById('chatSendBtn');

        // Goals Elements
        this.goalInput = document.getElementById('goalInput');
        this.addGoalBtn = document.getElementById('addGoal');
        this.goalListEl = document.getElementById('goalList');
        this.progressPercentageEl = document.getElementById('progressPercentage');
        this.progressBarEl = document.getElementById('progressBar');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.goalCategory = document.getElementById('goalCategory');
        this.goalPriority = document.getElementById('goalPriority');

        // Search Elements
        this.goalsSearch = document.getElementById('goalsSearch');
        this.goalsSearchClear = document.getElementById('goalsSearchClear');
        this.journalSearch = document.getElementById('journalSearch');
        this.journalSearchClear = document.getElementById('journalSearchClear');

        // Other Elements
        this.adviceTextEl = document.getElementById('adviceText');
        this.newAdviceBtn = document.getElementById('newAdvice');
        this.affirmationTextEl = document.getElementById('affirmationText');
        this.newAffirmationBtn = document.getElementById('newAffirmation');
        this.articleGrid = document.getElementById('articleGrid');
        this.mediaGrid = document.getElementById('mediaGrid');
        this.journalInput = document.getElementById('journalInput');
        this.saveJournalBtn = document.getElementById('saveJournal');
        this.journalEntries = document.getElementById('journalEntries');
        this.manageGoalsBtn = document.getElementById('manageGoalsBtn');
        this.managementModal = document.getElementById('goalsManagementModal');
    }

    bindAllEvents() {
        console.log('🔗 Binding all events...');
        
        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.themeManager.toggleTheme());
        }

        // Chat Events
        this.bindChatEvents();
        
        // Goals Events
        this.bindGoalsEvents();
        
        // Search Events
        this.bindSearchEvents();
        
        // Media Filter Events
        this.bindMediaEvents();
        
        // Journal Events
        this.bindJournalEvents();
        
        // Management Modal Events
        this.bindManagementEvents();
        
        // Other Button Events
        this.bindOtherEvents();
    }

    bindChatEvents() {
        if (this.chatToggleBtn) {
            this.chatToggleBtn.addEventListener('click', () => this.toggleChat());
        }
        
        if (this.chatCloseBtn) {
            this.chatCloseBtn.addEventListener('click', () => this.closeChat());
        }
        
        if (this.chatSendBtn) {
            this.chatSendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        // Quick Questions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-question-btn')) {
                const question = e.target.dataset.question;
                this.addUserMessage(question);
                this.generateBotResponse(question);
            }
        });
    }

    bindGoalsEvents() {
        if (this.addGoalBtn) {
            this.addGoalBtn.addEventListener('click', () => this.addNewGoal());
        }

        if (this.goalInput) {
            this.goalInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addNewGoal();
            });
        }

        // Goals List Events (Delegation)
        if (this.goalListEl) {
            this.goalListEl.addEventListener('click', (e) => {
                const goalItem = e.target.closest('li');
                if (!goalItem) return;

                const goalId = goalItem.dataset.id;
                
                if (e.target.classList.contains('goal-checkbox')) {
                    this.toggleGoalCompletion(goalId);
                }
                else if (e.target.classList.contains('delete-btn')) {
                    this.deleteGoal(goalId);
                }
                else if (e.target.classList.contains('edit-goal-btn') || e.target.closest('.edit-goal-btn')) {
                    this.startEditingGoal(goalId);
                }
            });

            this.goalListEl.addEventListener('input', (e) => {
                if (e.target.classList.contains('progress-slider')) {
                    const goalId = e.target.closest('li').dataset.id;
                    this.updateGoalProgress(goalId, e.target.value);
                }
            });
        }

        // Filter Events
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (this.priorityFilter) {
            this.priorityFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    bindSearchEvents() {
        if (this.goalsSearch) {
            this.goalsSearch.addEventListener('input', (e) => {
                this.searchGoals(e.target.value);
                this.toggleSearchClear(this.goalsSearch, this.goalsSearchClear);
            });
        }
        
        if (this.goalsSearchClear) {
            this.goalsSearchClear.addEventListener('click', () => {
                this.goalsSearch.value = '';
                this.searchGoals('');
                this.goalsSearchClear.style.display = 'none';
            });
        }
        
        if (this.journalSearch) {
            this.journalSearch.addEventListener('input', (e) => {
                this.searchJournal(e.target.value);
                this.toggleSearchClear(this.journalSearch, this.journalSearchClear);
            });
        }
        
        if (this.journalSearchClear) {
            this.journalSearchClear.addEventListener('click', () => {
                this.journalSearch.value = '';
                this.searchJournal('');
                this.journalSearchClear.style.display = 'none';
            });
        }
    }

    bindMediaEvents() {
        // Media Filter Events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to clicked button
                e.target.classList.add('active');
                // Apply filter
                this.fetchMedia(e.target.dataset.filter);
            }
        });
    }

    bindJournalEvents() {
        if (this.saveJournalBtn) {
            this.saveJournalBtn.addEventListener('click', () => this.saveJournalEntry());
        }

        // Journal entries events (delegation)
        if (this.journalEntries) {
            this.journalEntries.addEventListener('click', (e) => {
                const entry = e.target.closest('.journal-entry');
                if (!entry) return;

                const entryId = entry.querySelector('.edit-journal-btn')?.dataset.id;
                if (!entryId) return;

                if (e.target.classList.contains('edit-journal-btn') || e.target.closest('.edit-journal-btn')) {
                    this.startEditingJournalEntry(entryId);
                }
                else if (e.target.classList.contains('restore-journal-btn') || e.target.closest('.restore-journal-btn')) {
                    this.restoreJournalEntry(entryId);
                }
                else if (e.target.classList.contains('delete-journal-btn') || e.target.closest('.delete-journal-btn')) {
                    this.deleteJournalEntry(entryId);
                }
            });
        }
    }

    bindManagementEvents() {
        if (this.manageGoalsBtn) {
            this.manageGoalsBtn.addEventListener('click', () => this.openManagementModal());
        }

        // Modal close button
        const goalsModalClose = document.getElementById('goalsModalClose');
        if (goalsModalClose) {
            goalsModalClose.addEventListener('click', () => this.closeManagementModal());
        }

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabName = e.target.dataset.tab;
                this.switchManagementTab(tabName);
            }
        });
    }

    bindOtherEvents() {
        // Advice button
        if (this.newAdviceBtn) {
            this.newAdviceBtn.addEventListener('click', () => this.fetchAdvice());
        }

        // Affirmation button
        if (this.newAffirmationBtn) {
            this.newAffirmationBtn.addEventListener('click', () => this.getNewAffirmation());
        }
    }

    // Chat Methods
    toggleChat() {
        if (this.chatBotContainer.classList.contains('open')) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.chatBotContainer.classList.add('open');
        if (this.chatInput) this.chatInput.focus();
    }

    closeChat() {
        this.chatBotContainer.classList.remove('open');
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.addUserMessage(message);
        this.chatInput.value = '';
        this.generateBotResponse(message);
    }

    addUserMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'user-message';
        messageEl.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${Utils.escapeHtml(message)}</p>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;
        this.chatMessages.appendChild(messageEl);
        this.scrollChatToBottom();
    }

    generateBotResponse(userMessage) {
        this.showTypingIndicator();
        
        setTimeout(() => {
            const response = this.getSimpleResponse(userMessage);
            this.addBotMessage(response);
        }, 1000);
    }

    showTypingIndicator() {
        const typingEl = document.createElement('div');
        typingEl.className = 'bot-message';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingEl);
        this.scrollChatToBottom();
    }

    addBotMessage(message) {
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) typingEl.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = 'bot-message';
        messageEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${message}</p>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;
        this.chatMessages.appendChild(messageEl);
        this.scrollChatToBottom();
    }

    getSimpleResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! I'm your Motivation Assistant. How can I help you today? 😊";
        }
        else if (lowerMessage.includes('motivation')) {
            return "You've got this! 💪 Small steps every day lead to big results!";
        }
        else if (lowerMessage.includes('stress')) {
            return "Take a deep breath. You're stronger than you think! 🧘";
        }
        else {
            return "I'm here to help you stay motivated! What's on your mind? 😊";
        }
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    scrollChatToBottom() {
        setTimeout(() => {
            if (this.chatMessages) {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        }, 100);
    }

    // Goals Methods
    addNewGoal() {
        const text = this.goalInput.value.trim();
        const category = this.goalCategory.value;
        const priority = this.goalPriority.value;
        
        if (text) {
            this.goalsManager.addGoal(text, category, priority);
            this.goalInput.value = '';
            this.renderGoals();
            this.updateStats();
            this.showNotification('Goal Added', 'New objective added successfully!');
        }
    }

    toggleGoalCompletion(id) {
        this.goalsManager.toggleGoalCompletion(id);
        this.renderGoals();
        this.updateStats();
    }

    updateGoalProgress(id, progress) {
        this.goalsManager.updateGoalProgress(id, progress);
        this.renderGoals();
        this.updateStats();
    }

    deleteGoal(id) {
        if (confirm('Move this goal to trash?')) {
            this.goalsManager.deleteGoal(id);
            this.renderGoals();
            this.updateStats();
        }
    }

    startEditingGoal(goalId) {
        const goalItem = this.goalListEl.querySelector(`li[data-id="${goalId}"]`);
        const goalTextElement = goalItem.querySelector('.goal-text');
        const currentText = goalTextElement.textContent;
        
        goalTextElement.innerHTML = `
            <input type="text" class="edit-input" value="${Utils.escapeHtml(currentText)}">
            <div class="edit-actions">
                <button class="btn btn-sm btn-primary save-edit-btn">Save</button>
                <button class="btn btn-sm btn-secondary cancel-edit-btn">Cancel</button>
            </div>
        `;
        
        const input = goalTextElement.querySelector('.edit-input');
        input.focus();
        
        goalTextElement.querySelector('.save-edit-btn').addEventListener('click', () => {
            this.saveGoalEdit(goalId, input.value.trim());
        });
        
        goalTextElement.querySelector('.cancel-edit-btn').addEventListener('click', () => {
            this.cancelGoalEdit();
        });
    }

    saveGoalEdit(goalId, newText) {
        if (newText) {
            this.goalsManager.updateGoal(goalId, { text: newText });
            this.renderGoals();
            this.showNotification('Goal Updated', 'Goal text updated successfully!');
        }
    }

    cancelGoalEdit() {
        this.renderGoals();
    }

    applyFilters() {
        this.currentFilters = {
            category: this.categoryFilter.value,
            status: this.statusFilter.value,
            priority: this.priorityFilter.value
        };
        this.renderGoals();
    }

    renderGoals() {
        const filteredGoals = this.goalsManager.filterGoals(this.currentFilters);
        
        if (filteredGoals.length === 0) {
            this.goalListEl.innerHTML = '<li class="empty-state">No goals found. Add some goals or adjust your filters!</li>';
        } else {
            this.goalListEl.innerHTML = filteredGoals.map(goal => `
                <li class="priority-${goal.priority}" data-id="${goal.id}">
                    <div class="goal-info">
                        <div class="goal-checkbox ${goal.progress === 100 ? 'checked' : ''}"></div>
                        <span class="goal-text">${Utils.escapeHtml(goal.text)}</span>
                        <span class="goal-category">${this.getCategoryName(goal.category)}</span>
                    </div>
                    <div class="goal-controls">
                        <input type="range" class="progress-slider" min="0" max="100" value="${goal.progress}">
                        <span class="progress-label">${goal.progress}%</span>
                        <button class="edit-goal-btn" title="Edit goal">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn">&times;</button>
                    </div>
                </li>
            `).join('');
        }
        
        this.renderProgress();
    }

    renderProgress() {
        const progress = this.goalsManager.getOverallProgress();
        if (this.progressPercentageEl) this.progressPercentageEl.textContent = `${progress}%`;
        if (this.progressBarEl) this.progressBarEl.style.width = `${progress}%`;
    }

    updateStats() {
        const stats = this.goalsManager.getStats();
        if (this.streakCountEl) this.streakCountEl.textContent = stats.streak;
        if (this.goalsCompletedEl) this.goalsCompletedEl.textContent = stats.goalsCompleted;
        if (this.productivityScoreEl) this.productivityScoreEl.textContent = `${stats.productivityScore}%`;
    }

    getCategoryName(categoryId) {
        const category = this.goalsManager.getCategories().find(c => c.id === categoryId);
        return category ? category.name : 'General';
    }

    // Search Methods
    toggleSearchClear(searchInput, clearBtn) {
        if (searchInput && clearBtn) {
            clearBtn.style.display = searchInput.value.trim() !== '' ? 'block' : 'none';
        }
    }

    searchGoals(query) {
        const filteredGoals = this.goalsManager.filterGoals(this.currentFilters).filter(goal => {
            return goal.text.toLowerCase().includes(query.toLowerCase());
        });
        
        if (filteredGoals.length === 0) {
            this.goalListEl.innerHTML = '<li class="empty-state">No goals match your search.</li>';
        } else {
            this.goalListEl.innerHTML = filteredGoals.map(goal => `
                <li class="priority-${goal.priority}" data-id="${goal.id}">
                    <div class="goal-info">
                        <div class="goal-checkbox ${goal.progress === 100 ? 'checked' : ''}"></div>
                        <span class="goal-text">${Utils.escapeHtml(goal.text)}</span>
                        <span class="goal-category">${this.getCategoryName(goal.category)}</span>
                    </div>
                    <div class="goal-controls">
                        <input type="range" class="progress-slider" min="0" max="100" value="${goal.progress}">
                        <span class="progress-label">${goal.progress}%</span>
                        <button class="edit-goal-btn" title="Edit goal">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn">&times;</button>
                    </div>
                </li>
            `).join('');
        }
    }

    // Journal Methods
    saveJournalEntry() {
        const content = this.journalInput.value.trim();
        if (!content) {
            this.showNotification('Empty Entry', 'Please write something before saving');
            return;
        }
        
        const entry = {
            id: Date.now().toString(),
            content: content,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: new Date().toISOString(),
            originalContent: content
        };
        
        this.journalEntriesData.unshift(entry);
        this.saveJournalEntries();
        this.renderJournalEntries();
        this.journalInput.value = '';
        
        this.showNotification('Entry Saved', 'Your journal entry has been saved');
    }

    loadJournalEntries() {
        this.journalEntriesData = Utils.getStorage('motivationHub_journal', []);
        this.renderJournalEntries();
    }

    saveJournalEntries() {
        Utils.setStorage('motivationHub_journal', this.journalEntriesData);
    }

    renderJournalEntries() {
        if (!this.journalEntries) return;
        
        this.journalEntries.innerHTML = '';
        
        if (this.journalEntriesData.length === 0) {
            this.journalEntries.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <p>No journal entries yet. Start writing your thoughts!</p>
                </div>
            `;
            return;
        }
        
        this.journalEntriesData.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'journal-entry';
            entryEl.innerHTML = `
                <div class="journal-header">
                    <div class="journal-date">${entry.date}</div>
                    <div class="journal-actions">
                        <button class="btn btn-sm btn-primary edit-journal-btn" data-id="${entry.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${entry.originalContent && entry.originalContent !== entry.content ? 
                            `<button class="btn btn-sm btn-success restore-journal-btn" data-id="${entry.id}">
                                <i class="fas fa-undo"></i> Restore
                            </button>` : ''
                        }
                        <button class="btn btn-sm btn-danger delete-journal-btn" data-id="${entry.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="journal-content">${Utils.escapeHtml(entry.content)}</div>
            `;
            this.journalEntries.appendChild(entryEl);
        });
    }

    searchJournal(query) {
        const filteredEntries = this.journalEntriesData.filter(entry => {
            return entry.content.toLowerCase().includes(query.toLowerCase()) ||
                   entry.date.toLowerCase().includes(query.toLowerCase());
        });
        
        this.renderFilteredJournal(filteredEntries);
    }

    renderFilteredJournal(entries) {
        if (!this.journalEntries) return;
        
        this.journalEntries.innerHTML = '';
        
        if (entries.length === 0) {
            this.journalEntries.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No journal entries match your search.</p>
                </div>
            `;
            return;
        }
        
        entries.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'journal-entry';
            entryEl.innerHTML = `
                <div class="journal-header">
                    <div class="journal-date">${entry.date}</div>
                    <div class="journal-actions">
                        <button class="btn btn-sm btn-primary edit-journal-btn" data-id="${entry.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${entry.originalContent && entry.originalContent !== entry.content ? 
                            `<button class="btn btn-sm btn-success restore-journal-btn" data-id="${entry.id}">
                                <i class="fas fa-undo"></i> Restore
                            </button>` : ''
                        }
                        <button class="btn btn-sm btn-danger delete-journal-btn" data-id="${entry.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="journal-content">${Utils.escapeHtml(entry.content)}</div>
            `;
            this.journalEntries.appendChild(entryEl);
        });
    }

    startEditingJournalEntry(entryId) {
        const entry = this.journalEntriesData.find(e => e.id === entryId);
        if (!entry) return;

        const entryEl = this.journalEntries.querySelector(`[data-id="${entryId}"]`).closest('.journal-entry');
        const contentEl = entryEl.querySelector('.journal-content');
        const originalContent = entry.content;

        contentEl.innerHTML = `
            <textarea class="edit-input" style="height: 120px;">${Utils.escapeHtml(originalContent)}</textarea>
            <div class="edit-actions">
                <button class="btn btn-sm btn-primary save-journal-edit-btn">Save</button>
                <button class="btn btn-sm btn-secondary cancel-journal-edit-btn">Cancel</button>
            </div>
        `;

        const textarea = contentEl.querySelector('textarea');
        textarea.focus();

        contentEl.querySelector('.save-journal-edit-btn').addEventListener('click', () => {
            this.saveJournalEdit(entryId, textarea.value.trim());
        });

        contentEl.querySelector('.cancel-journal-edit-btn').addEventListener('click', () => {
            this.cancelJournalEdit();
        });
    }

    saveJournalEdit(entryId, newContent) {
        if (newContent) {
            const entryIndex = this.journalEntriesData.findIndex(e => e.id === entryId);
            if (entryIndex !== -1) {
                if (!this.journalEntriesData[entryIndex].originalContent) {
                    this.journalEntriesData[entryIndex].originalContent = this.journalEntriesData[entryIndex].content;
                }
                
                this.journalEntriesData[entryIndex].content = newContent;
                this.journalEntriesData[entryIndex].date = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                this.saveJournalEntries();
                this.renderJournalEntries();
                this.showNotification('Entry Updated', 'Journal entry updated successfully!');
            }
        }
    }

    cancelJournalEdit() {
        this.renderJournalEntries();
    }

    restoreJournalEntry(entryId) {
        const entryIndex = this.journalEntriesData.findIndex(e => e.id === entryId);
        if (entryIndex !== -1 && this.journalEntriesData[entryIndex].originalContent) {
            this.journalEntriesData[entryIndex].content = this.journalEntriesData[entryIndex].originalContent;
            delete this.journalEntriesData[entryIndex].originalContent;
            
            this.saveJournalEntries();
            this.renderJournalEntries();
            this.showNotification('Entry Restored', 'Original content restored successfully!');
        }
    }

    deleteJournalEntry(entryId) {
        if (confirm('Are you sure you want to delete this journal entry?')) {
            this.journalEntriesData = this.journalEntriesData.filter(entry => entry.id !== entryId);
            this.saveJournalEntries();
            this.renderJournalEntries();
            this.showNotification('Entry Deleted', 'Journal entry has been deleted');
        }
    }

    // Media Methods
    fetchMedia(filter = 'all') {
        if (!this.mediaGrid) return;
        
        this.mediaGrid.innerHTML = '<div class="empty-state">Loading media...</div>';
        
        setTimeout(() => {
            const mediaItems = this.getMediaItems(filter);
            this.renderMedia(mediaItems);
        }, 500);
    }

    getMediaItems(filter) {
        const allMedia = [
            {
                id: 1,
                title: "Morning Motivation Routine",
                type: "video",
                category: "morning",
                duration: "15:30",
                views: "1.2M",
                thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Start your day with energy and purpose"
            },
            {
                id: 2,
                title: "Business Success Stories",
                type: "interviews",
                category: "business",
                duration: "28:45",
                views: "850K",
                thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Learn from successful entrepreneurs"
            }
        ];
        
        if (filter === 'all') return allMedia;
        return allMedia.filter(media => media.category === filter || media.type === filter);
    }

    renderMedia(mediaItems) {
        if (!this.mediaGrid) return;
        
        if (mediaItems.length === 0) {
            this.mediaGrid.innerHTML = '<div class="empty-state">No media found for this filter</div>';
            return;
        }
        
        this.mediaGrid.innerHTML = mediaItems.map(item => `
            <div class="media-item">
                <div class="thumbnail-wrapper">
                    <img src="${item.thumbnail}" alt="${item.title}" class="thumbnail-img">
                    <div class="play-icon"></div>
                    <div class="media-duration">${item.duration}</div>
                </div>
                <div class="media-content">
                    <span class="media-tag">${item.type}</span>
                    <h3 class="media-title">${item.title}</h3>
                    <p class="media-description">${item.description}</p>
                    <div class="media-stats">
                        <span><i class="fas fa-eye"></i> ${item.views}</span>
                        <span><i class="fas fa-clock"></i> ${item.duration}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Management Modal Methods
    openManagementModal() {
        if (this.managementModal) {
            this.managementModal.style.display = 'flex';
        }
    }

    closeManagementModal() {
        if (this.managementModal) {
            this.managementModal.style.display = 'none';
        }
    }

    switchManagementTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }

    // Other Methods
    fetchAdvice() {
        if (!this.adviceTextEl) return;
        
        this.adviceTextEl.textContent = "Loading...";
        
        setTimeout(() => {
            const quotes = [
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
            ];
            
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            this.adviceTextEl.textContent = randomQuote.text;
            if (this.adviceAuthorEl) {
                this.adviceAuthorEl.textContent = `— ${randomQuote.author}`;
            }
        }, 1000);
    }

    getNewAffirmation() {
        if (!this.affirmationTextEl) return;
        
        const affirmations = [
            "I am capable of achieving my goals and creating positive change in my life.",
            "I embrace challenges as opportunities for growth and learning.",
            "I am worthy of success, happiness, and all good things that come my way.",
            "I trust in my ability to make wise decisions and navigate any situation."
        ];
        
        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        this.affirmationTextEl.textContent = randomAffirmation;
    }

    showNotification(title, message, duration = 3000) {
        // Simple notification implementation
        console.log(`Notification: ${title} - ${message}`);
        // You can enhance this with a proper notification system
    }

    // Initial Render
    initialRender() {
        this.populateCategoryFilters();
        this.renderGoals();
        this.updateStats();
        this.fetchAdvice();
        this.getNewAffirmation();
        this.fetchMedia('all');
        this.loadJournalEntries();
        
        console.log('✅ All components rendered');
    }

    populateCategoryFilters() {
        const categories = this.goalsManager.getCategories();
        
        if (this.categoryFilter) {
            this.categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
                categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        }
        
        if (this.goalCategory) {
            this.goalCategory.innerHTML = categories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM loaded, initializing app...');
    window.motivationApp = new MotivationApp();
});