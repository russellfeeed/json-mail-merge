#!/usr/bin/env node

/**
 * Coverage Gap Analysis Script
 * Analyzes coverage data to identify and report uncovered code sections
 * Provides detailed breakdown of coverage gaps by file, function, and branch
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_FINAL_PATH = './coverage/coverage-final.json';
const COVERAGE_SUMMARY_PATH = './coverage/coverage-summary.json';

/**
 * Loads coverage data from JSON files
 * @returns {Object} Coverage data object
 */
function loadCoverageData() {
  try {
    const finalData = fs.existsSync(COVERAGE_FINAL_PATH) 
      ? JSON.parse(fs.readFileSync(COVERAGE_FINAL_PATH, 'utf8'))
      : null;
    
    const summaryData = fs.existsSync(COVERAGE_SUMMARY_PATH)
      ? JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf8'))
      : null;
    
    return { finalData, summaryData };
  } catch (error) {
    console.error('Error loading coverage data:', error.message);
    return { finalData: null, summaryData: null };
  }
}

/**
 * Analyzes uncovered lines in a file
 * @param {Object} fileCoverage - Coverage data for a single file
 * @returns {Object} Analysis of uncovered lines
 */
function analyzeUncoveredLines(fileCoverage) {
  const uncoveredLines = [];
  const uncoveredRanges = [];
  
  if (!fileCoverage.s || !fileCoverage.statementMap) {
    return { uncoveredLines, uncoveredRanges, totalUncovered: 0 };
  }
  
  // Find uncovered statements
  Object.keys(fileCoverage.s).forEach(statementId => {
    if (fileCoverage.s[statementId] === 0) {
      const statement = fileCoverage.statementMap[statementId];
      if (statement && statement.start) {
        uncoveredLines.push({
          line: statement.start.line,
          column: statement.start.column,
          type: 'statement',
          id: statementId
        });
      }
    }
  });
  
  // Group consecutive lines into ranges
  uncoveredLines.sort((a, b) => a.line - b.line);
  
  let currentRange = null;
  uncoveredLines.forEach(item => {
    if (!currentRange || item.line > currentRange.end + 1) {
      currentRange = { start: item.line, end: item.line, count: 1 };
      uncoveredRanges.push(currentRange);
    } else {
      currentRange.end = item.line;
      currentRange.count++;
    }
  });
  
  return {
    uncoveredLines,
    uncoveredRanges,
    totalUncovered: uncoveredLines.length
  };
}

/**
 * Analyzes uncovered branches in a file
 * @param {Object} fileCoverage - Coverage data for a single file
 * @returns {Object} Analysis of uncovered branches
 */
function analyzeUncoveredBranches(fileCoverage) {
  const uncoveredBranches = [];
  
  if (!fileCoverage.b || !fileCoverage.branchMap) {
    return { uncoveredBranches, totalUncovered: 0 };
  }
  
  Object.keys(fileCoverage.b).forEach(branchId => {
    const branchHits = fileCoverage.b[branchId];
    const branchInfo = fileCoverage.branchMap[branchId];
    
    if (branchInfo && branchHits) {
      branchHits.forEach((hits, index) => {
        if (hits === 0) {
          uncoveredBranches.push({
            line: branchInfo.line || branchInfo.loc?.start?.line,
            type: branchInfo.type,
            branchId,
            branchIndex: index,
            location: branchInfo.locations?.[index]
          });
        }
      });
    }
  });
  
  return {
    uncoveredBranches,
    totalUncovered: uncoveredBranches.length
  };
}

/**
 * Analyzes uncovered functions in a file
 * @param {Object} fileCoverage - Coverage data for a single file
 * @returns {Object} Analysis of uncovered functions
 */
function analyzeUncoveredFunctions(fileCoverage) {
  const uncoveredFunctions = [];
  
  if (!fileCoverage.f || !fileCoverage.fnMap) {
    return { uncoveredFunctions, totalUncovered: 0 };
  }
  
  Object.keys(fileCoverage.f).forEach(functionId => {
    if (fileCoverage.f[functionId] === 0) {
      const functionInfo = fileCoverage.fnMap[functionId];
      if (functionInfo) {
        uncoveredFunctions.push({
          name: functionInfo.name,
          line: functionInfo.line || functionInfo.loc?.start?.line,
          functionId,
          location: functionInfo.loc
        });
      }
    }
  });
  
  return {
    uncoveredFunctions,
    totalUncovered: uncoveredFunctions.length
  };
}

