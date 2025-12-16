# Coverage Configuration Guide

This comprehensive guide covers all aspects of configuring and using the code coverage system for the JSON-CSV merge tool application.

## Overview

The coverage system is built on **Vitest** with **Istanbul** instrumentation, providing comprehensive coverage collection, reporting, and analysis. It supports both unit tests and E2E tests with automatic merging and enhanced reporting capabilities.

## Quick Start

### Basic Commands

```bash
# Run unit tests with coverage
npm run test:coverage

# Run all tests (unit + E2E) with coverage
npm run test:coverage:all

# View coverage reports
open coverage/index.html

# Analyze coverage gaps
npm run test:coverage:gaps
```

### Essential Configuration Files

- **`vitest.config.ts`** - Main Vitest and coverage configuration
- **`coverage.config.js`** - Extended coverage settings and options
- **`playwright.config.ts`** - E2E test coverage integration
- **`package.json`** - Coverage-related npm scripts

## Configuration Files

### 1. Vitest Configuration (`vitest.config.ts`)

The primary configuration file for coverage collection:

```typescript
export default defineConfig({
  test: {
    coverage: {
      // Coverage provider (istanbul recommended for TypeScript)
      provider: 'istanbul',
      
      // Report formats - multiple formats for different use cases
      reporter: [
        'text',           // Terminal output
        'text-summary',   // Concise summary
        'json',           // Machine-readable
        'json-summary',   // Compact JSON
        'html',           // Interactive browsing
        'lcov',           // External tool integration
        'cobertura'       // XML format
      ],
      
      // Output directory
      reportsDirectory: './coverage',
      
      // Files to include in coverage
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      
      // Files to exclude from coverage
      exclude: [
        '**/*.d.ts',           // Type definitions
        '**/*.config.*',       // Configuration files
        '**/*.test.*',         // Test files
        '**/*.spec.*',         // Spec files
        'src/vite-env.d.ts',   // Vite types
        'src/main.tsx',        // Entry point
        'src/components/ui/**' // UI library components
      ],
      
      // Coverage thresholds
      thresholds: {
        global: {
          branches: 5,
          functions: 5,
          lines: 10,
          statements: 10
        },
        // Pattern-based thresholds
        'src/lib/**/*.ts': {
          branches: 20,
          functions: 15,
          lines: 25,
          statements: 25
        }
      }
    }
  }
})
```

### 2. Extended Coverage Configuration (`coverage.config.js`)

Additional configuration for advanced features:

```javascript
module.exports = {
  // Coverage collection settings
  collection: {
    unit: {
      enabled: true,
      provider: 'istanbul',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [/* ... */]
    },
    e2e: {
      enabled: true,
      outputDir: 'coverage/e2e',
      include: ['http://localhost:5173/src/**'],
      exclude: [/* ... */]
    }
  },
  
  // Report generation settings
  reports: {
    directories: {
      unit: 'coverage',
      e2e: 'coverage/e2e',
      merged: 'coverage/merged'
    },
    formats: {
      unit: ['html', 'json', 'text', 'lcov', 'cobertura'],
      e2e: ['html', 'json', 'text'],
      merged: ['html', 'json', 'text', 'lcov']
    }
  },
  
  // Dynamic code tracking
  dynamicTracking: {
    enabled: true,
    watchPatterns: ['src/**/*.{ts,tsx,js,jsx}'],
    changeDetection: {
      threshold: 0.01,
      trackHistory: true,
      maxHistoryEntries: 50
    }
  }
}
```

## Coverage Thresholds

### Understanding Thresholds

Coverage thresholds enforce minimum coverage standards and fail builds when not met.

#### Threshold Types

1. **Global Thresholds** - Apply to the entire codebase
2. **Per-File Thresholds** - Apply to individual files
3. **Pattern-Based Thresholds** - Apply to files matching specific patterns

#### Current Threshold Configuration

