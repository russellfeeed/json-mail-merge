# Placeholder Transformations Design Document

## Overview

The Placeholder Transformations feature extends the JSON-CSV Merge Tool by enabling users to apply transformation methods to placeholder values during the merge process. This feature allows users to chain multiple methods (e.g., `{{name.toUpperCase().slugify()}}`) to transform CSV data, system-generated values, and user inputs into the desired format without manual post-processing.

The design leverages a functional approach where each method is a pure transformation function that can be composed with others. The system parses placeholders to extract the base name and method chain, then applies transformations sequentially from left to right.

## Architecture

### High-Level Architecture

The placeholder transformation system consists of four main layers:

1. **Parsing Layer**: Extracts placeholder names and method chains from JSON templates
2. **Method Registry**: Maintains a catalog of available transformation methods with their implementations
3. **Transformation Engine**: Applies method chains to values in the correct sequence
4. **UI Integration**: Provides autocomplete and visual feedback for method usage

### Component Interaction Flow

```
JSON Template → Parser → Extract Placeholders with Methods
                              ↓
CSV/System/User Data → Value Resolution → Base Values
                              ↓
Method Registry ← Transformation Engine → Apply Methods Sequentially
                              ↓
                        Transformed Values → Merged JSON Output
```

### Design Rationale

**Method Chaining Approach**: We chose left-to-right sequential application because it matches user intuition (reading order) and functional composition patterns familiar to developers. This makes the behavior predictable and easy to reason about.

**Pure Functions**: Each transformation method is implemented as a pure function (no side effects, deterministic output) to ensure consistent results and enable easy testing.

**Graceful Degradation**: Unknown methods are silently ignored rather than causing errors, allowing templates to be forward-compatible and preventing merge failures due to typos.

## Components and Interfaces

### 1. Placeholder Method Registry (`placeholderMethods.ts`)

**Purpose**: Central registry of all available transformation methods with their implementations.

**Interface**:
```typescript
interface PlaceholderMethod {
  name: string;           // Display name with parentheses (e.g., "toLowerCase()")
  description: string;    // Human-readable description for UI
  apply: (value: string) => string;  // Pure transformation function
}

// Registry of all methods
const placeholderMethods: Record<string, PlaceholderMethod>
```

**Available Methods**:
- **Case Transformations**: `toLowerCase()`, `toUpperCase()`, `capitalize()`, `titleCase()`, `camelCase()`, `snakeCase()`
- **String Manipulation**: `trim()`, `reverse()`, `length()`
- **URL/Slug Generation**: `slugify()`

**Design Decision**: Using a record/map structure allows O(1) lookup by method name and makes it easy to add new methods without modifying core logic.

### 2. Placeholder Parser (`parsePlaceholder` function)

**Purpose**: Extracts the base placeholder name and ordered list of methods from a placeholder string.

**Interface**:
```typescript
interface ParsedPlaceholder {
  full: string;        // Original placeholder text
  baseName: string;    // Base name without methods (e.g., "name")
  methods: string[];   // Ordered array of method names (e.g., ["toUpperCase", "slugify"])
}

function parsePlaceholder(placeholder: string): ParsedPlaceholder
```

**Parsing Logic**:
1. Remove `{{` and `}}` delimiters if present
2. Use regex `/\.([a-zA-Z]+)\(\)/g` to extract all method calls
3. Extract base name as everything before the first dot
4. Return structured data with base name and method array

**Design Decision**: Regex-based parsing is simple and sufficient for the method syntax. The ordered array preserves the sequence for sequential application.

### 3. Transformation Engine (`applyMethods` function)

**Purpose**: Applies a sequence of transformation methods to a value.

**Interface**:
```typescript
function applyMethods(value: string, methods: string[]): string
```

**Algorithm**:
1. Start with the input value
2. For each method name in the methods array:
   - Look up the method in the registry
   - If found, apply the transformation function
   - If not found, skip (graceful degradation)
3. Return the final transformed value

**Error Handling**: Empty or null values are handled by individual method implementations. Methods should be defensive and handle edge cases gracefully.

### 4. Merge Integration (`jsonMerge.ts`)

**Purpose**: Integrates placeholder transformation into the merge process.

**Key Functions**:
- `extractPlaceholders()`: Returns base names only (for CSV column matching)
- `extractFullPlaceholders()`: Returns complete placeholders with methods (for UI display)
- `mergePlaceholders()`: Performs the actual merge with transformation support

**Merge Algorithm**:
1. Parse all placeholders in the template to extract base names and methods
2. Resolve base values from CSV data, system placeholders, user inputs, or row inputs
3. For each placeholder:
   - Get the base value
   - Apply the method chain using `applyMethods()`
   - Build a regex that matches the exact placeholder (including methods)
   - Replace in the template
4. Handle special cases (number placeholders, quoted values)

**Design Decision**: We build specific regexes for each placeholder to avoid accidental replacements and to handle method chains correctly.

### 5. Autocomplete UI (`PlaceholderAutocomplete.tsx`)

**Purpose**: Provides intelligent autocomplete for both placeholders and methods.

