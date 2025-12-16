#!/usr/bin/env node

/**
 * Quick Performance Comparison Script
 * 
 * This script provides a quick comparison between different coverage modes
 * to demonstrate the performance optimizations implemented.
 */

const { spawn } = require('child_process')

class PerformanceComparison {
  constructor() {
    this.results = []
  }

  /**
   * Run a single test scenario and measure performance
   */
  async runScenario(name, command, description) {
    console.log(`\n🔍 Running: ${name}`)
    console.log(`   ${description}`)
    
    const startTime = Date.now()
    
    try {
      await new Promise((resolve, reject) => {
        const process = spawn(command[0], command.slice(1), {
          stdio: 'pipe',
          shell: true
        })

        let output = ''
        process.stdout.on('data', (data) => {
          output += data.toString()
        })

        process.stderr.on('data', (data) => {
          output += data.toString()
        })

        process.on('close', (code) => {
          const endTime = Date.now()
          const executionTime = endTime - startTime
          
          this.results.push({
            name,
            executionTime,
            success: code === 0,
            output: output.slice(-500) // Keep last 500 characters
          })
          
          if (code === 0) {
            console.log(`   ✅ Completed in ${executionTime}ms`)
          } else {
            console.log(`   ❌ Failed in ${executionTime}ms`)
          }
          
          resolve()
        })

        process.on('error', (error) => {
          console.log(`   ❌ Error: ${error.message}`)
          reject(error)
        })

        // Set timeout
        setTimeout(() => {
          process.kill()
          reject(new Error('Timeout'))
        }, 60000) // 1 minute timeout
      })
    } catch (error) {
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      this.results.push({
        name,
        executionTime,
        success: false,
        error: error.message
      })
      
      console.log(`   ❌ Failed: ${error.message}`)
    }
  }

  /**
   * Run performance comparison
   */
  async runComparison() {
    console.log('🚀 Performance Comparison: Coverage Collection Optimizations')
    console.log('=' .repeat(65))

    const scenarios = [
      {
        name: 'Unit Tests Only (Baseline)',
        command: ['npx', 'vitest', '--run'],
        description: 'Running unit tests without coverage collection'
      },
      {
        name: 'Full Coverage Collection',
        command: ['npx', 'vitest', '--run', '--coverage'],
        description: 'Running tests with full coverage on all source files'
      },
      {
        name: 'Selective Coverage (lib only)',
        command: ['node', 'scripts/selective-coverage.cjs', '--dir', 'lib'],
        description: 'Running coverage only on lib directory (optimized)'
      }
    ]

    // Run each scenario
    for (const scenario of scenarios) {
      await this.runScenario(scenario.name, scenario.command, scenario.description)
    }

    // Analyze and display results
    this.displayResults()
  }

  /**
   * Display performance comparison results
   */
  displayResults() {
    console.log('\n\n📊 Performance Analysis Results')
    console.log('=' .repeat(50))

    const baseline = this.results.find(r => r.name.includes('Baseline'))
    
    if (!baseline || !baseline.success) {
      console.log('❌ Could not establish baseline performance')
      return
    }

    console.log(`\n🏁 Baseline (no coverage): ${baseline.executionTime}ms`)

    // Calculate performance impacts
    this.results.forEach(result => {
      if (result.name.includes('Baseline')) return

      if (result.success) {
        const impact = ((result.executionTime - baseline.executionTime) / baseline.executionTime) * 100
        const status = this.getPerformanceStatus(impact)
        
        console.log(`\n${status.icon} ${result.name}:`)
        console.log(`   Time: ${result.executionTime}ms (+${Math.round(impact)}%)`)
        console.log(`   Status: ${status.message}`)
      } else {
        console.log(`\n❌ ${result.name}: Failed to complete`)
      }
    })

    // Show optimization benefits
    this.showOptimizationBenefits()
  }

  /**
   * Get performance status based on impact
   */
  getPerformanceStatus(impactPercentage) {
    if (impactPercentage < 25) {
      return { icon: '🟢', message: 'Excellent - minimal performance impact' }
    } else if (impactPercentage < 50) {
      return { icon: '🟡', message: 'Good - acceptable performance impact' }
    } else if (impactPercentage < 100) {
      return { icon: '🟠', message: 'Moderate - consider further optimization' }
    } else {
      return { icon: '🔴', message: 'High - optimization recommended' }
    }
  }

  /**
   * Show optimization benefits and recommendations
   */
  showOptimizationBenefits() {
    const fullCoverage = this.results.find(r => r.name.includes('Full Coverage'))
    const selective = this.results.find(r => r.name.includes('Selective'))
    const baseline = this.results.find(r => r.name.includes('Baseline'))

    if (fullCoverage && selective && baseline && 
        fullCoverage.success && selective.success && baseline.success) {
      
      const fullImpact = ((fullCoverage.executionTime - baseline.executionTime) / baseline.executionTime) * 100
      const selectiveImpact = ((selective.executionTime - baseline.executionTime) / baseline.executionTime) * 100
      const improvement = fullImpact - selectiveImpact

      console.log('\n\n💡 Optimization Benefits:')
      console.log('-'.repeat(30))
      
      if (improvement > 0) {
        console.log(`✅ Selective coverage is ${Math.round(improvement)}% faster than full coverage`)
      }
      
      console.log('\n🎯 Performance Optimizations Implemented:')
      console.log('   • Selective file inclusion (target specific directories)')
      console.log('   • Optimized thread pool configuration')
      console.log('   • Efficient instrumentation settings')
      console.log('   • Memory usage optimization')
      console.log('   • Fast report generation modes')

      console.log('\n📋 Usage Recommendations:')
      console.log('   • Development: npm run test:coverage:fast')
      console.log('   • Focused testing: npm run test:coverage:selective --dir <directory>')
      console.log('   • CI/CD: npm run test:coverage (full coverage)')
      console.log('   • Performance monitoring: npm run test:coverage:benchmark')
    }

    console.log('\n🔧 Available Performance Scripts:')
    console.log('   npm run test:coverage:fast      - Quick coverage on lib directory')
    console.log('   npm run test:coverage:selective - Customizable selective coverage')
    console.log('   npm run test:coverage:dev       - Development mode with watch')
    console.log('   npm run test:coverage:benchmark - Full performance analysis')
  }
}

// Run the comparison
async function main() {
  const comparison = new PerformanceComparison()
  
  try {
    await comparison.runComparison()
    console.log('\n✅ Performance comparison completed')
  } catch (error) {
    console.error('\n❌ Performance comparison failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}