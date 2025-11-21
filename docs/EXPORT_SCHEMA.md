# Data Export Schema Documentation

## Version 1.0.0

This document describes the JSON schema used for exporting and importing data from the Motivation Platform Pro application.

## Overview

The export format is a JSON object that contains all user data including goals, journal entries, mood tracking, checklists, bookmarks, and settings. The format includes versioning to support future migrations.

## Root Schema

```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "data": { ... }
}
```

### Root Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `version` | string | Yes | Schema version number (semantic versioning) |
| `exportedAt` | string | Yes | ISO 8601 timestamp of when the export was created |
| `data` | object | Yes | Container for all application data |

## Data Object Schema

The `data` object contains the following properties:

### Goals

Array of goal objects representing user objectives.

```json
{
  "goals": [
    {
      "id": "1234567890",
      "text": "Complete morning meditation session",
      "category": "wellness",
      "priority": "high",
      "progress": 75,
      "completed": false,
      "subtasks": [],
      "dueDate": "2024-01-20T00:00:00.000Z",
      "recurring": null,
      "tags": ["wellness", "daily"],
      "notes": "Practice mindfulness for 10 minutes",
      "createdAt": "2024-01-01T08:00:00.000Z",
      "updatedAt": "2024-01-15T09:30:00.000Z"
    }
  ]
}
```

#### Goal Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the goal |
| `text` | string | Yes | Goal description |
| `category` | string | Yes | Category ID (references categories array) |
| `priority` | string | Yes | Priority level: "high", "medium", or "low" |
| `progress` | number | Yes | Progress percentage (0-100) |
| `completed` | boolean | Yes | Whether goal is completed |
| `subtasks` | array | No | Array of subtask objects |
| `dueDate` | string/null | No | ISO 8601 date when goal is due |
| `recurring` | object/null | No | Recurring schedule configuration |
| `tags` | array | No | Array of tag strings |
| `notes` | string | No | Additional notes or description |
| `createdAt` | string | Yes | ISO 8601 creation timestamp |
| `updatedAt` | string | Yes | ISO 8601 last update timestamp |

#### Subtask Object

```json
{
  "id": "1234567890_sub_9876543210",
  "text": "Set up meditation space",
  "completed": false,
  "createdAt": "2024-01-01T08:00:00.000Z"
}
```

#### Recurring Object

```json
{
  "frequency": "daily",
  "interval": 1
}
```

Frequency can be: "daily", "weekly", "monthly"

### Deleted Goals

Array of soft-deleted goals that can be restored.

```json
{
  "deletedGoals": [
    {
      "id": "9876543210",
      "text": "Deleted goal text",
      "deletedAt": "2024-01-10T12:00:00.000Z",
      ...
    }
  ]
}
```

Properties are the same as goals, with an additional `deletedAt` timestamp.

### Categories

Array of goal category definitions.

```json
{
  "categories": [
    {
      "id": "wellness",
      "name": "Wellness",
      "color": "#8b5cf6"
    }
  ]
}
```

#### Category Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique category identifier |
| `name` | string | Yes | Display name |
| `color` | string | Yes | Hex color code for UI |

### Stats

Application statistics and streak information.

```json
{
  "stats": {
    "currentStreak": 7,
    "longestStreak": 14,
    "totalGoalsCompleted": 25,
    "productivityScore": 84,
    "lastVisit": "2024-01-15T10:00:00.000Z",
    "quotesViewed": 50
  }
}
```

### Journal Entries

Array of daily journal entries.

```json
{
  "journalEntries": [
    {
      "id": "journal_1234567890",
      "content": "Today was productive...",
      "date": "January 15, 2024, 10:30 AM",
      "originalContent": null,
      "timestamp": 1705315800000
    }
  ]
}
```

#### Journal Entry Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique entry identifier |
| `content` | string | Yes | Journal entry text |
| `date` | string | Yes | Formatted date string for display |
| `originalContent` | string/null | No | Original content if edited |
| `timestamp` | number | Yes | Unix timestamp in milliseconds |

### Inspiration Bookmarks

Array of bookmarked inspiration items.

