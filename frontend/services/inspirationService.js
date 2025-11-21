/**
 * Inspiration Service
 * 
 * Frontend service wrapper for inspiration API proxy.
 * Handles communication with GET /api/inspiration endpoint.
 */

class InspirationService {
    constructor(baseUrl = '', options = {}) {
        // Use relative path if no baseUrl provided (works for same-origin)
        // For different origins, set baseUrl to server URL
        this.baseUrl = baseUrl;
        this.cache = null;
        this.cacheTimestamp = null;
        // Allow configurable cache duration, default to 5 minutes
        this.cacheDuration = options.cacheDuration || 5 * 60 * 1000;
    }

    /**
     * Fetch inspiration items
     * 
     * @param {Object} options - Fetch options
     * @param {string} options.provider - Provider to use ('mock', 'youtube', 'rss')
     * @param {string} options.query - Search query (for YouTube)
     * @param {number} options.maxResults - Maximum results to return
     * @param {boolean} options.useCache - Whether to use cached results
     * @returns {Promise<Object>} Inspiration response
     */
    async fetchInspiration(options = {}) {
        const {
            provider = 'mock',
            query = 'motivation',
            maxResults = 10,
            useCache = true
        } = options;

        // Check cache
        if (useCache && this.cache && this.cacheTimestamp) {
            const cacheAge = Date.now() - this.cacheTimestamp;
            if (cacheAge < this.cacheDuration) {
                console.log('[Inspiration Service] Returning cached data');
                return this.cache;
            }
        }

        try {
            // Build query string
            const params = new URLSearchParams({
                provider,
                query,
                maxResults: maxResults.toString()
            });

            const url = `${this.baseUrl}/api/inspiration?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Update cache
            if (data.success) {
                this.cache = data;
                this.cacheTimestamp = Date.now();
            }

            return data;

        } catch (error) {
            console.error('[Inspiration Service] Error:', error);
            throw error;
        }
    }

    /**
     * Fetch from YouTube provider
     * 
     * @param {string} query - Search query
     * @param {number} maxResults - Maximum results
     * @returns {Promise<Object>} Inspiration response
     */
    async fetchFromYouTube(query = 'motivation', maxResults = 10) {
        return this.fetchInspiration({
            provider: 'youtube',
            query,
            maxResults,
            useCache: false
        });
    }

    /**
     * Fetch from RSS provider
     * 
     * @param {number} maxResults - Maximum results
     * @returns {Promise<Object>} Inspiration response
     */
    async fetchFromRSS(maxResults = 10) {
        return this.fetchInspiration({
            provider: 'rss',
            maxResults,
            useCache: false
        });
    }

    /**
     * Fetch mock data (useful for development)
     * 
     * @returns {Promise<Object>} Inspiration response
     */
    async fetchMockData() {
        return this.fetchInspiration({
            provider: 'mock',
            useCache: false
        });
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }

    /**
     * Get cache status
     * 
     * @returns {Object} Cache status information
     */
    getCacheStatus() {
        if (!this.cache || !this.cacheTimestamp) {
            return {
                cached: false,
                age: null,
                remaining: null
            };
        }

        const age = Date.now() - this.cacheTimestamp;
        const remaining = Math.max(0, this.cacheDuration - age);

        return {
            cached: true,
            age: Math.round(age / 1000), // seconds
            remaining: Math.round(remaining / 1000), // seconds
            expiresAt: new Date(this.cacheTimestamp + this.cacheDuration).toISOString()
        };
    }
}

// Export for ES6 modules
export default InspirationService;

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InspirationService;
}
