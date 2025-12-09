# Design Document: Playwright E2E Testing

## Overview

This design document outlines the implementation of end-to-end testing using Playwright for the JSON-CSV merge tool application. The testing framework will provide comprehensive coverage of user workflows, UI interactions, and core functionality across multiple browsers. The implementation follows modern testing best practices including page object patterns, reusable fixtures, and maintainable test organization.

## Architecture

### Testing Structure

```
tests/
├── e2e/
│   ├── json-editor.spec.ts       # JSON editor tests
│   ├── csv-editor.spec.ts        # CSV editor tests
│   ├── merge-workflow.spec.ts    # End-to-end merge tests
│   ├── placeholders.spec.ts      # Placeholder transformation tests
│   ├── user-inputs.spec.ts       # User/row input prompt tests
│   ├── tour-help.spec.ts         # Tour and help feature tests
│   └── error-handling.spec.ts    # Error and edge case tests
├── fixtures/
│   ├── test-data.ts              # Sample JSON templates and CSV data
│   ├── page-objects.ts           # Page object models
│   └── test-helpers.ts           # Utility functions
└── playwright.config.ts          # Playwright configuration
```

### Test Execution Flow

1. **Setup Phase**: Start development server, initialize browser contexts
2. **Test Execution**: Run tests in parallel across browsers
3. **Assertion Phase**: Verify expected outcomes using Playwright assertions
4. **Teardown Phase**: Capture screenshots/traces on failure, generate reports
5. **Reporting**: Generate HTML reports with test results and artifacts

## Components and Interfaces

### Page Object Models

```typescript
// Page object for the main application
class MergeToolPage {
  constructor(page: Page);
  
  // Navigation
  goto(): Promise<void>;
  
  // JSON Editor interactions
  getJsonEditor(): Locator;
  setJsonContent(content: string): Promise<void>;
  getJsonValidationError(): Promise<string | null>;
  selectPresetTemplate(templateName: string): Promise<void>;
  clearJsonEditor(): Promise<void>;
  
  // CSV Editor interactions
  getCsvEditor(): Locator;
  setCsvContent(content: string): Promise<void>;
  clearCsvEditor(): Promise<void>;
  
  // Merge operations
  clickMergeButton(): Promise<void>;
  getMergeResults(): Promise<string[]>;
  downloadResults(): Promise<void>;
  
  // User input prompts
  fillUserInputPrompt(value: string): Promise<void>;
  fillRowInputPrompt(rowIndex: number, value: string): Promise<void>;
  cancelInputPrompt(): Promise<void>;
  
  // Tour and help
  startTour(): Promise<void>;
  skipTour(): Promise<void>;
  openPlaceholderHelp(): Promise<void>;
  closePlaceholderHelp(): Promise<void>;
}
```

### Test Fixtures

```typescript
interface TestFixtures {
  mergeToolPage: MergeToolPage;
  sampleJson: {
    simple: string;
    withPlaceholders: string;
    withTransformations: string;
    withUserInputs: string;
    withRowInputs: string;
  };
  sampleCsv: {
    simple: string;
    withHeaders: string;
    multiRow: string;
    specialChars: string;
  };
}
```

### Test Helpers

```typescript
// Utility functions for common test operations
class TestHelpers {
  static parseJsonResults(results: string[]): any[];
  static validateJsonStructure(json: string): boolean;
  static compareMergedOutput(actual: any, expected: any): boolean;
  static generateLargeCsv(rows: number): string;
  static waitForMergeComplete(page: Page): Promise<void>;
}
```

## Data Models

### Test Data Structure

