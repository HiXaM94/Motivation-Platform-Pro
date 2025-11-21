# Real-Time Inspiration Provider Setup Guide

## Overview

The Motivation Platform Pro features a real-time inspiration feed that can display motivational videos, articles, and curated content. The system uses a pluggable provider architecture that supports multiple content sources.

## Architecture

The inspiration system consists of:

1. **Provider Interface**: Base class that all providers extend
2. **Multiple Providers**: YouTube, Local Curated, and Mock providers
3. **Inspiration Service**: Manages providers and coordinates fetching
4. **Polling System**: Checks for new content at regular intervals
5. **Bookmark System**: Users can save favorite items

## Available Providers

### 1. Mock Provider (Default)

The Mock Provider is active by default and requires no configuration. It provides sample motivational content without external API calls.

**Characteristics:**
- No API keys required
- Returns 6 pre-defined sample items
- Simulates network delay
- Useful for development and demos

**Content Types:**
- Motivational videos (mock YouTube embeds)
- Self-improvement articles
- Philosophy and wisdom content
- Fitness motivation
- Business success stories

### 2. YouTube Data API Provider

Fetches real motivational videos from YouTube using the YouTube Data API v3.

**Setup Required:**
1. Get a YouTube Data API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the YouTube Data API v3 for your project
3. Configure the API key in application settings

**Configuration:**
```javascript
{
  youtubeApiKey: 'YOUR_API_KEY_HERE',
  youtubeSearchQuery: 'motivation success mindset',
  enableRealtimeFeed: true
}
```

**API Limits:**
- Free tier: 10,000 units per day
- Search operation: ~100 units per request
- Recommended polling interval: 5-10 minutes

**Error Handling:**
- Falls back gracefully if API key is invalid
- Caches results to reduce API calls
- Respects rate limits

### 3. Local Curated Provider

Stores curated content locally that administrators can manage through the app interface.

**Features:**
- No external dependencies
- Full control over content
- Instant updates
- Add, edit, and remove items

**Use Cases:**
- Custom company motivation content
- Private or proprietary videos
- Curated article collections
- Content requiring no API keys

## Getting Started

### Option 1: Use Mock Provider (Fastest)

No setup needed! The mock provider is active by default.

```javascript
// Mock provider is automatically initialized
// Just start using the inspiration feed
```

### Option 2: Add YouTube Integration

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Copy your API key

2. **Configure in App:**
   - Open the Settings page
   - Navigate to "Inspiration Feed" section
   - Paste your YouTube API Key
   - (Optional) Customize search query
   - Save settings

3. **Verify:**
   - Go to Inspiration section
   - New content should appear from YouTube
   - Check browser console for any errors

### Option 3: Use Local Curated Content

1. **Access Admin Interface:**
   - Navigate to Inspiration section
   - Click "Manage Content" button
   - Opens the curator interface

2. **Add Content:**
   - Click "Add New Item"
   - Fill in details:
     - Title
     - Description
     - Type (Video/Article)
     - URL or Video ID
     - Thumbnail URL
     - Category and tags
   - Click "Save"

3. **Content Appears Immediately:**
   - No refresh needed
   - Items appear in main feed
   - Users can bookmark and share

## Provider Priority

The system uses multiple providers simultaneously:

1. **Local Curated** - Always active
2. **YouTube** - Active if API key configured
3. **Mock** - Always active as fallback

Results from all active providers are combined and de-duplicated by ID.

## Polling Configuration

### Enable/Disable Polling

```javascript
// In application settings
{
  enableRealtimeFeed: true  // Set to false to disable
}
```

### Polling Interval

Default: 5 minutes (300,000 ms)

To change, edit `inspirationProvider.js`:

```javascript
this.pollingFrequency = 10 * 60 * 1000; // 10 minutes
```

### Manual Refresh

```javascript
const inspirationService = new InspirationService();
inspirationService.initialize();
await inspirationService.fetchAll();
```

## Content Schema

### Video Item

