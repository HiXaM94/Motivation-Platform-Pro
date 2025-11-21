# API Secrets and Keys Configuration Guide

This document explains how to securely configure API keys for the Motivation Platform Pro application.

## 🔐 Security First

**CRITICAL: NEVER commit API keys to the repository!**

- Real API keys should ONLY be stored in:
  - GitHub repository secrets (for production/deployment)
  - Local `.env` file (for development, which is gitignored)
- The `.env.example` file contains placeholder values only - never real keys

## 📋 Required API Keys

### 1. OpenAI API Key

**Used for:** AI-powered chatbot functionality

**How to obtain:**
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to [API Keys section](https://platform.openai.com/api-keys)
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again!)
5. Note: OpenAI requires billing setup for API access

**Recommended model:** `gpt-4o-mini` (cost-effective and fast)

### 2. YouTube Data API v3 Key

**Used for:** Fetching inspirational video content

**How to obtain:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3" in the API Library
4. Navigate to Credentials
5. Click "Create Credentials" > "API Key"
6. Copy the generated API key
7. (Optional) Restrict the key to YouTube Data API v3 for security

**Free tier:** 10,000 quota units per day (sufficient for most use cases)

## 🛠️ Configuration Methods

### For Local Development

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your real keys:**
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxx
   ```

3. **Verify `.env` is gitignored:**
   ```bash
   git status  # .env should NOT appear
   ```

4. **Start your development server:**
   The server will automatically read from `.env` file

### For GitHub Actions / Production Deployment

1. **Navigate to repository settings:**
   - Go to your GitHub repository
   - Click "Settings" tab
   - Select "Secrets and variables" > "Actions"

2. **Add repository secrets:**
   - Click "New repository secret"
   - Add each secret:
     - Name: `OPENAI_API_KEY`
     - Value: Your actual OpenAI API key
     - Name: `YOUTUBE_API_KEY`
     - Value: Your actual YouTube API key

3. **GitHub Actions will automatically use these secrets**
   - Secrets are encrypted and not visible in logs
   - Access via `${{ secrets.OPENAI_API_KEY }}` in workflows

### For Other Deployment Platforms

**Vercel:**
```bash
vercel env add OPENAI_API_KEY
vercel env add YOUTUBE_API_KEY
```

**Netlify:**
- Go to Site settings > Environment variables
- Add each key-value pair

**Heroku:**
```bash
heroku config:set OPENAI_API_KEY=your_key_here
heroku config:set YOUTUBE_API_KEY=your_key_here
```

**Railway / Render:**
- Use their web dashboard to add environment variables

## 🧪 Development Without Keys (Mock Mode)

The application is designed to work without API keys for development:

- **Chatbot:** Returns mock responses when `OPENAI_API_KEY` is missing
- **Inspiration:** Shows placeholder content when `YOUTUBE_API_KEY` is missing

This allows you to:
- Test the UI/UX
- Develop frontend features
- Work on layout and styling
- All without spending money on API calls

## ✅ Verification Checklist

Before deploying to production:

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys are committed in any file
- [ ] GitHub repository secrets are configured
- [ ] Mock mode works when keys are absent
- [ ] Real API calls work when keys are present
- [ ] Error messages are clear when keys are invalid

## 🔍 Testing Your Configuration

**Test locally:**
```bash
# Without keys (should use mock mode)
unset OPENAI_API_KEY
unset YOUTUBE_API_KEY
npm start

# With keys (should use real APIs)
export OPENAI_API_KEY=your_key
export YOUTUBE_API_KEY=your_key
npm start
```

**Check the logs:**
- Server should log which keys are found/missing
- Should indicate when using mock mode
- Should show clear errors for invalid keys

## 🆘 Troubleshooting

**Problem:** Server can't find API keys
- **Solution:** Check `.env` file exists and has correct variable names
- **Solution:** Restart server after adding keys
- **Solution:** Verify no typos in variable names

**Problem:** OpenAI API returns 401 Unauthorized
- **Solution:** Verify your API key is correct
- **Solution:** Check you have billing enabled on OpenAI platform
- **Solution:** Ensure key hasn't been revoked

**Problem:** YouTube API returns 403 Forbidden
- **Solution:** Verify YouTube Data API v3 is enabled in Google Cloud
- **Solution:** Check API key restrictions aren't blocking requests
- **Solution:** Verify you haven't exceeded quota (10k units/day)

**Problem:** Keys are committed to git
- **Solution:** IMMEDIATELY revoke those keys in provider dashboards
- **Solution:** Generate new keys
- **Solution:** Use `git filter-branch` or BFG Repo-Cleaner to remove from history
- **Solution:** Update `.gitignore` to prevent future commits

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Environment Variables Best Practices](https://12factor.net/config)

## 🔄 Rotating Keys

If a key is compromised:

1. **Immediately revoke** the exposed key in the provider dashboard
2. **Generate a new key**
3. **Update all deployments:**
   - Local `.env` file
   - GitHub repository secrets
   - Any other deployment platforms
4. **Test** to ensure everything works with new keys
5. **Consider** using key rotation policies for production

---

**Remember:** API keys are like passwords. Treat them with the same level of security!
