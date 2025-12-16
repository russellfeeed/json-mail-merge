#!/usr/bin/env node

/**
 * Test Runner with Coverage Integration
 * Runs unit tests and E2E tests with coverage collection and merging
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { CoverageMerger } = require('./merge-coverage.cjs');
const { DynamicCodeTracker } = require('./dynamic-code-tracker.cjs');

class TestRunner {
  constructor() {
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.dynamicTracker = new DynamicCodeTracker();
    this.options = {
      runUnit: true,
      runE2E: true,
      merge: true,
      generateSeparate: false,
      clean: true,
      trackChanges: true
    };
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const options = { ...this.options };

    for (const arg of args) {
      switch (arg) {
        case '--unit-only':
          options.runUnit = true;
          options.runE2E = false;
          options.merge = false;
          break;
        case '--e2e-only':
          options.runUnit = false;
          options.runE2E = true;
          options.merge = false;
          break;
        case '--no-merge':
          options.merge = false;
          break;
        case '--separate':
          options.generateSeparate = true;
          break;
        case '--no-clean':
          options.clean = false;
          break;
        case '--no-track':
          options.trackChanges = false;
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
          break;
      }
    }

    return options;
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
Test Runner with Coverage Integration

Usage: node scripts/run-tests-with-coverage.js [options]

Options:
  --unit-only     Run only unit tests with coverage
  --e2e-only      Run only E2E tests with coverage
  --no-merge      Don't merge coverage data from different test types
  --separate      Generate separate reports for each test type
  --no-clean      Don't clean coverage directory before running tests
  --no-track      Don't run dynamic code tracking
  --help          Show this help message

Examples:
  node scripts/run-tests-with-coverage.js
  node scripts/run-tests-with-coverage.js --unit-only
  node scripts/run-tests-with-coverage.js --separate
  node scripts/run-tests-with-coverage.js --no-merge --separate
`);
  }

  /**
   * Clean coverage directory
   */
  cleanCoverageDir() {
    if (fs.existsSync(this.coverageDir)) {
      console.log('Cleaning coverage directory...');
      try {
        execSync(`rm -rf ${this.coverageDir}`, { stdio: 'inherit' });
      } catch (error) {
        // Fallback for Windows
        try {
          execSync(`rmdir /s /q "${this.coverageDir}"`, { stdio: 'inherit' });
        } catch (winError) {
          console.warn('Failed to clean coverage directory:', winError.message);
        }
      }
    }
  }

  /**
   * Run unit tests with coverage
   */
  async runUnitTests() {
    console.log('\n=== Running Unit Tests with Coverage ===');
    
    try {
      execSync('npm run test:coverage', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' }
      });
      console.log('✅ Unit tests completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Unit tests failed:', error.message);
      return false;
    }
  }

  /**
   * Run E2E tests with coverage
   */
  async runE2ETests() {
    console.log('\n=== Running E2E Tests with Coverage ===');
    
    try {
      // Ensure E2E coverage directory exists
      const e2eCoverageDir = path.join(this.coverageDir, 'e2e');
      if (!fs.existsSync(e2eCoverageDir)) {
        fs.mkdirSync(e2eCoverageDir, { recursive: true });
      }

      // Run E2E tests
      execSync('npm run test:e2e', { 
        stdio: 'inherit',
        env: { 
          ...process.env, 
          NODE_ENV: 'test',
          COVERAGE_ENABLED: 'true'
        }
      });
      
      console.log('✅ E2E tests completed successfully');
      return true;
    } catch (error) {
      console.error('❌ E2E tests failed:', error.message);
      return false;
    }
  }

  /**
   * Merge coverage data
   */
  async mergeCoverage(generateSeparate = false) {
    console.log('\n=== Merging Coverage Data ===');
    
    try {
      const merger = new CoverageMerger();
      const success = await merger.merge({
        generateSeparate,
        reportTypes: ['html', 'json', 'text', 'lcov']
      });

      if (success) {
        console.log('✅ Coverage data merged successfully');
        return true;
      } else {
        console.warn('⚠️  Coverage merge completed with warnings');
        return false;
      }
    } catch (error) {
      console.error('❌ Coverage merge failed:', error.message);
      return false;
    }
  }

  /**
   * Display coverage summary
   */
  displayCoverageSummary() {
    console.log('\n=== Coverage Summary ===');
    
    const summaryFiles = [
      path.join(this.coverageDir, 'coverage-summary.json'),
      path.join(this.coverageDir, 'merged', 'coverage-summary.json')
    ];

    for (const summaryFile of summaryFiles) {
      if (fs.existsSync(summaryFile)) {
        try {
          const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
          const total = summary.total;
          
          console.log(`\nCoverage Summary (${path.basename(path.dirname(summaryFile))}):`);
          console.log(`  Lines:      ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`);
          console.log(`  Functions:  ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`);
          console.log(`  Branches:   ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`);
          console.log(`  Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`);
          
          break; // Show only the first available summary
        } catch (error) {
          console.warn(`Failed to read coverage summary from ${summaryFile}`);
        }
      }
    }
  }

  /**
   * Display report locations
   */
  displayReportLocations() {
    console.log('\n=== Coverage Reports ===');
    
    const reportDirs = [
      { name: 'Unit Tests', path: path.join(this.coverageDir, 'index.html') },
      { name: 'E2E Tests', path: path.join(this.coverageDir, 'e2e', 'index.html') },
      { name: 'Merged', path: path.join(this.coverageDir, 'merged', 'index.html') }
    ];

    for (const report of reportDirs) {
      if (fs.existsSync(report.path)) {
        console.log(`  ${report.name}: file://${report.path}`);
      }
    }
  }

  /**
   * Main execution function
   */
  async run(args = []) {
    const options = this.parseArgs(args);
    
    console.log('🚀 Starting test execution with coverage...');
    console.log('Options:', options);

    // Run dynamic code tracking before tests
    if (options.trackChanges) {
      console.log('\n=== Dynamic Code Tracking ===');
      try {
        const trackingResult = await this.dynamicTracker.scan({ 
          runCoverage: false, 
          generateReport: false 
        });
        console.log(`✅ Code tracking completed: ${trackingResult.filesScanned} files tracked`);
        
        if (trackingResult.changes.added.length > 0 || trackingResult.changes.deleted.length > 0) {
          console.log(`📝 Detected ${trackingResult.changes.added.length} new files, ${trackingResult.changes.deleted.length} deleted files`);
        }
      } catch (error) {
        console.warn('⚠️  Dynamic code tracking failed:', error.message);
      }
    }

    // Clean coverage directory if requested
    if (options.clean) {
      this.cleanCoverageDir();
    }

    let unitSuccess = true;
    let e2eSuccess = true;
    let mergeSuccess = true;

    // Run unit tests
    if (options.runUnit) {
      unitSuccess = await this.runUnitTests();
    }

    // Run E2E tests
    if (options.runE2E) {
      e2eSuccess = await this.runE2ETests();
    }

    // Merge coverage data
    if (options.merge && (unitSuccess || e2eSuccess)) {
      mergeSuccess = await this.mergeCoverage(options.generateSeparate);
    }

    // Display results
    this.displayCoverageSummary();
    this.displayReportLocations();

    // Determine overall success
    const overallSuccess = unitSuccess && e2eSuccess && (mergeSuccess || !options.merge);
    
    console.log('\n=== Test Execution Complete ===');
    if (overallSuccess) {
      console.log('✅ All tests and coverage operations completed successfully');
    } else {
      console.log('❌ Some tests or coverage operations failed');
    }

    return overallSuccess;
  }
}

// CLI interface
if (require.main === module) {
  const runner = new TestRunner();
  const args = process.argv.slice(2);
  
  runner.run(args)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { TestRunner };