class GoalsManager {
    constructor() {
        this.goals = this.loadGoals();
        this.categories = this.loadCategories();
        this.stats = this.loadStats();
        this.deletedGoals = this.loadDeletedGoals();
    }

    // Goals Management
    addGoal(text, category = 'general', priority = 'medium', options = {}) {
        const goal = {
            id: Date.now().toString(),
            text: text.trim(),
            category: category,
            priority: priority,
            progress: 0,
            completed: false,
            subtasks: options.subtasks || [],
            dueDate: options.dueDate || null,
            recurring: options.recurring || null, // { frequency: 'daily|weekly|monthly', interval: 1 }
            tags: options.tags || [],
            notes: options.notes || '',
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

    permanentDeleteGoal(id) {
        const goalIndex = this.deletedGoals.findIndex(goal => goal.id === id);
        if (goalIndex !== -1) {
            this.deletedGoals.splice(goalIndex, 1);
            this.saveDeletedGoals();
        }
    }

    // Subtasks Management
    addSubtask(goalId, subtaskText) {
        const goal = this.getGoal(goalId);
        if (goal) {
            if (!goal.subtasks) goal.subtasks = [];
            
            const subtask = {
                id: `${goalId}_sub_${Date.now()}`,
                text: subtaskText.trim(),
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            goal.subtasks.push(subtask);
            this.updateGoal(goalId, { subtasks: goal.subtasks });
            this.updateGoalProgressFromSubtasks(goalId);
            return subtask;
        }
        return null;
    }

    toggleSubtask(goalId, subtaskId) {
        const goal = this.getGoal(goalId);
        if (goal && goal.subtasks) {
            const subtask = goal.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                this.updateGoal(goalId, { subtasks: goal.subtasks });
                this.updateGoalProgressFromSubtasks(goalId);
            }
        }
    }

    deleteSubtask(goalId, subtaskId) {
        const goal = this.getGoal(goalId);
        if (goal && goal.subtasks) {
            goal.subtasks = goal.subtasks.filter(st => st.id !== subtaskId);
            this.updateGoal(goalId, { subtasks: goal.subtasks });
            this.updateGoalProgressFromSubtasks(goalId);
        }
    }

    updateGoalProgressFromSubtasks(goalId) {
        const goal = this.getGoal(goalId);
        if (goal && goal.subtasks && goal.subtasks.length > 0) {
            const completedSubtasks = goal.subtasks.filter(st => st.completed).length;
            const progress = Math.round((completedSubtasks / goal.subtasks.length) * 100);
            this.updateGoal(goalId, { 
                progress,
                completed: progress === 100
            });
        }
    }

    // Bulk Actions
    bulkComplete(goalIds) {
        goalIds.forEach(id => {
            this.updateGoal(id, { completed: true, progress: 100 });
        });
        return { success: true, count: goalIds.length };
    }

    bulkDelete(goalIds) {
        goalIds.forEach(id => this.deleteGoal(id));
        return { success: true, count: goalIds.length };
    }

    bulkRestore(goalIds) {
        goalIds.forEach(id => this.restoreGoal(id));
        return { success: true, count: goalIds.length };
    }

    // Duplicate Goal
    duplicateGoal(id) {
        const goal = this.getGoal(id);
        if (goal) {
            const duplicate = {
                ...goal,
                id: Date.now().toString(),
                text: `${goal.text} (Copy)`,
                completed: false,
                progress: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (duplicate.subtasks) {
                duplicate.subtasks = duplicate.subtasks.map(st => ({
                    ...st,
                    id: `${duplicate.id}_sub_${Date.now()}_${Math.random()}`,
                    completed: false
                }));
            }
            
            this.goals.push(duplicate);
            this.saveGoals();
            return duplicate;
        }
        return null;
    }

    // Sorting
    sortGoals(sortBy = 'updatedAt', direction = 'desc') {
        const sorted = [...this.goals];
        
        sorted.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'createdAt':
                case 'updatedAt':
                    comparison = new Date(a[sortBy]) - new Date(b[sortBy]);
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case 'progress':
                    comparison = a.progress - b.progress;
                    break;
                case 'dueDate':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    comparison = new Date(a.dueDate) - new Date(b.dueDate);
                    break;
                case 'alphabetical':
                    comparison = a.text.localeCompare(b.text);
                    break;
                default:
                    comparison = new Date(b.updatedAt) - new Date(a.updatedAt);
            }
            
            return direction === 'desc' ? -comparison : comparison;
        });
        
        return sorted;
    }

    // Filtering and Search
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

