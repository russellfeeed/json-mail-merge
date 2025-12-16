# CI/CD Setup Documentation

This document provides detailed information about the Continuous Integration and Continuous Deployment (CI/CD) setup for the JSON-CSV Merge Tool project.

## Overview

The project uses GitHub Actions for automated testing, code coverage reporting, and quality assurance. The CI/CD pipeline ensures that all code changes are thoroughly tested and meet coverage thresholds before being merged into the main branches.

## Pipeline Architecture

The CI/CD pipeline consists of multiple workflows:

1. **Main CI Pipeline** (`.github/workflows/ci.yml`) - Comprehensive testing with coverage
2. **Standalone Playwright Tests** (`.github/workflows/playwright.yml`) - Nightly E2E testing

### Main CI Pipeline Jobs

1. **Unit Tests & Coverage** - Runs unit tests with coverage collection and threshold enforcement
2. **E2E Tests & Coverage** - Executes Playwright tests with coverage tracking
3. **Coverage Merge** - Combines coverage data from all test types and generates reports
4. **Build Validation** - Validates code quality and build process
5. **CI Status Check** - Final status validation and failure reporting

## GitHub Actions Workflows

### Main CI Workflow
**File**: `.github/workflows/ci.yml`

**Trigger Events**:
- **Push events** to `main` and `develop` branches
- **Pull request events** targeting `main` and `develop` branches

**Coverage Integration Features**:
- Automatic coverage collection from unit and E2E tests
- Coverage threshold enforcement (build fails if thresholds not met)
- Multi-format report generation (HTML, JSON, LCOV, Cobertura)
- Coverage artifacts uploaded for 90 days retention
- PR comments with coverage summaries and threshold status
- Integration with Codecov (optional)

### Standalone Playwright Workflow
**File**: `.github/workflows/playwright.yml`

**Trigger Events**:
- **Manual dispatch** (workflow_dispatch)
- **Nightly schedule** (2 AM UTC daily)

### Main CI Workflow Steps

#### Unit Tests & Coverage Job
1. **Checkout Code**: Fetches repository with full history for coverage comparison
2. **Setup Node.js**: Configures Node.js LTS with npm caching
3. **Install Dependencies**: Clean dependency installation
4. **Run Coverage Tests**: Executes `npm run test:coverage` with threshold enforcement
5. **Generate Coverage Summary**: Creates markdown summary for GitHub
6. **Upload Coverage Reports**: Saves coverage artifacts (HTML, JSON, LCOV)
7. **Upload to Codecov**: Optional integration with external coverage service

#### E2E Tests & Coverage Job
1. **Checkout Code**: Fetches repository code
2. **Setup Node.js**: Configures environment
3. **Install Dependencies**: Clean installation
4. **Install Playwright**: Downloads browser binaries
5. **Build Application**: Creates production build
6. **Run E2E Tests**: Executes Playwright tests with coverage
7. **Upload Artifacts**: Saves test reports and results

#### Coverage Merge Job
1. **Download Artifacts**: Retrieves coverage data from previous jobs
2. **Merge Coverage**: Combines unit and E2E coverage data
3. **Enhance Reports**: Applies visual enhancements and gap analysis
4. **Generate Final Reports**: Creates comprehensive coverage documentation
5. **Comment on PR**: Posts coverage summary to pull request

### Test Execution Environment

- **Operating System**: Ubuntu Latest
- **Node.js Version**: LTS (Long Term Support)
- **Browsers**: Chromium only (optimized for CI speed)
- **Timeout**: 60 minutes maximum execution time
- **Parallelization**: Tests run in parallel for faster execution

## Artifacts and Reports

### Coverage Reports
- **Artifact Name**: `final-coverage-reports`
- **Path**: `coverage/`
- **Contents**: 
  - HTML reports for interactive browsing
  - JSON reports for programmatic analysis
  - LCOV reports for external tool integration
  - Cobertura XML for additional compatibility
  - Enhanced reports with visual improvements
- **Retention**: 90 days
- **Access**: Download from GitHub Actions run page

### Playwright Reports
- **Artifact Name**: `playwright-report`
- **Path**: `playwright-report/`
- **Contents**: HTML test report with detailed results
- **Retention**: 30 days
- **Access**: Download from GitHub Actions run page

### E2E Test Results
- **Artifact Name**: `e2e-test-results`
- **Path**: `test-results/`
- **Contents**: Screenshots, traces, and raw test data
- **Retention**: 30 days
- **Usage**: Debugging failed tests and performance analysis

### Build Artifacts
- **Artifact Name**: `build-artifacts`
- **Path**: `dist/`
- **Contents**: Production build files
- **Retention**: 7 days
- **Usage**: Deployment and distribution

## Status Badges

The README can include status badges that show the current state of the CI pipeline:

### Main CI Pipeline Badge
```markdown
[![CI Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml)
```

### Coverage Badge (with Codecov)
```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO_NAME/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO_NAME)
```

### Playwright Tests Badge
```markdown
[![Playwright Tests](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/playwright.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/playwright.yml)
```

**Note**: Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub repository details.

## Local Development Integration

### Pre-commit Testing
Developers should run tests and coverage locally before pushing:

```bash
# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run all tests with coverage (simulates CI)
npm run test:coverage:all

# Test CI setup locally
npm run test:ci-setup
```

### Coverage Thresholds
The project enforces the following coverage thresholds:

- **Global Thresholds**:
  - Lines: 10%
  - Functions: 5%
  - Branches: 5%
  - Statements: 10%

- **Library Code** (`src/lib/**/*.ts`):
  - Lines: 25%
  - Functions: 15%
  - Branches: 20%
  - Statements: 25%

**Note**: Builds will fail if these thresholds are not met.

