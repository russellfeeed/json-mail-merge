# Coverage Workflow Integration Guide

This guide shows how to integrate code coverage into your development workflow, from local development to CI/CD pipelines.

## Overview

The coverage system integrates seamlessly into various development workflows:

- **Local Development**: Real-time coverage feedback during coding
- **Code Reviews**: Coverage impact analysis in pull requests
- **CI/CD Pipelines**: Automated coverage enforcement and reporting
- **Release Process**: Coverage quality gates and trend tracking

## Local Development Workflow

### 1. Daily Development Cycle

#### Morning Setup
```bash
# Start development with coverage baseline
npm run test:coverage:track:status

# Check current coverage state
npm run test:coverage
```

#### During Development
```bash
# Run tests with coverage after changes
npm run test:coverage

# Quick unit test feedback (faster)
npm run test:unit:watch

# Analyze coverage gaps when needed
npm run test:coverage:gaps
```

#### Before Committing
```bash
# Full coverage check
npm run test:coverage:all

# Ensure all tests pass
npm run test:unit && npm run test:e2e
```

### 2. IDE Integration

#### VS Code Setup

**Install Extensions**:
- Coverage Gutters
- Test Explorer UI
- Vitest Extension

**Settings Configuration** (`.vscode/settings.json`):
```json
{
  "coverage-gutters.coverageFileNames": [
    "lcov.info",
    "coverage-final.json"
  ],
  "coverage-gutters.coverageBaseDir": "coverage",
  "coverage-gutters.showGutterCoverage": true,
  "coverage-gutters.showLineCoverage": true,
  "coverage-gutters.showRulerCoverage": true,
  "coverage-gutters.highlightdark": "rgba(255, 0, 0, 0.2)",
  "coverage-gutters.highlightlight": "rgba(255, 0, 0, 0.2)",
  "vitest.enable": true,
  "vitest.commandLine": "npm run test:unit"
}
```

**Keyboard Shortcuts** (`.vscode/keybindings.json`):
```json
[
  {
    "key": "ctrl+shift+c",
    "command": "coverage-gutters.displayCoverage"
  },
  {
    "key": "ctrl+shift+r",
    "command": "coverage-gutters.removeCoverage"
  },
  {
    "key": "ctrl+shift+t",
    "command": "vitest.runAll"
  }
]
```

#### Workflow in VS Code
1. Write code
2. Press `Ctrl+Shift+T` to run tests
3. Press `Ctrl+Shift+C` to display coverage
4. See red/green gutters indicating coverage
5. Focus on red (uncovered) lines

### 3. Git Integration

#### Pre-commit Hooks

**Setup Husky** (if not already configured):
```bash
npm install --save-dev husky
npx husky install
```

**Coverage Pre-commit Hook** (`.husky/pre-commit`):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🧪 Running coverage check..."
npm run test:coverage

if [ $? -ne 0 ]; then
  echo "❌ Coverage check failed!"
  echo "💡 Run 'npm run test:coverage:gaps' to see what needs testing"
  exit 1
fi

echo "✅ Coverage check passed!"
```

**Lint-staged Integration** (`.lintstagedrc.json`):
```json
{
  "src/**/*.{ts,tsx}": [
    "eslint --fix",
    "npm run test:coverage -- --changed"
  ]
}
```

#### Commit Message Templates

**Coverage-aware commits** (`.gitmessage`):
```
# Title: Brief description of changes

# Body: Detailed explanation
# - What was changed
# - Why it was changed
# - Coverage impact (if significant)

# Coverage checklist:
# [ ] Added tests for new functionality
# [ ] Coverage thresholds still met
# [ ] No significant coverage regression

# Type: feat|fix|docs|style|refactor|test|chore
```

## Code Review Workflow

### 1. Pull Request Coverage Analysis

#### Automated PR Comments

The CI system automatically comments on PRs with coverage information:

```markdown
## 📊 Coverage Report

### Overall Coverage
- **Lines**: 72.5% (+2.3% from base)
- **Functions**: 68.1% (+1.8% from base)
- **Branches**: 65.4% (+0.9% from base)
- **Statements**: 71.8% (+2.1% from base)

### Changed Files
| File | Lines | Functions | Branches | Statements |
|------|-------|-----------|----------|------------|
| `src/lib/newFeature.ts` | 95.2% | 100% | 87.5% | 94.7% |
| `src/components/NewComponent.tsx` | 78.3% | 85.0% | 70.0% | 80.1% |

### 🎯 Threshold Status
✅ All coverage thresholds met!

### 📈 Coverage Trend
Coverage has improved by 2.1% overall. Great work! 🎉