**Modes**:
- **Placeholder Mode**: Shows available placeholders (CSV columns, system, user input, row input)
- **Method Mode**: Shows available transformation methods when user types `.` after a placeholder

**Context Awareness**:
- Detects when cursor is after a valid placeholder name followed by `.`
- Filters suggestions based on typed characters
- Shows method descriptions and badges
- Handles keyboard navigation (Tab, Enter, Arrow keys)

**Design Decision**: Separate modes for placeholders vs methods provides clearer UX and allows context-specific filtering.

### 6. System Placeholder Resolution (`systemPlaceholders.ts`)

**Purpose**: Generates values for system placeholders and applies transformations.

**Integration**: The `resolveSystemPlaceholders()` function:
1. Finds all system placeholders in the template
2. Parses each to extract base name and methods
3. Generates the system value (e.g., current date, UUID)
4. Applies method transformations
5. Replaces in the template

**Design Decision**: System placeholders are resolved before CSV merge to ensure consistent values across all rows when used in array contexts.

## Data Models

### ParsedPlaceholder
```typescript
interface ParsedPlaceholder {
  full: string;        // "{{name.toUpperCase().slugify()}}"
  baseName: string;    // "name"
  methods: string[];   // ["toUpperCase", "slugify"]
}
```

### PlaceholderMethod
```typescript
interface PlaceholderMethod {
  name: string;           // "toLowerCase()"
  description: string;    // "Convert to lowercase"
  apply: (value: string) => string;
}
```

