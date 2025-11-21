/**
 * Inspiration Proxy API Endpoint
 * 
 * Server-side proxy for fetching motivational content from various sources.
 * This endpoint handles GET requests to /api/inspiration and supports multiple providers.
 * 
 * Environment Variables:
 * - YOUTUBE_API_KEY: Your YouTube Data API key (set in GitHub repo secrets or .env)
 * - INSPIRATION_PROVIDER: Provider to use (mock|youtube|rss), defaults to 'mock'
 * 
 * Query Parameters:
 * - provider: Override the default provider (mock|youtube|rss)
 * - limit: Number of items to return (default: 10, max: 50)
 * - category: Filter by category (motivation, productivity, mindfulness)
 * 
 * Response:
 * {
 *   "items": [
 *     {
 *       "id": "unique-id",
 *       "title": "Item title",
 *       "description": "Item description",
 *       "thumbnail": "url",
 *       "url": "content-url",
 *       "source": "provider-name",
 *       "publishedAt": "ISO date"
 *     }
 *   ],
 *   "provider": "mock|youtube|rss",
 *   "total": 10
 * }
 */

// Mock inspiration items for development
const MOCK_INSPIRATION_ITEMS = [
  {
    id: 'mock-1',
    title: 'The Power of Small Wins',
    description: 'Discover how celebrating small victories can lead to massive success over time.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Small+Wins',
    url: '#',
    source: 'Mock Provider',
    publishedAt: new Date().toISOString(),
    category: 'motivation'
  },
  {
    id: 'mock-2',
    title: '5 Morning Habits of Successful People',
    description: 'Learn the morning routines that top performers use to start their day with purpose.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Morning+Habits',
    url: '#',
    source: 'Mock Provider',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'productivity'
  },
  {
    id: 'mock-3',
    title: 'Mindfulness Meditation for Beginners',
    description: 'A simple guide to starting your mindfulness practice today.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Mindfulness',
    url: '#',
    source: 'Mock Provider',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    category: 'mindfulness'
  },
  {
    id: 'mock-4',
    title: 'Overcoming Procrastination',
    description: 'Practical strategies to beat procrastination and get things done.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Beat+Procrastination',
    url: '#',
    source: 'Mock Provider',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    category: 'productivity'
  },
  {
    id: 'mock-5',
    title: 'Building Unshakeable Confidence',
    description: 'Develop lasting self-confidence through proven techniques.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Confidence',
    url: '#',
    source: 'Mock Provider',
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    category: 'motivation'
  }
];

/**
 * Fetch inspiration from YouTube API
 */
async function fetchFromYouTube(apiKey, limit = 10, category = '') {
  const searchQuery = category 
    ? `${category} motivation` 
    : 'motivation inspirational';

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=${encodeURIComponent(searchQuery)}&` +
      `type=video&maxResults=${Math.min(limit, 50)}&` +
      `order=relevance&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'YouTube',
      publishedAt: item.snippet.publishedAt,
      category: category || 'motivation'
    }));
  } catch (error) {
    console.error('YouTube API fetch error:', error);
    throw error;
  }
}

/**
 * Fetch inspiration from RSS feeds (placeholder for future implementation)
 */
async function fetchFromRSS(limit = 10, category = '') {
  // TODO: Implement RSS feed fetching in follow-up PR
  // For now, return mock data with RSS label
  return MOCK_INSPIRATION_ITEMS.slice(0, limit).map(item => ({
    ...item,
    source: 'RSS Feed (Coming Soon)',
    id: `rss-${item.id}`
  }));
}

/**
 * Get mock inspiration items
 */
function getMockInspiration(limit = 10, category = '') {
  let items = MOCK_INSPIRATION_ITEMS;
  
  // Filter by category if provided
  if (category) {
    items = items.filter(item => item.category === category);
  }
  
  return items.slice(0, Math.min(limit, items.length));
}

/**
 * Main handler function for serverless deployment
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
  }

  try {
    // Parse query parameters
    const { 
      provider: requestedProvider, 
      limit = '10', 
      category = '' 
    } = req.query;

    const itemLimit = Math.min(parseInt(limit, 10) || 10, 50);
    
    // Determine which provider to use
    const defaultProvider = process.env.INSPIRATION_PROVIDER || 'mock';
    const provider = requestedProvider || defaultProvider;

    let items = [];
    let actualProvider = provider;

    // Handle different providers
    switch (provider.toLowerCase()) {
      case 'youtube': {
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        
        if (!youtubeApiKey || youtubeApiKey === 'your_youtube_api_key_here') {
          console.warn('YOUTUBE_API_KEY not configured, falling back to mock data');
          items = getMockInspiration(itemLimit, category);
          actualProvider = 'mock';
        } else {
          try {
            items = await fetchFromYouTube(youtubeApiKey, itemLimit, category);
            actualProvider = 'youtube';
          } catch (error) {
            console.error('YouTube fetch failed, falling back to mock:', error);
            items = getMockInspiration(itemLimit, category);
            actualProvider = 'mock-fallback';
          }
        }
        break;
      }

      case 'rss': {
        items = await fetchFromRSS(itemLimit, category);
        actualProvider = 'rss';
        break;
      }

      case 'mock':
      default: {
        items = getMockInspiration(itemLimit, category);
        actualProvider = 'mock';
        break;
      }
    }

    // Return successful response
    return res.status(200).json({
      items,
      provider: actualProvider,
      total: items.length,
      ...(actualProvider.includes('mock') && {
        warning: 'Using mock data. Configure YOUTUBE_API_KEY for real content.'
      })
    });

  } catch (error) {
    console.error('Inspiration proxy error:', error);
    
    // Return error response
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching inspiration content. Please try again.'
    });
  }
}

/**
 * For Node.js/Express server usage (alternative to serverless)
 * Uncomment and use this if deploying to a traditional Node.js server
 */
/*
const express = require('express');
const router = express.Router();

router.get('/api/inspiration', async (req, res) => {
  return handler(req, res);
});

module.exports = router;
*/