### Branch Protection
Set up branch protection rules in GitHub to enforce quality gates:

1. Navigate to **Settings > Branches** in your repository
2. Add a rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select the following required checks:
   - "Unit Tests & Coverage"
   - "Build Validation"
   - "CI Status Check"
5. Optionally require "E2E Tests & Coverage" (may be flaky in some environments)

## Troubleshooting

### Common Issues

#### Coverage Threshold Failures
- **Cause**: New code without sufficient test coverage
- **Solution**: Add unit tests or adjust thresholds in `vitest.config.ts`
- **Debug**: Check coverage reports to identify uncovered code

#### Tests Failing with ERR_CONNECTION_REFUSED
- **Cause**: Port mismatch between Vite config, Playwright config, and test files
- **Solution**: Ensure all configurations use consistent ports (5173 for dev, 4173 for preview)

#### Coverage Collection Failures
- **Cause**: Instrumentation issues or configuration problems
- **Solution**: Check Vitest configuration and ensure source files are properly included
- **Debug**: Run `npm run test:coverage` locally to reproduce

#### Tests Failing in CI but Passing Locally
- **Cause**: Environment differences or timing issues
- **Solution**: Check browser versions, screen resolution, or add explicit waits

#### Timeout Issues
- **Cause**: Slow network or heavy test load
- **Solution**: Increase timeout in `playwright.config.ts` or optimize tests

#### Artifact Upload Failures
- **Cause**: Large file sizes, network issues, or empty directories
- **Solution**: Check artifact sizes, GitHub storage limits, and ensure tests generate output files
- **Note**: The workflow includes `if-no-files-found: ignore` to gracefully handle cases where directories might be empty

### Debugging Failed Tests and Coverage

#### Coverage Issues
1. **Download Coverage Artifacts**: Get coverage reports from the failed GitHub Actions run
2. **View HTML Coverage Report**: Open `coverage/index.html` in a browser
3. **Analyze Coverage Gaps**: Review uncovered lines and branches
4. **Check Threshold Details**: Look at coverage summary for specific metrics

#### Test Failures
1. **Download Test Artifacts**: Get test results from the failed GitHub Actions run
2. **View HTML Report**: Open `playwright-report/index.html` in a browser
3. **Analyze Traces**: Use Playwright trace viewer for step-by-step debugging
4. **Check Screenshots**: Review failure screenshots for visual issues

#### PR Coverage Comments
- Coverage summaries are automatically posted to pull requests
- Shows current coverage percentages and threshold status
- Includes links to detailed reports in CI artifacts

## Configuration Customization

### Modifying Test Browsers
The configuration automatically uses different browsers for CI vs local development:

```typescript
projects: process.env.CI ? [
  // CI: Only Chromium for faster execution
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
] : [
  // Only Chromium for all environments
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
]
```

### Adjusting Workflow Triggers
Modify `.github/workflows/playwright.yml` to change when tests run:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]  # Add feature branches
  pull_request:
    branches: [ main ]  # Only test PRs to main
```

### Environment Variables
Add secrets or environment variables in GitHub repository settings:

1. Go to **Settings > Secrets and variables > Actions**
2. Add repository secrets for sensitive data
3. Reference in workflow: `${{ secrets.SECRET_NAME }}`

## Performance Optimization

### Parallel Execution
Tests run in parallel by default. Adjust in `playwright.config.ts`:

```typescript
workers: process.env.CI ? 2 : undefined,  // Limit workers in CI
```

### Test Sharding
For large test suites, consider sharding:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - name: Run Playwright tests
    run: npx playwright test --shard=${{ matrix.shard }}/4
```

## Monitoring and Alerts

### GitHub Notifications
- Failed workflow runs trigger email notifications to repository owners
- Configure notification preferences in GitHub settings

### Integration with External Services
Consider integrating with:
- **Slack**: For team notifications on test failures
- **Discord**: For development team alerts
- **Email**: For stakeholder updates

## Security Considerations

### Dependency Updates
- Playwright and other dependencies are automatically updated
- Review security advisories regularly
- Use `npm audit` to check for vulnerabilities

### Secrets Management
- Never commit sensitive data to the repository
- Use GitHub Secrets for API keys and credentials
- Rotate secrets regularly

## Coverage Integration Details

### Coverage Collection Process
1. **Unit Tests**: Vitest collects coverage during test execution
2. **E2E Tests**: Playwright instruments the running application
3. **Merging**: Custom scripts combine coverage data from all sources
4. **Enhancement**: Visual improvements and gap analysis applied
5. **Reporting**: Multiple formats generated for different use cases

### Coverage Thresholds Enforcement
- Thresholds are enforced at the Vitest level
- Builds fail immediately if thresholds are not met
- Different thresholds can be set for different file patterns
- Global and per-file thresholds are supported

### External Integrations
- **Codecov**: Optional integration for enhanced reporting and PR comments
- **LCOV**: Standard format for integration with other tools
- **Cobertura**: XML format for additional tool compatibility

## Future Enhancements

### Potential Improvements
1. **Visual Regression Testing**: Add screenshot comparison tests
2. **Performance Testing**: Monitor application performance metrics
3. **Cross-Platform Testing**: Add Windows and macOS runners
4. **Deployment Pipeline**: Automate deployment after successful tests
5. **Coverage Trends**: Track coverage changes over time
6. **Mutation Testing**: Add mutation testing for test quality validation

### Monitoring Metrics
Consider tracking:
- Test execution time trends
- Coverage percentage trends
- Flaky test identification
- Browser-specific failure rates
- Test suite growth over time
- Coverage gap patterns

---

For questions or issues with the CI/CD setup, please create an issue in the repository or contact the development team.