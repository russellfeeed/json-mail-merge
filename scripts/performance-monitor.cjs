#!/usr/bin/env node

/**
 * Performance Monitoring Script for Coverage Collection
 * 
 * This script monitors and benchmarks the performance impact of coverage collection
 * to ensure it stays within acceptable limits and provides optimization recommendations.
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

class PerformanceMonitor {
  constructor() {
    this.results = []
    this.systemInfo = this.getSystemInfo()
  }

  /**
   * Get system information for performance context
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024), // GB
      freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024), // GB
      nodeVersion: process.version
    }
  }

  /**
   * Run performance benchmark
   */
  async runBenchmark() {
    console.log('🔍 Starting performance benchmark...')
    console.log(`System: ${this.systemInfo.platform} ${this.systemInfo.arch}`)
    console.log(`CPUs: ${this.systemInfo.cpus}, Memory: ${this.systemInfo.totalMemory}GB`)
    console.log('')

    // Test scenarios
    const scenarios = [
      {
        name: 'Baseline (no coverage)',
        command: ['npx', 'vitest', '--run'],
        description: 'Running tests without coverage collection'
      },
      {
        name: 'Full coverage (Istanbul)',
        command: ['npx', 'vitest', '--run', '--coverage'],
        description: 'Running tests with full Istanbul coverage'
      },
      {
        name: 'Selective coverage (lib only)',
        command: ['node', 'scripts/selective-coverage.cjs', '--dir', 'lib'],
        description: 'Running coverage on lib directory only'
      },
      {
        name: 'Fast mode coverage',
        command: ['node', 'scripts/selective-coverage.cjs', '--mode', 'fast', '--dir', 'lib'],
        description: 'Running fast mode coverage on lib directory'
      }
    ]

    // Run each scenario
    for (const scenario of scenarios) {
      console.log(`\n📊 Running: ${scenario.name}`)
      console.log(`   ${scenario.description}`)
      
      const result = await this.runScenario(scenario)
      this.results.push(result)
      
      console.log(`   ✅ Completed in ${result.executionTime}ms`)
      console.log(`   📈 Memory peak: ${result.memoryPeak}MB`)
    }

    // Analyze results
    this.analyzeResults()
  }

  /**
   * Run a single performance scenario
   */
  async runScenario(scenario) {
    const startTime = Date.now()
    const startMemory = process.memoryUsage()
    let memoryPeak = 0
    let success = false
    let output = ''

    // Monitor memory usage during execution
    const memoryMonitor = setInterval(() => {
      const currentMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      memoryPeak = Math.max(memoryPeak, currentMemory)
    }, 100)

    try {
      await new Promise((resolve, reject) => {
        const process = spawn(scenario.command[0], scenario.command.slice(1), {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        })

        process.stdout.on('data', (data) => {
          output += data.toString()
        })

        process.stderr.on('data', (data) => {
          output += data.toString()
        })

        process.on('close', (code) => {
          success = code === 0
          resolve()
        })

        process.on('error', (error) => {
          reject(error)
        })

        // Set timeout to prevent hanging
        setTimeout(() => {
          process.kill()
          reject(new Error('Process timeout'))
        }, 120000) // 2 minutes timeout
      })
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`)
    } finally {
      clearInterval(memoryMonitor)
    }

    const endTime = Date.now()
    const executionTime = endTime - startTime

    return {
      name: scenario.name,
      executionTime,
      memoryPeak,
      success,
      output: output.slice(-1000) // Keep last 1000 characters
    }
  }

  /**
   * Analyze performance results and provide recommendations
   */
  analyzeResults() {
    console.log('\n\n📈 Performance Analysis Results')
    console.log('=' .repeat(50))

    const baseline = this.results.find(r => r.name.includes('Baseline'))
    if (!baseline || !baseline.success) {
      console.log('❌ Could not establish baseline - baseline test failed')
      return
    }

    console.log(`\n🏁 Baseline Performance: ${baseline.executionTime}ms`)
    console.log('\n📊 Coverage Performance Impact:')

    this.results.forEach(result => {
      if (result.name.includes('Baseline')) return

      const impact = ((result.executionTime - baseline.executionTime) / baseline.executionTime) * 100
      const status = this.getPerformanceStatus(impact)
      
      console.log(`\n   ${status.icon} ${result.name}:`)
      console.log(`      Time: ${result.executionTime}ms (+${Math.round(impact)}%)`)
      console.log(`      Memory: ${result.memoryPeak}MB`)
      console.log(`      Status: ${status.message}`)
    })

    // Generate recommendations
    this.generateRecommendations()

    // Save results
    this.saveResults()
  }

  /**
   * Get performance status based on impact percentage
   */
  getPerformanceStatus(impactPercentage) {
    if (impactPercentage < 25) {
      return { icon: '🟢', message: 'Excellent - minimal impact' }
    } else if (impactPercentage < 50) {
      return { icon: '🟡', message: 'Good - acceptable impact' }
    } else if (impactPercentage < 100) {
      return { icon: '🟠', message: 'Moderate - consider optimization' }
    } else {
      return { icon: '🔴', message: 'High - optimization needed' }
    }
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    console.log('\n\n💡 Performance Recommendations:')
    console.log('-'.repeat(40))

    const fullCoverage = this.results.find(r => r.name.includes('Full coverage'))
    const selective = this.results.find(r => r.name.includes('Selective'))
    const fast = this.results.find(r => r.name.includes('Fast mode'))
    const baseline = this.results.find(r => r.name.includes('Baseline'))

    if (fullCoverage && baseline) {
      const fullImpact = ((fullCoverage.executionTime - baseline.executionTime) / baseline.executionTime) * 100
      
      if (fullImpact > 100) {
        console.log('\n🔴 High Impact Detected:')
        console.log('   • Consider using selective coverage during development')
        console.log('   • Use fast mode for quick feedback loops')
        console.log('   • Reserve full coverage for CI/CD pipelines')
      }
    }

    if (selective && fast && baseline) {
      const selectiveImpact = ((selective.executionTime - baseline.executionTime) / baseline.executionTime) * 100
      const fastImpact = ((fast.executionTime - baseline.executionTime) / baseline.executionTime) * 100

      console.log('\n🎯 Optimization Strategies:')
      
      if (fastImpact < 25) {
        console.log('   ✅ Fast mode provides excellent performance - recommended for development')
      }
      
      if (selectiveImpact < 50) {
        console.log('   ✅ Selective coverage is well-optimized - good for focused testing')
      }

      console.log('\n📋 Usage Recommendations:')
      console.log('   • Development: Use fast mode or selective coverage')
      console.log('   • Pre-commit: Use selective coverage on changed files')
      console.log('   • CI/CD: Use full coverage with parallel processing')
      console.log('   • Local testing: Use watch mode with selective coverage')
    }

    // Memory recommendations
    const maxMemory = Math.max(...this.results.map(r => r.memoryPeak))
    if (maxMemory > 500) {
      console.log('\n🧠 Memory Optimization:')
      console.log('   • High memory usage detected')
      console.log('   • Consider reducing processingConcurrency')
      console.log('   • Use selective coverage for large codebases')
    }

    // System-specific recommendations
    if (this.systemInfo.cpus >= 4) {
      console.log('\n⚡ Multi-core Optimization:')
      console.log('   • Your system can benefit from parallel processing')
      console.log('   • Consider increasing maxThreads in vitest config')
    }
  }

  /**
   * Save performance results to file
   */
  saveResults() {
    const resultsDir = path.join(process.cwd(), 'coverage', 'performance')
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const resultsFile = path.join(resultsDir, `performance-${timestamp}.json`)

    const report = {
      timestamp: new Date().toISOString(),
      systemInfo: this.systemInfo,
      results: this.results,
      summary: this.generateSummary()
    }

    fs.writeFileSync(resultsFile, JSON.stringify(report, null, 2))
    console.log(`\n💾 Results saved to: ${resultsFile}`)
  }

  /**
   * Generate performance summary
   */
  generateSummary() {
    const baseline = this.results.find(r => r.name.includes('Baseline'))
    if (!baseline) return null

    return this.results.map(result => {
      if (result.name.includes('Baseline')) {
        return { name: result.name, impact: 0, status: 'baseline' }
      }

      const impact = ((result.executionTime - baseline.executionTime) / baseline.executionTime) * 100
      const status = this.getPerformanceStatus(impact)
      
      return {
        name: result.name,
        impact: Math.round(impact),
        status: status.message,
        executionTime: result.executionTime,
        memoryPeak: result.memoryPeak
      }
    })
  }
}

// Run performance monitoring
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Performance Monitor for Coverage Collection

Usage:
  node scripts/performance-monitor.cjs [options]

Options:
  --help, -h    Show this help message

This script will:
1. Run tests without coverage (baseline)
2. Run tests with full coverage
3. Run tests with selective coverage
4. Run tests with fast mode coverage
5. Analyze performance impact and provide recommendations

The results will be saved to coverage/performance/ directory.
`)
    process.exit(0)
  }

  const monitor = new PerformanceMonitor()
  
  try {
    await monitor.runBenchmark()
    console.log('\n✅ Performance monitoring completed successfully')
  } catch (error) {
    console.error('\n❌ Performance monitoring failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}