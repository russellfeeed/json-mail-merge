/**
 * Performance-optimized coverage configuration
 * This configuration provides options for selective coverage collection
 * to minimize performance impact during development and testing.
 */

export const performanceConfig = {
  // Fast mode - minimal coverage for quick feedback
  fast: {
    provider: 'c8', // c8 is generally faster than istanbul
    reporter: ['text-summary', 'json-summary'],
    include: ['src/lib/**/*.ts'], // Only core business logic
    exclude: [
      '**/*.test.*',
      '**/*.spec.*',
      'src/components/**',
      'src/pages/**',
      'src/hooks/**'
    ],
    thresholds: {
      global: {
        lines: 5,
        functions: 5,
        branches: 0,
        statements: 5
      }
    }
  },

  // Selective mode - target specific directories
  selective: {
    provider: 'istanbul',
    reporter: ['text', 'html', 'json'],
    // Allow configuration of specific directories
    getIncludePatterns: (directories = ['lib']) => {
      return directories.map(dir => `src/${dir}/**/*.{ts,tsx}`)
    },
    // Memory optimization settings
    processingConcurrency: 2,
    maxMemoryUsage: '512MB'
  },

  // Development mode - optimized for watch mode
  development: {
    provider: 'c8',
    reporter: ['text-summary'],
    // Only instrument files that are actually imported
    all: false,
    // Skip full coverage collection for faster feedback
    skipFull: true,
    // Minimal thresholds for development
    thresholds: {
      global: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    }
  },

  // CI mode - comprehensive but optimized
  ci: {
    provider: 'istanbul',
    reporter: ['text', 'json', 'lcov', 'cobertura'],
    // Full coverage but with optimizations
    all: true,
    processingConcurrency: 4,
    // Parallel processing for large codebases
    parallel: true,
    // Cache instrumentation results
    cache: true,
    cacheDirectory: './node_modules/.cache/vitest-coverage'
  }
}

/**
 * Get performance-optimized configuration based on environment
 */
export function getPerformanceConfig(mode = 'default') {
  const configs = {
    fast: performanceConfig.fast,
    selective: performanceConfig.selective,
    dev: performanceConfig.development,
    ci: performanceConfig.ci
  }
  
  return configs[mode] || performanceConfig.ci
}

/**
 * Memory usage optimization utilities
 */
export const memoryOptimization = {
  // Estimate memory usage based on file count
  estimateMemoryUsage: (fileCount) => {
    // Rough estimate: ~1MB per 100 files with instrumentation
    return Math.ceil(fileCount / 100) * 1024 * 1024
  },

  // Get recommended concurrency based on available memory
  getRecommendedConcurrency: () => {
    const totalMemory = process.memoryUsage().heapTotal
    const availableMemory = totalMemory * 0.7 // Use 70% of available memory
    
    // Each thread uses approximately 50MB
    const threadMemoryUsage = 50 * 1024 * 1024
    const maxThreads = Math.floor(availableMemory / threadMemoryUsage)
    
    return Math.max(1, Math.min(maxThreads, 4)) // Between 1 and 4 threads
  },

  // Monitor memory usage during coverage collection
  monitorMemoryUsage: () => {
    const usage = process.memoryUsage()
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024)
    }
  }
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitoring = {
  // Measure test execution time with and without coverage
  measureExecutionTime: async (testFunction, withCoverage = true) => {
    const startTime = process.hrtime.bigint()
    
    try {
      await testFunction()
      const endTime = process.hrtime.bigint()
      const executionTime = Number(endTime - startTime) / 1000000 // Convert to milliseconds
      
      return {
        success: true,
        executionTime,
        withCoverage
      }
    } catch (error) {
      const endTime = process.hrtime.bigint()
      const executionTime = Number(endTime - startTime) / 1000000
      
      return {
        success: false,
        executionTime,
        withCoverage,
        error: error.message
      }
    }
  },

  // Calculate performance impact of coverage collection
  calculatePerformanceImpact: (baselineTime, coverageTime) => {
    const impact = ((coverageTime - baselineTime) / baselineTime) * 100
    return {
      baselineTime,
      coverageTime,
      impactPercentage: Math.round(impact * 100) / 100,
      isAcceptable: impact < 50 // Less than 50% slowdown is acceptable
    }
  }
}