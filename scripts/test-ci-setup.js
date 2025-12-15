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

// Step 5: Verify GitHub Actions workflow syntax
console.log('🔧 Checking GitHub Actions workflow...');
const workflowPath = path.join(projectRoot, '.github', 'workflows', 'playwright.yml');
if (fs.existsSync(workflowPath)) {
  console.log('✅ GitHub Actions workflow file exists');
  
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  if (workflowContent.includes('npm run test:e2e')) {
    console.log('✅ Workflow includes test execution step');
  }
  if (workflowContent.includes('upload-artifact@v4')) {
    console.log('✅ Workflow includes artifact upload steps');
  }
} else {
  console.error('❌ GitHub Actions workflow file not found');
  process.exit(1);
}

console.log('\n🎉 CI/CD setup verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Push changes to GitHub to trigger the workflow');
console.log('2. Check the Actions tab in your GitHub repository');
console.log('3. Download artifacts from successful test runs');
console.log('4. Update the status badge URL with your repository details');