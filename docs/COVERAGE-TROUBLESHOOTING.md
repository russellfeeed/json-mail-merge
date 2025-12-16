# Coverage Troubleshooting Guide

This guide helps diagnose and resolve common issues with the code coverage system.

## Quick Diagnosis

### Coverage Not Working At All

```bash
# Check if coverage is configured
npm run test:coverage

# If command fails, check package.json scripts
cat package.json | grep -A 5 -B 5 "test:coverage"

# Check Vitest configuration
cat vitest.config.ts | grep -A 20 "coverage"
```

### Coverage Reports Empty

```bash
# Check if tests are running
npm run test:unit

# Check if source files are included
ls -la src/

# Verify include/exclude patterns
node -e "console.log(require('./vitest.config.ts'))"
```

### Thresholds Failing

```bash
# Check current coverage levels
npm run test:coverage

# View detailed gap analysis
npm run test:coverage:gaps

# Check threshold configuration
grep -A 10 "thresholds" vitest.config.ts
```

## Common Issues and Solutions

### 1. Coverage Threshold Failures

#### Problem: "Coverage threshold not met"

**Symptoms**:
```
Error: Coverage threshold not met:
  Lines: 8.5% (53/621) - Expected: 10%
  Functions: 4.2% (9/213) - Expected: 5%
```

**Diagnosis**:
```bash
# Check current coverage
npm run test:coverage

# Identify specific gaps
npm run test:coverage:gaps

# View HTML report for details
open coverage/index.html
```

**Solutions**:

**Option 1: Add Tests (Recommended)**
```bash
# Identify uncovered files
npm run test:coverage:gaps

# Focus on files with 0% coverage first
# Add unit tests for core functions
```

**Option 2: Adjust Thresholds (Temporary)**
```typescript
// vitest.config.ts
thresholds: {
  global: {
    branches: 3,     // Reduced from 5
    functions: 3,    // Reduced from 5
    lines: 8,        // Reduced from 10
    statements: 8    // Reduced from 10
  }
}
```

**Option 3: Exclude Problematic Files**
```typescript
// vitest.config.ts
coverage: {
  exclude: [
    // Existing exclusions...
    'src/components/ui/**',      // Third-party components
    'src/legacy/**',             // Legacy code
    'src/generated/**'           // Generated files
  ]
}
```

### 2. Files Not Included in Coverage

#### Problem: New files not appearing in coverage reports

**Symptoms**:
- New TypeScript files not in coverage report
- Coverage percentage doesn't change after adding files
- Files missing from HTML report

**Diagnosis**:
```bash
# Check if files match include patterns
ls src/**/*.{ts,tsx} | head -10

# Verify file is not excluded
grep -r "exclude" vitest.config.ts coverage.config.js

# Check dynamic tracking
npm run test:coverage:track:status
```

**Solutions**:

**Check Include Patterns**:
```typescript
// vitest.config.ts
coverage: {
  include: [
    'src/**/*.{ts,tsx,js,jsx}',  // Make sure pattern matches your files
    'lib/**/*.ts'                // Add additional directories if needed
  ]
}
```

**Check Exclude Patterns**:
```typescript
coverage: {
  exclude: [
    '**/*.d.ts',
    '**/*.config.*',
    '**/*.test.*',
    '**/*.spec.*',
    // Make sure your file doesn't match these patterns
  ]
}
```

**Force File Inclusion**:
```typescript
coverage: {
  all: true,  // Include all files matching patterns
  includeSource: ['src/**/*.{ts,tsx,js,jsx}']
}
```

### 3. E2E Coverage Not Working

#### Problem: E2E tests not collecting coverage

**Symptoms**:
- Unit tests show coverage, E2E tests don't
- Coverage reports missing E2E data
- Merged coverage same as unit coverage

**Diagnosis**:
```bash
# Check if E2E tests run
npm run test:e2e

# Check Playwright configuration
cat playwright.config.ts | grep -A 10 -B 10 "coverage"

# Verify server is running during tests
curl http://localhost:5173
```

**Solutions**:

**Check Playwright Configuration**:
```typescript
// playwright.config.ts
use: {
  // Ensure coverage collection is enabled
  collectCoverage: true,
  coverageDir: 'coverage/e2e'
}
```

