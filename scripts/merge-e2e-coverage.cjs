#!/usr/bin/env node

/**
 * Merge E2E coverage data with unit test coverage
 * This script processes coverage data collected from E2E tests and merges it with unit test coverage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COVERAGE_DIR = path.join(process.cwd(), 'coverage');
const E2E_COVERAGE_DIR = path.join(COVERAGE_DIR, 'e2e');
const UNIT_COVERAGE_FILE = path.join(COVERAGE_DIR, 'coverage-final.json');
const MERGED_COVERAGE_FILE = path.join(COVERAGE_DIR, 'coverage-merged.json');

/**
 * Convert V8 coverage format to Istanbul format
 */
function convertV8ToIstanbul(v8Coverage) {
  const istanbul = {};
  
  for (const entry of v8Coverage) {
    // Extract file path from URL
    let filePath = entry.url;
    
    // Convert localhost URLs to file paths
    if (filePath.startsWith('http://localhost:')) {
      const url = new URL(filePath);
      filePath = url.pathname;
      
      // Remove leading slash and convert to src path
      if (filePath.startsWith('/src/')) {
        filePath = filePath.substring(1);
      } else if (filePath.startsWith('/')) {
        filePath = 'src' + filePath;
      }
    }
    
    // Skip non-source files
    if (!filePath.startsWith('src/') || filePath.includes('.test.') || filePath.includes('.spec.')) {
      continue;
    }
    
    // Create Istanbul format coverage object
    const statementMap = {};
    const fnMap = {};
    const branchMap = {};
    const s = {}; // statements
    const f = {}; // functions  
    const b = {}; // branches
    const l = {}; // lines
    
    // Process ranges to create coverage data
    let statementId = 0;
    let lineNum = 1;
    
    // Simple line-based coverage from ranges
    const lines = entry.text ? entry.text.split('\n') : [];
    const totalLines = Math.max(lines.length, 1);
    
    // Initialize all lines as uncovered
    for (let i = 1; i <= totalLines; i++) {
      l[i] = 0;
      s[statementId] = 0;
      statementMap[statementId] = {
        start: { line: i, column: 0 },
        end: { line: i, column: lines[i-1] ? lines[i-1].length : 0 }
      };
      statementId++;
    }
    
    // Mark covered ranges
    for (const range of entry.ranges) {
      if (range.count > 0) {
        // Estimate line coverage from character ranges
        const text = entry.text || '';
        const beforeRange = text.substring(0, range.start);
        const startLine = (beforeRange.match(/\n/g) || []).length + 1;
        const afterRange = text.substring(0, range.end);
        const endLine = (afterRange.match(/\n/g) || []).length + 1;
        
        // Mark lines as covered
        for (let line = startLine; line <= endLine && line <= totalLines; line++) {
          l[line] = Math.max(l[line], range.count);
          // Find corresponding statement
          for (let sid = 0; sid < statementId; sid++) {
            if (statementMap[sid] && statementMap[sid].start.line === line) {
              s[sid] = Math.max(s[sid], range.count);
            }
          }
        }
      }
    }
    
    istanbul[filePath] = {
      path: filePath,
      statementMap,
      fnMap,
      branchMap,
      s,
      f,
      b,
      l,
      inputSourceMap: null
    };
  }
  
  return istanbul;
}

/**
 * Merge two Istanbul coverage objects
 */
function mergeCoverage(coverage1, coverage2) {
  const merged = { ...coverage1 };
  
  for (const [filePath, fileCoverage] of Object.entries(coverage2)) {
    if (merged[filePath]) {
      // Merge existing file coverage
      const existing = merged[filePath];
      
      // Merge line coverage
      for (const [line, count] of Object.entries(fileCoverage.l)) {
        existing.l[line] = Math.max(existing.l[line] || 0, count);
      }
      
      // Merge statement coverage
      for (const [stmt, count] of Object.entries(fileCoverage.s)) {
        existing.s[stmt] = Math.max(existing.s[stmt] || 0, count);
      }
      
      // Merge function coverage
      for (const [fn, count] of Object.entries(fileCoverage.f)) {
        existing.f[fn] = Math.max(existing.f[fn] || 0, count);
      }
      
      // Merge branch coverage
      for (const [branch, counts] of Object.entries(fileCoverage.b)) {
        if (!existing.b[branch]) {
          existing.b[branch] = [...counts];
        } else {
          for (let i = 0; i < counts.length; i++) {
            existing.b[branch][i] = Math.max(existing.b[branch][i] || 0, counts[i] || 0);
          }
        }
      }
    } else {
      // Add new file coverage
      merged[filePath] = fileCoverage;
    }
  }
  
  return merged;
}

