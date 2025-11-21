# Secrets and API Keys Management

This document explains how to securely manage API keys and secrets for the Motivation Platform Pro application.

## Overview

The application requires API keys for the following services:
- **OpenAI API** - Powers the AI chatbot functionality
- **YouTube Data API v3** - Provides real-time inspiration content feed

## Option A: GitHub Repository Secrets (Recommended)

This is the **recommended approach** for managing secrets in this project.

### Setting Up GitHub Repository Secrets

1. **Navigate to your repository on GitHub**
   - Go to `https://github.com/YOUR_USERNAME/Motivation-Platform-Pro`

2. **Access Repository Settings**
   - Click on "Settings" tab
   - In the left sidebar, click on "Secrets and variables" → "Actions"

3. **Add Repository Secrets**
   - Click "New repository secret"
   - Add the following secrets one by one:

   **Secret Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key from https://platform.openai.com/api-keys
   
   **Secret Name:** `YOUTUBE_API_KEY`
   - **Value:** Your YouTube Data API v3 key from https://console.cloud.google.com/apis/credentials

4. **Verify Secrets**
   - Once added, secrets will be available to GitHub Actions workflows
   - They will be accessible via `process.env.OPENAI_API_KEY` in your application
   - Secrets are encrypted and never exposed in logs

### Using Secrets in GitHub Actions

In your workflow files (`.github/workflows/*.yml`), reference secrets as:

```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
```

## Option B: Local Development with .env File

For local development and testing:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your API keys:**
   ```
   OPENAI_API_KEY=sk-proj-...your-actual-key...
   YOUTUBE_API_KEY=AIza...your-actual-key...
   INSPIRATION_PROVIDER=youtube
   BACKUP_INTERVAL=30
   ```

3. **IMPORTANT:** Never commit the `.env` file
   - The `.env` file is already in `.gitignore`
   - Always double-check before committing

## Option C: Hosting Provider Environment Variables

When deploying to hosting providers (Vercel, Netlify, Railway, etc.):

### Vercel
1. Go to your project settings on Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add each secret with its value
4. Redeploy your application

### Netlify
1. Go to "Site settings" → "Build & deploy" → "Environment"
2. Click "Edit variables"
3. Add your secrets
4. Trigger a new deployment

### Railway
1. Go to your project's "Variables" tab
2. Click "New Variable"
3. Add each secret
4. Railway will automatically redeploy

### Heroku
```bash
heroku config:set OPENAI_API_KEY=your-key-here
heroku config:set YOUTUBE_API_KEY=your-key-here
```

## Obtaining API Keys

### OpenAI API Key

1. **Sign up or log in** to OpenAI at https://platform.openai.com/
2. **Navigate to API Keys** section
3. **Create a new secret key**
4. **Copy the key immediately** (it won't be shown again)
5. **Set usage limits** in your OpenAI account to prevent unexpected charges

**Cost Considerations:**
- OpenAI API is usage-based
- Set up billing alerts in your OpenAI account
- Consider using GPT-3.5-turbo for cost-effective operation

### YouTube Data API v3 Key

1. **Go to Google Cloud Console** at https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable YouTube Data API v3**
   - Navigate to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. **Create credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key
5. **Restrict the API key** (recommended)
   - Click on your API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Save changes

**Quota Considerations:**
- YouTube Data API has a daily quota limit (default: 10,000 units/day)
- Each search operation costs 100 quota units
- Monitor your usage in Google Cloud Console

## Fallback: Mock Mode

The application includes mock responses for development without API keys:

- Set `INSPIRATION_PROVIDER=mock` in your `.env` file
- The chatbot and inspiration feed will use sample data
- No API keys required for testing basic functionality

## Security Best Practices

1. **Never commit secrets to version control**
   - Always use `.env` files (in `.gitignore`)
   - Use environment variables
   - Use secret management services

2. **Rotate keys regularly**
   - Change API keys periodically
   - Revoke old keys when updating

3. **Use minimum required permissions**
   - Restrict API keys to only necessary services
   - Use API key restrictions when available

4. **Monitor usage**
   - Set up billing alerts
   - Review API usage regularly
   - Watch for unusual patterns

5. **Different keys for different environments**
   - Use separate keys for development, staging, and production
   - Never use production keys in development

## Troubleshooting

### "Missing API Key" Errors

If you see errors about missing API keys:

1. **Check that secrets are set correctly**
   - For GitHub: Verify in repository secrets
   - For local: Check `.env` file exists and has correct values
   - For hosting: Verify environment variables in provider dashboard

2. **Verify secret names match exactly**
   - Must be: `OPENAI_API_KEY` and `YOUTUBE_API_KEY`
   - Environment variable names are case-sensitive

3. **Restart the application**
   - After adding secrets, restart your server
   - For hosting providers, trigger a new deployment

### "Invalid API Key" Errors

1. **Verify the key is correct**
   - Check for extra spaces or characters
   - Ensure the full key was copied

2. **Check key permissions**
   - OpenAI: Ensure billing is set up
   - YouTube: Ensure API is enabled in Google Cloud Console

3. **Verify key restrictions**
   - Check if key is restricted to specific domains/IPs
   - Temporarily remove restrictions to test

## Support

If you encounter issues:
1. Check the error messages in server logs
2. Verify API key validity in the respective dashboards
3. Review the application's mock mode for testing
4. Open an issue in the GitHub repository with details (never include actual keys!)

---

**Last Updated:** November 2025