```typescript
interface TestTemplate {
  id: string;
  name: string;
  json: string;
  csv: string;
  expectedOutput: any[];
  description: string;
}

interface PlaceholderTest {
  placeholder: string;
  csvValue: string;
  expectedResult: string;
  transformation?: string;
}

interface UserInputTest {
  jsonTemplate: string;
  csvData: string;
  userInputs: Record<string, string>;
  rowInputs: Record<number, Record<string, string>>;
  expectedOutput: any[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: JSON validation consistency
*For any* JSON input string, if the JSON editor accepts it without errors, then parsing that string with JSON.parse() should succeed without throwing an exception.
**Validates: Requirements 2.2**

### Property 2: Invalid JSON error display
*For any* invalid JSON input string, the application should display at least one validation error message to the user.
**Validates: Requirements 2.3**

### Property 3: CSV header recognition
*For any* CSV input with a header row containing column names, those column names should be available as placeholders for the merge operation.
**Validates: Requirements 3.3**

### Property 4: Placeholder replacement completeness
*For any* JSON template with placeholders matching CSV column headers, after merging, the output should contain no unreplaced placeholder syntax ({{...}}) for those columns.
**Validates: Requirements 4.2**

### Property 5: Row count preservation
*For any* CSV with N data rows, the merge operation should produce exactly N merged JSON objects.
**Validates: Requirements 4.1, 4.5**

### Property 6: Transformation method application
*For any* placeholder with a valid transformation method (toUpperCase, toLowerCase, trim, capitalize), the output value should equal the result of applying that transformation to the CSV value.
**Validates: Requirements 5.1, 5.5**

### Property 7: Transformation chain ordering
*For any* placeholder with multiple chained transformations (e.g., {{name.trim().toUpperCase()}}), the transformations should be applied left-to-right in the order specified.
**Validates: Requirements 5.2**

### Property 8: User input propagation
*For any* JSON template containing userInput placeholders, when a user provides a value V, all instances of that userInput placeholder across all merged rows should contain the value V.
**Validates: Requirements 6.3**

### Property 9: Row input prompt count
*For any* JSON template with rowInput placeholders in arrays, when processing N CSV rows, the system should prompt for exactly N input values (one per row).
**Validates: Requirements 6.2**

### Property 10: Special character preservation
*For any* CSV value containing special characters (quotes, commas, newlines, unicode), after merging into JSON, those characters should be correctly escaped and preserved in the output.
**Validates: Requirements 3.5, 9.4**

## Error Handling

### Test Error Handling

1. **Test Failures**: Capture screenshots, videos, and traces automatically
2. **Timeout Handling**: Configure appropriate timeouts for different operations
3. **Flaky Test Detection**: Use retry logic for network-dependent tests
4. **Assertion Failures**: Provide detailed error messages with actual vs expected values

### Application Error Testing

1. **Invalid JSON**: Verify error messages appear and are user-friendly
2. **Invalid CSV**: Test handling of malformed CSV data
3. **Missing Placeholders**: Verify behavior when CSV columns don't match placeholders
4. **Network Failures**: Mock and test API failure scenarios
5. **Storage Errors**: Test behavior when localStorage is unavailable

## Testing Strategy

### Dual Testing Approach

This implementation uses both unit testing and property-based testing:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing

Unit tests will cover:
- Specific workflow examples (e.g., merging a specific template with specific CSV data)
- UI interaction sequences (e.g., clicking buttons, filling forms)
- Edge cases (empty inputs, very large inputs, special characters)
- Error conditions (invalid JSON, network failures)

Example unit test scenarios:
- Loading the application displays the correct initial state
- Selecting a preset template populates the JSON editor
- Entering valid JSON and CSV produces expected merge results
- Clicking download button triggers file download

### Property-Based Testing

For property-based testing, we will use **fast-check** (a TypeScript property-based testing library) integrated with Playwright tests. Each property-based test will run a minimum of 100 iterations.

Property-based tests will:
- Generate random but valid JSON templates with various placeholder patterns
- Generate random CSV data with different column counts and data types
- Verify that universal properties hold across all generated inputs
- Test transformation methods with arbitrary input strings

Each property-based test will be tagged with a comment in this format:
```typescript
// **Feature: playwright-e2e-testing, Property 1: JSON validation consistency**
test('JSON validation consistency property', async ({ page }) => {
  // Property test implementation
});
```

### Test Organization

Tests are organized by feature area:
1. **JSON Editor Tests**: Input validation, preset templates, clearing
2. **CSV Editor Tests**: Parsing, headers, special characters
3. **Merge Workflow Tests**: End-to-end merge scenarios
4. **Placeholder Tests**: Transformations, system placeholders
5. **User Input Tests**: Prompts, cancellation, multiple inputs
6. **Tour/Help Tests**: Interactive tour, help modals
7. **Error Handling Tests**: Invalid inputs, edge cases

### Browser Coverage

Tests will run on:
- **Chromium**: Primary browser for development
- **Firefox**: Cross-browser compatibility
- **WebKit**: Safari compatibility (optional, can be enabled for full coverage)

### Test Execution Modes

1. **Local Development**: Run against local dev server (`npm run dev`)
2. **CI/CD**: Run against production build in headless mode
3. **Debug Mode**: Run in headed mode with Playwright Inspector
4. **UI Mode**: Interactive test runner for development

### Performance Considerations

- Run tests in parallel to reduce execution time
- Use test fixtures to avoid redundant setup
- Implement smart waiting strategies (avoid arbitrary timeouts)
- Cache browser contexts when possible

## Implementation Plan

The implementation will follow these phases:

1. **Setup Phase**: Install Playwright, configure project, create directory structure
2. **Foundation Phase**: Create page objects, fixtures, and test helpers
3. **Core Tests Phase**: Implement tests for JSON editor, CSV editor, and merge workflow
4. **Advanced Tests Phase**: Implement placeholder, user input, and tour tests
5. **Quality Phase**: Add property-based tests, error handling tests, and edge cases
6. **Integration Phase**: Configure CI/CD, add npm scripts, document usage

## Configuration

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### NPM Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Dependencies

Required packages:
- `@playwright/test`: Core Playwright testing framework
- `fast-check`: Property-based testing library (for property tests)

Development workflow:
- Tests run automatically in CI/CD
- Developers can run tests locally before committing
- Test reports are generated and can be viewed in browser
- Failed tests include screenshots and traces for debugging