/**
 * Main function to merge coverage data
 */
async function mergeE2ECoverage() {
  console.log('🔄 Merging E2E coverage with unit test coverage...');
  
  let unitCoverage = {};
  let e2eCoverage = {};
  
  // Load unit test coverage if it exists
  if (fs.existsSync(UNIT_COVERAGE_FILE)) {
    try {
      const unitData = fs.readFileSync(UNIT_COVERAGE_FILE, 'utf8');
      unitCoverage = JSON.parse(unitData);
      console.log(`📊 Loaded unit test coverage for ${Object.keys(unitCoverage).length} files`);
    } catch (error) {
      console.warn('⚠️  Failed to load unit test coverage:', error.message);
    }
  } else {
    console.log('📊 No unit test coverage found');
  }
  
  // Load and process E2E coverage files
  if (fs.existsSync(E2E_COVERAGE_DIR)) {
    const e2eFiles = fs.readdirSync(E2E_COVERAGE_DIR).filter(f => f.endsWith('.json'));
    
    if (e2eFiles.length > 0) {
      console.log(`📊 Processing ${e2eFiles.length} E2E coverage files...`);
      
      for (const file of e2eFiles) {
        try {
          const filePath = path.join(E2E_COVERAGE_DIR, file);
          const e2eData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (e2eData.coverage && Array.isArray(e2eData.coverage)) {
            const convertedCoverage = convertV8ToIstanbul(e2eData.coverage);
            e2eCoverage = mergeCoverage(e2eCoverage, convertedCoverage);
            console.log(`  ✅ Processed ${file}: ${Object.keys(convertedCoverage).length} files`);
          }
        } catch (error) {
          console.warn(`  ⚠️  Failed to process ${file}:`, error.message);
        }
      }
    } else {
      console.log('📊 No E2E coverage files found');
    }
  } else {
    console.log('📊 No E2E coverage directory found');
  }
  
  // Merge unit and E2E coverage
  const mergedCoverage = mergeCoverage(unitCoverage, e2eCoverage);
  const totalFiles = Object.keys(mergedCoverage).length;
  const unitFiles = Object.keys(unitCoverage).length;
  const e2eFiles = Object.keys(e2eCoverage).length;
  
  console.log(`📊 Coverage summary:`);
  console.log(`  • Unit test files: ${unitFiles}`);
  console.log(`  • E2E test files: ${e2eFiles}`);
  console.log(`  • Total merged files: ${totalFiles}`);
  
  // Save merged coverage
  if (totalFiles > 0) {
    fs.writeFileSync(MERGED_COVERAGE_FILE, JSON.stringify(mergedCoverage, null, 2));
    console.log(`✅ Merged coverage saved to: ${MERGED_COVERAGE_FILE}`);
    
    // Generate merged coverage reports
    try {
      console.log('📊 Generating merged coverage reports...');
      
      // Create merged reports directory
      const mergedReportsDir = path.join(COVERAGE_DIR, 'merged');
      if (!fs.existsSync(mergedReportsDir)) {
        fs.mkdirSync(mergedReportsDir, { recursive: true });
      }
      
      // Generate reports using nyc
      execSync(`npx nyc report --temp-dir coverage --report-dir coverage/merged --reporter html --reporter json --reporter text --reporter lcov`, {
        stdio: 'inherit',
        env: { ...process.env, NYC_CONFIG_OVERRIDE: JSON.stringify({ include: ['src/**'] }) }
      });
      
      console.log('✅ Merged coverage reports generated in coverage/merged/');
    } catch (error) {
      console.warn('⚠️  Failed to generate merged reports:', error.message);
    }
  } else {
    console.log('⚠️  No coverage data to merge');
  }
}

// Run if called directly
if (require.main === module) {
  mergeE2ECoverage().catch(error => {
    console.error('❌ Failed to merge E2E coverage:', error);
    process.exit(1);
  });
}

module.exports = { mergeE2ECoverage };