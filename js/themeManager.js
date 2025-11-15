class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.saveTheme(this.currentTheme);
        this.updateToggleButton();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Add smooth transition
        document.documentElement.style.transition = 'all 0.3s ease';
        
        // Update meta theme color for mobile browsers
        this.updateMetaThemeColor(theme);
    }

    updateToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (this.currentTheme === 'light') {
                icon.className = 'fas fa-moon';
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            } else {
                icon.className = 'fas fa-sun';
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            }
        }
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = theme === 'light' ? '#f8fafc' : '#0f172a';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('motivationHub_theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        
        return 'dark';
    }

    saveTheme(theme) {
        localStorage.setItem('motivationHub_theme', theme);
    }

    // Utility method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Method to set specific theme
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.saveTheme(theme);
            this.updateToggleButton();
        }
    }
}