**Verify Server URLs in Coverage Config**:
```javascript
// coverage.config.js
e2e: {
  include: [
    'http://localhost:5173/src/**',  // Dev server
    'http://localhost:4173/src/**',  // Preview server
    'http://127.0.0.1:5173/src/**',  // Alternative localhost
    'http://127.0.0.1:4173/src/**'
  ]
}
```

**Check Test Execution Order**:
```bash
# Make sure server starts before tests
npm run build
npm run preview &  # Start server in background
sleep 5           # Wait for server to start
npm run test:e2e  # Run tests
```

### 4. Performance Issues

#### Problem: Tests run very slowly with coverage

**Symptoms**:
- Tests take much longer with coverage enabled
- Out of memory errors
- Browser timeouts in E2E tests

**Diagnosis**:
```bash
# Compare test times
time npm run test:unit
time npm run test:coverage

# Check memory usage
node --max-old-space-size=4096 node_modules/.bin/vitest --run --coverage
```

**Solutions**:

**Optimize Coverage Configuration**:
```typescript
// vitest.config.ts
coverage: {
  // Use faster provider for development
  provider: process.env.CI ? 'istanbul' : 'c8',
  
  // Reduce report formats in development
  reporter: process.env.CI 
    ? ['html', 'json', 'lcov', 'cobertura']
    : ['text', 'html'],
    
  // Skip full coverage in watch mode
  skipFull: !process.env.CI,
  
  // Clean between runs
  clean: true
}
```

**Reduce Concurrent Processing**:
```typescript
// vitest.config.ts
test: {
  // Limit workers in CI
  maxWorkers: process.env.CI ? 2 : undefined,
  
  coverage: {
    // Reduce memory usage
    allowExternal: false,
    
    // Process smaller chunks
    clean: true
  }
}
```

**Exclude Large Files**:
```typescript
coverage: {
  exclude: [
    // Existing exclusions...
    '**/*.bundle.js',
    '**/vendor/**',
    '**/dist/**',
    '**/build/**'
  ]
}
```

### 5. Report Generation Issues

#### Problem: Coverage reports are empty or malformed

**Symptoms**:
- HTML report shows no files
- JSON report is empty or invalid
- LCOV file missing or corrupted

**Diagnosis**:
```bash
# Check if coverage data exists
ls -la coverage/

# Verify JSON report
cat coverage/coverage-final.json | jq .

# Check HTML report structure
ls -la coverage/lcov-report/
```

**Solutions**:

**Verify Report Directory**:
```typescript
// vitest.config.ts
coverage: {
  reportsDirectory: './coverage',  // Ensure directory is correct
  clean: true                      // Clean before generating
}
```

**Check Report Formats**:
```typescript
coverage: {
  reporter: [
    'text',           // Always include for debugging
    'json',           // For programmatic access
    'html',           // For visual inspection
    'lcov'            // For external tools
  ]
}
```

**Manual Report Generation**:
```bash
# Generate reports manually
npx vitest --run --coverage --reporter=html
npx vitest --run --coverage --reporter=json
npx vitest --run --coverage --reporter=lcov
```

### 6. CI/CD Integration Issues

#### Problem: Coverage works locally but fails in CI

**Symptoms**:
- Local coverage passes, CI fails
- Different coverage percentages
- Missing coverage artifacts

**Diagnosis**:
```bash
# Check CI logs for errors
# Compare local vs CI environment
# Verify file paths and permissions
```

**Solutions**:

**Environment-Specific Configuration**:
```typescript
// vitest.config.ts
const isCI = process.env.CI === 'true';

export default defineConfig({
  test: {
    coverage: {
      // CI-specific settings
      reporter: isCI 
        ? ['html', 'json', 'lcov', 'cobertura']
        : ['text', 'html'],
        
      // Stricter thresholds in CI
      thresholds: isCI 
        ? { global: { lines: 70, functions: 60, branches: 50, statements: 70 } }
        : { global: { lines: 10, functions: 5, branches: 5, statements: 10 } }
    }
  }
});
```

**Fix File Path Issues**:
```yaml
# .github/workflows/ci.yml
- name: Run Coverage
  run: |
    npm run test:coverage
  env:
    NODE_ENV: test
    CI: true
```

**Ensure Artifacts Upload**:
```yaml
- name: Upload Coverage Reports
  uses: actions/upload-artifact@v3
  with:
    name: coverage-reports
    path: coverage/
  if: always()  # Upload even if tests fail
```