```typescript
thresholds: {
  // Global minimums - baseline for entire project
  global: {
    branches: 5,      // 5% branch coverage minimum
    functions: 5,     // 5% function coverage minimum
    lines: 10,        // 10% line coverage minimum
    statements: 10    // 10% statement coverage minimum
  },
  
  // Higher standards for core business logic
  'src/lib/**/*.ts': {
    branches: 20,     // 20% branch coverage for utilities
    functions: 15,    // 15% function coverage for utilities
    lines: 25,        // 25% line coverage for utilities
    statements: 25    // 25% statement coverage for utilities
  },
  
  // Lenient thresholds for UI components (gradual improvement)
  'src/components/**/*.tsx': {
    branches: 0,
    functions: 0,
    lines: 0,
    statements: 0
  }
}
```

### Configuring Thresholds

#### Example: Stricter Thresholds

```typescript
thresholds: {
  global: {
    branches: 50,
    functions: 60,
    lines: 70,
    statements: 70
  },
  'src/lib/**/*.ts': {
    branches: 80,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

#### Example: Component-Specific Thresholds

```typescript
thresholds: {
  // Critical components require high coverage
  'src/components/JsonEditor.tsx': {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  },
  
  // Form components need moderate coverage
  'src/components/*Form*.tsx': {
    branches: 50,
    functions: 60,
    lines: 65,
    statements: 65
  },
  
  // UI components can have lower coverage
  'src/components/ui/**/*.tsx': {
    branches: 0,
    functions: 0,
    lines: 0,
    statements: 0
  }
}
```

## Report Formats

### Available Formats

#### 1. HTML Reports (`html`)
- **Purpose**: Interactive browsing and detailed analysis
- **Location**: `coverage/index.html`
- **Features**: 
  - File-by-file breakdown
  - Syntax highlighting
  - Uncovered line highlighting
  - Branch coverage visualization

#### 2. JSON Reports (`json`)
- **Purpose**: Programmatic analysis and CI/CD integration
- **Location**: `coverage/coverage-final.json`
- **Use Cases**:
  - Custom analysis scripts
  - CI/CD threshold checking
  - Coverage trend tracking

#### 3. LCOV Reports (`lcov`)
- **Purpose**: External tool integration
- **Location**: `coverage/lcov.info`
- **Compatible Tools**:
  - Codecov
  - Coveralls
  - SonarQube
  - IDE extensions

#### 4. Text Reports (`text`)
- **Purpose**: Terminal viewing and CI logs
- **Output**: Console/terminal
- **Features**:
  - Quick overview
  - File-by-file percentages
  - Threshold status

#### 5. Cobertura Reports (`cobertura`)
- **Purpose**: XML format for additional tool compatibility
- **Location**: `coverage/cobertura-coverage.xml`
- **Use Cases**:
  - Jenkins integration
  - Azure DevOps
  - GitLab CI

### Configuring Report Options

```typescript
coverage: {
  reporter: ['html', 'json', 'lcov'],
  
  // HTML report customization
  watermarks: {
    statements: [50, 80],  // Low: <50%, Medium: 50-80%, High: >80%
    functions: [50, 80],
    branches: [50, 80],
    lines: [50, 80]
  }
}
```

## File Inclusion and Exclusion

### Include Patterns

```typescript
include: [
  'src/**/*.{ts,tsx,js,jsx}',  // All TypeScript/JavaScript in src
  'lib/**/*.ts',               // Additional library code
  'utils/**/*.js'              // Utility functions
]
```

### Exclude Patterns

```typescript
exclude: [
  // Type definitions
  '**/*.d.ts',
  
  // Configuration files
  '**/*.config.*',
  'vite.config.ts',
  'tailwind.config.ts',
  
  // Test files
  '**/*.test.*',
  '**/*.spec.*',
  '**/tests/**',
  
  // Build artifacts
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  
  // Dependencies
  '**/node_modules/**',
  
  // Application-specific exclusions
  'src/vite-env.d.ts',        // Vite environment types
  'src/main.tsx',             // Application entry point
  'src/components/ui/**'      // Third-party UI components
]
```

### Dynamic File Inclusion

The system automatically includes new files matching the include patterns:

```javascript
// coverage.config.js
dynamicTracking: {
  enabled: true,
  watchPatterns: ['src/**/*.{ts,tsx,js,jsx}'],
  excludePatterns: [
    '**/*.d.ts',
    '**/*.config.*',
    '**/*.test.*'
  ]
}
```

## Integration with Development Workflow

### NPM Scripts

```json
{
  "scripts": {
    // Basic coverage
    "test:coverage": "vitest --run --coverage && node scripts/enhance-coverage-reports.cjs",
    
    // Enhanced coverage with gap analysis
    "test:coverage:gaps": "node scripts/coverage-gap-analysis.cjs",
    
    // Coverage with file tracking
    "test:coverage:track": "node scripts/dynamic-code-tracker.cjs scan",
    
    // All tests with coverage merging
    "test:coverage:all": "node scripts/run-tests-with-coverage.cjs",
    
    // Watch mode with automatic enhancement
    "test:coverage:watch": "node scripts/enhance-coverage-reports.cjs --watch"
  }
}
```

### IDE Integration

#### VS Code Settings

```json
{
  "coverage-gutters.coverageFileNames": [
    "lcov.info",
    "coverage-final.json"
  ],
  "coverage-gutters.coverageBaseDir": "coverage",
  "coverage-gutters.showGutterCoverage": true,
  "coverage-gutters.showLineCoverage": true,
  "coverage-gutters.showRulerCoverage": true
}
```

#### Coverage Gutters Extension

Install the Coverage Gutters extension for VS Code to see coverage directly in the editor:

1. Install "Coverage Gutters" extension
2. Run `npm run test:coverage`
3. Press `Ctrl+Shift+P` and run "Coverage Gutters: Display Coverage"

### Git Integration

#### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run test:coverage
```