        if (filters.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filtered = filtered.filter(goal => {
                if (!goal.dueDate) return false;
                const dueDate = new Date(goal.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                switch (filters.dueDate) {
                    case 'overdue':
                        return dueDate < today && !goal.completed;
                    case 'today':
                        return dueDate.getTime() === today.getTime();
                    case 'week':
                        const weekFromNow = new Date(today);
                        weekFromNow.setDate(today.getDate() + 7);
                        return dueDate >= today && dueDate <= weekFromNow;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting if specified
        if (filters.sortBy) {
            return this.sortGoals(filters.sortBy, filters.sortDirection || 'desc').filter(g => filtered.includes(g));
        }

        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    // Calendar View Data
    getGoalsForCalendar() {
        return this.goals
            .filter(goal => goal.dueDate)
            .map(goal => ({
                id: goal.id,
                title: goal.text,
                date: goal.dueDate,
                completed: goal.completed,
                priority: goal.priority,
                category: goal.category
            }));
    }

    getGoalsForDate(dateString) {
        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);
        
        return this.goals.filter(goal => {
            if (!goal.dueDate) return false;
            const goalDate = new Date(goal.dueDate);
            goalDate.setHours(0, 0, 0, 0);
            return goalDate.getTime() === targetDate.getTime();
        });
    }

    searchGoals(query) {
        if (!query) return this.goals;
        
        const lowerQuery = query.toLowerCase();
        return this.goals.filter(goal => 
            goal.text.toLowerCase().includes(lowerQuery) ||
            goal.priority.toLowerCase().includes(lowerQuery) ||
            this.getCategoryName(goal.category).toLowerCase().includes(lowerQuery)
        );
    }

    // Progress and Stats
    getOverallProgress() {
        if (this.goals.length === 0) return 0;
        
        const totalProgress = this.goals.reduce((sum, goal) => sum + goal.progress, 0);
        return Math.round(totalProgress / this.goals.length);
    }

    getStats() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(goal => goal.completed).length;
        const inProgressGoals = this.goals.filter(goal => !goal.completed && goal.progress > 0).length;
        const highPriorityGoals = this.goals.filter(goal => goal.priority === 'high').length;

        // Calculate productivity score based on completion rate and progress
        const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        const progressScore = this.getOverallProgress();
        const productivityScore = Math.round((completionRate + progressScore) / 2);

        return {
            totalGoals,
            completedGoals,
            inProgressGoals,
            highPriorityGoals,
            productivityScore,
            streak: this.stats.currentStreak || 7,
            goalsCompleted: completedGoals
        };
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastVisit = this.stats.lastVisit ? new Date(this.stats.lastVisit).toDateString() : null;
        
        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastVisit === yesterday.toDateString()) {
                this.stats.currentStreak++;
            } else {
                this.stats.currentStreak = 1;
            }
            
            this.stats.lastVisit = new Date().toISOString();
            this.saveStats();
        }
    }

    // Categories Management
    getCategories() {
        return this.categories;
    }

    addCategory(name) {
        const category = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name.trim(),
            color: this.generateCategoryColor()
        };
        
        this.categories.push(category);
        this.saveCategories();
        return category;
    }

    deleteCategory(id) {
        // Don't delete category if it's being used by goals
        const categoryInUse = this.goals.some(goal => goal.category === id);
        if (categoryInUse) {
            throw new Error('Cannot delete category that is being used by goals');
        }

        const categoryIndex = this.categories.findIndex(cat => cat.id === id);
        if (categoryIndex !== -1) {
            this.categories.splice(categoryIndex, 1);
            this.saveCategories();
        }
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'General';
    }

    generateCategoryColor() {
        const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Export/Import
    exportGoals() {
        const data = {
            goals: this.goals,
            categories: this.categories,
            stats: this.stats,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    importGoals(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.goals) {
                this.goals = data.goals;
            }
            if (data.categories) {
                this.categories = data.categories;
            }
            if (data.stats) {
                this.stats = { ...this.stats, ...data.stats };
            }
            
            this.saveGoals();
            this.saveCategories();
            this.saveStats();
            
            return true;
        } catch (error) {
            console.error('Failed to import goals:', error);
            return false;
        }
    }

    // Storage Methods
    loadGoals() {
        try {
            const stored = localStorage.getItem('motivationHub_goals');
            return stored ? JSON.parse(stored) : this.getDefaultGoals();
        } catch (error) {
            console.error('Error loading goals:', error);
            return this.getDefaultGoals();
        }
    }

    loadCategories() {
        try {
            const stored = localStorage.getItem('motivationHub_categories');
            return stored ? JSON.parse(stored) : this.getDefaultCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            return this.getDefaultCategories();
        }
    }

    loadStats() {
        try {
            const stored = localStorage.getItem('motivationHub_stats');
            return stored ? JSON.parse(stored) : this.getDefaultStats();
        } catch (error) {
            console.error('Error loading stats:', error);
            return this.getDefaultStats();
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

    // Default Data
    getDefaultGoals() {
        return [
            {
                id: '1',
                text: 'Complete morning meditation session',
                category: 'wellness',
                priority: 'high',
                progress: 100,
                completed: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                text: 'Read 30 pages of personal development book',
                category: 'learning',
                priority: 'medium',
                progress: 75,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                text: 'Complete workout routine',
                category: 'fitness',
                priority: 'high',
                progress: 50,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    getDefaultCategories() {
        return [
            { id: 'general', name: 'General', color: '#7c3aed' },
            { id: 'work', name: 'Work', color: '#ec4899' },
            { id: 'personal', name: 'Personal', color: '#06b6d4' },
            { id: 'health', name: 'Health', color: '#10b981' },
            { id: 'learning', name: 'Learning', color: '#f59e0b' },
            { id: 'fitness', name: 'Fitness', color: '#ef4444' },
            { id: 'wellness', name: 'Wellness', color: '#8b5cf6' }
        ];
    }

    getDefaultStats() {
        return {
            currentStreak: 7,
            longestStreak: 14,
            totalGoalsCompleted: 12,
            productivityScore: 84,
            lastVisit: new Date().toISOString(),
            quotesViewed: 25
        };
    }
}