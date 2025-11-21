/**
 * DataManager - Central data management for export, import, backup, and restore
 * Handles data versioning, validation, and conflict resolution
 */
class DataManager {
    constructor() {
        this.SCHEMA_VERSION = '1.0.0';
        this.BACKUP_KEY_PREFIX = 'motivationApp_backup_';
        this.MAX_BACKUPS = 10;
        this.AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Export all application data as JSON
     * @returns {Object} Complete data export with versioning
     */
    exportData() {
        const exportData = {
            version: this.SCHEMA_VERSION,
            exportedAt: new Date().toISOString(),
            data: {
                goals: Utils.getStorage('goals', []),
                deletedGoals: Utils.getStorage('deletedGoals', []),
                categories: Utils.getStorage('categories', []),
                stats: Utils.getStorage('stats', {}),
                journalEntries: Utils.getStorage('journalEntries', []),
                inspirationBookmarks: Utils.getStorage('inspirationBookmarks', []),
                dailyChecklist: Utils.getStorage('dailyChecklist', []),
                moodHistory: Utils.getStorage('moodHistory', []),
                streakData: Utils.getStorage('streakData', {}),
                achievements: Utils.getStorage('achievements', []),
                settings: Utils.getStorage('appSettings', {}),
                theme: Utils.getStorage('theme', 'light')
            }
        };

        return exportData;
    }

    /**
     * Download exported data as JSON file
     */
    downloadExport() {
        const data = this.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `motivation-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return { success: true, message: 'Data exported successfully' };
    }

    /**
     * Validate imported data structure
     * @param {Object} data - Imported data object
     * @returns {Object} Validation result
     */
    validateImportData(data) {
        const errors = [];
        
        if (!data || typeof data !== 'object') {
            errors.push('Invalid data format');
            return { valid: false, errors };
        }

        if (!data.version) {
            errors.push('Missing version information');
        }

        if (!data.data || typeof data.data !== 'object') {
            errors.push('Missing data section');
            return { valid: false, errors };
        }

        // Check for required data sections
        const requiredSections = ['goals'];
        requiredSections.forEach(section => {
            if (!Array.isArray(data.data[section])) {
                errors.push(`Invalid or missing ${section} data`);
            }
        });

        return {
            valid: errors.length === 0,
            errors,
            warnings: this.checkVersionCompatibility(data.version)
        };
    }

    /**
     * Check version compatibility and suggest migration
     * @param {string} importVersion - Version of imported data
     * @returns {Array} Array of warning messages
     */
    checkVersionCompatibility(importVersion) {
        const warnings = [];
        
        if (!importVersion) {
            warnings.push('Data version unknown - may require manual review');
            return warnings;
        }

        const [importMajor] = importVersion.split('.').map(Number);
        const [currentMajor] = this.SCHEMA_VERSION.split('.').map(Number);

        if (importMajor < currentMajor) {
            warnings.push(`Data from older version (${importVersion}). Will attempt automatic migration.`);
        } else if (importMajor > currentMajor) {
            warnings.push(`Data from newer version (${importVersion}). Some features may not be supported.`);
        }

        return warnings;
    }

    /**
     * Import data with merge or replace strategy
     * @param {Object} importedData - Data to import
     * @param {string} strategy - 'merge' or 'replace'
     * @returns {Object} Import result
     */
    importData(importedData, strategy = 'replace') {
        const validation = this.validateImportData(importedData);
        
        if (!validation.valid) {
            return {
                success: false,
                errors: validation.errors,
                warnings: validation.warnings
            };
        }

        try {
            // Create backup before importing
            this.createBackup('pre_import');

            const data = importedData.data;

            if (strategy === 'merge') {
                this.mergeImport(data);
            } else {
                this.replaceImport(data);
            }

            return {
                success: true,
                message: 'Data imported successfully',
                warnings: validation.warnings
            };
        } catch (error) {
            console.error('Import error:', error);
            return {
                success: false,
                errors: ['Import failed: ' + error.message]
            };
        }
    }

    /**
     * Replace existing data with imported data
     * @param {Object} data - Imported data
     */
    replaceImport(data) {
        Object.keys(data).forEach(key => {
            if (key === 'theme') {
                Utils.setStorage('theme', data[key]);
            } else {
                Utils.setStorage(key, data[key]);
            }
        });
    }

    /**
     * Merge imported data with existing data
     * @param {Object} data - Imported data
     */
    mergeImport(data) {
        // Merge goals (avoid duplicates by ID)
        if (data.goals) {
            const existingGoals = Utils.getStorage('goals', []);
            const existingIds = new Set(existingGoals.map(g => g.id));
            const newGoals = data.goals.filter(g => !existingIds.has(g.id));
            Utils.setStorage('goals', [...existingGoals, ...newGoals]);
        }

        // Merge journal entries
        if (data.journalEntries) {
            const existingEntries = Utils.getStorage('journalEntries', []);
            const existingIds = new Set(existingEntries.map(e => e.id));
            const newEntries = data.journalEntries.filter(e => !existingIds.has(e.id));
            Utils.setStorage('journalEntries', [...existingEntries, ...newEntries]);
        }

        // Merge categories
        if (data.categories) {
            const existingCategories = Utils.getStorage('categories', []);
            const existingIds = new Set(existingCategories.map(c => c.id));
            const newCategories = data.categories.filter(c => !existingIds.has(c.id));
            Utils.setStorage('categories', [...existingCategories, ...newCategories]);
        }

        // Merge bookmarks
        if (data.inspirationBookmarks) {
            const existingBookmarks = Utils.getStorage('inspirationBookmarks', []);
            const existingIds = new Set(existingBookmarks.map(b => b.id));
            const newBookmarks = data.inspirationBookmarks.filter(b => !existingIds.has(b.id));
            Utils.setStorage('inspirationBookmarks', [...existingBookmarks, ...newBookmarks]);
        }

        // Merge other data sections that don't conflict
        ['dailyChecklist', 'moodHistory', 'achievements'].forEach(key => {
            if (data[key]) {
                const existing = Utils.getStorage(key, []);
                Utils.setStorage(key, [...existing, ...data[key]]);
            }
        });

        // Settings are merged at property level
        if (data.settings) {
            const existingSettings = Utils.getStorage('appSettings', {});
            Utils.setStorage('appSettings', { ...existingSettings, ...data.settings });
        }
    }

    /**
     * Create a timestamped backup
     * @param {string} label - Optional label for the backup
     * @returns {Object} Backup result
     */
    createBackup(label = 'manual') {
        try {
            const timestamp = Date.now();
            const backupKey = `${this.BACKUP_KEY_PREFIX}${timestamp}_${label}`;
            const data = this.exportData();
            
            Utils.setStorage(backupKey, data);
            
            // Clean old backups
            this.cleanOldBackups();
            
            return {
                success: true,
                timestamp,
                key: backupKey
            };
        } catch (error) {
            console.error('Backup error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get list of available backups
     * @returns {Array} List of backup metadata
     */
    getBackups() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.BACKUP_KEY_PREFIX)) {
                try {
                    const data = Utils.getStorage(key);
                    if (data && data.exportedAt) {
                        const [, timestampLabel] = key.replace(this.BACKUP_KEY_PREFIX, '').split('_');
                        backups.push({
                            key,
                            timestamp: parseInt(timestampLabel),
                            date: data.exportedAt,
                            label: key.split('_').slice(2).join('_') || 'manual'
                        });
                    }
                } catch (error) {
                    console.error('Error reading backup:', key, error);
                }
            }
        }
        
        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Restore data from a specific backup
     * @param {string} backupKey - Key of the backup to restore
     * @returns {Object} Restore result
     */
    restoreFromBackup(backupKey) {
        try {
            const backupData = Utils.getStorage(backupKey);
            
            if (!backupData) {
                return {
                    success: false,
                    error: 'Backup not found'
                };
            }

            // Create a backup before restoring
            this.createBackup('pre_restore');

            const result = this.importData(backupData, 'replace');
            
            if (result.success) {
                return {
                    success: true,
                    message: 'Backup restored successfully'
                };
            } else {
                return result;
            }
        } catch (error) {
            console.error('Restore error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete a specific backup
     * @param {string} backupKey - Key of the backup to delete
     */
    deleteBackup(backupKey) {
        try {
            localStorage.removeItem(backupKey);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Clean old backups, keeping only MAX_BACKUPS most recent
     */
    cleanOldBackups() {
        const backups = this.getBackups();
        
        if (backups.length > this.MAX_BACKUPS) {
            const toDelete = backups.slice(this.MAX_BACKUPS);
            toDelete.forEach(backup => {
                localStorage.removeItem(backup.key);
            });
        }
    }

    /**
     * Set up automatic periodic backups
     */
    setupAutoBackup() {
        // Check if auto backup is enabled
        const settings = Utils.getStorage('appSettings', {});
        if (settings.autoBackupEnabled === false) {
            return;
        }

        // Check last backup time
        const lastBackupTime = Utils.getStorage('lastAutoBackup', 0);
        const now = Date.now();
        
        if (now - lastBackupTime > this.AUTO_BACKUP_INTERVAL) {
            this.createBackup('auto');
            Utils.setStorage('lastAutoBackup', now);
        }

        // Schedule next check
        setTimeout(() => this.setupAutoBackup(), 60 * 60 * 1000); // Check every hour
    }

    /**
     * Migrate data from older schema version to current
     * @param {Object} data - Data to migrate
     * @param {string} fromVersion - Source version
     * @returns {Object} Migrated data
     */
    migrateData(data, fromVersion) {
        // Future: Add migration logic for different versions
        // For now, just return the data as-is
        console.log(`Migrating data from version ${fromVersion} to ${this.SCHEMA_VERSION}`);
        return data;
    }
}