### 7. Dynamic Code Tracking Issues

#### Problem: New files not automatically included

**Symptoms**:
- New files don't appear in coverage
- Dynamic tracking not working
- File changes not detected

**Diagnosis**:
```bash
# Check tracking status
npm run test:coverage:track:status

# Verify file patterns
node -e "console.log(require('./coverage.config.js').dynamicTracking)"

# Test file detection
npm run test:coverage:track
```

**Solutions**:

**Enable Dynamic Tracking**:
```javascript
// coverage.config.js
dynamicTracking: {
  enabled: true,
  watchPatterns: ['src/**/*.{ts,tsx,js,jsx}'],
  excludePatterns: [
    '**/*.d.ts',
    '**/*.config.*',
    '**/*.test.*'
  ]
}
```

**Manual File Scan**:
```bash
# Force file scan
npm run test:coverage:track

# Run coverage after scan
npm run test:coverage
```

**Check File Permissions**:
```bash
# Ensure coverage directory is writable
chmod -R 755 coverage/

# Check tracking data file
ls -la coverage/tracking-data.json
```

## Debug Commands

### Coverage Configuration Debug

```bash
# Show current configuration
node -e "
const config = require('./vitest.config.ts');
console.log(JSON.stringify(config.test.coverage, null, 2));
"

# Test include/exclude patterns
node -e "
const glob = require('glob');
const files = glob.sync('src/**/*.{ts,tsx}');
console.log('Found files:', files.length);
files.slice(0, 10).forEach(f => console.log(f));
"
```

### Coverage Data Debug

```bash
# Check coverage data structure
cat coverage/coverage-final.json | jq 'keys'

# Show file coverage summary
cat coverage/coverage-summary.json | jq '.total'

# List covered files
cat coverage/coverage-final.json | jq 'keys[]' | head -10
```

### Test Execution Debug

```bash
# Run tests with verbose output
npx vitest --run --reporter=verbose

# Run coverage with debug info
DEBUG=vitest:coverage npx vitest --run --coverage

# Check test file discovery
npx vitest list
```

## Prevention Strategies

### 1. Regular Health Checks

```bash
# Add to package.json scripts
"health:coverage": "npm run test:coverage && npm run test:coverage:gaps"

# Run weekly
npm run health:coverage
```

### 2. Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "Coverage check failed. Please add tests or adjust thresholds."
  exit 1
fi
```

### 3. Monitoring Scripts

```javascript
// scripts/coverage-monitor.js
const fs = require('fs');
const coverageData = JSON.parse(fs.readFileSync('coverage/coverage-summary.json'));

const thresholds = {
  lines: 70,
  functions: 60,
  branches: 50,
  statements: 70
};

Object.entries(thresholds).forEach(([metric, threshold]) => {
  const actual = coverageData.total[metric].pct;
  if (actual < threshold) {
    console.warn(`⚠️  ${metric} coverage (${actual}%) below threshold (${threshold}%)`);
  }
});
```

### 4. Documentation Updates

Keep documentation current:
- Update threshold rationale when changed
- Document new exclusion patterns
- Maintain troubleshooting examples
- Record common issues and solutions

## Getting Help

### 1. Check Logs

```bash
# Vitest debug logs
DEBUG=vitest* npm run test:coverage

# Coverage provider logs
DEBUG=coverage* npm run test:coverage

# Full debug output
DEBUG=* npm run test:coverage 2>&1 | grep -i coverage
```

### 2. Validate Configuration

```bash
# Test configuration syntax
node -c vitest.config.ts

# Validate JSON files
cat coverage.config.js | node -e "console.log(JSON.stringify(eval(require('fs').readFileSync(0, 'utf8')), null, 2))"
```

### 3. Community Resources

- **Vitest Documentation**: https://vitest.dev/guide/coverage.html
- **Istanbul Documentation**: https://istanbul.js.org/
- **GitHub Issues**: Search for similar problems
- **Stack Overflow**: Tag questions with `vitest` and `code-coverage`

### 4. Create Minimal Reproduction

When reporting issues:

1. Create minimal test case
2. Include configuration files
3. Provide error messages
4. Share environment details (Node.js version, OS, etc.)

This troubleshooting guide covers the most common coverage issues and their solutions. For complex problems, start with the quick diagnosis steps and work through the relevant sections systematically.