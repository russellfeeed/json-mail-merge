import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/tests/e2e/**',
      '**/playwright-report/**',
      '**/test-results/**'
    ],
    coverage: {
      provider: 'istanbul',
      reporter: [
        'text',           // Terminal output for quick viewing
        'text-summary',   // Concise terminal summary
        'json',           // Machine-readable format for programmatic analysis
        'json-summary',   // Compact JSON format for CI/CD integration
        'html',           // Interactive browsing with detailed file-by-file analysis
        'lcov',           // Industry standard format for external tool integration
        'cobertura'       // XML format for additional tool compatibility
      ],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Type definition files
        '**/*.d.ts',
        // Configuration files
        '**/*.config.*',
        // Test files
        '**/*.test.*',
        '**/*.spec.*',
        // Build artifacts and generated files
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/node_modules/**',
        // Vite environment types
        'src/vite-env.d.ts',
        // Application entry point (typically not tested)
        'src/main.tsx',
        // UI component library (external dependencies)
        'src/components/ui/**'
      ],
      all: true,
      clean: true,
      // Enable source maps for accurate line mapping
      skipFull: false,
      // Report uncovered lines
      reportOnFailure: true,
      // Fail the build when thresholds are not met
      thresholdAutoUpdate: false,
      // Enhanced uncovered code highlighting options
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 80],
        lines: [50, 80]
      },
      thresholds: {
        // Global coverage thresholds - set to current baseline with room for improvement
        global: {
          branches: 5,
          functions: 5,
          lines: 10,
          statements: 10
        },
        // Per-file coverage thresholds - disabled for now to focus on global targets
        // perFile: {
        //   branches: 0,
        //   functions: 0,
        //   lines: 0,
        //   statements: 0
        // },
        // Pattern-based thresholds for different types of files
        // Core business logic - higher standards for tested files, lenient for untested
        'src/lib/**/*.ts': {
          branches: 20,
          functions: 15,
          lines: 25,
          statements: 25
        },
        // Component files - very lenient to allow gradual improvement
        'src/components/**/*.tsx': {
          branches: 0,
          functions: 0,
          lines: 0,
          statements: 0
        },
        // Page components - very lenient to allow gradual improvement
        'src/pages/**/*.tsx': {
          branches: 0,
          functions: 0,
          lines: 0,
          statements: 0
        },
        // Hook files - very lenient to allow gradual improvement
        'src/hooks/**/*.ts': {
          branches: 0,
          functions: 0,
          lines: 0,
          statements: 0
        }
      }
    }
  }
})