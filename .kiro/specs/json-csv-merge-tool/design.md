# Design Document: JSON-CSV Merge Tool

## Overview

The JSON-CSV Merge Tool is a client-side web application built with React and TypeScript that enables users to merge CSV data into JSON templates through placeholder substitution. The application operates entirely in the browser without requiring server-side processing, ensuring data privacy and instant feedback.

The system supports two distinct operational modes:
1. **Individual Mode**: Generates one JSON file per CSV row, ideal for bulk data generation
2. **Array Mode**: Generates a single JSON file with all CSV rows merged into a specified array, ideal for API payloads or batch operations

The design emphasizes real-time validation, intuitive user experience, and extensibility for future enhancements.

## Architecture

### High-Level Architecture

The application follows a component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│  (React Components: JsonEditor, CsvEditor, MergeResults) │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Business Logic Layer                   │
│     (jsonMerge, arrayMerge, systemPlaceholders)         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                      Data Layer                          │
│        (Browser APIs: File, Clipboard, Crypto)          │
└─────────────────────────────────────────────────────────┘
```

**Design Rationale**: This layered architecture ensures:
- **Testability**: Business logic is isolated from UI concerns
- **Reusability**: Core merge functions can be used independently
- **Maintainability**: Changes to UI don't affect business logic and vice versa

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript for type safety
- **UI Components**: shadcn/ui component library for consistent design
- **State Management**: React hooks (useState, useMemo, useEffect) for local state
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first styling

**Design Rationale**: This stack provides:
- Type safety through TypeScript reduces runtime errors
- Fast development iteration with Vite's HMR
- Accessible, customizable UI components from shadcn/ui
- No external dependencies for core merge logic ensures reliability

## Components and Interfaces

### Core Business Logic Modules

#### 1. JSON Merge Module (`jsonMerge.ts`)

**Purpose**: Handles CSV parsing, placeholder extraction, and basic merge operations.

**Key Interfaces**:
```typescript
interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}
```

**Key Functions**:
- `parseCSV(csvText: string): ParsedCSV` - Parses CSV text with proper quote handling
- `extractPlaceholders(jsonString: string): string[]` - Extracts unique placeholders from JSON
- `mergePlaceholders(jsonTemplate: string, data: Record<string, string>): string` - Replaces placeholders with values
- `validateJSON(jsonString: string): { valid: boolean; error?: string }` - Validates JSON syntax
- `formatJSON(jsonString: string): string` - Formats JSON with 2-space indentation

**Design Rationale**: 
- CSV parsing handles edge cases (quoted commas, escaped quotes) for robust data handling
- Placeholder extraction uses regex for flexibility in whitespace handling
- Validation provides immediate feedback to users

#### 2. Array Merge Module (`arrayMerge.ts`)

**Purpose**: Handles array mode operations including array detection and batch merging.

**Key Interfaces**:
```typescript
interface ArrayPath {
  path: string;      // Dot-notation path to array (e.g., "users" or "data.items")
  preview: string;   // Preview of first array item
}
```

**Key Functions**:
- `findArraysInJson(jsonString: string): ArrayPath[]` - Recursively finds all arrays in JSON
- `mergeAsArray(jsonTemplate: string, rows: Record<string, string>[], arrayPath: string): string` - Merges all rows into specified array

**Design Rationale**:
- Recursive traversal finds nested arrays at any depth
- First array item serves as template, ensuring consistent structure
- System placeholders in surrounding template are resolved once, while array item placeholders are resolved per row

#### 3. System Placeholders Module (`systemPlaceholders.ts`)

**Purpose**: Manages dynamic placeholder generation for timestamps, UUIDs, and random values.

**Key Interface**:
```typescript
interface SystemPlaceholder {
  name: string;
  description: string;
  getValue: () => string;
}
```

**Supported Placeholders**:
- `{{currentDatetime}}` - ISO 8601 format (YYYY-MM-DDTHH:mm:ss.SSS)
- `{{currentDate}}` - Date only (YYYY-MM-DD)
- `{{currentTime}}` - Time only (HH:mm:ss)
- `{{timestamp}}` - Unix timestamp in milliseconds
- `{{uuid}}` - UUID v4 using crypto.randomUUID()
- `{{randomNumber}}` - Random integer 0-999999

**Key Functions**:
- `getSystemPlaceholderNames(): string[]` - Returns list of system placeholder names
- `resolveSystemPlaceholders(jsonString: string): string` - Replaces all system placeholders with generated values

**Design Rationale**:
- Extensible design allows easy addition of new system placeholders
- Lazy evaluation (getValue function) ensures fresh values on each call
- Browser crypto API provides cryptographically secure UUIDs

### UI Components

#### 1. JsonEditor Component

**Purpose**: Provides JSON template input with validation, placeholder detection, and autocomplete.

**Key Features**:
- Real-time JSON syntax validation
- Placeholder highlighting with visual tags
- Autocomplete dropdown triggered by `{{`
- File upload and drag-and-drop support
- Datetime placeholder replacement UI

**Props**:
```typescript
{
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  error?: string;
  placeholders: string[];
  csvHeaders: string[];
}
```

**Design Rationale**:
- Textarea-based editor keeps implementation simple while providing necessary features
- Real-time validation prevents user frustration from delayed error feedback
- Autocomplete reduces typing errors and improves discoverability

#### 2. CsvEditor Component

**Purpose**: Provides CSV data input with preview and validation.

**Key Features**:
- Tabular preview of parsed CSV data
- Column header highlighting for matched placeholders
- Missing column warnings
- Sample data generation from template placeholders
- File upload and drag-and-drop support

**Props**:
```typescript
{
  value: string;
  onChange: (value: string) => void;
  parsedData: ParsedCSV;
  requiredHeaders: string[];
}
```

**Design Rationale**:
- Table preview helps users verify correct parsing
- Visual feedback on matched/missing columns guides users to fix issues
- Sample generation provides quick testing capability

#### 3. MergeResults Component

**Purpose**: Displays merged JSON results with download and copy functionality.

**Key Features**:
- Syntax-highlighted JSON display
- Individual file download with sequential naming
- "Download All" for batch export as JSON array
- Copy to clipboard with visual confirmation
- Collapsible results for large datasets

**Props**:
```typescript
{
  results: string[];
  csvRows: Record<string, string>[];
}
```

**Design Rationale**:
- Accordion UI prevents overwhelming users with many results
- Multiple export options accommodate different workflows
- Visual feedback confirms successful copy operations

## Data Models

### Internal Data Structures

#### ParsedCSV
```typescript
interface ParsedCSV {
  headers: string[];              // Column names from first CSV row
  rows: Record<string, string>[]; // Array of row objects keyed by header
}
```

**Purpose**: Normalized representation of CSV data for easy placeholder matching.

**Design Rationale**: Using objects keyed by header name simplifies placeholder replacement logic and makes code more readable than index-based access.

#### ArrayPath
```typescript
interface ArrayPath {
  path: string;    // Dot-notation path (e.g., "data.users")
  preview: string; // Truncated preview of first item
}
```

**Purpose**: Represents a discovered array in the JSON template for user selection.

**Design Rationale**: Preview helps users identify the correct array when multiple arrays exist in the template.

### Data Flow

```
User Input (JSON + CSV)
        ↓
    Validation
        ↓
  Placeholder Extraction
        ↓
    CSV Parsing
        ↓
  Placeholder Matching
        ↓
   Merge Operation
        ↓
System Placeholder Resolution
        ↓
   JSON Formatting
        ↓
    Display Results
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: CSV Parsing Preserves Data Integrity
*For any* valid CSV string with N rows and M columns, parsing should produce exactly N row objects, each containing exactly M key-value pairs corresponding to the headers.
**Validates: Requirements 3.4, 3.5, 3.6**

### Property 2: Placeholder Extraction Completeness
*For any* JSON string, all text matching the pattern `{{...}}` should be extracted exactly once in the placeholder list, regardless of how many times each placeholder appears.
**Validates: Requirements 2.1**

### Property 3: Placeholder Replacement Completeness
*For any* JSON template and data object, after merging, the result should contain zero instances of placeholders that exist as keys in the data object.
**Validates: Requirements 6.2**

### Property 4: JSON Validation Consistency
*For any* string that successfully parses with `JSON.parse()`, the validation function should return `{ valid: true }`, and for any string that throws an error, it should return `{ valid: false, error: string }`.
**Validates: Requirements 1.4, 1.5**

### Property 5: System Placeholder Resolution Freshness
*For any* JSON string containing system placeholders, resolving placeholders twice in sequence should produce different values for time-based placeholders (`{{currentDatetime}}`, `{{currentDate}}`, `{{currentTime}}`, `{{timestamp}}`) when sufficient time has elapsed.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 6: System Placeholder Resolution Uniqueness
*For any* JSON string containing `{{uuid}}`, resolving placeholders multiple times should produce different UUID values each time.
**Validates: Requirements 8.5**

### Property 7: Array Mode Preserves Row Count
*For any* valid JSON template with an array, CSV data with N rows, and valid array path, merging in array mode should produce a result where the specified array contains exactly N items.
**Validates: Requirements 7.1, 7.4**

### Property 8: Individual Mode Produces Correct File Count
*For any* valid JSON template and CSV data with N rows, merging in individual mode should produce exactly N result strings.
**Validates: Requirements 6.1**

### Property 9: CSV Quote Handling Preserves Commas
*For any* CSV string where a field is enclosed in quotes and contains commas, parsing should treat the entire quoted section as a single field value including the commas.
**Validates: Requirements 3.5**

### Property 10: CSV Escaped Quote Handling
*For any* CSV string containing `""` within a quoted field, parsing should convert it to a single `"` character in the resulting value.
**Validates: Requirements 3.6**

### Property 11: Missing Column Detection Accuracy
*For any* set of required CSV placeholders R and set of actual CSV headers H, the system should report a missing column warning if and only if there exists a placeholder in R that is not in H.
**Validates: Requirements 5.2, 5.3**

### Property 12: Array Detection Completeness
*For any* valid JSON object, the array detection function should find all arrays at any nesting level that contain at least one element.
**Validates: Requirements 7.2**

### Property 13: JSON Formatting Idempotence
*For any* valid JSON string, formatting it twice should produce the same result as formatting it once (formatting is idempotent).
**Validates: Requirements 6.4**

### Property 14: Placeholder Autocomplete Filtering
*For any* list of available placeholders P and filter string F, the filtered results should contain only placeholders that include F as a substring (case-insensitive).
**Validates: Requirements 12.4**

### Property 15: Sample CSV Generation Completeness
*For any* set of CSV placeholders extracted from a JSON template, generating sample CSV should produce data with headers exactly matching all CSV placeholders.
**Validates: Requirements 13.2, 13.3**

## Error Handling

### Error Categories

#### 1. User Input Errors
- **Invalid JSON Syntax**: Display inline error message with JSON.parse error details
- **Invalid CSV Format**: Gracefully handle malformed CSV, treating unparseable lines as empty rows
- **Missing Required Columns**: Display warning banner listing missing columns, but allow merge to proceed (placeholders remain unreplaced)

**Design Rationale**: Permissive error handling allows users to work incrementally without blocking progress.

#### 2. System Errors
- **File Read Errors**: Display toast notification with error message
- **Clipboard API Errors**: Fall back to displaying error message if clipboard access denied
- **Array Path Errors**: Silently fall back to original template if array path is invalid

**Design Rationale**: Graceful degradation ensures the application remains functional even when optional features fail.

#### 3. Edge Cases
- **Empty CSV**: Treat as zero rows, display "Add CSV data" message
- **Empty JSON Template**: Display "Add JSON template" message
- **No Arrays in Template (Array Mode)**: Display warning message prompting user to add an array
- **Placeholder Not in CSV**: Leave placeholder unreplaced in output (allows partial merges)

**Design Rationale**: Explicit handling of edge cases prevents confusing behavior and guides users toward resolution.

### Error Recovery Strategies

1. **Validation Before Action**: All operations validate inputs before proceeding
2. **Try-Catch Boundaries**: All JSON parsing and file operations wrapped in try-catch
3. **User Feedback**: All errors displayed with actionable messages
4. **State Preservation**: Errors don't clear user input, allowing correction without data loss

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific examples, edge cases, and error conditions for individual functions. Key areas for unit testing:

1. **CSV Parsing Edge Cases**:
   - Empty CSV strings
   - CSV with only headers (no data rows)
   - CSV with quoted fields containing commas
   - CSV with escaped quotes (`""`)
   - CSV with varying column counts per row

2. **Placeholder Extraction**:
   - JSON with no placeholders
   - JSON with nested placeholders in strings
   - JSON with whitespace variations in placeholders
   - Malformed placeholders (missing closing braces)

3. **JSON Validation**:
   - Valid JSON objects and arrays
   - Invalid JSON with specific syntax errors
   - Empty strings
   - Non-JSON strings

4. **Array Detection**:
   - JSON with no arrays
   - JSON with nested arrays
   - JSON with empty arrays
   - JSON with arrays at multiple levels

### Property-Based Testing Approach

Property-based tests will verify universal properties across randomly generated inputs using **fast-check**, a property-based testing library for TypeScript/JavaScript.

**Library Choice Rationale**: fast-check is the most mature PBT library for JavaScript/TypeScript, with excellent TypeScript support, comprehensive generators, and shrinking capabilities.

**Configuration**: Each property test will run a minimum of 100 iterations to ensure adequate coverage of the input space.

**Test Organization**: Each correctness property from the design document will be implemented as a single property-based test, tagged with a comment in this format:

```typescript
// **Feature: json-csv-merge-tool, Property 1: CSV Parsing Preserves Data Integrity**
```

**Key Property Tests**:

1. **CSV Parsing Properties** (Properties 1, 9, 10):
   - Generate random CSV data with varying structures
   - Verify row count, column count, and data integrity
   - Test quote handling and escape sequences

2. **Placeholder Operations** (Properties 2, 3, 14):
   - Generate random JSON templates with placeholders
   - Verify extraction completeness and replacement correctness
   - Test filtering behavior with random filter strings

3. **Validation Properties** (Property 4):
   - Generate both valid and invalid JSON strings
   - Verify validation results match JSON.parse behavior

4. **System Placeholder Properties** (Properties 5, 6):
   - Generate templates with system placeholders
   - Verify freshness and uniqueness guarantees

5. **Mode-Specific Properties** (Properties 7, 8):
   - Generate random templates and CSV data
   - Verify correct output counts for both modes

6. **Array Operations** (Property 12):
   - Generate random nested JSON structures
   - Verify all arrays are detected regardless of depth

7. **Idempotence Properties** (Property 13):
   - Generate random valid JSON
   - Verify formatting is idempotent

8. **Sample Generation** (Property 15):
   - Generate random placeholder sets
   - Verify sample CSV contains all required headers

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Complete Merge Workflow**: JSON input → CSV input → Merge → Download
2. **Mode Switching**: Verify state consistency when switching between modes
3. **File Upload**: Verify file reading and parsing integration
4. **Clipboard Operations**: Verify copy functionality with mocked clipboard API

### Testing Tools

- **Test Runner**: Vitest (fast, Vite-native test runner)
- **Property Testing**: fast-check
- **Component Testing**: React Testing Library
- **Mocking**: Vitest's built-in mocking capabilities

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Use React's `useMemo` for expensive computations:
   - JSON validation
   - Placeholder extraction
   - CSV parsing
   - Merge results generation

2. **Debouncing**: Debounce validation and parsing during rapid typing (300ms delay)

3. **Lazy Rendering**: Use accordion/collapse for large result sets to avoid rendering all results simultaneously

4. **Efficient Regex**: Compile regex patterns once, reuse for multiple operations

### Scalability Limits

**Expected Limits**:
- JSON templates: Up to 1MB (reasonable for complex templates)
- CSV data: Up to 10,000 rows (browser memory constraints)
- Individual results: Up to 10,000 files (UI remains responsive)

**Design Rationale**: Client-side processing limits are acceptable for the target use case (data generation and testing). For larger datasets, users should use server-side tools.

## Security Considerations

### Data Privacy

- **Client-Side Only**: All processing occurs in the browser; no data sent to servers
- **No Persistence**: Data not stored in localStorage or cookies by default
- **No Analytics**: No tracking of user data or templates

### Input Sanitization

- **JSON Parsing**: Uses native `JSON.parse()` which is safe from injection
- **CSV Parsing**: Custom parser doesn't execute code, only extracts strings
- **Placeholder Replacement**: Uses regex replacement, not eval or Function constructor

### Browser API Security

- **File API**: Only reads files explicitly selected by user
- **Clipboard API**: Requires user gesture (click) to access
- **Crypto API**: Uses secure random number generation for UUIDs

## Future Enhancements

### Potential Features

1. **Custom System Placeholders**: Allow users to define custom placeholder functions
2. **Template Library**: Save and load frequently used templates
3. **Advanced CSV Options**: Support for different delimiters, encodings
4. **Conditional Logic**: Support for if/else logic in templates
5. **Nested Placeholder Resolution**: Support placeholders within placeholder values
6. **Export Formats**: Support for XML, YAML, TOML output formats
7. **Batch Processing**: Process multiple template-CSV pairs simultaneously
8. **Undo/Redo**: History management for template and CSV edits
9. **Collaboration**: Share templates via URL encoding
10. **API Mode**: Generate API request payloads with authentication headers

### Extensibility Points

The architecture supports extension through:
- **System Placeholder Registry**: Add new placeholders by extending the array
- **Parser Plugins**: Replace CSV parser with alternative implementations
- **Export Handlers**: Add new download formats by extending export logic
- **Validation Rules**: Add custom validation beyond JSON syntax

## Accessibility

### WCAG 2.1 Compliance

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets WCAG AA standards (4.5:1 for normal text)
- **Focus Indicators**: Visible focus states for all interactive elements
- **Error Announcements**: Validation errors announced to screen readers

### Inclusive Design

- **Responsive Layout**: Works on mobile, tablet, and desktop
- **Reduced Motion**: Respects `prefers-reduced-motion` for animations
- **High Contrast**: Supports high contrast mode
- **Font Scaling**: Layout adapts to user font size preferences

## Deployment

### Build Configuration

- **Production Build**: Vite optimizes bundle size with tree-shaking and minification
- **Asset Optimization**: Images and fonts optimized for web delivery
- **Code Splitting**: Lazy load non-critical components
- **Source Maps**: Generated for production debugging

### Hosting Requirements

- **Static Hosting**: Can be deployed to any static host (Netlify, Vercel, GitHub Pages)
- **No Backend**: No server-side requirements
- **CDN**: Benefits from CDN caching for global performance

### Browser Support

- **Primary Browser**: Chrome 90+ (Chromium-based browsers)
- **Required APIs**: File API, Clipboard API, Crypto API
- **Fallbacks**: Graceful degradation for unsupported features
