/**
 * InspirationProvider - Pluggable service for fetching inspirational content
 * Supports multiple providers: YouTube, RSS feeds, and local curated content
 */

/**
 * Base Provider Interface
 */
class BaseInspirationProvider {
    constructor(config = {}) {
        this.config = config;
        this.cache = [];
        this.lastFetch = 0;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    async fetch() {
        throw new Error('fetch() must be implemented by provider');
    }

    shouldRefresh() {
        return Date.now() - this.lastFetch > this.cacheDuration;
    }
}

/**
 * Mock Provider - Returns sample data without external API calls
 * Used when no API keys are configured
 */
class MockInspirationProvider extends BaseInspirationProvider {
    constructor(config = {}) {
        super(config);
        this.mockData = this.generateMockData();
    }

    generateMockData() {
        return [
            {
                id: 'mock_1',
                type: 'video',
                title: 'Morning Motivation - Start Your Day Right',
                description: 'Powerful morning routine to kickstart your day with energy and purpose',
                thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80',
                videoId: 'dQw4w9WgXcQ', // Mock YouTube ID
                duration: '10:32',
                views: '1.2M',
                source: 'YouTube',
                category: 'morning',
                tags: ['motivation', 'morning', 'routine']
            },
            {
                id: 'mock_2',
                type: 'video',
                title: 'Business Success Mindset',
                description: 'Learn the mindset of successful entrepreneurs',
                thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80',
                videoId: 'jNQXAC9IVRw', // Mock YouTube ID
                duration: '15:45',
                views: '850K',
                source: 'YouTube',
                category: 'business',
                tags: ['business', 'success', 'mindset']
            },
            {
                id: 'mock_3',
                type: 'article',
                title: '10 Habits of Highly Successful People',
                description: 'Transform your life by adopting these proven daily habits',
                thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80',
                url: '#',
                readTime: '8 min read',
                source: 'Medium',
                category: 'habits',
                tags: ['habits', 'success', 'productivity']
            },
            {
                id: 'mock_4',
                type: 'video',
                title: 'Gym Motivation - Push Your Limits',
                description: 'High-energy workout motivation to push past your limits',
                thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
                videoId: 'dQw4w9WgXcQ',
                duration: '5:20',
                views: '2.1M',
                source: 'YouTube',
                category: 'fitness',
                tags: ['fitness', 'gym', 'workout']
            },
            {
                id: 'mock_5',
                type: 'article',
                title: 'The Power of Positive Thinking',
                description: 'How to harness the power of positive thoughts to achieve your goals',
                thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&q=80',
                url: '#',
                readTime: '6 min read',
                source: 'Psychology Today',
                category: 'mindset',
                tags: ['mindset', 'positive', 'psychology']
            },
            {
                id: 'mock_6',
                type: 'video',
                title: 'Wisdom from Great Philosophers',
                description: 'Ancient wisdom applied to modern challenges',
                thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
                videoId: 'jNQXAC9IVRw',
                duration: '20:15',
                views: '650K',
                source: 'YouTube',
                category: 'wisdom',
                tags: ['philosophy', 'wisdom', 'learning']
            }
        ];
    }

    async fetch() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.cache = this.mockData;
        this.lastFetch = Date.now();
        
        return {
            success: true,
            items: this.cache,
            provider: 'mock'
        };
    }
}

/**
 * YouTube Provider - Fetches content from YouTube Data API
 * Requires API key to be configured
 */
