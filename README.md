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

1. **Download the files** to a folder structure:
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
- `server/api/` - Server-side API proxy endpoints (new)
- `frontend/services/` - Frontend service layers (new)

## 🤖 AI & API Integration (In Progress)

### Current Status: Initial Scaffold Complete ✅

The platform is being enhanced with AI-powered features and real-time content integration:

#### 🎯 Completed
- ✅ Server-side proxy infrastructure for secure API handling
- ✅ OpenAI chatbot endpoint with GPT-4o-mini integration
- ✅ YouTube inspiration feed endpoint
- ✅ Mock data for development without API keys
- ✅ Frontend service layers for both features

#### 📋 Next Steps (Upcoming PRs)
- [ ] **Phase 1**: Chatbot UI with typing indicator, quick replies, and conversation history
- [ ] **Phase 2**: Goals Manager overhaul with AI-powered suggestions
- [ ] **Phase 3**: Real-time inspiration feed with admin panel and curation
- [ ] **Phase 4**: Daily Journey enhancements with AI insights and analytics
- [ ] **Phase 5**: Export/import utilities and data backup system
- [ ] **Phase 6**: Comprehensive test suite and CI/CD pipeline

#### 🔧 Setup for Developers
1. Copy `.env.example` to `.env`
2. Add your API keys (optional - mock mode works without keys):
   - `OPENAI_API_KEY` - For AI chatbot features
   - `YOUTUBE_API_KEY` - For inspiration content
3. See `docs/SECRETS_AND_KEYS.md` for detailed configuration instructions

**Note**: The application works fully in mock mode without API keys for development and testing.

## 🚀 Future Enhancements

- Cloud synchronization
- Social features and sharing
- Advanced analytics and reports
- Mobile app version
- Integration with productivity tools

## 📄 License

This project is for educational purposes. Feel free to modify and enhance for your needs.

---

**Built with ❤️ using modern web technologies**
