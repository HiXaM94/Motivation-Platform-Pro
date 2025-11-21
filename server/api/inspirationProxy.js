/**
 * Inspiration Proxy Endpoint
 * 
 * GET /api/inspiration
 * 
 * Proxies requests to YouTube Data API v3 for inspiration feed.
 * Reads YOUTUBE_API_KEY and INSPIRATION_PROVIDER from process.env.
 * 
 * If the API key is not available or provider is set to 'mock', 
 * returns mocked inspiration content for testing.
 * 
 * GitHub Secrets Configuration:
 * Add YOUTUBE_API_KEY to repository secrets at:
 * Settings → Secrets and variables → Actions → New repository secret
 * 
 * See docs/SECRETS_AND_KEYS.md for detailed setup instructions.
 */

/**
 * Mock inspiration content for testing without API key
 */
const mockInspirationContent = [
  {
    id: 'mock1',
    title: 'The Power of Small Wins - Building Momentum',
    description: 'Discover how celebrating small victories can lead to major achievements. Learn practical strategies for building lasting momentum in your personal and professional life.',
    thumbnail: 'https://via.placeholder.com/320x180/4F46E5/ffffff?text=Small+Wins',
    source: 'mock',
    category: 'Personal Growth',
    duration: '8:32'
  },
  {
    id: 'mock2',
    title: 'Morning Routine of Successful People',
    description: 'Explore the morning habits that successful people swear by. From meditation to exercise, learn how to structure your mornings for maximum productivity.',
    thumbnail: 'https://via.placeholder.com/320x180/7C3AED/ffffff?text=Morning+Routine',
    source: 'mock',
    category: 'Productivity',
    duration: '12:15'
  },
  {
    id: 'mock3',
    title: 'Overcoming Fear and Self-Doubt',
    description: 'Learn powerful techniques to overcome fear and silence your inner critic. Practical advice for building confidence and taking action despite uncertainty.',
    thumbnail: 'https://via.placeholder.com/320x180/EC4899/ffffff?text=Overcome+Fear',
    source: 'mock',
    category: 'Mindset',
    duration: '10:47'
  },
  {
    id: 'mock4',
    title: 'Goal Setting That Actually Works',
    description: 'Move beyond vague resolutions. Discover the science-backed approach to setting and achieving meaningful goals that align with your values.',
    thumbnail: 'https://via.placeholder.com/320x180/10B981/ffffff?text=Goal+Setting',
    source: 'mock',
    category: 'Goals',
    duration: '15:23'
  },
  {
    id: 'mock5',
    title: 'The Science of Habit Formation',
    description: 'Understand how habits are formed and how to leverage this knowledge to create positive changes in your life. Practical strategies backed by research.',
    thumbnail: 'https://via.placeholder.com/320x180/F59E0B/ffffff?text=Habits',
    source: 'mock',
    category: 'Self-Improvement',
    duration: '9:18'
  },
  {
    id: 'mock6',
    title: 'Mindfulness for Busy People',
    description: 'You don\'t need hours to meditate. Learn quick mindfulness techniques that fit into your busy schedule and provide immediate benefits.',
    thumbnail: 'https://via.placeholder.com/320x180/06B6D4/ffffff?text=Mindfulness',
    source: 'mock',
    category: 'Wellness',
    duration: '7:54'
  }
];

/**
 * Fetch inspiration from YouTube Data API v3
 */
async function fetchFromYouTube(apiKey, searchQuery = 'motivation success mindset') {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('q', searchQuery);
  url.searchParams.append('type', 'video');
  url.searchParams.append('maxResults', '10');
  url.searchParams.append('order', 'relevance');
  url.searchParams.append('key', apiKey);
  url.searchParams.append('videoDuration', 'medium'); // 4-20 minutes
  url.searchParams.append('videoDefinition', 'high');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`YouTube API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  // Transform YouTube response to our format
  return data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    source: 'youtube',
    category: 'Motivation',
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle
  }));
}

/**
 * Get mock inspiration content
 */
function getMockContent() {
  // Shuffle and return mock content
  const shuffled = [...mockInspirationContent].sort(() => Math.random() - 0.5);
  return shuffled;
}

/**
 * Main handler function
 * Serverless-compatible (Vercel, Netlify, etc.)
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
    // Get query parameters
    const { query, limit = '10' } = req.query || {};
    const searchQuery = query || 'motivation success mindset goals';
    const maxResults = Math.min(parseInt(limit, 10), 50); // Cap at 50

    // Check provider setting
    const provider = process.env.INSPIRATION_PROVIDER || 'mock';
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Use mock if provider is mock or API key is not available
    if (provider === 'mock' || !apiKey || apiKey === 'your_youtube_api_key_here') {
      console.warn('Using mock inspiration content - YOUTUBE_API_KEY not configured or provider set to mock');
      
      const mockContent = getMockContent();
      const limitedContent = mockContent.slice(0, maxResults);
      
      return res.status(200).json({
        success: true,
        data: limitedContent,
        count: limitedContent.length,
        mock: true,
        notice: 'Using mock content. Configure YOUTUBE_API_KEY in GitHub repository secrets and set INSPIRATION_PROVIDER=youtube for real YouTube content.'
      });
    }

    // Fetch from YouTube API
    const youtubeContent = await fetchFromYouTube(apiKey, searchQuery);
    const limitedContent = youtubeContent.slice(0, maxResults);

    return res.status(200).json({
      success: true,
      data: limitedContent,
      count: limitedContent.length,
      mock: false,
      provider: 'youtube'
    });

  } catch (error) {
    console.error('Inspiration proxy error:', error);
    
    // Fallback to mock on error
    const mockContent = getMockContent();
    const maxResults = parseInt(req.query?.limit || '10', 10);
    const limitedContent = mockContent.slice(0, maxResults);
    
    return res.status(200).json({
      success: true,
      data: limitedContent,
      count: limitedContent.length,
      mock: true,
      notice: 'An error occurred. Using mock content as fallback.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * For Express.js or standard Node.js HTTP server
 */
export function handleInspirationRequest(req, res) {
  // Parse query if needed
  return handler(req, res);
}
