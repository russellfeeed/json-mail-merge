#!/usr/bin/env node

/**
 * Coverage Report Enhancement Script
 * Automatically enhances generated HTML coverage reports with improved visual indicators
 * for uncovered code highlighting, branch coverage visualization, and function coverage reporting
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const COVERAGE_DIR = './coverage';
const ENHANCEMENT_CSS_PATH = './coverage-enhancements.css';

/**
 * Reads the enhancement CSS file
 * @returns {string} CSS content
 */
function readEnhancementCSS() {
  try {
    return fs.readFileSync(ENHANCEMENT_CSS_PATH, 'utf8');
  } catch (error) {
    console.error('Error reading enhancement CSS:', error.message);
    return '';
  }
}

/**
 * Creates a coverage legend HTML snippet
 * @returns {string} HTML content for the legend
 */
function createCoverageLegend() {
  return `
    <div class="coverage-legend">
      <h3>Coverage Legend</h3>
      <div class="coverage-legend-item legend-covered">Covered Code</div>
      <div class="coverage-legend-item legend-uncovered-line">Uncovered Lines</div>
      <div class="coverage-legend-item legend-uncovered-statement">Uncovered Statements</div>
      <div class="coverage-legend-item legend-uncovered-branch">Uncovered Branches</div>
    </div>
  `;
}

/**
 * Enhances a single HTML file with improved coverage styling
 * @param {string} filePath - Path to the HTML file
 */
function enhanceHTMLFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already enhanced
    if (content.includes('Enhanced Coverage Report Styling')) {
      console.log(`Skipping already enhanced file: ${filePath}`);
      return;
    }
    
    const enhancementCSS = readEnhancementCSS();
    if (!enhancementCSS) {
      console.warn(`No enhancement CSS found, skipping: ${filePath}`);
      return;
    }
    
    // Inject enhanced CSS
    const cssInjection = `
    <style type="text/css">
    ${enhancementCSS}
    </style>
    `;
    
    // Insert CSS before closing head tag
    content = content.replace('</head>', `${cssInjection}</head>`);
    
    // Add coverage legend after the main coverage summary (only for file-specific reports)
    if (filePath.includes('.html') && !filePath.endsWith('index.html')) {
      const legend = createCoverageLegend();
      content = content.replace(
        /<div class='status-line[^>]*><\/div>/,
        `$&${legend}`
      );
    }
    
    // Enhance navigation instructions
    const enhancedInstructions = `
      <p class="quiet">
        Press <em>n</em> or <em>j</em> to go to the next uncovered block, <em>b</em>, <em>p</em> or <em>k</em> for the previous block.
        <br><strong>Visual Indicators:</strong> 
        <span style="background: #ffcdd2; padding: 2px 4px; border-radius: 3px; margin: 0 2px;">Red = Uncovered</span>
        <span style="background: #fff3e0; border: 1px solid #ff9800; padding: 2px 4px; border-radius: 3px; margin: 0 2px;">Orange = Uncovered Branch</span>
        <span style="background: #e8f5e8; padding: 2px 4px; border-radius: 3px; margin: 0 2px;">Green = Covered</span>
      </p>
    `;
    
    content = content.replace(
      /<p class="quiet">\s*Press <em>n<\/em>.*?<\/p>/s,
      enhancedInstructions
    );
    
    // Write enhanced content back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Enhanced coverage report: ${filePath}`);
    
  } catch (error) {
    console.error(`Error enhancing file ${filePath}:`, error.message);
  }
}

/**
 * Finds all HTML files in the coverage directory
 * @returns {Promise<string[]>} Array of HTML file paths
 */
async function findCoverageHTMLFiles() {
  try {
    const pattern = path.join(COVERAGE_DIR, '**/*.html').replace(/\\/g, '/');
    const files = await glob(pattern);
    return files.filter(file => !file.includes('node_modules'));
  } catch (error) {
    console.error('Error finding HTML files:', error.message);
    return [];
  }
}

/**
 * Enhances all coverage HTML reports
 */
async function enhanceAllReports() {
  console.log('🎨 Enhancing coverage reports with improved visual indicators...');
  
  // Check if coverage directory exists
  if (!fs.existsSync(COVERAGE_DIR)) {
    console.warn(`Coverage directory not found: ${COVERAGE_DIR}`);
    console.log('Run coverage tests first: npm run test:coverage');
    return;
  }
  
  // Check if enhancement CSS exists
  if (!fs.existsSync(ENHANCEMENT_CSS_PATH)) {
    console.error(`Enhancement CSS not found: ${ENHANCEMENT_CSS_PATH}`);
    return;
  }
  
  const htmlFiles = await findCoverageHTMLFiles();
  
  if (htmlFiles.length === 0) {
    console.warn('No HTML coverage reports found');
    return;
  }
  
  console.log(`Found ${htmlFiles.length} HTML coverage reports to enhance`);
  
  // Enhance each HTML file
  for (const file of htmlFiles) {
    enhanceHTMLFile(file);
  }
  
  console.log('✅ Coverage report enhancement complete!');
  console.log(`Enhanced visual indicators for:`);
  console.log(`  • Uncovered lines (red highlighting with left border)`);
  console.log(`  • Uncovered statements (red background with bold text)`);
  console.log(`  • Uncovered branches (orange border with warning styling)`);
  console.log(`  • Function coverage (integrated with existing indicators)`);
  console.log(`  • File-by-file breakdown (enhanced with status icons)`);
  console.log(`\nOpen coverage/index.html to view enhanced reports`);
}

/**
 * Watches for changes in coverage directory and auto-enhances new reports
 */
function watchCoverageDirectory() {
  if (!fs.existsSync(COVERAGE_DIR)) {
    console.log('Coverage directory not found, creating watcher for when it appears...');
  }
  
  console.log('👀 Watching for coverage report changes...');
  
  // Simple polling approach since fs.watch can be unreliable across platforms
  let lastEnhancementTime = 0;
  
  setInterval(async () => {
    if (!fs.existsSync(COVERAGE_DIR)) return;
    
    try {
      const stats = fs.statSync(COVERAGE_DIR);
      if (stats.mtime.getTime() > lastEnhancementTime) {
        console.log('Coverage directory updated, enhancing reports...');
        await enhanceAllReports();
        lastEnhancementTime = Date.now();
      }
    } catch (error) {
      // Directory might be in the process of being created/updated
    }
  }, 2000);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--watch')) {
    watchCoverageDirectory();
  } else {
    await enhanceAllReports();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Enhancement script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  enhanceAllReports,
  enhanceHTMLFile,
  watchCoverageDirectory
};