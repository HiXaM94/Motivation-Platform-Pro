# CI/CD Workflow Notes

This directory will contain GitHub Actions workflows for continuous integration and deployment.

## Planned Workflows

### 1. Test Workflow (`test.yml`)
- Run unit tests and integration tests
- Execute when: push to main/develop, pull requests
- Use secrets: OPENAI_API_KEY, YOUTUBE_API_KEY (for integration tests)
- Status: **TODO** - Will be implemented in follow-up PR

### 2. Lint Workflow (`lint.yml`)
- Run code linting and formatting checks
- Execute when: push to any branch, pull requests
- Status: **TODO** - Will be implemented in follow-up PR

### 3. Deploy Workflow (`deploy.yml`)
- Deploy to production/staging environments
- Execute when: push to main (production), push to develop (staging)
- Use secrets: OPENAI_API_KEY, YOUTUBE_API_KEY, deployment credentials
- Status: **TODO** - Will be implemented in follow-up PR

## Using Secrets in Workflows

GitHub repository secrets are configured at:
**Settings → Secrets and variables → Actions**

In workflow files, reference secrets as:
```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
```

## Required Secrets

The following secrets must be added to the repository:
- `OPENAI_API_KEY` - OpenAI API key for chatbot tests
- `YOUTUBE_API_KEY` - YouTube Data API v3 key for inspiration feed tests

See `docs/SECRETS_AND_KEYS.md` for detailed setup instructions.

## Development

For local testing without secrets, the application will use mock responses.
Set `INSPIRATION_PROVIDER=mock` in your local `.env` file.

---

**Last Updated:** November 2025
**Status:** Planning phase - workflows will be added in follow-up PRs
