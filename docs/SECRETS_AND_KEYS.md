# Secrets and API Keys Configuration

This document explains how to configure API keys for the Motivation Platform Pro application.

## ⚠️ Security Warning

**NEVER commit real API keys to version control!**

- Do not commit `.env` files containing real keys
- Do not hardcode keys in source code
- Do not share keys in public channels or documentation
- Use environment variables or secrets management systems

## Required API Keys

### 1. OpenAI API Key (OPENAI_API_KEY)

Used for the AI-powered chatbot feature.

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key immediately (you won't be able to see it again)

**Cost:** OpenAI charges per token used. The gpt-4o-mini model is very cost-effective (~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens as of 2024).

### 2. YouTube Data API Key (YOUTUBE_API_KEY)

Used for fetching motivational video content in the inspiration feed.

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to Credentials
5. Click "Create Credentials" > "API Key"
6. Copy the API key

**Cost:** YouTube Data API has a free quota of 10,000 units per day. Each search query costs 100 units, so you get ~100 searches per day for free.

## Configuration Methods

### Method A: GitHub Repository Secrets (Recommended for Production)

Best for production deployments and CI/CD pipelines.

**Setup Steps:**
1. Go to your GitHub repository
2. Click on "Settings" tab
3. Navigate to "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Add each secret:
   - Name: `OPENAI_API_KEY`, Value: your OpenAI API key
   - Name: `YOUTUBE_API_KEY`, Value: your YouTube API key

**Deployment Platforms:**
- **Vercel**: Automatically uses GitHub secrets or add in Vercel dashboard
- **Netlify**: Add in site settings under "Build & Deploy" > "Environment"
- **GitHub Actions**: Secrets are automatically available

### Method B: Local .env File (For Development)

Best for local development and testing.

**Setup Steps:**
1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your real API keys:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
   INSPIRATION_PROVIDER=youtube
   EXPORT_BACKUP_INTERVAL_MINUTES=60
   ```

3. **IMPORTANT**: The `.env` file is already in `.gitignore` - never remove it from there!

### Method C: Serverless Platform Environment Variables

For platforms like Vercel, Netlify, AWS Lambda, etc.

**Vercel:**
```bash
vercel env add OPENAI_API_KEY
vercel env add YOUTUBE_API_KEY
```

**Netlify:**
1. Go to Site settings
2. Build & deploy > Environment
3. Add variables

**AWS Lambda:**
Use AWS Systems Manager Parameter Store or Secrets Manager

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No* | - | OpenAI API key for chatbot. Falls back to mock if not provided. |
| `YOUTUBE_API_KEY` | No* | - | YouTube Data API key. Falls back to mock if not provided. |
| `INSPIRATION_PROVIDER` | No | `mock` | Provider for inspiration content: `mock`, `youtube`, or `rss` |
| `EXPORT_BACKUP_INTERVAL_MINUTES` | No | `60` | Interval in minutes for backup reminders |

\* Not strictly required - the app will use mock data if keys are not provided, but real functionality requires these keys.

## Testing Without API Keys

The application includes mock data for development:

- **Chatbot**: Returns pre-written motivational responses
- **Inspiration Feed**: Shows placeholder motivational content

This allows you to:
- Develop and test the UI without API costs
- Onboard new developers quickly
- Demo the application without sharing keys

## Verifying Configuration

### Check if keys are loaded (backend logs):

The server endpoints will log warnings if keys are not configured:
```
OPENAI_API_KEY not configured, using mock response
YOUTUBE_API_KEY not configured, falling back to mock data
```

### Test the endpoints:

**Chatbot:**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Inspiration:**
```bash
curl http://localhost:3000/api/inspiration?provider=youtube&limit=5
```

If configured correctly, you should see real API responses instead of mock data.

## Security Best Practices

1. **Rotate keys regularly**: Change API keys every 90 days
2. **Use separate keys**: Different keys for dev/staging/prod environments
3. **Monitor usage**: Check OpenAI and Google Cloud dashboards for unexpected usage
4. **Set usage limits**: Configure spending limits in API dashboards
5. **Restrict key permissions**: Use least-privilege access (e.g., read-only keys where possible)
6. **Audit access**: Review who has access to secrets in GitHub settings

## Troubleshooting

### Error: "Invalid OpenAI API key"
- Verify the key starts with `sk-` for old keys or `sk-proj-` for project keys
- Check for extra spaces or newlines when copying
- Ensure the key hasn't been revoked or expired

### Error: "YouTube API quota exceeded"
- Check your usage in Google Cloud Console
- Consider caching results to reduce API calls
- Wait 24 hours for quota reset

### Mock data still showing despite keys being set
- Verify environment variables are loaded (check server logs)
- Restart your development server
- For serverless deployments, redeploy after adding environment variables

## Getting Help

If you encounter issues:
1. Check server logs for specific error messages
2. Verify keys are correctly formatted
3. Test keys directly using curl or API testing tools
4. Review API provider documentation for rate limits and usage

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