class YouTubeInspirationProvider extends BaseInspirationProvider {
    constructor(config = {}) {
        super(config);
        this.apiKey = config.apiKey || '';
        this.searchQuery = config.searchQuery || 'motivation success mindset';
        this.maxResults = config.maxResults || 10;
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async fetch() {
        if (!this.isConfigured()) {
            console.warn('YouTube API key not configured');
            return {
                success: false,
                error: 'API key not configured',
                items: []
            };
        }

        try {
            const url = `https://www.googleapis.com/youtube/v3/search?` +
                `part=snippet&q=${encodeURIComponent(this.searchQuery)}` +
                `&type=video&maxResults=${this.maxResults}&key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            this.cache = data.items.map(item => ({
                id: item.id.videoId,
                type: 'video',
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.medium.url,
                videoId: item.id.videoId,
                source: 'YouTube',
                publishedAt: item.snippet.publishedAt,
                channelTitle: item.snippet.channelTitle,
                tags: []
            }));

            this.lastFetch = Date.now();

            return {
                success: true,
                items: this.cache,
                provider: 'youtube'
            };
        } catch (error) {
            console.error('YouTube fetch error:', error);
            return {
                success: false,
                error: error.message,
                items: []
            };
        }
    }
}

/**
 * Local Curated Provider - Uses locally stored curated content
 * Managed through admin interface
 */
class LocalCuratedProvider extends BaseInspirationProvider {
    constructor(config = {}) {
        super(config);
        this.storageKey = 'curatedInspiration';
    }

    async fetch() {
        const curated = Utils.getStorage(this.storageKey, []);
        
        this.cache = curated;
        this.lastFetch = Date.now();
        
        return {
            success: true,
            items: this.cache,
            provider: 'local'
        };
    }

    add(item) {
        const curated = Utils.getStorage(this.storageKey, []);
        
        const newItem = {
            id: `curated_${Date.now()}`,
            ...item,
            addedAt: new Date().toISOString()
        };
        
        curated.push(newItem);
        Utils.setStorage(this.storageKey, curated);
        
        return newItem;
    }

    remove(id) {
        const curated = Utils.getStorage(this.storageKey, []);
        const filtered = curated.filter(item => item.id !== id);
        Utils.setStorage(this.storageKey, filtered);
        return { success: true };
    }

    update(id, updates) {
        const curated = Utils.getStorage(this.storageKey, []);
        const index = curated.findIndex(item => item.id === id);
        
        if (index !== -1) {
            curated[index] = { ...curated[index], ...updates };
            Utils.setStorage(this.storageKey, curated);
            return { success: true, item: curated[index] };
        }
        
        return { success: false, error: 'Item not found' };
    }
}

/**
 * Main Inspiration Service - Manages multiple providers and polling
 */
class InspirationService {
    constructor() {
        this.providers = [];
        this.combinedCache = [];
        this.pollingInterval = null;
        this.pollingFrequency = 5 * 60 * 1000; // 5 minutes
        this.bookmarks = Utils.getStorage('inspirationBookmarks', []);
        this.listeners = [];
    }

    /**
     * Initialize with configured providers
     */
    initialize() {
        const settings = Utils.getStorage('appSettings', {});
        
        // Always add local curated provider
        this.providers.push(new LocalCuratedProvider());
        
        // Add YouTube provider if configured
        if (settings.youtubeApiKey) {
            this.providers.push(new YouTubeInspirationProvider({
                apiKey: settings.youtubeApiKey,
                searchQuery: settings.youtubeSearchQuery || 'motivation success mindset'
            }));
        }
        
        // Add mock provider as fallback
        this.providers.push(new MockInspirationProvider());
        
        // Start polling if enabled
        if (settings.enableRealtimeFeed !== false) {
            this.startPolling();
        }
    }

    /**
     * Fetch from all configured providers
     */
    async fetchAll() {
        const results = await Promise.all(
            this.providers.map(provider => provider.fetch())
        );

        // Combine results from all providers
        const allItems = [];
        results.forEach(result => {
            if (result.success && result.items) {
                allItems.push(...result.items);
            }
        });

        // Remove duplicates by ID
        const uniqueItems = [];
        const seenIds = new Set();
        
        allItems.forEach(item => {
            if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueItems.push(item);
            }
        });

        // Check for new items
        const oldIds = new Set(this.combinedCache.map(item => item.id));
        const newItems = uniqueItems.filter(item => !oldIds.has(item.id));

        this.combinedCache = uniqueItems;

        // Notify listeners of new items
        if (newItems.length > 0) {
            this.notifyListeners(newItems);
        }

        return {
            success: true,
            items: this.combinedCache,
            newItems: newItems
        };
    }

    /**
     * Start polling for new content
     */
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        // Initial fetch
        this.fetchAll();

        // Set up polling
        this.pollingInterval = setInterval(() => {
            this.fetchAll();
        }, this.pollingFrequency);
    }

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Subscribe to new item notifications
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all listeners of new items
     */
    notifyListeners(newItems) {
        this.listeners.forEach(callback => {
            try {
                callback(newItems);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }

    /**
     * Bookmark an inspiration item
     */
    bookmarkItem(item) {
        const bookmark = {
            ...item,
            bookmarkedAt: new Date().toISOString()
        };
        
        if (!this.bookmarks.find(b => b.id === item.id)) {
            this.bookmarks.push(bookmark);
            Utils.setStorage('inspirationBookmarks', this.bookmarks);
        }
        
        return { success: true };
    }

    /**
     * Remove bookmark
     */
    removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        Utils.setStorage('inspirationBookmarks', this.bookmarks);
        return { success: true };
    }

    /**
     * Check if item is bookmarked
     */
    isBookmarked(id) {
        return this.bookmarks.some(b => b.id === id);
    }

    /**
     * Get all bookmarks
     */
    getBookmarks() {
        return this.bookmarks;
    }

    /**
     * Get items filtered by category/type
     */
    filterItems(filter = {}) {
        let items = [...this.combinedCache];

        if (filter.type) {
            items = items.filter(item => item.type === filter.type);
        }

        if (filter.category) {
            items = items.filter(item => item.category === filter.category);
        }

        if (filter.tags && filter.tags.length > 0) {
            items = items.filter(item => 
                item.tags && filter.tags.some(tag => item.tags.includes(tag))
            );
        }

        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(searchLower) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        }

        return items;
    }

    /**
     * Get local curated provider for admin functions
     */
    getLocalProvider() {
        return this.providers.find(p => p instanceof LocalCuratedProvider);
    }
}
