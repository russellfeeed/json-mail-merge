# Code Coverage Documentation

This directory contains comprehensive documentation for the code coverage system implemented in the JSON-CSV merge tool application.

## 📚 Documentation Overview

### Core Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| **[Coverage Configuration Guide](COVERAGE-CONFIGURATION.md)** | Complete configuration reference and setup instructions | All developers |
| **[Threshold Examples](COVERAGE-THRESHOLD-EXAMPLES.md)** | Practical threshold configurations for different scenarios | Tech leads, senior developers |
| **[Troubleshooting Guide](COVERAGE-TROUBLESHOOTING.md)** | Solutions for common coverage issues and problems | All developers |
| **[Workflow Integration](COVERAGE-WORKFLOW-INTEGRATION.md)** | Integration with development workflows and CI/CD | All team members |

### Specialized Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| **[CI/CD Setup](CI-CD-SETUP.md)** | Continuous integration and deployment configuration | DevOps, tech leads |
| **[Coverage Gap Identification](COVERAGE-GAP-IDENTIFICATION.md)** | Tools and techniques for identifying uncovered code | Developers, QA |
| **[Dynamic Code Tracking](DYNAMIC-CODE-TRACKING.md)** | Automatic inclusion of new files in coverage | All developers |

## 🚀 Quick Start

### For New Team Members

1. **Read the Configuration Guide**: Start with [COVERAGE-CONFIGURATION.md](COVERAGE-CONFIGURATION.md) to understand the system
2. **Set up your IDE**: Follow the IDE integration section for VS Code setup
3. **Run your first coverage check**: `npm run test:coverage`
4. **Explore the reports**: Open `coverage/index.html` in your browser

### For Existing Developers

1. **Check current coverage**: `npm run test:coverage`
2. **Analyze gaps**: `npm run test:coverage:gaps`
3. **Review thresholds**: See [COVERAGE-THRESHOLD-EXAMPLES.md](COVERAGE-THRESHOLD-EXAMPLES.md)
4. **Integrate with workflow**: Follow [COVERAGE-WORKFLOW-INTEGRATION.md](COVERAGE-WORKFLOW-INTEGRATION.md)

### For Tech Leads

1. **Review threshold strategy**: [COVERAGE-THRESHOLD-EXAMPLES.md](COVERAGE-THRESHOLD-EXAMPLES.md)
2. **Set up CI/CD**: [CI-CD-SETUP.md](CI-CD-SETUP.md)
3. **Configure team workflows**: [COVERAGE-WORKFLOW-INTEGRATION.md](COVERAGE-WORKFLOW-INTEGRATION.md)
4. **Plan coverage improvements**: Use gap analysis tools

## 📊 Coverage System Overview

### Architecture

The coverage system is built on:
- **Vitest** with **Istanbul** instrumentation for unit tests
- **Playwright** with coverage collection for E2E tests
- **Custom scripts** for merging, enhancement, and analysis
- **Multiple report formats** for different use cases

### Key Features

- ✅ **Multi-format reporting** (HTML, JSON, LCOV, Cobertura)
- ✅ **Threshold enforcement** with flexible configuration
- ✅ **Dynamic file tracking** for automatic inclusion of new files
- ✅ **Coverage gap analysis** with detailed reporting
- ✅ **CI/CD integration** with automated quality gates
- ✅ **Enhanced visual reports** with improved highlighting
- ✅ **Performance optimization** for large codebases

### Current Coverage Status

```bash
# Check current coverage levels
npm run test:coverage

# View detailed gap analysis
npm run test:coverage:gaps

# Check file tracking status
npm run test:coverage:track:status
```

## 🎯 Coverage Thresholds

### Current Thresholds

| Scope | Lines | Functions | Branches | Statements |
|-------|-------|-----------|----------|------------|
| **Global** | 10% | 5% | 5% | 10% |
| **Library Code** (`src/lib/**`) | 25% | 15% | 20% | 25% |
| **Components** (`src/components/**`) | 0% | 0% | 0% | 0% |
| **Pages** (`src/pages/**`) | 0% | 0% | 0% | 0% |

### Threshold Philosophy

- **Start Conservative**: Begin with achievable thresholds
- **Improve Gradually**: Increase thresholds over time
- **Different Standards**: Higher requirements for critical code
- **Team Alignment**: Adjust based on team capabilities

See [COVERAGE-THRESHOLD-EXAMPLES.md](COVERAGE-THRESHOLD-EXAMPLES.md) for detailed configuration examples.

## 🛠️ Available Commands

### Basic Coverage Commands

```bash
# Run unit tests with coverage
npm run test:coverage

# Run all tests (unit + E2E) with coverage
npm run test:coverage:all

# Enhance existing coverage reports
npm run test:coverage:enhance

# Watch for changes and auto-enhance
npm run test:coverage:watch
```

### Analysis Commands

```bash
# Analyze coverage gaps
npm run test:coverage:gaps

# Save gap analysis to file
npm run test:coverage:gaps:save

# Merge coverage from multiple sources
npm run test:coverage:merge
```

### Dynamic Tracking Commands

```bash
# Scan for new files
npm run test:coverage:track

# Start file system watcher
npm run test:coverage:track:watch

# Check tracking status
npm run test:coverage:track:status

# Scan and run coverage
npm run test:coverage:track:full
```

### CI/CD Commands

```bash
# Test CI setup locally
npm run test:ci-setup

# Run E2E tests with coverage
npm run test:e2e:coverage
```

