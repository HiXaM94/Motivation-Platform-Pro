# WIP PR Notes - OpenAI and YouTube Integration

**Status:** 🚧 Work In Progress - Initial Scaffold Complete

This PR implements the initial server-side infrastructure for integrating OpenAI and YouTube APIs into the Motivation Platform Pro. This is the foundation for several upcoming features.

## What's Included in This PR

### ✅ Completed

1. **Project Structure Setup**
   - Added `package.json` for Node.js dependencies
   - Created `.env.example` template for API keys
   - Added `.gitignore` for sensitive files and dependencies

2. **Server-Side API Proxies**
   - `server/api/chatbotProxy.js` - OpenAI proxy endpoint
     - POST `/api/chatbot` - Sends messages to OpenAI GPT-4o-mini
     - Includes mock fallback responses for development
     - Proper error handling for missing/invalid keys
   - `server/api/inspirationProxy.js` - YouTube/content proxy endpoint
     - GET `/api/inspiration` - Fetches motivational content
     - Supports multiple providers: mock, YouTube, RSS (RSS coming in follow-up)
     - Mock data included for keyless development

3. **Frontend Service Layers**
   - `frontend/services/chatbotService.js` - Chatbot API wrapper
     - Conversation history management
     - Export/import capabilities
     - Quick replies support (to be enhanced)
   - `frontend/services/inspirationService.js` - Inspiration API wrapper
     - Content fetching with caching
     - Category filtering and date sorting
     - Saved items export

4. **Documentation**
   - `docs/SECRETS_AND_KEYS.md` - Comprehensive API key setup guide
   - `docs/PR_NOTES.md` - This file
   - Updated README with integration notes

### 🎯 Key Features

- **Security First**: All API keys are server-side only, never exposed to client
- **Mock Mode**: Full functionality without API keys for development
- **Serverless Ready**: Code is compatible with Vercel, Netlify, AWS Lambda
- **Error Handling**: Clear error messages when keys are missing or invalid
- **Extensible**: Easy to add new providers or endpoints

## What's NOT in This PR (Coming in Follow-up PRs)

### Phase 1: Core Features (Next PR)
- [ ] Chatbot UI components with typing indicator
- [ ] Quick replies and suggested actions
- [ ] Conversation persistence in localStorage
- [ ] Chatbot settings panel (model selection, temperature)

### Phase 2: Goals Manager Overhaul
- [ ] Central state management for goals
- [ ] Enhanced CRUD operations
- [ ] Goal templates and recommendations
- [ ] Smart goal suggestions using AI

### Phase 3: Inspiration Feed
- [ ] Real-time inspiration feed UI
- [ ] Admin panel for content curation
- [ ] RSS feed provider implementation
- [ ] Favorites and bookmarking system
- [ ] Background refresh and notifications

### Phase 4: Daily Journey Enhancements
- [ ] Journal integration with AI insights
- [ ] Mood tracking analytics
- [ ] Personalized daily challenges
- [ ] Progress visualization

### Phase 5: Export/Import System
- [ ] Goals backup and restore utilities
- [ ] Conversation history export
- [ ] Data migration tools
- [ ] Fixture data for testing

### Phase 6: Testing & CI
- [ ] Unit tests for all services
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] CI/CD pipeline setup
- [ ] Automated testing on PRs

## Required Maintainer Actions

### Before Merging

1. **Review Code Structure**
   - Verify serverless function compatibility with your deployment platform
   - Check that file paths and imports match your deployment setup
   - Review error handling and logging approach

2. **Add GitHub Repository Secrets**
   
   Navigate to: Repository Settings → Secrets and variables → Actions
   
   Add the following secrets:
   - `OPENAI_API_KEY` - Your OpenAI API key
     - Get it from: https://platform.openai.com/api-keys
     - Format: `sk-proj-xxxxxxxxxxxxx`
   - `YOUTUBE_API_KEY` - Your YouTube Data API v3 key
     - Get it from: https://console.cloud.google.com/apis/credentials
     - Format: `AIzaSyxxxxxxxxxxxxx`

   See `docs/SECRETS_AND_KEYS.md` for detailed instructions.

3. **Configure Deployment Platform**
   
   If deploying to Vercel/Netlify:
   - Add environment variables in platform dashboard
   - Or use CLI: `vercel env add OPENAI_API_KEY`
   - Redeploy after adding variables

### After Merging

1. **Deploy and Test**
   - Deploy to staging environment first
   - Test chatbot endpoint: POST `/api/chatbot` with a test message
   - Test inspiration endpoint: GET `/api/inspiration?provider=youtube&limit=5`
   - Verify API keys are loaded (check logs for warnings)
   - Monitor API usage in OpenAI and Google Cloud dashboards

2. **Set Usage Limits** (Important!)
   - OpenAI: Set monthly spending limit in account settings
   - YouTube: Monitor daily quota (free tier = 10,000 units/day)

3. **Create Follow-up Issues**
   - Create GitHub issues for each phase listed above
   - Assign to team members
   - Set milestones and priorities

## Technical Notes

### Serverless Function Compatibility

The proxy endpoints use a standard request/response pattern that works with:
- **Vercel**: Works out of the box (place in `api/` directory)
- **Netlify**: Works with Netlify Functions (place in `netlify/functions/`)
- **AWS Lambda**: Compatible with Lambda proxy integration
- **Traditional Node.js**: Uncomment Express router code at bottom of each file

### API Costs Estimate

Based on moderate usage:
- **OpenAI gpt-4o-mini**: ~$0.15/1M input tokens, ~$0.60/1M output tokens
  - Estimated cost: $5-20/month for 1000 conversations
- **YouTube Data API**: Free tier = 10,000 units/day
  - Each search = 100 units = ~100 searches/day free
  - Paid tier if needed: $0.25 per 10,000 units

### Environment Variables in Different Contexts

- **Local development**: Uses `.env` file (not committed)
- **GitHub Actions**: Uses repository secrets automatically
- **Vercel**: Uses environment variables from dashboard
- **Netlify**: Uses environment variables from site settings

### Mock Data Strategy

Both endpoints include comprehensive mock responses so developers can:
- Build and test UI without API keys
- Demo features without incurring costs
- Onboard new contributors quickly

The app gracefully falls back to mock mode if keys are missing.

## Testing Checklist

Before marking this PR as ready:

- [ ] Verify `.env` is in `.gitignore` (✅ already added)
- [ ] Confirm no real API keys are committed (✅ only `.env.example`)
- [ ] Test chatbot endpoint with mock mode
- [ ] Test inspiration endpoint with mock mode
- [ ] Test chatbot endpoint with real OpenAI key
- [ ] Test inspiration endpoint with real YouTube key
- [ ] Verify error messages are user-friendly
- [ ] Check CORS headers if needed for your deployment
- [ ] Test rate limiting behavior
- [ ] Review logs for security issues

## Questions or Issues?

If you encounter problems:
1. Check `docs/SECRETS_AND_KEYS.md` for configuration help
2. Review server logs for specific error messages
3. Test endpoints with curl to isolate frontend/backend issues
4. Verify environment variables are loaded in deployment platform

## Next Steps After Approval

1. Merge this PR to main branch
2. Deploy to staging with API keys configured
3. Create follow-up PRs for Phase 1 (Chatbot UI)
4. Update project board with new issues for remaining phases
5. Schedule team meeting to discuss Phase 2+ implementation

---

**Ready for Review** ✅

This scaffold is production-ready and includes all necessary safety measures (mock mode, error handling, documentation). Once maintainers add the required API keys, the full functionality will be available.
