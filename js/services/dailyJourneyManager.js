/**
 * DailyJourneyManager - Enhanced daily journey with checklists, mood tracking, and streaks
 */
class DailyJourneyManager {
    constructor() {
        this.checklists = Utils.getStorage('dailyChecklists', {});
        this.moodHistory = Utils.getStorage('moodHistory', []);
        this.streakData = Utils.getStorage('streakData', this.getDefaultStreakData());
        this.achievements = Utils.getStorage('achievements', []);
        this.templates = this.getDefaultTemplates();
    }

    /**
     * Checklist Management
     */
    getTodayChecklist() {
        const today = this.getDateKey();
        if (!this.checklists[today]) {
            this.checklists[today] = {
                date: new Date().toISOString(),
                items: [],
                completed: false
            };
        }
        return this.checklists[today];
    }

    addChecklistItem(text) {
        const today = this.getDateKey();
        const checklist = this.getTodayChecklist();
        
        const item = {
            id: `check_${Date.now()}`,
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        checklist.items.push(item);
        this.checklists[today] = checklist;
        this.saveChecklists();
        
        return item;
    }

    toggleChecklistItem(itemId) {
        const today = this.getDateKey();
        const checklist = this.checklists[today];
        
        if (checklist) {
            const item = checklist.items.find(i => i.id === itemId);
            if (item) {
                item.completed = !item.completed;
                item.completedAt = item.completed ? new Date().toISOString() : null;
                
                // Check if all items completed
                checklist.completed = checklist.items.every(i => i.completed);
                
                if (checklist.completed) {
                    this.updateStreak();
                    this.checkAchievements();
                }
                
                this.saveChecklists();
            }
        }
    }

    deleteChecklistItem(itemId) {
        const today = this.getDateKey();
        const checklist = this.checklists[today];
        
        if (checklist) {
            checklist.items = checklist.items.filter(i => i.id !== itemId);
            this.saveChecklists();
        }
    }

    getChecklistForDate(dateString) {
        return this.checklists[dateString] || null;
    }

    /**
     * Mood Tracking
     */
    setMood(mood, notes = '') {
        const entry = {
            date: new Date().toISOString(),
            dateKey: this.getDateKey(),
            mood: mood, // 1-5 or emoji
            notes: notes.trim(),
            timestamp: Date.now()
        };
        
        // Remove existing entry for today
        this.moodHistory = this.moodHistory.filter(m => m.dateKey !== entry.dateKey);
        
        // Add new entry
        this.moodHistory.push(entry);
        this.saveMoodHistory();
        
        return entry;
    }

    getMoodForDate(dateString) {
        return this.moodHistory.find(m => m.dateKey === dateString);
    }

    getTodayMood() {
        return this.getMoodForDate(this.getDateKey());
    }

    getMoodHistory(days = 30) {
        const now = Date.now();
        const cutoff = now - (days * 24 * 60 * 60 * 1000);
        
        return this.moodHistory
            .filter(m => m.timestamp > cutoff)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    getMoodStats() {
        const recent = this.getMoodHistory(30);
        
        if (recent.length === 0) {
            return { average: 0, trend: 'neutral', entries: 0 };
        }
        
        const sum = recent.reduce((acc, m) => acc + (typeof m.mood === 'number' ? m.mood : 3), 0);
        const average = sum / recent.length;
        
        // Calculate trend (last 7 days vs previous 7 days)
        const last7 = recent.slice(0, 7);
        const prev7 = recent.slice(7, 14);
        
        let trend = 'neutral';
        if (prev7.length > 0 && last7.length > 0) {
            const last7Avg = last7.reduce((acc, m) => acc + (typeof m.mood === 'number' ? m.mood : 3), 0) / last7.length;
            const prev7Avg = prev7.reduce((acc, m) => acc + (typeof m.mood === 'number' ? m.mood : 3), 0) / prev7.length;
            
            if (last7Avg > prev7Avg + 0.3) trend = 'improving';
            else if (last7Avg < prev7Avg - 0.3) trend = 'declining';
        }
        
        return {
            average: average.toFixed(1),
            trend,
            entries: recent.length
        };
    }

    /**
     * Streak Management
     */
    updateStreak() {
        const today = this.getDateKey();
        const yesterday = this.getYesterdayKey();
        
        if (this.streakData.lastCompletionDate === yesterday) {
            // Continue streak
            this.streakData.currentStreak++;
        } else if (this.streakData.lastCompletionDate !== today) {
            // Start new streak
            this.streakData.currentStreak = 1;
        }
        
        // Update longest streak
        if (this.streakData.currentStreak > this.streakData.longestStreak) {
            this.streakData.longestStreak = this.streakData.currentStreak;
        }
        
        this.streakData.lastCompletionDate = today;
        this.streakData.totalCompletions++;
        
        this.saveStreakData();
    }

    checkStreak() {
        const today = this.getDateKey();
        const yesterday = this.getYesterdayKey();
        
        // Reset streak if missed yesterday
        if (this.streakData.lastCompletionDate !== today && 
            this.streakData.lastCompletionDate !== yesterday) {
            this.streakData.currentStreak = 0;
            this.saveStreakData();
        }
        
        return this.streakData;
    }

    getStreakData() {
        return this.checkStreak();
    }

    /**
     * Achievements/Badges
     */
    checkAchievements() {
        const newAchievements = [];
        
        // Streak achievements
        if (this.streakData.currentStreak >= 7 && !this.hasAchievement('week_warrior')) {
            newAchievements.push(this.unlockAchievement('week_warrior', 'Week Warrior', 'Maintained a 7-day streak'));
        }
        
        if (this.streakData.currentStreak >= 30 && !this.hasAchievement('month_master')) {
            newAchievements.push(this.unlockAchievement('month_master', 'Month Master', 'Maintained a 30-day streak'));
        }
        
        if (this.streakData.currentStreak >= 100 && !this.hasAchievement('century_champion')) {
            newAchievements.push(this.unlockAchievement('century_champion', 'Century Champion', 'Maintained a 100-day streak'));
        }
        
        // Completion achievements
        if (this.streakData.totalCompletions >= 10 && !this.hasAchievement('getting_started')) {
            newAchievements.push(this.unlockAchievement('getting_started', 'Getting Started', 'Completed 10 daily checklists'));
        }
        
        if (this.streakData.totalCompletions >= 50 && !this.hasAchievement('dedicated')) {
            newAchievements.push(this.unlockAchievement('dedicated', 'Dedicated', 'Completed 50 daily checklists'));
        }
        
        // Mood tracking achievements
        const moodEntries = this.moodHistory.length;
        if (moodEntries >= 30 && !this.hasAchievement('mood_tracker')) {
            newAchievements.push(this.unlockAchievement('mood_tracker', 'Mood Tracker', 'Tracked mood for 30 days'));
        }
        
        return newAchievements;
    }

    hasAchievement(id) {
        return this.achievements.some(a => a.id === id);
    }

    unlockAchievement(id, title, description) {
        const achievement = {
            id,
            title,
            description,
            unlockedAt: new Date().toISOString(),
            icon: this.getAchievementIcon(id)
        };
        
        this.achievements.push(achievement);
        this.saveAchievements();
        
        return achievement;
    }

    getAchievementIcon(id) {
        const icons = {
            week_warrior: '🔥',
            month_master: '📅',
            century_champion: '👑',
            getting_started: '🌟',
            dedicated: '💪',
            mood_tracker: '😊'
        };
        return icons[id] || '🏆';
    }

    getAchievements() {
        return this.achievements;
    }

    /**
     * Journal Templates
     */
    getDefaultTemplates() {
        return [
            {
                id: 'gratitude',
                name: 'Gratitude Journal',
                template: 'Today I am grateful for:\n\n1. \n2. \n3. \n\nWhat made today special:'
            },
            {
                id: 'reflection',
                name: 'Daily Reflection',
                template: 'What went well today:\n\n\nWhat could be improved:\n\n\nTomorrow I will:'
            },
            {
                id: 'goals',
                name: 'Goal Progress',
                template: 'Goals I worked on today:\n\n\nProgress made:\n\n\nChallenges faced:\n\n\nNext steps:'
            },
            {
                id: 'wins',
                name: 'Daily Wins',
                template: 'Today\'s wins:\n\n1. \n2. \n3. \n\nLesson learned:\n\n\nHow I celebrated:'
            }
        ];
    }

    getTemplates() {
        return this.templates;
    }

    applyTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        return template ? template.template : '';
    }

    /**
     * Timeline/History
     */
    getTimelineData(days = 30) {
        const timeline = [];
        const now = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = this.formatDateKey(date);
            
            timeline.push({
                date: date.toISOString(),
                dateKey,
                displayDate: date.toLocaleDateString(),
                checklist: this.getChecklistForDate(dateKey),
                mood: this.getMoodForDate(dateKey),
                hasData: !!this.getChecklistForDate(dateKey) || !!this.getMoodForDate(dateKey)
            });
        }
        
        return timeline;
    }

    /**
     * Progress Graphs Data
     */
    getProgressGraphData(days = 30) {
        const data = {
            dates: [],
            completions: [],
            moods: []
        };
        
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = this.formatDateKey(date);
            
            data.dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const checklist = this.getChecklistForDate(dateKey);
            data.completions.push(checklist && checklist.completed ? 1 : 0);
            
            const mood = this.getMoodForDate(dateKey);
            data.moods.push(mood ? (typeof mood.mood === 'number' ? mood.mood : 3) : null);
        }
        
        return data;
    }

    /**
     * Utility Methods
     */
    getDateKey() {
        return this.formatDateKey(new Date());
    }

    getYesterdayKey() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.formatDateKey(yesterday);
    }

    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Storage Methods
     */
    saveChecklists() {
        Utils.setStorage('dailyChecklists', this.checklists);
    }

    saveMoodHistory() {
        Utils.setStorage('moodHistory', this.moodHistory);
    }

    saveStreakData() {
        Utils.setStorage('streakData', this.streakData);
    }

    saveAchievements() {
        Utils.setStorage('achievements', this.achievements);
    }

    getDefaultStreakData() {
        return {
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            lastCompletionDate: null
        };
    }
}