/**
 * Generates a comprehensive coverage gap report
 * @param {Object} coverageData - Coverage data
 * @returns {Object} Gap analysis report
 */
function generateGapReport(coverageData) {
  const { finalData, summaryData } = coverageData;
  
  if (!finalData) {
    return { error: 'No coverage data available' };
  }
  
  const report = {
    summary: summaryData?.total || {},
    files: {},
    overallGaps: {
      totalFiles: 0,
      filesWithGaps: 0,
      totalUncoveredLines: 0,
      totalUncoveredBranches: 0,
      totalUncoveredFunctions: 0
    }
  };
  
  // Analyze each file
  Object.keys(finalData).forEach(filePath => {
    const fileCoverage = finalData[filePath];
    
    // Skip files that are not source files
    if (!filePath.includes('src/') || filePath.includes('.test.') || filePath.includes('.spec.')) {
      return;
    }
    
    const lineAnalysis = analyzeUncoveredLines(fileCoverage);
    const branchAnalysis = analyzeUncoveredBranches(fileCoverage);
    const functionAnalysis = analyzeUncoveredFunctions(fileCoverage);
    
    const hasGaps = lineAnalysis.totalUncovered > 0 || 
                   branchAnalysis.totalUncovered > 0 || 
                   functionAnalysis.totalUncovered > 0;
    
    if (hasGaps) {
      report.files[filePath] = {
        lines: lineAnalysis,
        branches: branchAnalysis,
        functions: functionAnalysis,
        summary: {
          linesCovered: Object.values(fileCoverage.s || {}).filter(hits => hits > 0).length,
          linesTotal: Object.keys(fileCoverage.s || {}).length,
          branchesCovered: Object.values(fileCoverage.b || {}).flat().filter(hits => hits > 0).length,
          branchesTotal: Object.values(fileCoverage.b || {}).flat().length,
          functionsCovered: Object.values(fileCoverage.f || {}).filter(hits => hits > 0).length,
          functionsTotal: Object.keys(fileCoverage.f || {}).length
        }
      };
      
      report.overallGaps.filesWithGaps++;
      report.overallGaps.totalUncoveredLines += lineAnalysis.totalUncovered;
      report.overallGaps.totalUncoveredBranches += branchAnalysis.totalUncovered;
      report.overallGaps.totalUncoveredFunctions += functionAnalysis.totalUncovered;
    }
    
    report.overallGaps.totalFiles++;
  });
  
  return report;
}

/**
 * Formats and displays the gap report
 * @param {Object} report - Gap analysis report
 */
