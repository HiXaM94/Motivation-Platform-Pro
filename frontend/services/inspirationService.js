/**
 * Inspiration Service
 * 
 * Frontend service for fetching inspiration content from the server proxy endpoint.
 * Retrieves motivational videos and content from YouTube API (or mock data).
 * 
 * Usage:
 *   import { getInspiration, searchInspiration } from './services/inspirationService.js';
 *   
 *   const content = await getInspiration();
 *   console.log(content.data); // Array of inspiration items
 *   console.log(content.mock); // true if using mock data
 */

/**
 * Base API URL - can be configured via environment or defaults to relative path
 */
const API_BASE_URL = window.location.origin;

/**
 * Default inspiration topics for variety
 */
const DEFAULT_TOPICS = [
  'motivation success mindset',
  'goal setting achievement',
  'personal growth development',
  'productivity focus',
  'overcoming obstacles resilience',
  'morning routine habits'
];

/**
 * Get random inspiration topic
 */
function getRandomTopic() {
  return DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];
}

/**
 * Get inspiration content with default search
 * 
 * @param {Object} options - Options object
 * @param {number} options.limit - Maximum number of items to return (default: 10)
 * @returns {Promise<Object>} Response object with { success, data, count, mock, notice? }
 */
export async function getInspiration(options = {}) {
  const { limit = 10 } = options;
  const randomTopic = getRandomTopic();
  return searchInspiration(randomTopic, limit);
}

/**
 * Search for inspiration content with a specific query
 * 
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of items to return (default: 10)
 * @returns {Promise<Object>} Response object with { success, data, count, mock, notice? }
 */
export async function searchInspiration(query, limit = 10) {
  try {
    // Validate input
    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    // Build query parameters
    const params = new URLSearchParams({
      query: query || getRandomTopic(),
      limit: limit.toString()
    });

    // Call the inspiration proxy endpoint
    const response = await fetch(`${API_BASE_URL}/api/inspiration?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch inspiration content');
    }

    return data;

  } catch (error) {
    console.error('Inspiration service error:', error);
    
    // Return a minimal fallback response on network error
    return {
      success: false,
      data: [],
      count: 0,
      mock: true,
      error: error.message,
      notice: 'Unable to fetch inspiration content. Please try again later.'
    };
  }
}

/**
 * Get inspiration by category
 * 
 * @param {string} category - Category name (e.g., 'productivity', 'mindset', 'goals')
 * @param {number} limit - Maximum number of items to return (default: 10)
 * @returns {Promise<Object>} Response object
 */
export async function getInspirationByCategory(category, limit = 10) {
  return searchInspiration(`${category} motivation`, limit);
}

/**
 * Check if inspiration service is using mock content
 * 
 * @returns {Promise<boolean>} True if using mock content
 */
export async function isMockMode() {
  try {
    const response = await searchInspiration('test', 1);
    return response.mock === true;
  } catch (error) {
    return true; // Assume mock mode on error
  }
}

/**
 * Get inspiration service status
 * 
 * @returns {Promise<Object>} Status object with { available, mock, provider?, notice? }
 */
export async function getInspirationStatus() {
  try {
    const testResponse = await searchInspiration('test', 1);
    return {
      available: testResponse.success,
      mock: testResponse.mock,
      provider: testResponse.provider,
      notice: testResponse.notice
    };
  } catch (error) {
    return {
      available: false,
      mock: true,
      notice: 'Inspiration service is currently unavailable'
    };
  }
}

/**
 * Refresh inspiration content (useful for "load more" or "refresh" features)
 * 
 * @param {string} lastQuery - The last query used (optional, will use random if not provided)
 * @param {number} limit - Maximum number of items to return (default: 10)
 * @returns {Promise<Object>} Response object
 */
export async function refreshInspiration(lastQuery, limit = 10) {
  const query = lastQuery || getRandomTopic();
  return searchInspiration(query, limit);
}

// Export default object for convenience
export default {
  getInspiration,
  searchInspiration,
  getInspirationByCategory,
  isMockMode,
  getInspirationStatus,
  refreshInspiration
};
