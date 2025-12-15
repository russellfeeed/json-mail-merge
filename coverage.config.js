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
        skipFull: false
      },
      json: {
        file: 'coverage-final.json'
      },
      text: {
        maxCols: 120
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
  }
};