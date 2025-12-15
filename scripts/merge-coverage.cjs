#!/usr/bin/env node

/**
 * Coverage Data Merging Utility
 * Merges coverage data from unit tests and E2E tests into unified reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CoverageMerger {
  constructor() {
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.unitCoverageFile = path.join(this.coverageDir, 'coverage-final.json');
    this.e2eCoverageDir = path.join(this.coverageDir, 'e2e');
    this.mergedCoverageFile = path.join(this.coverageDir, 'coverage-merged.json');
  }

  /**
   * Check if coverage files exist
   */
  checkCoverageFiles() {
    const unitExists = fs.existsSync(this.unitCoverageFile);
    const e2eExists = fs.existsSync(this.e2eCoverageDir) && 
                     fs.readdirSync(this.e2eCoverageDir).length > 0;

    console.log(`Unit test coverage: ${unitExists ? 'Found' : 'Not found'}`);
    console.log(`E2E test coverage: ${e2eExists ? 'Found' : 'Not found'}`);

    return { unitExists, e2eExists };
  }

  /**
   * Load unit test coverage data
   */
  loadUnitCoverage() {
    if (!fs.existsSync(this.unitCoverageFile)) {
      console.log('No unit test coverage data found');
      return {};
    }

    try {
      const data = fs.readFileSync(this.unitCoverageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load unit coverage data:', error.message);
      return {};
    }
  }

  /**
   * Load and process E2E coverage data
   */
  loadE2ECoverage() {
    if (!fs.existsSync(this.e2eCoverageDir)) {
      console.log('No E2E coverage directory found');
      return {};
    }

    const e2eFiles = fs.readdirSync(this.e2eCoverageDir)
      .filter(file => file.endsWith('.json'));

    if (e2eFiles.length === 0) {
      console.log('No E2E coverage files found');
      return {};
    }

    console.log(`Found ${e2eFiles.length} E2E coverage files`);

    let mergedE2ECoverage = {};

    for (const file of e2eFiles) {
      try {
        const filePath = path.join(this.e2eCoverageDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Convert E2E coverage data to Istanbul format if needed
        if (data.coverage && Array.isArray(data.coverage)) {
          const convertedCoverage = this.convertE2ECoverageToIstanbul(data.coverage);
          mergedE2ECoverage = this.mergeCoverageObjects(mergedE2ECoverage, convertedCoverage);
        } else if (typeof data === 'object') {
          // Already in Istanbul format
          mergedE2ECoverage = this.mergeCoverageObjects(mergedE2ECoverage, data);
        }
      } catch (error) {
        console.warn(`Failed to process E2E coverage file ${file}:`, error.message);
      }
    }

    return mergedE2ECoverage;
  }

  /**
   * Convert E2E coverage data to Istanbul format
   */
  convertE2ECoverageToIstanbul(coverageData) {
    const istanbulCoverage = {};

    for (const entry of coverageData) {
      if (!entry.url || !entry.ranges || !entry.text) {
        continue;
      }

      // Extract file path from URL
      const url = new URL(entry.url);
      let filePath = url.pathname;
      
      // Convert URL path to local file path
      if (filePath.startsWith('/src/')) {
        filePath = filePath.substring(1); // Remove leading slash
      } else {
        continue; // Skip non-source files
      }

      // Create Istanbul-compatible coverage object
      const lines = {};
      const functions = {};
      const branches = {};
      const statements = {};

      // Process ranges to extract line coverage
      const sourceLines = entry.text.split('\n');

      // Initialize all lines as uncovered
      for (let i = 1; i <= sourceLines.length; i++) {
        lines[i] = 0;
        statements[i] = 0;
      }

      // Mark covered lines based on ranges
      for (const range of entry.ranges) {
        if (range.count > 0) {
          // Find which lines this range covers
          let charCount = 0;
          for (let lineNum = 1; lineNum <= sourceLines.length; lineNum++) {
            const lineLength = sourceLines[lineNum - 1].length + 1; // +1 for newline
            
            if (charCount + lineLength > range.start && charCount < range.end) {
              lines[lineNum] = Math.max(lines[lineNum], range.count);
              statements[lineNum] = Math.max(statements[lineNum], range.count);
            }
            
            charCount += lineLength;
            if (charCount > range.end) break;
          }
        }
      }

      istanbulCoverage[filePath] = {
        path: filePath,
        statementMap: {},
        fnMap: functions,
        branchMap: branches,
        s: statements,
        f: {},
        b: {},
        l: lines,
        inputSourceMap: null
      };
    }

    return istanbulCoverage;
  }

  /**
   * Merge two coverage objects
   */
  mergeCoverageObjects(coverage1, coverage2) {
    const merged = { ...coverage1 };

    for (const [filePath, fileCoverage] of Object.entries(coverage2)) {
      if (merged[filePath]) {
        // Merge coverage for existing file
        merged[filePath] = this.mergeFileCoverage(merged[filePath], fileCoverage);
      } else {
        // Add new file coverage
        merged[filePath] = { ...fileCoverage };
      }
    }

    return merged;
  }

  /**
   * Merge coverage data for a single file
   */
  mergeFileCoverage(coverage1, coverage2) {
    const merged = { ...coverage1 };

    // Merge line coverage
    if (coverage2.l) {
      merged.l = merged.l || {};
      for (const [line, count] of Object.entries(coverage2.l)) {
        merged.l[line] = Math.max(merged.l[line] || 0, count);
      }
    }

    // Merge statement coverage
    if (coverage2.s) {
      merged.s = merged.s || {};
      for (const [stmt, count] of Object.entries(coverage2.s)) {
        merged.s[stmt] = Math.max(merged.s[stmt] || 0, count);
      }
    }

    // Merge function coverage
    if (coverage2.f) {
      merged.f = merged.f || {};
      for (const [func, count] of Object.entries(coverage2.f)) {
        merged.f[func] = Math.max(merged.f[func] || 0, count);
      }
    }

    // Merge branch coverage
    if (coverage2.b) {
      merged.b = merged.b || {};
      for (const [branch, counts] of Object.entries(coverage2.b)) {
        if (merged.b[branch]) {
          // Merge branch counts
          merged.b[branch] = merged.b[branch].map((count, index) => 
            Math.max(count, counts[index] || 0)
          );
        } else {
          merged.b[branch] = [...counts];
        }
      }
    }

    return merged;
  }

  /**
   * Save merged coverage data
   */
  saveMergedCoverage(mergedCoverage) {
    try {
      fs.writeFileSync(
        this.mergedCoverageFile, 
        JSON.stringify(mergedCoverage, null, 2)
      );
      console.log(`Merged coverage saved to: ${this.mergedCoverageFile}`);
      return true;
    } catch (error) {
      console.error('Failed to save merged coverage:', error.message);
      return false;
    }
  }

  /**
   * Generate reports from merged coverage data
   */
  generateReports(reportTypes = ['html', 'json', 'text', 'lcov']) {
    if (!fs.existsSync(this.mergedCoverageFile)) {
      console.error('No merged coverage file found');
      return false;
    }

    try {
      // Use nyc to generate reports from merged coverage
      const nycCommand = [
        'npx nyc report',
        '--temp-dir coverage',
        '--report-dir coverage/merged',
        ...reportTypes.map(type => `--reporter ${type}`)
      ].join(' ');

      console.log('Generating merged coverage reports...');
      execSync(nycCommand, { stdio: 'inherit' });
      console.log('Merged coverage reports generated successfully');
      return true;
    } catch (error) {
      console.error('Failed to generate merged reports:', error.message);
      return false;
    }
  }

  /**
   * Generate separate reports for unit and E2E tests
   */
  generateSeparateReports() {
    const { unitExists, e2eExists } = this.checkCoverageFiles();

    // Generate unit test reports
    if (unitExists) {
      try {
        console.log('Generating unit test coverage reports...');
        execSync('npm run test:coverage', { stdio: 'inherit' });
      } catch (error) {
        console.warn('Failed to generate unit test reports:', error.message);
      }
    }

    // Generate E2E test reports (if we have data)
    if (e2eExists) {
      const e2eCoverage = this.loadE2ECoverage();
      if (Object.keys(e2eCoverage).length > 0) {
        const e2eReportFile = path.join(this.coverageDir, 'e2e-coverage.json');
        fs.writeFileSync(e2eReportFile, JSON.stringify(e2eCoverage, null, 2));
        
        try {
          console.log('Generating E2E test coverage reports...');
          const nycCommand = `npx nyc report --temp-dir coverage --report-dir coverage/e2e --reporter html --reporter json --reporter text`;
          execSync(nycCommand, { stdio: 'inherit' });
        } catch (error) {
          console.warn('Failed to generate E2E test reports:', error.message);
        }
      }
    }
  }

  /**
   * Main merge function
   */
  async merge(options = {}) {
    const {
      generateSeparate = false,
      reportTypes = ['html', 'json', 'text', 'lcov']
    } = options;

    console.log('Starting coverage merge process...');

    // Check what coverage data we have
    const { unitExists, e2eExists } = this.checkCoverageFiles();

    if (!unitExists && !e2eExists) {
      console.log('No coverage data found to merge');
      return false;
    }

    // Load coverage data
    const unitCoverage = this.loadUnitCoverage();
    const e2eCoverage = this.loadE2ECoverage();

    // Merge coverage data
    let mergedCoverage = {};
    
    if (Object.keys(unitCoverage).length > 0) {
      console.log(`Merging unit test coverage (${Object.keys(unitCoverage).length} files)`);
      mergedCoverage = this.mergeCoverageObjects(mergedCoverage, unitCoverage);
    }

    if (Object.keys(e2eCoverage).length > 0) {
      console.log(`Merging E2E test coverage (${Object.keys(e2eCoverage).length} files)`);
      mergedCoverage = this.mergeCoverageObjects(mergedCoverage, e2eCoverage);
    }

    if (Object.keys(mergedCoverage).length === 0) {
      console.log('No valid coverage data to merge');
      return false;
    }

    // Save merged coverage
    const saved = this.saveMergedCoverage(mergedCoverage);
    if (!saved) {
      return false;
    }

    // Generate reports
    if (generateSeparate) {
      this.generateSeparateReports();
    }

    // Generate merged reports
    const reportsGenerated = this.generateReports(reportTypes);

    console.log('Coverage merge process completed');
    return reportsGenerated;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    generateSeparate: args.includes('--separate'),
    reportTypes: ['html', 'json', 'text', 'lcov']
  };

  const merger = new CoverageMerger();
  merger.merge(options)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Coverage merge failed:', error);
      process.exit(1);
    });
}

module.exports = { CoverageMerger };