/**
 * Coverage Configuration
 * Centralized configuration for coverage collection and reporting
 */

module.exports = {
  // Coverage collection settings
  collection: {
    // Unit test coverage settings (handled by Vitest)
    unit: {
      enabled: true,
      provider: 'istanbul',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/node_modules/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/components/ui/**'
      ]
    },

    // E2E test coverage settings
    e2e: {
      enabled: true,
      outputDir: 'coverage/e2e',
      include: [
        'http://localhost:5173/src/**',
        'http://localhost:4173/src/**',
        'http://127.0.0.1:5173/src/**',
        'http://127.0.0.1:4173/src/**'
      ],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '/node_modules/',
        '/@vite/',
        '/@fs/',
        '/src/vite-env.d.ts',
        '/src/main.tsx',
        '.css',
        '.svg',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.woff',
        '.woff2',
        '.ttf',
        '.eot'
      ]
    }
  },

  // Report generation settings
  reports: {
    // Output directories
    directories: {
      unit: 'coverage',
      e2e: 'coverage/e2e',
      merged: 'coverage/merged'
    },

    // Report formats
    formats: {
      unit: ['html', 'json', 'text', 'lcov', 'cobertura'],
      e2e: ['html', 'json', 'text'],
      merged: ['html', 'json', 'text', 'lcov']
    },

    // Report options
    options: {
      html: {
        skipEmpty: false,
        skipFull: false,
        // Enhanced options for better uncovered code highlighting
        verbose: true,
        linkMapper: null,
        // Custom watermarks for visual indicators
        watermarks: {
          statements: [50, 80],
          functions: [50, 80],
          branches: [50, 80],
          lines: [50, 80]
        }
      },
      json: {
        file: 'coverage-final.json'
      },
      text: {
        maxCols: 120,
        // Show detailed uncovered line information
        skipEmpty: false,
        skipFull: false
      },
      lcov: {
        file: 'lcov.info'
      }
    }
  },

  // Threshold settings (shared across test types)
  thresholds: {
    global: {
      branches: 5,
      functions: 5,
      lines: 10,
      statements: 10
    },
    perFile: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    },
    patterns: {
      'src/lib/**/*.ts': {
        branches: 20,
        functions: 15,
        lines: 25,
        statements: 25
      },
      'src/components/**/*.tsx': {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0
      },
      'src/pages/**/*.tsx': {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0
      },
      'src/hooks/**/*.ts': {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0
      }
    }
  },

  // Merging settings
  merge: {
    // Strategy for merging coverage data
    strategy: 'max', // 'max', 'sum', 'average'
    
    // Whether to generate separate reports for each test type
    generateSeparateReports: true,
    
    // Whether to clean up intermediate files after merging
    cleanupIntermediateFiles: false,
    
    // File patterns to prioritize when merging
    priorityPatterns: [
      'src/lib/**',
      'src/components/**',
      'src/hooks/**'
    ]
  },

  // Dynamic code tracking settings
  dynamicTracking: {
    // Enable automatic inclusion of new source files
    enabled: true,
    
    // File patterns to watch for changes
    watchPatterns: ['src/**/*.{ts,tsx,js,jsx}'],
    
    // Patterns to exclude from dynamic tracking
    excludePatterns: [
      '**/*.d.ts',
      '**/*.config.*',
      '**/*.test.*',
      '**/*.spec.*',
      'src/vite-env.d.ts',
      'src/main.tsx',
      'src/components/ui/**'
    ],
    
    // Coverage change detection settings
    changeDetection: {
      // Minimum percentage change to report
      threshold: 0.01,
      
      // Track coverage history
      trackHistory: true,
      
      // Maximum history entries to keep
      maxHistoryEntries: 50
    },
    
    // Automatic coverage collection settings
    autoCollection: {
      // Run coverage when new files are detected
      onNewFiles: false,
      
      // Run coverage when files are modified
      onModifiedFiles: false,
      
      // Run coverage on manual scan
      onScan: true
    }
  }
};