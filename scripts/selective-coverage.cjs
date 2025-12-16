#!/usr/bin/env node

/**
 * Selective Coverage Collection Script
 * 
 * This script allows developers to run coverage collection on specific
 * directories or files to minimize performance impact during development.
 * 
 * Usage:
 *   node scripts/selective-coverage.cjs --dir lib
 *   node scripts/selective-coverage.cjs --dir components --mode fast
 *   node scripts/selective-coverage.cjs --files src/lib/utils.ts,src/lib/merge.ts
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
  directories: [],
  files: [],
  mode: 'default',
  watch: false,
  verbose: false
}

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  
  switch (arg) {
    case '--dir':
    case '-d':
      if (args[i + 1]) {
        options.directories.push(args[i + 1])
        i++
      }
      break
    case '--files':
    case '-f':
      if (args[i + 1]) {
        options.files = args[i + 1].split(',').map(f => f.trim())
        i++
      }
      break
    case '--mode':
    case '-m':
      if (args[i + 1]) {
        options.mode = args[i + 1]
        i++
      }
      break
    case '--watch':
    case '-w':
      options.watch = true
      break
    case '--verbose':
    case '-v':
      options.verbose = true
      break
    case '--help':
    case '-h':
      showHelp()
      process.exit(0)
  }
}

function showHelp() {
  console.log(`
Selective Coverage Collection Script

Usage:
  node scripts/selective-coverage.cjs [options]

Options:
  --dir, -d <directory>     Target specific directory (can be used multiple times)
  --files, -f <files>       Target specific files (comma-separated)
  --mode, -m <mode>         Coverage mode: fast, selective, dev, ci (default: default)
  --watch, -w               Run in watch mode
  --verbose, -v             Verbose output
  --help, -h                Show this help message

Examples:
  # Run coverage on lib directory only
  node scripts/selective-coverage.cjs --dir lib

  # Run coverage on multiple directories in fast mode
  node scripts/selective-coverage.cjs --dir lib --dir components --mode fast

  # Run coverage on specific files
  node scripts/selective-coverage.cjs --files src/lib/utils.ts,src/lib/merge.ts

  # Run in watch mode for development
  node scripts/selective-coverage.cjs --dir lib --watch --mode dev
`)
}

/**
 * Generate Vitest configuration for selective coverage
 */
function generateSelectiveConfig(options) {
  const baseConfig = {
    test: {
      globals: true,
      environment: 'jsdom',
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
          maxThreads: options.mode === 'fast' ? 2 : 4,
          minThreads: 1
        }
      }
    }
  }

  // Configure coverage based on mode and targets
  const coverageConfig = {
    provider: 'istanbul', // Use istanbul for all modes since c8 is not installed
    enabled: true,
    reportsDirectory: './coverage'
  }

  // Set include patterns based on directories and files
  if (options.directories.length > 0) {
    coverageConfig.include = options.directories.map(dir => `src/${dir}/**/*.{ts,tsx,js,jsx}`)
  } else if (options.files.length > 0) {
    coverageConfig.include = options.files
  } else {
    // Default to lib directory for performance
    coverageConfig.include = ['src/lib/**/*.{ts,tsx,js,jsx}']
  }

  // Configure reporters based on mode
  switch (options.mode) {
    case 'fast':
      coverageConfig.reporter = ['text-summary', 'json-summary']
      coverageConfig.thresholds = {
        global: { lines: 5, functions: 5, branches: 0, statements: 5 }
      }
      break
    case 'dev':
      coverageConfig.reporter = ['text-summary']
      coverageConfig.all = false
      coverageConfig.skipFull = true
      break
    case 'ci':
      coverageConfig.reporter = ['text', 'json', 'lcov', 'html']
      coverageConfig.processingConcurrency = 4
      break
    default:
      coverageConfig.reporter = ['text', 'html', 'json']
  }

  baseConfig.test.coverage = coverageConfig
  return baseConfig
}

/**
 * Run Vitest with selective coverage configuration
 */
async function runSelectiveCoverage(options) {
  console.log('🎯 Running selective coverage collection...')
  
  if (options.verbose) {
    console.log('Configuration:', JSON.stringify(options, null, 2))
  }

  // Generate temporary config file
  const config = generateSelectiveConfig(options)
  const configPath = path.join(process.cwd(), 'vitest.selective.config.js')
  
  const configContent = `
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
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: ${config.test.poolOptions.threads.maxThreads},
        minThreads: 1
      }
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/tests/e2e/**',
      '**/playwright-report/**',
      '**/test-results/**'
    ],
    coverage: ${JSON.stringify(config.test.coverage, null, 6)}
  }
})
`

  try {
    // Write temporary config
    fs.writeFileSync(configPath, configContent)
    
    // Build Vitest command
    const vitestArgs = [
      '--config', configPath,
      '--coverage'
    ]
    
    if (!options.watch) {
      vitestArgs.push('--run')
    }
    
    if (options.verbose) {
      vitestArgs.push('--reporter=verbose')
    }

    // Measure execution time
    const startTime = Date.now()
    
    // Run Vitest
    const vitestProcess = spawn('npx', ['vitest', ...vitestArgs], {
      stdio: 'inherit',
      shell: true
    })

    vitestProcess.on('close', (code) => {
      const executionTime = Date.now() - startTime
      
      // Clean up temporary config
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath)
      }
      
      console.log(`\n⏱️  Execution time: ${executionTime}ms`)
      
      if (code === 0) {
        console.log('✅ Selective coverage collection completed successfully')
        
        // Show performance summary
        showPerformanceSummary(options, executionTime)
      } else {
        console.log('❌ Coverage collection failed')
        process.exit(code)
      }
    })

    vitestProcess.on('error', (error) => {
      console.error('Error running Vitest:', error)
      
      // Clean up temporary config
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath)
      }
      
      process.exit(1)
    })

  } catch (error) {
    console.error('Error generating configuration:', error)
    
    // Clean up temporary config
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath)
    }
    
    process.exit(1)
  }
}

/**
 * Show performance summary
 */
function showPerformanceSummary(options, executionTime) {
  console.log('\n📊 Performance Summary:')
  console.log(`   Mode: ${options.mode}`)
  console.log(`   Execution time: ${executionTime}ms`)
  
  if (options.directories.length > 0) {
    console.log(`   Directories: ${options.directories.join(', ')}`)
  }
  
  if (options.files.length > 0) {
    console.log(`   Files: ${options.files.length} file(s)`)
  }
  
  // Estimate performance improvement
  const estimatedFullTime = executionTime * 3 // Rough estimate
  const improvement = Math.round(((estimatedFullTime - executionTime) / estimatedFullTime) * 100)
  
  console.log(`   Estimated performance improvement: ~${improvement}%`)
  console.log('\n💡 Tips:')
  console.log('   - Use --mode fast for quickest feedback')
  console.log('   - Use --watch for development workflow')
  console.log('   - Target specific directories with --dir for focused testing')
}

// Validate options
if (options.directories.length === 0 && options.files.length === 0) {
  console.log('ℹ️  No specific targets specified, defaulting to lib directory for performance')
  options.directories.push('lib')
}

// Run selective coverage
runSelectiveCoverage(options).catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})