function displayGapReport(report) {
  if (report.error) {
    console.error('❌ Coverage Gap Analysis Failed:', report.error);
    return;
  }
  
  console.log('📊 Coverage Gap Analysis Report');
  console.log('================================\n');
  
  // Overall summary
  console.log('📈 Overall Coverage Summary:');
  if (report.summary.lines) {
    console.log(`  Lines: ${report.summary.lines.pct}% (${report.summary.lines.covered}/${report.summary.lines.total})`);
  }
  if (report.summary.branches) {
    console.log(`  Branches: ${report.summary.branches.pct}% (${report.summary.branches.covered}/${report.summary.branches.total})`);
  }
  if (report.summary.functions) {
    console.log(`  Functions: ${report.summary.functions.pct}% (${report.summary.functions.covered}/${report.summary.functions.total})`);
  }
  if (report.summary.statements) {
    console.log(`  Statements: ${report.summary.statements.pct}% (${report.summary.statements.covered}/${report.summary.statements.total})`);
  }
  
  console.log(`\n🔍 Gap Analysis:`);
  console.log(`  Total Files Analyzed: ${report.overallGaps.totalFiles}`);
  console.log(`  Files with Coverage Gaps: ${report.overallGaps.filesWithGaps}`);
  console.log(`  Total Uncovered Lines: ${report.overallGaps.totalUncoveredLines}`);
  console.log(`  Total Uncovered Branches: ${report.overallGaps.totalUncoveredBranches}`);
  console.log(`  Total Uncovered Functions: ${report.overallGaps.totalUncoveredFunctions}`);
  
  // File-by-file breakdown
  const filesWithGaps = Object.keys(report.files);
  if (filesWithGaps.length > 0) {
    console.log(`\n📁 Files with Coverage Gaps:`);
    console.log('─'.repeat(80));
    
    filesWithGaps.forEach(filePath => {
      const fileReport = report.files[filePath];
      const relativePath = filePath.replace(process.cwd(), '').replace(/^[\/\\]/, '');
      
      console.log(`\n📄 ${relativePath}`);
      
      // Summary for this file
      const linePct = fileReport.summary.linesTotal > 0 
        ? Math.round((fileReport.summary.linesCovered / fileReport.summary.linesTotal) * 100)
        : 100;
      const branchPct = fileReport.summary.branchesTotal > 0
        ? Math.round((fileReport.summary.branchesCovered / fileReport.summary.branchesTotal) * 100)
        : 100;
      const functionPct = fileReport.summary.functionsTotal > 0
        ? Math.round((fileReport.summary.functionsCovered / fileReport.summary.functionsTotal) * 100)
        : 100;
      
      console.log(`  Coverage: Lines ${linePct}%, Branches ${branchPct}%, Functions ${functionPct}%`);
      
      // Uncovered functions
      if (fileReport.functions.totalUncovered > 0) {
        console.log(`  🔴 Uncovered Functions (${fileReport.functions.totalUncovered}):`);
        fileReport.functions.uncoveredFunctions.forEach(func => {
          console.log(`    • ${func.name || 'anonymous'} (line ${func.line})`);
        });
      }
      
      // Uncovered branches
      if (fileReport.branches.totalUncovered > 0) {
        console.log(`  🟡 Uncovered Branches (${fileReport.branches.totalUncovered}):`);
        const branchesByLine = {};
        fileReport.branches.uncoveredBranches.forEach(branch => {
          const line = branch.line || 'unknown';
          if (!branchesByLine[line]) branchesByLine[line] = 0;
          branchesByLine[line]++;
        });
        Object.keys(branchesByLine).forEach(line => {
          console.log(`    • Line ${line}: ${branchesByLine[line]} uncovered branch(es)`);
        });
      }
      
      // Uncovered line ranges
      if (fileReport.lines.uncoveredRanges.length > 0) {
        console.log(`  🔴 Uncovered Line Ranges:`);
        fileReport.lines.uncoveredRanges.forEach(range => {
          if (range.start === range.end) {
            console.log(`    • Line ${range.start}`);
          } else {
            console.log(`    • Lines ${range.start}-${range.end} (${range.count} lines)`);
          }
        });
      }
    });
  } else {
    console.log(`\n🎉 No coverage gaps found! All analyzed files have complete coverage.`);
  }
  
  console.log(`\n💡 Recommendations:`);
  if (report.overallGaps.totalUncoveredFunctions > 0) {
    console.log(`  • Add unit tests for ${report.overallGaps.totalUncoveredFunctions} uncovered functions`);
  }
  if (report.overallGaps.totalUncoveredBranches > 0) {
    console.log(`  • Add test cases for ${report.overallGaps.totalUncoveredBranches} uncovered branches (conditional logic)`);
  }
  if (report.overallGaps.totalUncoveredLines > 0) {
    console.log(`  • Add tests to cover ${report.overallGaps.totalUncoveredLines} uncovered lines`);
  }
  
  console.log(`\n📖 View detailed coverage report: open coverage/index.html`);
}

/**
 * Saves the gap report to a JSON file
 * @param {Object} report - Gap analysis report
 */
function saveGapReport(report) {
  const outputPath = './coverage/coverage-gaps.json';
  try {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n💾 Gap analysis saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error saving gap report:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🔍 Analyzing coverage gaps...\n');
  
  const coverageData = loadCoverageData();
  const report = generateGapReport(coverageData);
  
  displayGapReport(report);
  
  if (args.includes('--save')) {
    saveGapReport(report);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Gap analysis failed:', error);
    process.exit(1);
  });
}

module.exports = {
  loadCoverageData,
  generateGapReport,
  displayGapReport,
  analyzeUncoveredLines,
  analyzeUncoveredBranches,
  analyzeUncoveredFunctions
};