/**
 * Inspiration Proxy API Endpoint
 * 
 * GET /api/inspiration?provider=mock|youtube|rss
 * 
 * Server-side proxy that fetches inspirational content from various providers.
 * Reads YOUTUBE_API_KEY from process.env when provider=youtube.
 * 
 * MAINTAINER ACTION REQUIRED:
 * Add YOUTUBE_API_KEY to GitHub repository secrets for production deployment.
 * For local development, add YOUTUBE_API_KEY to .env file (DO NOT commit .env).
 */

/**
 * Generate mock inspiration items for development
 */
function getMockInspirationItems() {
    return [
        {
            id: 'mock-1',
            title: 'The Power of Consistency',
            description: 'Small daily actions compound into remarkable results. Focus on progress, not perfection.',
            thumbnail: 'https://via.placeholder.com/320x180/4f46e5/ffffff?text=Consistency',
            url: '#',
            source: 'mock',
            publishedAt: new Date().toISOString()
        },
        {
            id: 'mock-2',
            title: 'Embrace Growth Mindset',
            description: 'Challenges are opportunities to learn and grow. Every setback is a setup for a comeback.',
            thumbnail: 'https://via.placeholder.com/320x180/7c3aed/ffffff?text=Growth',
            url: '#',
            source: 'mock',
            publishedAt: new Date().toISOString()
        },
        {
            id: 'mock-3',
            title: 'Set Clear Goals',
            description: 'A goal without a plan is just a wish. Break down your dreams into actionable steps.',
            thumbnail: 'https://via.placeholder.com/320x180/2563eb/ffffff?text=Goals',
            url: '#',
            source: 'mock',
            publishedAt: new Date().toISOString()
        },
        {
            id: 'mock-4',
            title: 'Practice Gratitude Daily',
            description: 'Gratitude transforms what we have into enough. Start and end each day with thankfulness.',
            thumbnail: 'https://via.placeholder.com/320x180/059669/ffffff?text=Gratitude',
            url: '#',
            source: 'mock',
            publishedAt: new Date().toISOString()
        }
    ];
}

/**
 * Fetch inspiration from YouTube API
 * 
 * @param {string} apiKey - YouTube Data API v3 key
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum results to return
 */
async function fetchYouTubeInspiration(apiKey, query = 'motivation', maxResults = 10) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`YouTube API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform YouTube results to our format
    return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        source: 'youtube',
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
    }));
}

/**
 * Handle inspiration proxy requests
 * 
 * @param {Object} req - Request object with query params { provider, query, maxResults }
 * @param {Object} res - Response object
 */
async function handleInspirationRequest(req, res) {
    // Helper function for JSON responses
    const sendJSON = (statusCode, data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    };

    // CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Only accept GET requests
    if (req.method !== 'GET') {
        sendJSON(405, { error: 'Method not allowed. Use GET.' });
        return;
    }

    try {
        // Parse query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const provider = url.searchParams.get('provider') || process.env.INSPIRATION_PROVIDER || 'mock';
        const query = url.searchParams.get('query') || 'motivation';
        const maxResults = parseInt(url.searchParams.get('maxResults') || '10', 10);

        console.log(`[Inspiration Proxy] Fetching from provider: ${provider}`);

        let items = [];
        let isMock = false;

        switch (provider.toLowerCase()) {
            case 'youtube': {
                const apiKey = process.env.YOUTUBE_API_KEY;
                
                if (!apiKey) {
                    console.warn('[Inspiration Proxy] YOUTUBE_API_KEY not found. Falling back to mock data.');
                    items = getMockInspirationItems();
                    isMock = true;
                } else {
                    try {
                        items = await fetchYouTubeInspiration(apiKey, query, maxResults);
                    } catch (error) {
                        console.error('[Inspiration Proxy] YouTube API error:', error.message);
                        // Fallback to mock on error
                        items = getMockInspirationItems();
                        isMock = true;
                    }
                }
                break;
            }

            case 'rss': {
                // RSS provider placeholder - to be implemented in future PR
                console.warn('[Inspiration Proxy] RSS provider not yet implemented. Using mock data.');
                items = getMockInspirationItems();
                isMock = true;
                break;
            }

            case 'mock':
            default: {
                items = getMockInspirationItems();
                isMock = true;
                break;
            }
        }

        // Return response
        sendJSON(200, {
            success: true,
            provider: isMock ? 'mock' : provider,
            items: items,
            count: items.length,
            isMock: isMock,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Inspiration Proxy] Error:', error);
        sendJSON(500, {
            error: 'Internal server error',
            message: error.message
        });
    }
}

// Export for serverless/Node.js environments
module.exports = handleInspirationRequest;

// For direct Node.js server usage
if (require.main === module) {
    const http = require('http');
    const server = http.createServer(async (req, res) => {
        await handleInspirationRequest(req, res);
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`[Inspiration Proxy] Server running on port ${PORT}`);
        console.log(`[Inspiration Proxy] YOUTUBE_API_KEY ${process.env.YOUTUBE_API_KEY ? 'found' : 'NOT found (using mock mode)'}`);
        console.log(`[Inspiration Proxy] Default provider: ${process.env.INSPIRATION_PROVIDER || 'mock'}`);
    });
}
