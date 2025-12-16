#!/usr/bin/env node

/**
 * Dynamic Code Tracking System
 * Automatically includes new source files in coverage calculations
 * and tracks coverage changes across file modifications
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chokidar = require('chokidar');
const glob = require('glob');

class DynamicCodeTracker {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.configFile = path.join(process.cwd(), 'vitest.config.ts');
    this.coverageConfigFile = path.join(process.cwd(), 'coverage.config.js');
    this.trackingDataFile = path.join(this.coverageDir, 'tracking-data.json');
    
    // File patterns to track
    this.sourcePatterns = ['src/**/*.{ts,tsx,js,jsx}'];
    this.excludePatterns = [
      '**/*.d.ts',
      '**/*.config.*',
      '**/*.test.*',
      '**/*.spec.*',
      'src/vite-env.d.ts',
      'src/main.tsx',
      'src/components/ui/**'
    ];

    // Initialize tracking data
    this.trackingData = this.loadTrackingData();
  }

  /**
   * Load existing tracking data
   */
  loadTrackingData() {
    if (fs.existsSync(this.trackingDataFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.trackingDataFile, 'utf8'));
      } catch (error) {
        console.warn('Failed to load tracking data:', error.message);
      }
    }

    return {
      lastScan: null,
      files: {},
      coverageHistory: [],
      changeLog: []
    };
  }

  /**
   * Save tracking data
   */
  saveTrackingData() {
    try {
      // Ensure coverage directory exists
      if (!fs.existsSync(this.coverageDir)) {
        fs.mkdirSync(this.coverageDir, { recursive: true });
      }

      fs.writeFileSync(
        this.trackingDataFile,
        JSON.stringify(this.trackingData, null, 2)
      );
    } catch (error) {
      console.error('Failed to save tracking data:', error.message);
    }
  }

  /**
   * Scan source directory for files
   */
  scanSourceFiles() {
    const files = {};
    
    for (const pattern of this.sourcePatterns) {
      const matchedFiles = glob.sync(pattern, {
        ignore: this.excludePatterns,
        cwd: process.cwd()
      });

      for (const file of matchedFiles) {
        const fullPath = path.resolve(file);
        const stats = fs.statSync(fullPath);
        
        files[file] = {
          path: fullPath,
          size: stats.size,
          mtime: stats.mtime.toISOString(),
          exists: true
        };
      }
    }

    return files;
  }

  /**
   * Detect changes in source files
   */
  detectChanges(currentFiles) {
    const changes = {
      added: [],
      modified: [],
      deleted: [],
      renamed: []
    };

    const previousFiles = this.trackingData.files || {};

    // Check for new and modified files
    for (const [filePath, fileInfo] of Object.entries(currentFiles)) {
      if (!previousFiles[filePath]) {
        changes.added.push({
          path: filePath,
          size: fileInfo.size,
          timestamp: new Date().toISOString()
        });
      } else if (previousFiles[filePath].mtime !== fileInfo.mtime) {
        changes.modified.push({
          path: filePath,
          previousSize: previousFiles[filePath].size,
          currentSize: fileInfo.size,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check for deleted files
    for (const [filePath, fileInfo] of Object.entries(previousFiles)) {
      if (!currentFiles[filePath]) {
        changes.deleted.push({
          path: filePath,
          size: fileInfo.size,
          timestamp: new Date().toISOString()
        });
      }
    }

    return changes;
  }

  /**
   * Update coverage configuration with new files
   */
  updateCoverageConfiguration(changes) {
    if (changes.added.length === 0 && changes.deleted.length === 0) {
      return false; // No configuration changes needed
    }

    console.log('Updating coverage configuration...');

    // The Vitest configuration already uses glob patterns that automatically
    // include new files, so we don't need to modify the config file.
    // We just log the changes for tracking purposes.

    let configChanged = false;

    // Log the changes for tracking
    if (changes.added.length > 0) {
      console.log(`✅ Automatically including ${changes.added.length} new files in coverage:`);
      changes.added.forEach(file => {
        console.log(`  + ${file.path}`);
      });
      configChanged = true;
    }

    if (changes.deleted.length > 0) {
      console.log(`🗑️  Removing ${changes.deleted.length} deleted files from coverage tracking:`);
      changes.deleted.forEach(file => {
        console.log(`  - ${file.path}`);
      });
      configChanged = true;
    }

    return configChanged;
  }

  /**
   * Generate coverage change report
   */
  generateCoverageChangeReport(previousCoverage, currentCoverage) {
    if (!previousCoverage || !currentCoverage) {
      return null;
    }

    const report = {
      timestamp: new Date().toISOString(),
      overall: {
        previous: previousCoverage.total || {},
        current: currentCoverage.total || {},
        changes: {}
      },
      files: {}
    };

    // Calculate overall changes
    const metrics = ['lines', 'functions', 'branches', 'statements'];
    for (const metric of metrics) {
      const prev = previousCoverage.total?.[metric]?.pct || 0;
      const curr = currentCoverage.total?.[metric]?.pct || 0;
      report.overall.changes[metric] = {
        previous: prev,
        current: curr,
        delta: curr - prev,
        improved: curr > prev,
        degraded: curr < prev
      };
    }

    // Calculate per-file changes
    const allFiles = new Set([
      ...Object.keys(previousCoverage),
      ...Object.keys(currentCoverage)
    ]);

    for (const filePath of allFiles) {
      if (filePath === 'total') continue;

      const prevFile = previousCoverage[filePath];
      const currFile = currentCoverage[filePath];

      if (!prevFile && currFile) {
        // New file
        report.files[filePath] = {
          status: 'added',
          coverage: currFile
        };
      } else if (prevFile && !currFile) {
        // Deleted file
        report.files[filePath] = {
          status: 'deleted',
          previousCoverage: prevFile
        };
      } else if (prevFile && currFile) {
        // Modified file - check for coverage changes
        const fileChanges = {};
        let hasChanges = false;

        for (const metric of metrics) {
          const prev = prevFile[metric]?.pct || 0;
          const curr = currFile[metric]?.pct || 0;
          if (Math.abs(curr - prev) > 0.01) { // Threshold for significant change
            fileChanges[metric] = {
              previous: prev,
              current: curr,
              delta: curr - prev
            };
            hasChanges = true;
          }
        }

        if (hasChanges) {
          report.files[filePath] = {
            status: 'modified',
            changes: fileChanges
          };
        }
      }
    }

    return report;
  }

  /**
   * Load previous coverage data
   */
  loadPreviousCoverage() {
    const summaryFile = path.join(this.coverageDir, 'coverage-summary.json');
    if (fs.existsSync(summaryFile)) {
      try {
        return JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
      } catch (error) {
        console.warn('Failed to load previous coverage data:', error.message);
      }
    }
    return null;
  }

  /**
   * Run coverage collection
   */
  async runCoverage() {
    console.log('Running coverage collection...');
    
    try {
      execSync('npm run test:coverage', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' }
      });
      return true;
    } catch (error) {
      console.error('Coverage collection failed:', error.message);
      return false;
    }
  }

  /**
   * Display coverage change summary
   */
  displayCoverageChanges(changeReport) {
    if (!changeReport) {
      console.log('No previous coverage data available for comparison');
      return;
    }

    console.log('\n=== Coverage Change Report ===');
    console.log(`Generated: ${changeReport.timestamp}`);

    // Overall changes
    console.log('\nOverall Coverage Changes:');
    const overall = changeReport.overall.changes;
    for (const [metric, change] of Object.entries(overall)) {
      const symbol = change.improved ? '📈' : change.degraded ? '📉' : '➡️';
      const deltaStr = change.delta > 0 ? `+${change.delta.toFixed(2)}%` : `${change.delta.toFixed(2)}%`;
      console.log(`  ${symbol} ${metric}: ${change.previous.toFixed(2)}% → ${change.current.toFixed(2)}% (${deltaStr})`);
    }

    // File changes
    const fileChanges = Object.entries(changeReport.files);
    if (fileChanges.length > 0) {
      console.log('\nFile-Level Changes:');
      
      const added = fileChanges.filter(([, info]) => info.status === 'added');
      const deleted = fileChanges.filter(([, info]) => info.status === 'deleted');
      const modified = fileChanges.filter(([, info]) => info.status === 'modified');

      if (added.length > 0) {
        console.log(`\n  📁 New Files (${added.length}):`);
        added.forEach(([filePath, info]) => {
          const coverage = info.coverage;
          console.log(`    + ${filePath} (${coverage.lines?.pct || 0}% lines)`);
        });
      }

      if (deleted.length > 0) {
        console.log(`\n  🗑️  Deleted Files (${deleted.length}):`);
        deleted.forEach(([filePath]) => {
          console.log(`    - ${filePath}`);
        });
      }

      if (modified.length > 0) {
        console.log(`\n  📝 Modified Files (${modified.length}):`);
        modified.forEach(([filePath, info]) => {
          console.log(`    ~ ${filePath}`);
          for (const [metric, change] of Object.entries(info.changes)) {
            const deltaStr = change.delta > 0 ? `+${change.delta.toFixed(2)}%` : `${change.delta.toFixed(2)}%`;
            console.log(`      ${metric}: ${change.previous.toFixed(2)}% → ${change.current.toFixed(2)}% (${deltaStr})`);
          }
        });
      }
    }
  }

  /**
   * Start file watching for continuous tracking
   */
  startWatching() {
    console.log('Starting file system watcher for dynamic code tracking...');
    
    const watcher = chokidar.watch(this.sourcePatterns, {
      ignored: this.excludePatterns,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (filePath) => {
        console.log(`📁 New file detected: ${filePath}`);
        this.handleFileChange('added', filePath);
      })
      .on('change', (filePath) => {
        console.log(`📝 File modified: ${filePath}`);
        this.handleFileChange('modified', filePath);
      })
      .on('unlink', (filePath) => {
        console.log(`🗑️  File deleted: ${filePath}`);
        this.handleFileChange('deleted', filePath);
      })
      .on('error', (error) => {
        console.error('File watcher error:', error);
      });

    console.log('File watcher started. Press Ctrl+C to stop.');
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\nStopping file watcher...');
      watcher.close();
      process.exit(0);
    });

    return watcher;
  }

  /**
   * Handle file system changes
   */
  async handleFileChange(type, filePath) {
    // Update tracking data
    const currentFiles = this.scanSourceFiles();
    const changes = this.detectChanges(currentFiles);
    
    // Log the change
    this.trackingData.changeLog.push({
      type,
      path: filePath,
      timestamp: new Date().toISOString()
    });

    // Update file tracking
    this.trackingData.files = currentFiles;
    this.trackingData.lastScan = new Date().toISOString();
    
    // Save tracking data
    this.saveTrackingData();

    // Update configuration if needed
    this.updateCoverageConfiguration(changes);

    console.log(`✅ Updated tracking data for ${type} file: ${filePath}`);
  }

  /**
   * Perform full scan and update
   */
  async scan(options = {}) {
    const { runCoverage = false, generateReport = true } = options;

    console.log('🔍 Scanning source files for changes...');

    // Load previous coverage data
    const previousCoverage = this.loadPreviousCoverage();

    // Scan current files
    const currentFiles = this.scanSourceFiles();
    const changes = this.detectChanges(currentFiles);

    console.log(`Found ${Object.keys(currentFiles).length} source files`);
    console.log(`Changes: ${changes.added.length} added, ${changes.modified.length} modified, ${changes.deleted.length} deleted`);

    // Update configuration
    const configChanged = this.updateCoverageConfiguration(changes);

    // Update tracking data
    this.trackingData.files = currentFiles;
    this.trackingData.lastScan = new Date().toISOString();

    // Log changes
    if (changes.added.length > 0 || changes.modified.length > 0 || changes.deleted.length > 0) {
      this.trackingData.changeLog.push({
        type: 'scan',
        changes,
        timestamp: new Date().toISOString()
      });
    }

    // Save tracking data
    this.saveTrackingData();

    // Run coverage if requested or if configuration changed
    if (runCoverage || configChanged) {
      const coverageSuccess = await this.runCoverage();
      
      if (coverageSuccess && generateReport) {
        // Load new coverage data
        const currentCoverage = this.loadPreviousCoverage();
        
        // Generate change report
        const changeReport = this.generateCoverageChangeReport(previousCoverage, currentCoverage);
        
        // Store coverage history
        if (currentCoverage) {
          this.trackingData.coverageHistory.push({
            timestamp: new Date().toISOString(),
            coverage: currentCoverage.total
          });
          
          // Keep only last 50 entries
          if (this.trackingData.coverageHistory.length > 50) {
            this.trackingData.coverageHistory = this.trackingData.coverageHistory.slice(-50);
          }
          
          this.saveTrackingData();
        }

        // Display changes
        this.displayCoverageChanges(changeReport);
      }
    }

    return {
      filesScanned: Object.keys(currentFiles).length,
      changes,
      configChanged
    };
  }

  /**
   * Show tracking status
   */
  showStatus() {
    console.log('=== Dynamic Code Tracking Status ===');
    console.log(`Last scan: ${this.trackingData.lastScan || 'Never'}`);
    console.log(`Tracked files: ${Object.keys(this.trackingData.files).length}`);
    console.log(`Change log entries: ${this.trackingData.changeLog.length}`);
    console.log(`Coverage history entries: ${this.trackingData.coverageHistory.length}`);

    if (this.trackingData.changeLog.length > 0) {
      console.log('\nRecent changes:');
      const recentChanges = this.trackingData.changeLog.slice(-5);
      recentChanges.forEach(change => {
        console.log(`  ${change.timestamp}: ${change.type} - ${change.path || 'multiple files'}`);
      });
    }

    if (this.trackingData.coverageHistory.length > 0) {
      console.log('\nCoverage trend:');
      const recent = this.trackingData.coverageHistory.slice(-3);
      recent.forEach(entry => {
        const coverage = entry.coverage;
        console.log(`  ${entry.timestamp}: ${coverage?.lines?.pct || 0}% lines, ${coverage?.functions?.pct || 0}% functions`);
      });
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'scan';

  const tracker = new DynamicCodeTracker();

  switch (command) {
    case 'scan':
      const runCoverage = args.includes('--coverage');
      const noReport = args.includes('--no-report');
      tracker.scan({ 
        runCoverage, 
        generateReport: !noReport 
      }).then(result => {
        console.log(`\n✅ Scan completed: ${result.filesScanned} files, ${result.changes.added.length + result.changes.modified.length + result.changes.deleted.length} changes`);
        process.exit(0);
      }).catch(error => {
        console.error('Scan failed:', error);
        process.exit(1);
      });
      break;

    case 'watch':
      tracker.startWatching();
      break;

    case 'status':
      tracker.showStatus();
      break;

    case 'help':
    default:
      console.log(`
Dynamic Code Tracker

Usage: node scripts/dynamic-code-tracker.js [command] [options]

Commands:
  scan          Scan for file changes and update tracking (default)
  watch         Start file system watcher for continuous tracking
  status        Show current tracking status
  help          Show this help message

Options:
  --coverage    Run coverage collection after scan
  --no-report   Don't generate coverage change report

Examples:
  node scripts/dynamic-code-tracker.js scan
  node scripts/dynamic-code-tracker.js scan --coverage
  node scripts/dynamic-code-tracker.js watch
  node scripts/dynamic-code-tracker.js status
`);
      break;
  }
}

module.exports = { DynamicCodeTracker };