### Method Registry Structure
```typescript
Record<string, PlaceholderMethod>
// Key: method name without parentheses (e.g., "toLowerCase")
// Value: PlaceholderMethod object
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Method application order preservation
*For any* value and any sequence of valid methods, applying the methods sequentially from left to right should produce the same result as composing the method functions in that order.

**Validates: Requirements 1.2**

### Property 2: Base placeholder extraction consistency
*For any* placeholder string with methods, parsing should extract the base name such that it matches the portion before the first dot character.

**Validates: Requirements 1.1, 1.3, 1.4, 1.5**

### Property 3: Method chain parsing completeness
*For any* placeholder with N method calls in the format `.methodName()`, parsing should extract exactly N method names in the order they appear.

**Validates: Requirements 1.2**

### Property 4: Unknown method graceful handling
*For any* placeholder with an unrecognized method name, the transformation engine should skip that method and continue processing remaining methods without throwing errors.

**Validates: Requirements 8.1, 8.2**

### Property 5: Case transformation correctness
*For any* string value, applying case transformation methods (toLowerCase, toUpperCase, capitalize, titleCase) should produce output where all characters match the expected case pattern.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 6: Slugify URL-safety
*For any* string value, applying slugify() should produce output containing only lowercase letters, numbers, and hyphens, with no leading or trailing hyphens.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 7: camelCase format correctness
*For any* string value, applying camelCase() should produce output where the first character is lowercase and each word boundary is marked by an uppercase letter with no spaces or special characters.

**Validates: Requirements 2.5**

### Property 8: snakeCase format correctness
*For any* string value, applying snakeCase() should produce output containing only lowercase letters, numbers, and underscores, with no leading or trailing underscores.

**Validates: Requirements 2.6**

### Property 9: String manipulation correctness
*For any* string value, applying trim() should remove all leading and trailing whitespace, reverse() should reverse character order, and length() should return the character count as a string.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 10: Method chaining composition
*For any* value and any two valid methods M1 and M2, applying `{{value.M1().M2()}}` should produce the same result as `M2(M1(value))`.

**Validates: Requirements 1.2**

### Property 11: Placeholder type independence
*For any* transformation method and any placeholder type (CSV, system, user input, row input), the method should transform the resolved value identically regardless of the placeholder source.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 12: Empty value handling
*For any* transformation method, applying it to an empty string or null value should complete without throwing errors and return a valid string result.

**Validates: Requirements 8.3**

### Property 13: Autocomplete trigger accuracy
*For any* valid placeholder name followed by a dot character in the JSON editor, the system should display method autocomplete suggestions.

**Validates: Requirements 5.1**

### Property 14: Autocomplete filtering correctness
*For any* typed characters after the dot, the filtered method suggestions should include only methods whose names contain the typed substring (case-insensitive).

**Validates: Requirements 5.3**

### Property 15: Full placeholder display preservation
*For any* detected placeholder with methods, the UI display should show the complete placeholder string including all method calls in the correct order.

**Validates: Requirements 6.1, 6.3**

## Error Handling

### Parsing Errors
- **Invalid method syntax**: If method parsing fails, treat the placeholder as having no methods and use the base name only
- **Malformed placeholders**: Extract what can be extracted; gracefully degrade to base functionality

### Transformation Errors
- **Unknown methods**: Skip the unknown method and continue with the next method in the chain
- **Null/undefined values**: Individual methods should handle null/empty strings defensively (e.g., return empty string or "0" for length)
- **Type mismatches**: All methods work on string inputs; numeric conversions happen at the merge level

### UI Errors
- **Autocomplete positioning**: If position calculation fails, fall back to cursor position
- **Method insertion**: If insertion fails, allow manual typing without blocking the user

### Design Principle
The system follows a "fail gracefully" philosophy: errors should never break the merge process. Unknown methods are ignored, parsing errors fall back to simpler behavior, and UI errors don't prevent manual editing.

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Parsing Tests**:
- Parse placeholder with no methods: `{{name}}` → `{baseName: "name", methods: []}`
- Parse placeholder with one method: `{{name.toUpperCase()}}` → `{baseName: "name", methods: ["toUpperCase"]}`
- Parse placeholder with multiple methods: `{{name.toUpperCase().slugify()}}` → `{baseName: "name", methods: ["toUpperCase", "slugify"]}`
- Parse with whitespace: `{{ name .toUpperCase() }}` → correct extraction

**Method Application Tests**:
- Apply single method: `toLowerCase("HELLO")` → `"hello"`
- Apply method chain: `applyMethods("Hello World", ["toUpperCase", "slugify"])` → `"hello-world"`
- Apply unknown method: `applyMethods("test", ["unknown", "toUpperCase"])` → `"TEST"`

**Edge Cases**:
- Empty string input to all methods
- Null/undefined handling
- Special characters in slugify
- Unicode characters in case transformations
- Very long method chains (10+ methods)

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test should run a minimum of 100 iterations.

**Configuration**: Use fast-check with:
```typescript
fc.assert(fc.property(...), { numRuns: 100 })
```

**Test Tagging**: Each property test must include a comment linking to the design document:
```typescript
// Feature: placeholder-transformations, Property 1: Method application order preservation
```

**Property Test Implementations**:

1. **Method Order Preservation** (Property 1)
   - Generate: random string, random sequence of 2-5 valid methods
   - Test: Sequential application equals functional composition

2. **Base Name Extraction** (Property 2)
   - Generate: random base name, random method chain
   - Test: Parsed base name equals substring before first dot

3. **Method Chain Completeness** (Property 3)
   - Generate: random base name, N random methods (0-10)
   - Test: Parsed methods array has length N and correct order

4. **Unknown Method Handling** (Property 4)
   - Generate: random string, mix of valid and invalid method names
   - Test: No errors thrown, valid methods still applied

5. **Case Transformation Correctness** (Property 5)
   - Generate: random strings with mixed case
   - Test: Output matches expected case pattern for each method

6. **Slugify URL-Safety** (Property 6)
   - Generate: random strings with special characters, spaces, unicode
   - Test: Output matches `/^[a-z0-9]+(-[a-z0-9]+)*$/` or is empty

7. **camelCase Format** (Property 7)
   - Generate: random multi-word strings
   - Test: First char lowercase, no spaces, word boundaries uppercase

8. **snakeCase Format** (Property 8)
   - Generate: random multi-word strings
   - Test: All lowercase, underscores only, no leading/trailing underscores

9. **String Manipulation** (Property 9)
   - Generate: random strings with whitespace
   - Test: trim removes leading/trailing, reverse inverts, length counts correctly

10. **Method Chaining Composition** (Property 10)
    - Generate: random string, two random valid methods
    - Test: Chained application equals nested function calls

11. **Placeholder Type Independence** (Property 11)
    - Generate: random value, random method, random placeholder type
    - Test: Same transformation result regardless of source type

12. **Empty Value Handling** (Property 12)
    - Generate: empty string or null, random method
    - Test: No errors, returns valid string

13. **Autocomplete Filtering** (Property 14)
    - Generate: random filter string, method list
    - Test: All filtered results contain filter substring (case-insensitive)

### Integration Testing

Integration tests will verify end-to-end workflows:
- Complete merge with CSV data and method transformations
- System placeholder resolution with methods
- User input placeholders with methods
- Row input placeholders with methods in array contexts
- Autocomplete interaction with method insertion
- UI display of placeholders with method badges

### Test Organization

Tests will be co-located with source files:
- `placeholderMethods.test.ts` - Method registry and application tests
- `jsonMerge.test.ts` - Integration tests for merge with transformations
- `PlaceholderAutocomplete.test.tsx` - UI component tests

## Implementation Notes

### Performance Considerations
- Method lookup is O(1) using the record structure
- Regex compilation happens once per placeholder during merge
- Sequential method application is O(n) where n is the number of methods (typically 1-3)

### Extensibility
Adding new methods requires:
1. Add entry to `placeholderMethods` record
2. Implement the `apply` function
3. Add tests for the new method
4. No changes needed to parser, engine, or UI (autocomplete automatically includes new methods)

### Browser Compatibility
- All string methods use standard JavaScript APIs
- Regex patterns are ES2015 compatible
- UUID generation uses `crypto.randomUUID()` (requires HTTPS or localhost)

### Future Enhancements
- Method parameters: `{{name.substring(0, 5)}}`
- Custom user-defined methods
- Conditional transformations: `{{name.if(condition).then(method)}}`
- Method composition shortcuts: `{{name.urlSafe()}}` as alias for `{{name.toLowerCase().slugify()}}`
