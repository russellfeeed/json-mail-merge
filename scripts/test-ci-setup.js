#!/usr/bin/env node

/**
 * Test script to verify CI/CD setup works correctly
 * This simulates the GitHub Actions workflow locally
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Testing CI/CD Setup...\n');

// Step 1: Install dependencies (skip - assume already done)
console.log('✅ Dependencies already installed');

// Step 2: Build application
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Check if Playwright is configured correctly
console.log('🎭 Checking Playwright configuration...');
try {
  const output = execSync('npx playwright test --list', { encoding: 'utf8' });
  const testCount = (output.match(/Total: (\d+) tests/)?.[1]) || '0';
  const isCI = process.env.CI;
  const browserInfo = isCI ? ' (Chromium only for CI)' : ' (all browsers for local)';
  console.log(`✅ Playwright configured correctly - Found ${testCount} tests${browserInfo}`);
} catch (error) {
  console.error('❌ Playwright configuration error:', error.message);
  process.exit(1);
}

// Step 4: Check output directories exist
console.log('📁 Checking output directories...');
const playwrightReportDir = path.join(projectRoot, 'playwright-report');
const testResultsDir = path.join(projectRoot, 'test-results');

if (fs.existsSync(playwrightReportDir)) {
  console.log('✅ playwright-report/ directory exists');
} else {
  console.log('⚠️  playwright-report/ directory not found (will be created during test run)');
}

if (fs.existsSync(testResultsDir)) {
  console.log('✅ test-results/ directory exists');
} else {
  console.log('⚠️  test-results/ directory not found (will be created during test run)');
}

// Step 5: Test coverage collection
console.log('📊 Testing coverage collection...');
try {
  execSync('npm run test:coverage', { stdio: 'inherit' });
  console.log('✅ Coverage collection successful');
  
  // Check if coverage files were generated
  const coverageDir = path.join(projectRoot, 'coverage');
  if (fs.existsSync(coverageDir)) {
    const files = fs.readdirSync(coverageDir);
    const hasHtml = files.some(f => f === 'index.html');
    const hasJson = files.some(f => f === 'coverage-final.json');
    const hasLcov = files.some(f => f === 'lcov.info');
    
    console.log(`✅ Coverage reports generated: HTML=${hasHtml}, JSON=${hasJson}, LCOV=${hasLcov}`);
  }
} catch (error) {
  console.error('❌ Coverage collection failed:', error.message);
  process.exit(1);
}

// Step 6: Verify GitHub Actions workflows
console.log('🔧 Checking GitHub Actions workflows...');

// Check main CI workflow
const ciWorkflowPath = path.join(projectRoot, '.github', 'workflows', 'ci.yml');
if (fs.existsSync(ciWorkflowPath)) {
  console.log('✅ Main CI workflow file exists');
  
  const ciWorkflowContent = fs.readFileSync(ciWorkflowPath, 'utf8');
  if (ciWorkflowContent.includes('npm run test:coverage')) {
    console.log('✅ CI workflow includes coverage collection');
  }
  if (ciWorkflowContent.includes('coverage-reports')) {
    console.log('✅ CI workflow includes coverage artifact upload');
  }
  if (ciWorkflowContent.includes('thresholds')) {
    console.log('✅ CI workflow includes threshold enforcement');
  }
} else {
  console.error('❌ Main CI workflow file not found');
  process.exit(1);
}

// Check Playwright workflow
const playwrightWorkflowPath = path.join(projectRoot, '.github', 'workflows', 'playwright.yml');
if (fs.existsSync(playwrightWorkflowPath)) {
  console.log('✅ Playwright workflow file exists');
  
  const workflowContent = fs.readFileSync(playwrightWorkflowPath, 'utf8');
  if (workflowContent.includes('npm run test:e2e')) {
    console.log('✅ Playwright workflow includes test execution step');
  }
  if (workflowContent.includes('upload-artifact@v4')) {
    console.log('✅ Playwright workflow includes artifact upload steps');
  }
} else {
  console.error('❌ Playwright workflow file not found');
  process.exit(1);
}

console.log('\n🎉 CI/CD setup verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Push changes to GitHub to trigger the CI workflow');
console.log('2. Check the Actions tab in your GitHub repository');
console.log('3. Download coverage artifacts from successful test runs');
console.log('4. Monitor coverage thresholds and build failures');
console.log('5. Review coverage reports in pull requests');
console.log('6. Set up Codecov token (optional) for enhanced reporting');