```json
{
  "id": "unique_id",
  "type": "video",
  "title": "Morning Motivation",
  "description": "Start your day with energy",
  "thumbnail": "https://...",
  "videoId": "abc123xyz",
  "duration": "10:32",
  "views": "1.2M",
  "source": "YouTube",
  "category": "morning",
  "tags": ["motivation", "morning", "routine"],
  "publishedAt": "2024-01-15T00:00:00.000Z"
}
```

### Article Item

```json
{
  "id": "unique_id",
  "type": "article",
  "title": "10 Habits of Successful People",
  "description": "Transform your life with these habits",
  "thumbnail": "https://...",
  "url": "https://...",
  "readTime": "8 min read",
  "source": "Medium",
  "category": "habits",
  "tags": ["habits", "success", "productivity"],
  "publishedAt": "2024-01-15T00:00:00.000Z"
}
```

## Adding Custom Providers

You can create custom providers by extending the `BaseInspirationProvider` class:

```javascript
class CustomProvider extends BaseInspirationProvider {
    constructor(config = {}) {
        super(config);
        // Your initialization
    }

    async fetch() {
        // Fetch from your source
        const items = await yourFetchLogic();
        
        this.cache = items;
        this.lastFetch = Date.now();
        
        return {
            success: true,
            items: this.cache,
            provider: 'custom'
        };
    }
}

// Register provider
inspirationService.providers.push(new CustomProvider());
```

## Bookmarking System

Users can bookmark inspiration items they want to save:

```javascript
// Bookmark an item
inspirationService.bookmarkItem(item);

// Check if bookmarked
const isBookmarked = inspirationService.isBookmarked(item.id);

// Remove bookmark
inspirationService.removeBookmark(item.id);

// Get all bookmarks
const bookmarks = inspirationService.getBookmarks();
```

Bookmarks are stored locally and included in data exports.

## Filtering and Search

The service supports filtering inspiration items:

```javascript
const filtered = inspirationService.filterItems({
    type: 'video',           // Filter by type
    category: 'business',     // Filter by category
    tags: ['success'],        // Filter by tags
    search: 'motivation'      // Text search
});
```

## Real-Time Notifications

When new items are fetched, the service notifies subscribers:

```javascript
// Subscribe to new items
const unsubscribe = inspirationService.subscribe((newItems) => {
    console.log(`${newItems.length} new items available!`);
    
    // Show toast notification
    showNotification(`${newItems.length} new inspirational items!`);
});

// Unsubscribe when done
unsubscribe();
```

## Troubleshooting

### No Items Appearing

1. Check browser console for errors
2. Verify API key is correct
3. Check network tab for failed requests
4. Ensure polling is enabled
5. Try manual refresh

### YouTube Quota Exceeded

- Wait 24 hours for quota reset
- Reduce polling frequency
- Switch to mock or local provider
- Consider upgrading to paid quota

### CORS Errors

- YouTube API should work without CORS issues
- For custom APIs, ensure CORS headers are set
- Consider using a proxy server

### Slow Performance

- Reduce polling frequency
- Limit number of items fetched
- Clear old cache periodically
- Optimize image loading

## Best Practices

1. **API Keys**: Never commit API keys to source control
2. **Caching**: Implement proper caching to reduce API calls
3. **Error Handling**: Always handle API failures gracefully
4. **Rate Limits**: Respect API rate limits and quotas
5. **User Experience**: Show loading states and error messages
6. **Privacy**: Respect user privacy when fetching external content

## Production Deployment

For production use:

1. Set up environment variables for API keys
2. Implement server-side proxy for API calls
3. Add rate limiting and caching layer
4. Monitor API usage and costs
5. Implement proper error logging
6. Set up content moderation if needed

## Future Enhancements

Planned features:

- RSS feed provider
- Medium API integration
- Reddit motivation subreddit feed
- Social sharing capabilities
- Content recommendations
- User-submitted content
- Advanced filtering options

## Support

For issues or questions:
- Check the troubleshooting section
- Review browser console errors
- Check network requests
- Refer to provider documentation

## API Documentation Links

- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
