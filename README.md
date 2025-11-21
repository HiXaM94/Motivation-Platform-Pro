# 🚀 Motivation Hub Pro - Advanced Daily Motivation Platform

A comprehensive web application for daily motivation, goal tracking, and personal development with advanced features and beautiful UI.

## ✨ Features

### 🎯 Enhanced Goals Management
- **Advanced Goal Tracking**: Progress sliders, categories, priorities
- **Goal Restoration**: Recover deleted goals from trash
- **Categories & Filtering**: Organize goals by categories and filter by status/priority
- **Export/Import**: Backup and restore your goals data
- **Progress Analytics**: Visual progress tracking with statistics

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Toggle between themes with persistence
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Engaging user experience
- **Glass Morphism**: Modern design with blurred backgrounds

### ⏱️ Productivity Tools
- **Focus Timer**: Pomodoro-style timer for focused work sessions
- **Daily Challenges**: Random motivational challenges
- **Mood Tracking**: Track your daily mood
- **Journal System**: Personal reflection and note-taking

### 📚 Content & Inspiration
- **Motivational Quotes**: Daily inspirational quotes
- **Affirmations**: Positive self-affirmations
- **Media Library**: Curated motivational content
- **Trending Articles**: Latest motivation and self-improvement content

## 🛠️ Installation

1. **Download the files** to a folder structure
2. **Open `index.html`** in your web browser
3. **Start using** the application immediately

## 🎮 How to Use

### Managing Goals
1. **Add Goals**: Use the input field at the bottom of the Goals section
2. **Set Progress**: Use the slider or click the checkbox to mark as complete
3. **Categorize**: Assign categories and priorities to organize your goals
4. **Filter**: Use the filter dropdowns to view specific goal subsets
5. **Manage**: Click the "Manage" button for advanced options

### Goal Restoration
1. Click the "Manage" button in the Goals section
2. Go to the "Deleted Goals" tab
3. Restore individual goals or restore all at once
4. Permanently delete goals if needed

### Export/Import
1. In the Management modal, go to the "Export/Import" tab
2. **Export**: Download your goals as a JSON file for backup
3. **Import**: Paste exported JSON data to restore your goals

## 🚧 In Progress: API Integration & Enhanced Features

This repository is being actively enhanced with server-side API integrations and advanced features. See the [WIP Pull Request](docs/PR_NOTES.md) for details.

### 🔧 Current Development (Initial Scaffold)

**Server-Side API Proxies:**
- ✅ OpenAI chatbot integration (server/api/chatbotProxy.js)
- ✅ YouTube inspiration feed (server/api/inspirationProxy.js)
- ✅ Mock mode for development without API keys
- ✅ Security-first approach (keys in environment variables)

**Frontend Services:**
- ✅ Chatbot service wrapper (frontend/services/chatbotService.js)
- ✅ Inspiration service wrapper (frontend/services/inspirationService.js)

**Documentation:**
- ✅ API keys configuration guide (docs/SECRETS_AND_KEYS.md)
- ✅ Environment setup (.env.example)
- ✅ Developer documentation (docs/PR_NOTES.md)

### 📅 Upcoming Features (Planned PRs)

**PR #2 - Chatbot UI Enhancement:**
- Interactive chat interface with message history
- Typing indicators and quick reply buttons
- Conversation persistence

**PR #3 - Goals Manager Overhaul:**
- Centralized state management
- Enhanced CRUD with validation
- Goal templates and analytics dashboard

**PR #4 - Inspiration Real-Time Feed:**
- Admin UI for content providers
- Real-time polling and RSS integration
- Favorite/bookmark functionality

**PR #5 - Daily Journey Enhancements:**
- Mood tracking with visual charts
- Journal templates and daily prompts
- Streak tracking and achievements

**PR #6 - Export/Import/Restore:**
- Comprehensive backup system
- Auto-backup with configurable intervals
- Cloud sync support

**PR #7 - Testing & CI/CD:**
- Unit and integration tests
- GitHub Actions workflow
- Automated testing pipeline

**PR #8 - Performance & Polish:**
- Bundle optimization
- Offline support with service workers
- Accessibility improvements

### 🔐 Setup for Development

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to `.env` (optional - mock mode available):**
   ```bash
   OPENAI_API_KEY=your_key_here
   YOUTUBE_API_KEY=your_key_here
   ```

3. **See full setup guide:**
   - Read [docs/SECRETS_AND_KEYS.md](docs/SECRETS_AND_KEYS.md) for detailed instructions

## 🔧 Technical Features

- **Local Storage**: All data persists in your browser
- **Modular Architecture**: Clean, maintainable code structure
- **ES6 Modules**: Modern JavaScript with imports/exports
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Keyboard navigation and screen reader friendly

## 📁 File Structure

- `index.html` - Main application structure
- `styles/main.css` - All styling and themes
- `js/app.js` - Main application logic
- `js/goalsManager.js` - Complete goals management system
- `js/themeManager.js` - Theme switching functionality
- `js/timer.js` - Focus timer implementation
- `js/utils.js` - Utility functions and helpers
- `server/` - Server-side API proxies (new)
- `frontend/services/` - Frontend service wrappers (new)
- `docs/` - Documentation (new)

## 📄 License

This project is for educational purposes. Feel free to modify and enhance for your needs.

---

**Built with ❤️ using modern web technologies**