#### Coverage in Pull Requests

The CI/CD system automatically:
- Runs coverage on every PR
- Comments coverage changes
- Fails builds if thresholds not met
- Uploads coverage artifacts

## Troubleshooting

### Common Issues

#### 1. Coverage Threshold Failures

**Problem**: Build fails with "Coverage threshold not met"

**Solutions**:
```bash
# Check current coverage
npm run test:coverage

# Identify gaps
npm run test:coverage:gaps

# View detailed HTML report
open coverage/index.html
```

**Temporary Fix** (adjust thresholds):
```typescript
thresholds: {
  global: {
    branches: 0,  // Temporarily lower
    functions: 0,
    lines: 5,     // Reduce from 10 to 5
    statements: 5
  }
}
```

#### 2. Files Not Included in Coverage

**Problem**: New files not appearing in coverage reports

**Check Include/Exclude Patterns**:
```typescript
include: ['src/**/*.{ts,tsx,js,jsx}'],
exclude: [
  '**/*.d.ts',
  '**/*.config.*',
  // Check if your file matches exclude patterns
]
```

**Force File Inclusion**:
```typescript
coverage: {
  all: true,  // Include all files matching patterns
  includeSource: ['src/**/*.{ts,tsx,js,jsx}']
}
```

#### 3. E2E Coverage Not Working

**Problem**: E2E tests not collecting coverage

**Check Playwright Configuration**:
```typescript
// playwright.config.ts
use: {
  // Ensure coverage collection is enabled
  collectCoverage: true,
  coverageDir: 'coverage/e2e'
}
```

**Verify Server URLs**:
```javascript
// coverage.config.js
e2e: {
  include: [
    'http://localhost:5173/src/**',  // Dev server
    'http://localhost:4173/src/**'   // Preview server
  ]
}
```

#### 4. Performance Issues

**Problem**: Tests run slowly with coverage enabled

**Optimize Configuration**:
```typescript
coverage: {
  // Use faster provider for development
  provider: process.env.CI ? 'istanbul' : 'c8',
  
  // Reduce report formats in development
  reporter: process.env.CI 
    ? ['html', 'json', 'lcov', 'cobertura']
    : ['text', 'html'],
    
  // Skip full coverage in watch mode
  skipFull: !process.env.CI
}
```

#### 5. Memory Issues with Large Codebases

**Problem**: Out of memory errors during coverage collection

**Solutions**:
```typescript
coverage: {
  // Increase memory limit
  maxWorkers: 1,
  
  // Process files in smaller chunks
  clean: true,
  
  // Reduce concurrent processing
  allowExternal: false
}
```

### Debug Commands