[View Full Coverage Report](https://github.com/user/repo/actions/runs/123456789)
```

#### Manual Review Checklist

**For Reviewers**:
- [ ] Check coverage impact in PR comment
- [ ] Verify new code has appropriate tests
- [ ] Review coverage gaps in changed files
- [ ] Ensure critical paths are covered

**For Authors**:
- [ ] Add tests for new functionality
- [ ] Maintain or improve coverage percentages
- [ ] Document any intentional coverage exclusions
- [ ] Address reviewer feedback on test coverage

### 2. Coverage-Focused Review Process

#### Review Guidelines

**High Priority** (require tests):
- New business logic functions
- API endpoints and data processing
- Error handling and edge cases
- Security-related code

**Medium Priority** (tests recommended):
- UI component logic
- Utility functions
- Configuration changes

**Low Priority** (tests optional):
- Type definitions
- Constants and enums
- Simple getters/setters
- Styling and layout

#### Review Commands

```bash
# Check coverage for specific files
npm run test:coverage -- src/lib/newFeature.ts

# Compare coverage with base branch
git checkout main
npm run test:coverage > /tmp/main-coverage.txt
git checkout feature-branch
npm run test:coverage > /tmp/feature-coverage.txt
diff /tmp/main-coverage.txt /tmp/feature-coverage.txt

# Analyze coverage gaps in changed files
npm run test:coverage:gaps -- --changed-only
```

## CI/CD Pipeline Integration

### 1. GitHub Actions Workflow

#### Complete CI Pipeline (`.github/workflows/ci.yml`):

```yaml
name: CI Pipeline with Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for coverage comparison
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Unit Tests with Coverage
        run: npm run test:coverage
        
      - name: Generate Coverage Summary
        run: |
          echo "## 📊 Coverage Summary" >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          cat coverage/coverage-summary.json | jq -r '
            "Lines: " + (.total.lines.pct | tostring) + "%\n" +
            "Functions: " + (.total.functions.pct | tostring) + "%\n" +
            "Branches: " + (.total.branches.pct | tostring) + "%\n" +
            "Statements: " + (.total.statements.pct | tostring) + "%"
          ' >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          
      - name: Upload Coverage Reports
        uses: actions/upload-artifact@v3
        with:
          name: unit-coverage-reports
          path: coverage/
          retention-days: 90

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
        
      - name: Build Application
        run: npm run build
        
      - name: Run E2E Tests with Coverage
        run: npm run test:e2e:coverage
        
      - name: Upload E2E Coverage
        uses: actions/upload-artifact@v3
        with:
          name: e2e-coverage-reports
          path: coverage/e2e/
          retention-days: 30

  coverage-merge:
    needs: [unit-tests, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Download Unit Coverage
        uses: actions/download-artifact@v3
        with:
          name: unit-coverage-reports
          path: coverage/
          
      - name: Download E2E Coverage
        uses: actions/download-artifact@v3
        with:
          name: e2e-coverage-reports
          path: coverage/e2e/
          
      - name: Merge Coverage Reports
        run: npm run test:coverage:merge
        
      - name: Enhance Coverage Reports
        run: npm run test:coverage:enhance
        
      - name: Generate Gap Analysis
        run: npm run test:coverage:gaps:save
        
      - name: Upload Final Coverage Reports
        uses: actions/upload-artifact@v3
        with:
          name: final-coverage-reports
          path: coverage/
          retention-days: 90
          
      - name: Comment PR with Coverage
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json'));
            
            const comment = `## 📊 Coverage Report
            
            ### Overall Coverage
            - **Lines**: ${coverage.total.lines.pct}%
            - **Functions**: ${coverage.total.functions.pct}%
            - **Branches**: ${coverage.total.branches.pct}%
            - **Statements**: ${coverage.total.statements.pct}%
            
            ### 🎯 Threshold Status
            ${coverage.total.lines.pct >= 70 ? '✅' : '❌'} Lines threshold (70%)
            ${coverage.total.functions.pct >= 60 ? '✅' : '❌'} Functions threshold (60%)
            ${coverage.total.branches.pct >= 50 ? '✅' : '❌'} Branches threshold (50%)
            ${coverage.total.statements.pct >= 70 ? '✅' : '❌'} Statements threshold (70%)
            
            [View Full Report](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

  quality-gate:
    needs: [coverage-merge]
    runs-on: ubuntu-latest
    steps:
      - name: Download Coverage Reports
        uses: actions/download-artifact@v3
        with:
          name: final-coverage-reports
          path: coverage/
          
      - name: Check Quality Gate
        run: |
          LINES=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          FUNCTIONS=$(cat coverage/coverage-summary.json | jq '.total.functions.pct')
          BRANCHES=$(cat coverage/coverage-summary.json | jq '.total.branches.pct')
          STATEMENTS=$(cat coverage/coverage-summary.json | jq '.total.statements.pct')
          
          echo "Coverage: Lines=$LINES%, Functions=$FUNCTIONS%, Branches=$BRANCHES%, Statements=$STATEMENTS%"
          
          if (( $(echo "$LINES < 70" | bc -l) )); then
            echo "❌ Lines coverage ($LINES%) below threshold (70%)"
            exit 1
          fi
          
          if (( $(echo "$FUNCTIONS < 60" | bc -l) )); then
            echo "❌ Functions coverage ($FUNCTIONS%) below threshold (60%)"
            exit 1
          fi
          
          if (( $(echo "$BRANCHES < 50" | bc -l) )); then
            echo "❌ Branches coverage ($BRANCHES%) below threshold (50%)"
            exit 1
          fi
          
          if (( $(echo "$STATEMENTS < 70" | bc -l) )); then
            echo "❌ Statements coverage ($STATEMENTS%) below threshold (70%)"
            exit 1
          fi
          
          echo "✅ All coverage thresholds met!"
```

### 2. Branch Protection Rules

#### GitHub Branch Protection

**Settings > Branches > Add Rule**:
- Branch name pattern: `main`
- Require status checks to pass before merging: ✅
- Required status checks:
  - `unit-tests`
  - `e2e-tests`
  - `coverage-merge`
  - `quality-gate`
- Require branches to be up to date before merging: ✅
- Require pull request reviews before merging: ✅

### 3. External Service Integration

#### Codecov Integration

```yaml
# Add to CI workflow
- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: true
```

#### SonarQube Integration

```yaml
- name: SonarQube Scan
  uses: sonarqube-quality-gate-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  with:
    scanMetadataReportFile: coverage/sonar-report.json
```

## Release Workflow Integration

### 1. Pre-release Coverage Validation

```bash
# Release preparation script
#!/bin/bash

echo "🚀 Preparing release..."

# Run full test suite with coverage
npm run test:coverage:all

# Check coverage thresholds
COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
if (( $(echo "$COVERAGE < 80" | bc -l) )); then
  echo "❌ Coverage ($COVERAGE%) below release threshold (80%)"
  exit 1
fi

# Generate coverage trend report
npm run test:coverage:track:status

echo "✅ Coverage validation passed!"
```

### 2. Release Notes with Coverage

```markdown
# Release v2.1.0

## 📊 Coverage Metrics
- **Lines**: 82.3% (+3.1% from v2.0.0)
- **Functions**: 78.9% (+2.4% from v2.0.0)
- **Branches**: 74.2% (+1.8% from v2.0.0)
- **Statements**: 81.7% (+2.9% from v2.0.0)

## 🎯 Quality Improvements
- Added comprehensive test coverage for payment processing
- Improved error handling test scenarios
- Enhanced E2E test coverage for user workflows

## 📈 Coverage Highlights
- All new features have >90% test coverage
- Critical business logic maintains >95% coverage
- Overall project coverage improved by 2.6%
```

## Team Workflow Guidelines

### 1. Coverage Responsibilities

#### Developers
- Write tests for new functionality
- Maintain coverage thresholds
- Review coverage impact of changes
- Address coverage gaps identified in reviews

#### Tech Leads
- Set and adjust coverage thresholds
- Review coverage trends
- Ensure team follows coverage practices
- Make decisions on coverage exclusions

#### QA Engineers
- Validate E2E coverage collection
- Review coverage gaps for testing priorities
- Ensure critical paths are covered
- Collaborate on test strategy

### 2. Coverage Meetings

#### Weekly Coverage Review
- Review coverage trends
- Identify files with low coverage
- Plan coverage improvement tasks
- Discuss threshold adjustments

#### Sprint Planning Integration
- Include coverage improvement tasks
- Estimate effort for adding tests
- Prioritize coverage gaps
- Set coverage goals for sprint

### 3. Coverage Metrics Dashboard

```javascript
// scripts/coverage-dashboard.js
const fs = require('fs');
const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json'));

console.log(`
📊 Coverage Dashboard
====================

Overall: ${coverage.total.lines.pct}% lines
Trend: ${getTrend()} (${getTrendDirection()})

Top Files by Coverage:
${getTopFiles().map(f => `✅ ${f.name}: ${f.coverage}%`).join('\n')}

Files Needing Attention:
${getLowCoverageFiles().map(f => `⚠️  ${f.name}: ${f.coverage}%`).join('\n')}

Coverage Goals:
${getCoverageGoals().map(g => `${g.met ? '✅' : '❌'} ${g.name}: ${g.current}% / ${g.target}%`).join('\n')}
`);
```

This comprehensive workflow integration guide ensures coverage becomes a natural part of your development process, from individual coding sessions to team collaboration and release management.