# Dynamic Code Tracking

This document describes the dynamic code tracking system that automatically includes new source files in coverage calculations and tracks coverage changes over time.

## Overview

The dynamic code tracking system provides:

- **Automatic File Inclusion**: New source files are automatically included in coverage calculations
- **Change Detection**: Tracks when files are added, modified, or deleted
- **Coverage Change Reporting**: Shows how coverage metrics change over time
- **File System Watching**: Real-time monitoring of source file changes
- **Coverage History**: Maintains a history of coverage trends

## Features

### Automatic Code Inclusion

When new TypeScript/JavaScript files are added to the `src/` directory, they are automatically:

1. Detected by the file scanner
2. Included in coverage calculations
3. Added to coverage reports
4. Tracked for future changes

### Coverage Change Detection

The system tracks:

- **New Files**: Files added to the source directory
- **Modified Files**: Files that have been changed since last scan
- **Deleted Files**: Files removed from the source directory
- **Coverage Impact**: How changes affect overall coverage percentages

### Coverage History

Maintains a rolling history of:

- Coverage percentages over time
- File-level coverage changes
- Overall project coverage trends
- Change timestamps and details

## Usage

### Command Line Interface

#### Basic Scanning

```bash
# Scan for file changes
npm run test:coverage:track

# Scan and run coverage collection
npm run test:coverage:track:full

# Check tracking status
npm run test:coverage:track:status

# Start file system watcher
npm run test:coverage:track:watch
```

#### Direct Script Usage

```bash
# Scan for changes
node scripts/dynamic-code-tracker.cjs scan

# Scan with coverage collection
node scripts/dynamic-code-tracker.cjs scan --coverage

# Start file watcher
node scripts/dynamic-code-tracker.cjs watch

# Show status
node scripts/dynamic-code-tracker.cjs status
```

### Integration with Test Runner

The dynamic code tracking is automatically integrated with the main test runner:

```bash
# Run tests with automatic code tracking
npm run test:coverage:all

# Run unit tests only with tracking
node scripts/run-tests-with-coverage.cjs --unit-only

# Disable tracking
node scripts/run-tests-with-coverage.cjs --no-track
```

## Configuration

### Coverage Configuration

The system uses the existing Vitest configuration in `vitest.config.ts`:

```typescript
coverage: {
  include: ['src/**/*.{ts,tsx,js,jsx}'],
  exclude: [
    '**/*.d.ts',
    '**/*.config.*',
    '**/*.test.*',
    '**/*.spec.*',
    'src/vite-env.d.ts',
    'src/main.tsx',
    'src/components/ui/**'
  ],
  all: true,
  // ... other settings
}
```

### Dynamic Tracking Settings

Additional configuration in `coverage.config.js`:

```javascript
dynamicTracking: {
  enabled: true,
  watchPatterns: ['src/**/*.{ts,tsx,js,jsx}'],
  excludePatterns: [
    '**/*.d.ts',
    '**/*.config.*',
    '**/*.test.*',
    '**/*.spec.*',
    'src/vite-env.d.ts',
    'src/main.tsx',
    'src/components/ui/**'
  ],
  changeDetection: {
    threshold: 0.01,
    trackHistory: true,
    maxHistoryEntries: 50
  },
  autoCollection: {
    onNewFiles: false,
    onModifiedFiles: false,
    onScan: true
  }
}
```

## Output Examples

### File Change Detection

```
🔍 Scanning source files for changes...
Found 21 source files
Changes: 1 added, 0 modified, 0 deleted
Updating coverage configuration...
✅ Automatically including 1 new files in coverage:
  + src/lib/newFeature.ts
```

### Coverage Change Report

```
=== Coverage Change Report ===
Generated: 2025-12-16T08:32:41.434Z

Overall Coverage Changes:
  📉 lines: 10.95% → 10.91% (-0.04%)
  📉 functions: 5.16% → 5.11% (-0.05%)
  ➡️ branches: 4.41% → 4.41% (0.00%)
  📉 statements: 9.82% → 9.80% (-0.02%)

File-Level Changes:

  📁 New Files (1):
    + src/lib/newFeature.ts (0% lines)
```

### Tracking Status

```
=== Dynamic Code Tracking Status ===
Last scan: 2025-12-16T08:32:13.924Z
Tracked files: 20
Change log entries: 1
Coverage history entries: 2

Recent changes:
  2025-12-16T08:31:59.381Z: scan - multiple files

Coverage trend:
  2025-12-16T08:32:27.550Z: 10.95% lines, 5.16% functions
  2025-12-16T08:32:41.434Z: 10.91% lines, 5.11% functions
```

## File System Watching

The file watcher provides real-time monitoring:

```bash
npm run test:coverage:track:watch
```

This will:

1. Monitor the `src/` directory for changes
2. Automatically detect new, modified, or deleted files
3. Update tracking data in real-time
4. Log changes as they occur

Example output:

```
Starting file system watcher for dynamic code tracking...
📁 New file detected: src/lib/newModule.ts
✅ Updated tracking data for added file: src/lib/newModule.ts
📝 File modified: src/lib/existingModule.ts
✅ Updated tracking data for modified file: src/lib/existingModule.ts
```

## Data Storage

### Tracking Data File

The system stores tracking data in `coverage/tracking-data.json`:

```json
{
  "lastScan": "2025-12-16T08:32:13.924Z",
  "files": {
    "src/lib/utils.ts": {
      "path": "/full/path/to/src/lib/utils.ts",
      "size": 1234,
      "mtime": "2025-12-16T08:30:00.000Z",
      "exists": true
    }
  },
  "coverageHistory": [
    {
      "timestamp": "2025-12-16T08:32:27.550Z",
      "coverage": {
        "lines": { "pct": 10.95 },
        "functions": { "pct": 5.16 },
        "branches": { "pct": 4.41 },
        "statements": { "pct": 9.82 }
      }
    }
  ],
  "changeLog": [
    {
      "type": "scan",
      "changes": { "added": [], "modified": [], "deleted": [] },
      "timestamp": "2025-12-16T08:31:59.381Z"
    }
  ]
}
```

## Benefits

### For Development

- **Zero Configuration**: New files are automatically included
- **Real-time Feedback**: Immediate notification of coverage changes
- **Historical Tracking**: See how coverage evolves over time
- **Change Impact**: Understand how code changes affect coverage

### For CI/CD

- **Automated Detection**: No manual configuration updates needed
- **Coverage Trends**: Track coverage improvements or regressions
- **Change Reports**: Clear visibility into coverage impact of changes
- **Integration Ready**: Works seamlessly with existing CI/CD pipelines

## Troubleshooting

### Common Issues

1. **File Not Detected**: Check if file matches include patterns and doesn't match exclude patterns
2. **Watcher Not Working**: Ensure `chokidar` dependency is installed
3. **Permission Errors**: Check file system permissions for the coverage directory
4. **Large File Sets**: Consider adjusting `maxHistoryEntries` for large projects

### Debug Information

Use the status command to check system state:

```bash
npm run test:coverage:track:status
```

This shows:
- Last scan timestamp
- Number of tracked files
- Recent changes
- Coverage history

## Requirements Satisfied

This implementation satisfies the following requirements:

- **10.1**: Automatic inclusion of new source files in coverage calculations
- **10.2**: Accurate coverage tracking across file changes and refactoring
- **10.3**: Clear information about coverage changes
- **10.4**: Reflection of improvements in reports and metrics

The system provides a comprehensive solution for maintaining coverage quality over time as the project evolves.