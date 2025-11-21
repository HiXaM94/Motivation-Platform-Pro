/**
 * Inspiration Service
 * 
 * Frontend service for fetching motivational content from various sources.
 * Handles all inspiration feed API calls and content management.
 */

class InspirationService {
  constructor() {
    this.apiEndpoint = '/api/inspiration';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.defaultProvider = 'mock'; // Will use server's default if not specified
  }

  /**
   * Fetch inspiration items
   * @param {Object} options - Fetch options
   * @param {string} options.provider - Provider to use (mock|youtube|rss)
   * @param {number} options.limit - Number of items to fetch (default: 10, max: 50)
   * @param {string} options.category - Filter by category
   * @param {boolean} options.useCache - Whether to use cached data (default: true)
   * @returns {Promise<Object>} Response from the API
   */
  async fetchInspiration({ 
    provider, 
    limit = 10, 
    category = '', 
    useCache = true 
  } = {}) {
    // Create cache key
    const cacheKey = `${provider || 'default'}-${limit}-${category}`;
    
    // Check cache if enabled
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('Returning cached inspiration data');
        return {
          ...cached.data,
          fromCache: true
        };
      }
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (provider) params.append('provider', provider);
      if (limit) params.append('limit', limit.toString());
      if (category) params.append('category', category);

      const url = `${this.apiEndpoint}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Cache the response
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: {
          success: true,
          items: data.items,
          provider: data.provider,
          total: data.total,
          warning: data.warning
        }
      });

      return {
        success: true,
        items: data.items,
        provider: data.provider,
        total: data.total,
        warning: data.warning,
        fromCache: false
      };

    } catch (error) {
      console.error('Inspiration service error:', error);
      return {
        success: false,
        error: error.message,
        items: [],
        provider: provider || 'unknown'
      };
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get a single inspiration item by ID
   * @param {string} itemId - Item ID to fetch
   * @returns {Promise<Object|null>} Item data or null if not found
   */
  async getItemById(itemId) {
    // Check all cached entries
    for (const [, cached] of this.cache.entries()) {
      const item = cached.data.items.find(i => i.id === itemId);
      if (item) {
        return item;
      }
    }

    // If not in cache, fetch fresh data
    // This is a simple implementation; could be optimized in follow-up PRs
    const result = await this.fetchInspiration({ useCache: false });
    if (result.success) {
      return result.items.find(i => i.id === itemId) || null;
    }

    return null;
  }

  /**
   * Filter items by category
   * @param {Array} items - Array of inspiration items
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered items
   */
  filterByCategory(items, category) {
    if (!category) return items;
    return items.filter(item => 
      item.category && item.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Sort items by publish date
   * @param {Array} items - Array of inspiration items
   * @param {boolean} ascending - Sort order (default: false for newest first)
   * @returns {Array} Sorted items
   */
  sortByDate(items, ascending = false) {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Get available categories from items
   * @param {Array} items - Array of inspiration items
   * @returns {Array<string>} Unique categories
   */
  getCategories(items) {
    const categories = new Set();
    items.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories);
  }

  /**
   * Format item for display
   * @param {Object} item - Inspiration item
   * @returns {Object} Formatted item with additional display properties
   */
  formatForDisplay(item) {
    const description = item.description || '';
    return {
      ...item,
      formattedDate: new Date(item.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      shortDescription: description.length > 150 
        ? description.substring(0, 150) + '...'
        : description
    };
  }

  /**
   * Export favorites/saved items
   * @param {Array} itemIds - Array of item IDs to export
   * @returns {string} JSON string of saved items
   */
  async exportSavedItems(itemIds) {
    const items = [];
    for (const id of itemIds) {
      const item = await this.getItemById(id);
      if (item) {
        items.push(item);
      }
    }

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      count: items.length,
      items
    }, null, 2);
  }
}

// Create and export a singleton instance
const inspirationService = new InspirationService();

// For ES6 modules
export default inspirationService;

// For CommonJS (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = inspirationService;
}