## 📁 Coverage Output Structure

```
coverage/
├── index.html                    # Main HTML report
├── coverage-final.json          # Complete coverage data
├── coverage-summary.json        # Summary statistics
├── lcov.info                    # LCOV format for external tools
├── cobertura-coverage.xml       # Cobertura XML format
├── coverage-gaps.json           # Gap analysis results
├── tracking-data.json           # Dynamic tracking data
├── lcov-report/                 # Detailed HTML reports
│   ├── index.html
│   └── src/                     # File-by-file reports
├── e2e/                         # E2E-specific coverage
└── merged/                      # Merged coverage reports
```

## 🔧 Configuration Files

### Primary Configuration

- **`vitest.config.ts`** - Main Vitest and coverage configuration
- **`coverage.config.js`** - Extended coverage settings
- **`playwright.config.ts`** - E2E test coverage integration

### Supporting Files

- **`package.json`** - Coverage-related npm scripts
- **`.github/workflows/ci.yml`** - CI/CD pipeline configuration
- **`scripts/`** - Coverage enhancement and analysis scripts

## 🚨 Troubleshooting

### Common Issues

1. **Coverage thresholds failing** → See [troubleshooting guide](COVERAGE-TROUBLESHOOTING.md#coverage-threshold-failures)
2. **Files not included** → Check [file inclusion issues](COVERAGE-TROUBLESHOOTING.md#files-not-included-in-coverage)
3. **E2E coverage not working** → Review [E2E troubleshooting](COVERAGE-TROUBLESHOOTING.md#e2e-coverage-not-working)
4. **Performance issues** → Follow [optimization guide](COVERAGE-TROUBLESHOOTING.md#performance-issues)

### Quick Diagnosis

```bash
# Check if coverage is working
npm run test:coverage

# Verify configuration
node -c vitest.config.ts

# Test file patterns
ls src/**/*.{ts,tsx} | wc -l

# Check tracking status
npm run test:coverage:track:status
```

### Getting Help

1. **Check the troubleshooting guide**: [COVERAGE-TROUBLESHOOTING.md](COVERAGE-TROUBLESHOOTING.md)
2. **Review configuration**: [COVERAGE-CONFIGURATION.md](COVERAGE-CONFIGURATION.md)
3. **Validate setup**: Run `npm run test:ci-setup`
4. **Create an issue**: Include configuration files and error messages

## 📈 Coverage Improvement Strategies

### 1. Identify Gaps

```bash
# Find files with low coverage
npm run test:coverage:gaps

# Focus on 0% coverage files first
grep "0%" coverage/coverage-summary.json
```

### 2. Prioritize Testing

**High Priority**:
- Business logic functions (`src/lib/**`)
- API integration code
- Error handling and edge cases

**Medium Priority**:
- Component logic
- Utility functions
- Form validation

**Low Priority**:
- Type definitions
- Constants
- Simple getters/setters

### 3. Gradual Improvement

```typescript
// Example: Gradual threshold increases
// Month 1: Current baseline
global: { lines: 10, functions: 5, branches: 5, statements: 10 }

// Month 2: Small improvement
global: { lines: 20, functions: 15, branches: 10, statements: 20 }

// Month 3: Moderate improvement
global: { lines: 40, functions: 35, branches: 25, statements: 40 }

// Month 6: Production ready
global: { lines: 70, functions: 65, branches: 50, statements: 70 }
```

## 🎯 Best Practices

### Development Practices

1. **Write tests first** or alongside new features
2. **Check coverage** before committing changes
3. **Focus on critical paths** for high coverage
4. **Use coverage reports** to guide testing efforts

### Team Practices

1. **Review coverage** in pull requests
2. **Set realistic thresholds** based on team capabilities
3. **Celebrate improvements** in coverage metrics
4. **Share knowledge** about testing techniques

### CI/CD Practices

1. **Enforce thresholds** in build pipelines
2. **Upload coverage artifacts** for analysis
3. **Comment on PRs** with coverage changes
4. **Track trends** over time

## 📚 Additional Resources

### External Documentation

- **Vitest Coverage**: https://vitest.dev/guide/coverage.html
- **Istanbul Documentation**: https://istanbul.js.org/
- **Playwright Coverage**: https://playwright.dev/docs/test-coverage

### Internal Resources

- **Project README**: `../README.md`
- **Testing Documentation**: `../tests/README.md`
- **CI/CD Documentation**: `.github/workflows/README.md`

### Community Resources

- **GitHub Discussions**: Project discussions and Q&A
- **Stack Overflow**: Tag questions with `vitest` and `code-coverage`
- **Discord/Slack**: Team communication channels

## 🔄 Maintenance

### Regular Tasks

- **Weekly**: Review coverage trends and gaps
- **Monthly**: Adjust thresholds based on progress
- **Quarterly**: Update documentation and examples
- **Annually**: Review overall coverage strategy

### Updates and Changes

When updating the coverage system:

1. **Update documentation** to reflect changes
2. **Test thoroughly** in development environment
3. **Communicate changes** to the team
4. **Monitor impact** on CI/CD pipelines

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12 | Initial coverage system implementation |
| 1.1.0 | 2024-12 | Added dynamic code tracking |
| 1.2.0 | 2024-12 | Enhanced visual reports and gap analysis |

---

For questions, issues, or suggestions about the coverage system, please:

1. Check this documentation first
2. Review the troubleshooting guide
3. Search existing issues
4. Create a new issue with detailed information

**Happy testing! 🧪✨**