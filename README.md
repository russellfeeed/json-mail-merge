# JSON-CSV Merge Tool

[![Playwright Tests](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/playwright.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/playwright.yml)

A web-based tool for merging CSV data into JSON templates with powerful placeholder substitution, transformations, and batch processing capabilities.

## Overview

The JSON-CSV Merge Tool allows you to create dynamic JSON outputs by combining CSV data with JSON templates. It's perfect for generating configuration files, API payloads, test data, or any structured JSON content from tabular data sources.

## Features

### Core Functionality
- **JSON Template Editor** - Write or paste JSON templates with syntax validation and placeholder highlighting
- **CSV Data Editor** - Import CSV files via drag-and-drop or paste directly, with tabular preview
- **Real-time Validation** - Instant feedback on JSON validity and missing CSV columns
- **Batch Processing** - Generate individual JSON files per CSV row or combine into a single array

### Placeholder System

| Type | Example | Description |
|------|---------|-------------|
| **CSV Column** | `{{name}}`, `{{email}}` | Replaced with values from CSV columns |
| **System** | `{{currentDatetime}}`, `{{uuid}}`, `{{timestamp}}` | Auto-generated dynamic values |
| **User Input** | `{{userInputString}}`, `{{userInputNumber}}` | Single value applied to all rows |
| **Row Input** | `{{rowInputString}}`, `{{rowInputNumber}}` | Unique value per row (must be inside arrays) |

### Placeholder Methods
Transform placeholder values with chainable methods:
```
{{name.toUpperCase()}}
{{email.slugify().toLowerCase()}}
{{title.titleCase()}}
```

Available methods: `toLowerCase`, `toUpperCase`, `trim`, `capitalize`, `titleCase`, `slugify`, `camelCase`, `snakeCase`, `reverse`, `length`

### Array Mode
Generate a single JSON file containing an array with one item per CSV row, instead of multiple separate files.

### Additional Features
- **Autocomplete** - Suggestions appear when typing `{{` for quick placeholder insertion
- **Preset Templates** - Quick-start with predefined JSON structures
- **Download Options** - Export individual results or all as a combined JSON array
- **Sample Data** - Load example templates and CSV data to explore features
- **Interactive Tour** - Guided walkthrough for first-time users
- **Fixed Timestamps** - Lock date/time placeholders to specific values for deterministic output

---

## Development

### Tech Stack
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

### Testing

This project uses comprehensive testing with both unit tests and end-to-end tests, along with detailed code coverage reporting.

#### Running Tests Locally

```sh
# Unit Tests
npm run test:unit                 # Run unit tests once
npm run test:unit:watch          # Run unit tests in watch mode
npm run test:unit:ui             # Run unit tests with UI

# Coverage
npm run test:coverage            # Run unit tests with coverage
npm run test:coverage:all        # Run all tests (unit + E2E) with coverage
npm run test:coverage:gaps       # Analyze coverage gaps
npm run test:coverage:track      # Track new files for coverage

# E2E Tests
npm run test:e2e                 # Run all E2E tests
npm run test:e2e:ui              # Run tests with UI mode (interactive)
npm run test:e2e:headed          # Run tests in headed mode (see browser)
npm run test:e2e:debug           # Run tests in debug mode
npm run test:e2e:report          # View test report

# CI/CD
npm run test:ci-setup            # Verify CI/CD setup
```

#### Test Structure

Tests are organized in the `tests/` directory:

```
tests/
├── e2e/                          # End-to-end test files
│   ├── json-editor.spec.ts       # JSON editor functionality
│   ├── csv-editor.spec.ts        # CSV editor functionality
│   ├── merge-workflow.spec.ts    # Complete merge workflows
│   ├── placeholder-transformations.spec.ts  # Placeholder methods
│   ├── user-inputs.spec.ts       # User/row input prompts
│   ├── tour-help.spec.ts         # Tour and help features
│   └── error-handling.spec.ts    # Error scenarios and edge cases
├── fixtures/                     # Test utilities and data
│   ├── test-data.ts              # Sample JSON templates and CSV data
│   ├── page-objects.ts           # Page object models
│   └── test-helpers.ts           # Utility functions
```

#### CI/CD Integration

The project includes automated testing via GitHub Actions:

- **Triggers**: Tests run on pushes to `main`/`develop` branches and all pull requests
- **Browsers**: Tests execute on Chromium only in CI (for speed), all browsers locally
- **Artifacts**: Test reports, screenshots, and traces are automatically uploaded
- **Timeout**: Tests have a 60-minute timeout to handle comprehensive test suites

#### Test Reports

When tests run in CI or locally, detailed HTML reports are generated including:
- Test execution results with pass/fail status
- Screenshots of failures for visual debugging
- Execution traces for step-by-step analysis
- Performance metrics and timing information

Access reports by:
1. **Locally**: Run `npm run test:e2e:report` after tests complete
2. **CI/CD**: Download artifacts from the GitHub Actions run page

#### Code Coverage

The project maintains comprehensive code coverage with automated reporting and threshold enforcement:

- **Current Coverage**: Lines: 10.95% | Functions: 5.16% | Branches: 4.41% | Statements: 9.82%
- **Coverage Reports**: Interactive HTML reports with gap analysis and visual indicators
- **Threshold Enforcement**: Configurable coverage thresholds that fail builds when not met
- **Multi-format Output**: HTML, JSON, LCOV, and Cobertura formats for different tools

**Coverage Commands**:
```sh
# View coverage reports
open coverage/index.html         # Interactive HTML report
npm run test:coverage:gaps       # Detailed gap analysis
npm run test:coverage:track:status  # File tracking status
```

**Coverage Documentation**: See [docs/README-COVERAGE.md](docs/README-COVERAGE.md) for comprehensive coverage documentation including:
- Configuration guide and best practices
- Threshold examples for different project phases
- Troubleshooting common coverage issues
- Workflow integration with CI/CD

For detailed CI/CD setup information, see [CI/CD Setup Documentation](docs/CI-CD-SETUP.md).

---

## Adding New JSON Templates

To add a new preset JSON template, edit the `presetTemplates` array in `src/components/JsonEditor.tsx`:

```typescript
const presetTemplates = [
  {
    id: 'my-template',      // Unique identifier (kebab-case)
    name: 'My Template',    // Display name in dropdown
    content: `{
      "field": "{{placeholder}}",
      "timestamp": "{{currentDatetime}}",
      "items": [
        {
          "name": "{{name}}",
          "rowNote": "{{rowInputString}}"
        }
      ]
    }`
  },
  // ... other templates
];
```

---

## Deployment

### Lovable Publish
Open [Lovable](https://lovable.dev/projects/d030c1cb-9bed-443b-b8c4-facdd3dfed2a) and click Share → Publish.

### Self-Hosting (IIS, Apache, Nginx)

This is a static single-page application (SPA) that can be deployed to any web server.

#### 1. Build the Production Bundle

```sh
npm run build
```

This creates a `dist/` folder containing all static files.

#### 2. Deploy to IIS

1. Copy the contents of `dist/` to your IIS site folder
2. Create a `web.config` file in the site root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

3. Ensure the **URL Rewrite** module is installed in IIS

#### 3. Deploy to Apache

Create a `.htaccess` file in the site root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 4. Deploy to Nginx

Add this to your server block:

```nginx
location / {
  root /var/www/json-merge-tool;
  index index.html;
  try_files $uri $uri/ /index.html;
}
```

#### 5. Subfolder Deployment

If deploying to a subfolder (e.g., `/tools/json-merge/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/tools/json-merge/',
  // ... rest of config
})
```

Then rebuild and update the rewrite rules to match your base path.

---

## Specifications & Design Documents

Detailed specifications and design documents are available in the `.kiro/specs/` folder, generated by [kiro.dev](https://kiro.dev). These documents provide in-depth requirements and architectural designs for each feature:

| Spec | Description |
|------|-------------|
| `json-csv-merge-tool/` | Core requirements and task breakdown for the merge tool |
| `placeholder-transformations/` | Design for placeholder method chaining and transformations |
| `user-and-row-inputs/` | Requirements for user input and row input placeholder types |
| `user-experience-enhancements/` | UX improvements including tour and autocomplete |

---

## Custom Domain

To connect a custom domain, navigate to Project > Settings > Domains in Lovable and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
