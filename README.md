# 🚀 Motivation Hub Pro - Advanced Daily Motivation Platform

A comprehensive web application for daily motivation, goal tracking, and personal development with advanced features, AI-powered chatbot, and real-time inspiration feed.

> **🚧 New Features in Development:** This application now includes server-side API integration for AI chatbot and real-time inspiration content. See [API Keys Setup](#-api-keys-and-secrets) section below for configuration.

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

### 🤖 NEW: AI & Real-Time Features (In Development)
- **AI Chatbot**: Get personalized motivation and advice (powered by OpenAI)
- **Real-Time Inspiration Feed**: Dynamic motivational content from YouTube
- **Server-Side Proxy**: Secure API key management
- **Mock Mode**: Full functionality without API keys for development

## 🛠️ Installation

### Quick Start (Static Version)

For the basic static version without server features:

1. **Download the files** to a folder structure
2. **Open `index.html`** in your web browser
3. **Start using** the application immediately

### Full Installation (With Server & API Features)

For the complete version with AI chatbot and real-time inspiration:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HiXaM94/Motivation-Platform-Pro.git
   cd Motivation-Platform-Pro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API keys** (see [API Keys Setup](#-api-keys-and-secrets) below)

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 🔑 API Keys and Secrets

The application supports AI chatbot and real-time inspiration features that require API keys.

### Option 1: Mock Mode (No API Keys Required)
The application works without any API keys using mock responses. Perfect for development and testing!

### Option 2: Full Features (API Keys Required)
To enable real AI chatbot and YouTube inspiration:

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Get your API keys:**
   - **OpenAI API Key**: https://platform.openai.com/api-keys
   - **YouTube API Key**: https://console.cloud.google.com/apis/credentials

3. **Add keys to `.env` file:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here
   INSPIRATION_PROVIDER=youtube
   ```

4. **For GitHub repository secrets** (recommended for deployments):
   - See detailed guide: [`docs/SECRETS_AND_KEYS.md`](docs/SECRETS_AND_KEYS.md)
   - Add secrets at: Settings → Secrets and variables → Actions

⚠️ **Important:** Never commit the `.env` file with real API keys!

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

### Using the AI Chatbot (Coming Soon)
1. Click the chatbot icon
2. Type your message or question
3. Get personalized motivation and advice
4. Build on the conversation for deeper guidance

### Browsing Inspiration Feed (Coming Soon)
1. Visit the Inspiration section
2. Browse curated motivational content
3. Filter by category or search for specific topics
4. Save your favorites for later

## 🔧 Technical Features

- **Local Storage**: All data persists in your browser
- **Modular Architecture**: Clean, maintainable code structure
- **ES6 Modules**: Modern JavaScript with imports/exports
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Keyboard navigation and screen reader friendly
- **Server-Side Proxies**: Secure API key handling
- **Serverless Compatible**: Deploy to Vercel, Netlify, Railway, etc.

## 📁 File Structure

```
Motivation-Platform-Pro/
├── index.html                      # Main application structure
├── styles/
│   └── main.css                    # All styling and themes
├── js/
│   ├── app.js                      # Main application logic
│   ├── goalsManager.js             # Complete goals management system
│   ├── themeManager.js             # Theme switching functionality
│   ├── timer.js                    # Focus timer implementation
│   └── utils.js                    # Utility functions and helpers
├── frontend/
│   └── services/
│       ├── chatbotService.js       # Chatbot API client
│       └── inspirationService.js   # Inspiration API client
├── server/
│   ├── index.js                    # Server entry point
│   └── api/
│       ├── chatbotProxy.js         # OpenAI proxy endpoint
│       └── inspirationProxy.js     # YouTube proxy endpoint
├── docs/
│   └── SECRETS_AND_KEYS.md         # Secrets management guide
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
└── package.json                    # Node.js dependencies
```

## 🚀 Roadmap & TODO

This is a work in progress. The following features are planned for upcoming releases:

### Phase 1: Core Server Integration (Current PR) ✅
- [x] Server-side proxy endpoints for OpenAI and YouTube APIs
- [x] Environment-based secret handling
- [x] Mock responses for development without API keys
- [x] Frontend service stubs
- [x] Documentation for secrets management

### Phase 2: Chatbot UI & Functionality
- [ ] Full chatbot UI component with conversation history
- [ ] Typing indicator animation
- [ ] Quick reply suggestions
- [ ] Conversation persistence
- [ ] Export conversation history

### Phase 3: Goals Manager Refactor
- [ ] Enhanced CRUD operations with validation
- [ ] Soft-delete with trash management
- [ ] Goal templates and suggestions
- [ ] Sub-goals and task breakdown
- [ ] Goal sharing and collaboration features

### Phase 4: Real-Time Inspiration Feed
- [ ] Inspiration admin UI with filters
- [ ] Real-time content polling
- [ ] Favorite/bookmark system
- [ ] Category-based browsing
- [ ] Content recommendations

### Phase 5: Daily Journey Enhancements
- [ ] Advanced mood tracker with trends
- [ ] Daily checklists and routines
- [ ] Journaling with prompts
- [ ] Streak tracking and achievements
- [ ] Weekly/monthly summaries

### Phase 6: Export/Import & Backup
- [ ] Comprehensive data export utilities
- [ ] Import with validation and fixtures
- [ ] Automated backup scheduling
- [ ] Cloud sync integration (optional)
- [ ] Data migration tools

### Phase 7: Testing & Quality
- [ ] Unit tests for all services
- [ ] Integration tests for API endpoints
- [ ] E2E smoke tests
- [ ] Performance testing
- [ ] Accessibility audit

### Phase 8: Documentation & Polish
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guides
- [ ] Contributing guidelines
- [ ] Enhanced responsive design

## 🧪 Development & Testing

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

### Building for Production
The current version is a static web app with optional server components. For production:
1. Configure API keys in your hosting provider
2. Deploy static files + server endpoints
3. Set environment variables in hosting dashboard

## 📝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test your changes thoroughly
5. Submit a pull request

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Configure secrets in GitHub repository settings
- Review [`docs/SECRETS_AND_KEYS.md`](docs/SECRETS_AND_KEYS.md) for best practices

## 📄 License

This project is for educational purposes. Feel free to modify and enhance for your needs.

## 🙏 Acknowledgments

- OpenAI for GPT API
- YouTube Data API v3
- Modern web technologies and open-source community

---

**Built with ❤️ using modern web technologies**

For detailed setup instructions and troubleshooting, see the documentation in the `docs/` directory.
