# CI/CD Setup Documentation

This document provides detailed information about the Continuous Integration and Continuous Deployment (CI/CD) setup for the JSON-CSV Merge Tool project.

## Overview

The project uses GitHub Actions for automated testing and quality assurance. The CI/CD pipeline ensures that all code changes are thoroughly tested before being merged into the main branches.

## GitHub Actions Workflow

### Workflow File Location
`.github/workflows/playwright.yml`

### Trigger Events
The workflow is triggered on:
- **Push events** to `main` and `develop` branches
- **Pull request events** targeting `main` and `develop` branches

### Workflow Steps

1. **Checkout Code**: Uses `actions/checkout@v4` to fetch the repository code
2. **Setup Node.js**: Configures Node.js LTS version with npm caching
3. **Install Dependencies**: Runs `npm ci` for clean, reproducible installs
4. **Install Playwright Browsers**: Downloads required browser binaries
5. **Build Application**: Creates production build to test against
6. **Run Tests**: Executes the complete Playwright test suite
7. **Ensure Directories**: Creates artifact directories if they don't exist
8. **List Artifacts**: Debug step to show generated test files
9. **Upload Artifacts**: Saves test reports and results for analysis (ignores if no files found)

### Test Execution Environment

- **Operating System**: Ubuntu Latest
- **Node.js Version**: LTS (Long Term Support)
- **Browsers**: Chromium only (optimized for CI speed)
- **Timeout**: 60 minutes maximum execution time
- **Parallelization**: Tests run in parallel for faster execution

## Artifacts and Reports

### Playwright Report
- **Path**: `playwright-report/`
- **Contents**: HTML test report with detailed results
- **Retention**: 30 days
- **Access**: Download from GitHub Actions run page

### Test Results
- **Path**: `test-results/`
- **Contents**: Screenshots, traces, and raw test data
- **Retention**: 30 days
- **Usage**: Debugging failed tests and performance analysis

## Status Badge

The README includes a status badge that shows the current state of the test suite:

```markdown
[![Playwright Tests](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/playwright.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/playwright.yml)
```

**Note**: Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub repository details.

## Local Development Integration

### Pre-commit Testing
Developers should run tests locally before pushing:

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode for debugging
npm run test:e2e:ui
```

### Branch Protection
Consider setting up branch protection rules in GitHub:

1. Navigate to **Settings > Branches** in your repository
2. Add a rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select "Playwright Tests" as a required check

## Troubleshooting

### Common Issues

#### Tests Failing with ERR_CONNECTION_REFUSED
- **Cause**: Port mismatch between Vite config, Playwright config, and test files
- **Solution**: Ensure all configurations use consistent ports (5173 for dev, 4173 for preview)
- **Fixed**: Updated Vite config to use port 5173, removed hardcoded URLs from tests

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
- **Debug**: The workflow includes directory listing steps to help diagnose artifact generation issues

### Debugging Failed Tests

1. **Download Artifacts**: Get test results from the failed GitHub Actions run
2. **View HTML Report**: Open `playwright-report/index.html` in a browser
3. **Analyze Traces**: Use Playwright trace viewer for step-by-step debugging
4. **Check Screenshots**: Review failure screenshots for visual issues

## Configuration Customization

### Modifying Test Browsers
The configuration automatically uses different browsers for CI vs local development:

```typescript
projects: process.env.CI ? [
  // CI: Only Chromium for faster execution
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
] : [
  // Local: All browsers for comprehensive testing
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
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

## Future Enhancements

### Potential Improvements
1. **Visual Regression Testing**: Add screenshot comparison tests
2. **Performance Testing**: Monitor application performance metrics
3. **Cross-Platform Testing**: Add Windows and macOS runners
4. **Deployment Pipeline**: Automate deployment after successful tests
5. **Test Coverage**: Integrate code coverage reporting

### Monitoring Metrics
Consider tracking:
- Test execution time trends
- Flaky test identification
- Browser-specific failure rates
- Test suite growth over time

---

For questions or issues with the CI/CD setup, please create an issue in the repository or contact the development team.