```json
{
  "inspirationBookmarks": [
    {
      "id": "mock_1",
      "type": "video",
      "title": "Morning Motivation",
      "description": "Start your day right",
      "thumbnail": "https://...",
      "videoId": "abc123",
      "bookmarkedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### Bookmark Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique item identifier |
| `type` | string | Yes | Type: "video" or "article" |
| `title` | string | Yes | Item title |
| `description` | string | No | Item description |
| `thumbnail` | string | No | Thumbnail image URL |
| `videoId` | string | No | YouTube video ID (for videos) |
| `url` | string | No | Article URL (for articles) |
| `bookmarkedAt` | string | Yes | ISO 8601 bookmark timestamp |

### Daily Checklist

Object with date keys containing daily checklists.

```json
{
  "dailyChecklist": {
    "2024-01-15": {
      "date": "2024-01-15T00:00:00.000Z",
      "items": [
        {
          "id": "check_1234567890",
          "text": "Morning exercise",
          "completed": true,
          "createdAt": "2024-01-15T06:00:00.000Z",
          "completedAt": "2024-01-15T07:30:00.000Z"
        }
      ],
      "completed": false
    }
  }
}
```

### Mood History

Array of mood tracking entries.

```json
{
  "moodHistory": [
    {
      "date": "2024-01-15T10:00:00.000Z",
      "dateKey": "2024-01-15",
      "mood": 4,
      "notes": "Feeling great today!",
      "timestamp": 1705315800000
    }
  ]
}
```

#### Mood Entry Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `date` | string | Yes | ISO 8601 timestamp |
| `dateKey` | string | Yes | Date in YYYY-MM-DD format |
| `mood` | number | Yes | Mood rating 1-5 (1=poor, 5=excellent) |
| `notes` | string | No | Optional mood notes |
| `timestamp` | number | Yes | Unix timestamp in milliseconds |

### Streak Data

Streak and completion statistics.

```json
{
  "streakData": {
    "currentStreak": 7,
    "longestStreak": 14,
    "totalCompletions": 50,
    "lastCompletionDate": "2024-01-15"
  }
}
```

### Achievements

Array of unlocked achievement badges.

```json
{
  "achievements": [
    {
      "id": "week_warrior",
      "title": "Week Warrior",
      "description": "Maintained a 7-day streak",
      "unlockedAt": "2024-01-08T00:00:00.000Z",
      "icon": "🔥"
    }
  ]
}
```

### Settings

Application preferences and configuration.

```json
{
  "settings": {
    "autoBackupEnabled": true,
    "enableRealtimeFeed": true,
    "youtubeApiKey": "",
    "youtubeSearchQuery": "motivation success mindset",
    "notificationsEnabled": false,
    "backupFrequency": 24
  }
}
```

### Theme

Current theme preference.

```json
{
  "theme": "light"
}
```

Value can be "light" or "dark".

## Import Behavior

### Validation

Before importing, the data is validated to ensure:
- Version field is present
- Data object exists and is valid
- Required fields are present in critical objects (goals, categories)
- Data types match the schema

### Import Strategies

#### Replace Strategy

All existing data is replaced with imported data. This is the default and recommended for restoring from a complete backup.

#### Merge Strategy

Imported data is merged with existing data:
- Goals: New goals are added; existing goals with matching IDs are skipped
- Journal Entries: Merged by ID, duplicates skipped
- Categories: Merged by ID, duplicates skipped
- Bookmarks: Merged by ID, duplicates skipped
- Settings: Properties are merged (imported settings override existing)
- Checklists: Merged by date key
- Mood History: Appended (one entry per day, newer entries override)
- Achievements: Merged by ID

### Version Migration

When importing data from an older schema version, automatic migration is attempted:
- Minor version differences (e.g., 1.0.0 → 1.1.0): Automatic migration
- Major version differences (e.g., 1.0.0 → 2.0.0): Migration with warnings

## Example Complete Export

See `tests/fixtures/sample-export-v1.json` for a complete example export file.

## Error Handling

Common import errors and their meanings:

| Error | Meaning | Resolution |
|-------|---------|------------|
| "Invalid data format" | Data is not valid JSON or wrong structure | Check file format |
| "Missing version information" | Version field is missing | File may be corrupted |
| "Invalid or missing goals data" | Goals array is malformed | Check goals structure |
| "Data version unknown" | Version field is invalid | File may be from incompatible version |

## Best Practices

1. **Regular Exports**: Export data regularly to prevent data loss
2. **Version Tracking**: Always keep the version field when manually editing exports
3. **Backup Before Import**: The app automatically creates a backup before importing
4. **Validate JSON**: Ensure JSON is valid before importing (use a JSON validator)
5. **Test Import**: Test imports with merge strategy first if unsure

## Backwards Compatibility

Future versions will maintain backwards compatibility for:
- Reading v1.0.0 exports in newer versions
- Automatic migration of data structures
- Graceful handling of missing optional fields

Breaking changes will only be introduced in major version increments (2.0.0, 3.0.0, etc.).