```bash
# Check coverage configuration
npx vitest --config vitest.config.ts --reporter=verbose

# Test coverage collection without thresholds
npx vitest --run --coverage --coverage.thresholds.global.lines=0

# Verify file patterns
node -e "console.log(require('./coverage.config.js'))"

# Check dynamic tracking status
npm run test:coverage:track:status
```

## Best Practices

### 1. Threshold Strategy

**Start Low, Improve Gradually**:
```typescript
// Phase 1: Establish baseline
global: { lines: 10, functions: 5, branches: 5, statements: 10 }

// Phase 2: Moderate improvement
global: { lines: 30, functions: 25, branches: 20, statements: 30 }

// Phase 3: High quality
global: { lines: 70, functions: 60, branches: 50, statements: 70 }
```

**Different Standards for Different Code**:
```typescript
thresholds: {
  // Critical business logic - high standards
  'src/lib/**/*.ts': { lines: 90, functions: 95, branches: 85, statements: 90 },
  
  // UI components - moderate standards
  'src/components/**/*.tsx': { lines: 60, functions: 50, branches: 40, statements: 60 },
  
  // Configuration/setup - low standards
  'src/config/**/*.ts': { lines: 20, functions: 10, branches: 10, statements: 20 }
}
```

### 2. Report Usage

**Development Workflow**:
1. Run `npm run test:coverage` after making changes
2. Check terminal output for quick overview
3. Open HTML report for detailed analysis
4. Use gap analysis for targeted improvements

**CI/CD Integration**:
1. Use JSON reports for automated analysis
2. Use LCOV for external service integration
3. Upload HTML reports as artifacts
4. Set appropriate threshold levels

### 3. File Organization

**Recommended Structure**:
```
coverage/
├── index.html              # Main HTML report
├── coverage-final.json     # Complete coverage data
├── coverage-summary.json   # Summary statistics
├── lcov.info              # LCOV format
├── cobertura-coverage.xml # Cobertura XML
├── e2e/                   # E2E-specific reports
├── merged/                # Merged coverage reports
└── tracking-data.json     # Dynamic tracking data
```

### 4. Performance Optimization

**Development Mode**:
```typescript
coverage: {
  reporter: ['text', 'html'],  // Minimal reports
  skipFull: true,              // Skip uncovered files
  clean: false                 // Don't clean between runs
}
```

**CI Mode**:
```typescript
coverage: {
  reporter: ['html', 'json', 'lcov', 'cobertura'],  // All formats
  skipFull: false,                                   // Include all files
  clean: true,                                       // Clean between runs
  all: true                                          // Force all file inclusion
}
```

## Advanced Configuration

### Custom Reporters

```typescript
// Custom reporter for specific needs
coverage: {
  reporter: [
    'html',
    'json',
    ['text', { skipFull: true }],
    ['lcov', { file: 'custom-lcov.info' }]
  ]
}
```

### Environment-Specific Configuration

```typescript
// Different settings for different environments
const coverageConfig = {
  provider: 'istanbul',
  reporter: process.env.NODE_ENV === 'development' 
    ? ['text', 'html']
    : ['html', 'json', 'lcov', 'cobertura'],
  
  thresholds: process.env.CI 
    ? { global: { lines: 70, functions: 60, branches: 50, statements: 70 } }
    : { global: { lines: 10, functions: 5, branches: 5, statements: 10 } }
}
```

### Integration with External Services

#### Codecov Integration

```yaml
# .github/workflows/ci.yml
- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
```

#### SonarQube Integration

```javascript
// sonar-project.properties
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts
```

## Migration Guide

### From Jest to Vitest

```typescript
// Old Jest configuration
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'json', 'lcov'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
}

// New Vitest configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['html', 'json', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50
        }
      }
    }
  }
})
```

### Updating NPM Scripts

```json
{
  "scripts": {
    // Old Jest scripts
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    
    // New Vitest scripts
    "test:unit": "vitest --run",
    "test:coverage": "vitest --run --coverage",
    "test:unit:watch": "vitest"
  }
}
```

This comprehensive configuration guide provides everything needed to effectively configure and use the coverage system. For specific implementation questions or advanced use cases, refer to the troubleshooting section or create an issue in the repository.