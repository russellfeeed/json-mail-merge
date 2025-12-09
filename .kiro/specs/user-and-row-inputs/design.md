# Design Document: User and Row Inputs

## Overview

The User and Row Inputs feature extends the JSON-CSV Merge Tool by introducing special placeholder types that prompt users for additional input values during the merge process. This enables dynamic data generation beyond what's available in CSV columns or system placeholders.

**Key Capabilities:**
- User input placeholders (`{{userInputString}}`, `{{userInputNumber}}`) apply a single value across all output rows
- Row input placeholders (`{{rowInputString}}`, `{{rowInputNumber}}`) allow unique values for each CSV row
- Type-safe inputs with validation for string and number types
- Context-aware autocomplete that only suggests row inputs when inside JSON arrays
- Seamless integration with existing placeholder transformation methods

**Design Rationale:** The distinction between user inputs (global) and row inputs (per-row) provides flexibility for different use cases. User inputs are ideal for metadata like batch IDs or timestamps that should be consistent across all outputs. Row inputs enable per-row customization without requiring CSV modifications, useful for adding notes, priorities, or other row-specific data.

## Architecture

### Component Structure

The feature integrates into the existing application architecture with minimal changes:

```
Index.tsx (Main Page)
├── JsonEditor (with enhanced autocomplete)
├── CsvEditor (unchanged)
├── UserInputPrompt (new component)
├── RowInputPrompt (new component)
└── MergeResults (unchanged)

Core Libraries
├── systemPlaceholders.ts (extended)
├── jsonMerge.ts (extended)
├── jsonArrayDetection.ts (new)
└── placeholderMethods.ts (unchanged)
```

**Design Decision:** Components are separated by concern - UserInputPrompt handles global inputs, RowInputPrompt handles per-row inputs. This separation makes the UI clearer and allows independent validation logic.


### Data Flow

1. **Detection Phase**: Extract user and row input placeholders from JSON template
2. **Validation Phase**: Verify row inputs are inside arrays, validate input types
3. **Collection Phase**: Display input prompts and collect user-provided values
4. **Merge Phase**: Apply user inputs globally, row inputs per-row during merge
5. **Output Phase**: Generate merged JSON with proper type formatting

**Design Rationale:** The validation phase occurs before collection to provide early feedback. Row input placement validation prevents runtime errors and guides users toward correct usage.

## Components and Interfaces

### UserInputPrompt Component

**Purpose:** Collects global input values that apply to all output rows.

**Props:**
```typescript
interface UserInputPromptProps {
  requiredInputs: string[];           // Placeholder names detected in template
  values: Record<string, string>;     // Current input values
  onChange: (values: Record<string, string>) => void;
}
```

**Behavior:**
- Displays one input field per unique user input placeholder
- Shows placeholder name, type indicator (string/number), and description
- Validates number inputs in real-time
- Prevents merge when validation errors exist

**Design Decision:** Real-time validation provides immediate feedback. Using controlled inputs ensures state consistency and enables validation before merge.

### RowInputPrompt Component

**Purpose:** Collects unique input values for each CSV row.

**Props:**
```typescript
interface RowInputPromptProps {
  requiredInputs: string[];                              // Placeholder names
  csvRows: Record<string, string>[];                     // CSV data for context
  values: Record<number, Record<string, string>>;        // Row index -> inputs
  onChange: (values: Record<number, Record<string, string>>) => void;
}
```

**Behavior:**
- Displays table with one row per CSV row
- Shows row number, CSV context (first 2 columns), and input fields
- Tracks completion status per row
- Validates number inputs per field

**Design Decision:** Table layout provides clear row-to-input mapping. Showing CSV context helps users understand which row they're filling. Completion indicators provide progress feedback.


### Enhanced PlaceholderAutocomplete Component

**Modifications:**
- Add `isInsideArray` prop to determine context
- Filter row input placeholders based on array context
- Display "Array only" indicator for row inputs

**Props (new/modified):**
```typescript
interface PlaceholderAutocompleteProps {
  // ... existing props
  isInsideArray?: boolean;  // NEW: determines if cursor is in array
}
```

**Behavior:**
- When `isInsideArray` is false, exclude row input placeholders from suggestions
- When `isInsideArray` is true, include row input placeholders with visual indicator
- Maintain existing behavior for system placeholders, user inputs, and CSV columns

**Design Decision:** Context-aware filtering prevents users from placing row inputs incorrectly. The visual indicator educates users about the constraint without blocking them.

## Data Models

### Placeholder Definitions

```typescript
// Existing in systemPlaceholders.ts
export interface UserInputPlaceholder {
  name: string;           // e.g., 'userInputString'
  description: string;    // Human-readable description
  type: 'string' | 'number';
}

export const userInputPlaceholders: UserInputPlaceholder[] = [
  {
    name: 'userInputString',
    description: 'Prompts for a text input',
    type: 'string'
  },
  {
    name: 'userInputNumber',
    description: 'Prompts for a numeric input',
    type: 'number'
  }
];

export const rowInputPlaceholders: UserInputPlaceholder[] = [
  {
    name: 'rowInputString',
    description: 'Prompts for text input per row',
    type: 'string'
  },
  {
    name: 'rowInputNumber',
    description: 'Prompts for numeric input per row',
    type: 'number'
  }
];
```

**Design Decision:** Reusing the same interface for user and row inputs simplifies the codebase. The distinction is made by which array they belong to, not by type structure.


### Input Value Storage

```typescript
// User inputs: single value per placeholder
type UserInputValues = Record<string, string>;
// Example: { userInputString: "Batch-123", userInputNumber: "42" }

// Row inputs: value per placeholder per row
type RowInputValues = Record<number, Record<string, string>>;
// Example: { 0: { rowInputString: "Note A" }, 1: { rowInputString: "Note B" } }
```

**Design Decision:** Storing all values as strings simplifies state management. Type conversion happens during merge based on placeholder configuration. Row inputs use row index as key for efficient lookup.

### Validation State

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  placeholder: string;
  rowIndex?: number;  // undefined for user inputs
  message: string;
}
```

**Design Decision:** Centralized validation state enables comprehensive error reporting. Optional rowIndex distinguishes between user and row input errors.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified:

**Redundant Properties:**
- 3.3 is redundant with 3.1 and 3.2 (format preservation is already tested by verifying JSON number output)
- 1.1 and 1.2 can be combined into a single detection property
- 2.1 and 2.2 can be combined into a single detection property
- 5.2 and 5.5 are inverses of 5.1 and can be covered by testing the validation function comprehensively
- 4.2 is an edge case that will be covered by property test generators for 4.1

**Combined Properties:**
- User input detection (1.1, 1.2) → Single property testing placeholder detection
- Row input detection (2.1, 2.2) → Single property testing placeholder detection
- Number formatting (3.1, 3.2) → Single property testing JSON number output

This reduces the property count while maintaining comprehensive coverage.

### Correctness Properties

Property 1: User input placeholder detection
*For any* JSON template containing user input placeholders (userInputString or userInputNumber), the detection function should return all unique user input placeholder names
**Validates: Requirements 1.1, 1.2, 1.4**

Property 2: User input value consistency across rows
*For any* user input value and any set of CSV rows, all merged output rows should contain the same user input value
**Validates: Requirements 1.3, 1.5**

Property 3: Row input placeholder detection
*For any* JSON template containing row input placeholders inside arrays, the detection function should return all unique row input placeholder names
**Validates: Requirements 2.1, 2.2, 2.4**

Property 4: Row input value per-row mapping
*For any* row input values and CSV rows, the merged output at index i should contain the row input value provided for row i
**Validates: Requirements 2.3, 2.5**

Property 5: Number placeholder JSON formatting
*For any* number input placeholder (user or row) with a valid numeric value, the merged JSON output should contain an actual JSON number (not a quoted string)
**Validates: Requirements 3.1, 3.2**

Property 6: Number placeholder string context conversion
*For any* number input placeholder used in a string context (e.g., within a larger string), the output should contain the string representation of the number
**Validates: Requirements 3.4**

Property 7: Number input validation
*For any* non-numeric string value in a number input field, the validation function should return an error
**Validates: Requirements 4.1**

Property 8: Validation blocks merge
*For any* template with validation errors (invalid numbers or placement errors), the canMerge flag should be false
**Validates: Requirements 4.3, 5.4**

Property 9: Valid inputs enable merge
*For any* template with all inputs filled and valid, the canMerge flag should be true
**Validates: Requirements 4.4, 6.5, 7.6**

Property 10: Row input placement validation
*For any* row input placeholder placed outside a JSON array, the validation function should return a placement error
**Validates: Requirements 5.1, 5.3**

Property 11: Autocomplete context-aware filtering
*For any* cursor position inside a JSON array, the autocomplete suggestions should include row input placeholders; for positions outside arrays, row inputs should be excluded
**Validates: Requirements 8.1, 8.2**

Property 12: Method transformation on user inputs
*For any* user input placeholder with transformation methods, the merged output should contain the transformed value (methods applied sequentially)
**Validates: Requirements 10.1, 10.3**

Property 13: Method transformation on row inputs
*For any* row input placeholder with transformation methods, each row's merged output should contain the transformed value for that row
**Validates: Requirements 10.2, 10.3**

Property 14: Input prompt displays base names
*For any* input placeholder with methods, the input prompt should display only the base placeholder name without method suffixes
**Validates: Requirements 10.4**


## Error Handling

### Input Validation Errors

**Number Input Validation:**
- Empty values in number fields → Display "Please enter a valid number"
- Non-numeric text in number fields → Display "Please enter a valid number"
- Validation occurs on input change (real-time feedback)
- Errors prevent merge operation

**Row Input Placement Errors:**
- Row input outside array → Display error with placeholder name
- Multiple placement errors → List all incorrectly placed placeholders
- Errors prevent merge operation
- Validation occurs when template changes

**Design Decision:** Real-time validation provides immediate feedback. Blocking merge when errors exist prevents invalid output generation.

### Edge Cases

**Empty Templates:**
- No placeholders detected → No input prompts shown
- Only system placeholders → No input prompts shown

**Empty CSV:**
- Row inputs required but no CSV rows → Show warning, disable merge
- User inputs work normally (not dependent on CSV)

**Duplicate Placeholders:**
- Same placeholder multiple times → Prompt once, apply everywhere
- Deduplication happens during detection phase

**Mixed Contexts:**
- Number placeholder in string template → Convert to string
- Number placeholder in numeric context → Output as JSON number
- Context detection based on surrounding characters


## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific examples and edge cases:

**Detection Functions:**
- Test extracting user input placeholders from templates
- Test extracting row input placeholders from templates
- Test deduplication of repeated placeholders
- Test handling templates with no input placeholders

**Validation Functions:**
- Test number validation with valid numbers (integers, decimals, negative)
- Test number validation with invalid inputs (text, empty, special characters)
- Test row input placement detection inside arrays
- Test row input placement detection outside arrays
- Test nested array scenarios

**Merge Functions:**
- Test merging with user inputs only
- Test merging with row inputs only
- Test merging with both user and row inputs
- Test number formatting in JSON output
- Test method application on input placeholders

**UI Components:**
- Test UserInputPrompt renders correct number of fields
- Test RowInputPrompt renders correct number of rows
- Test validation error display
- Test completion status indicators

### Property-Based Testing Approach

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript property testing library). Each test will run a minimum of 100 iterations.

**Test Configuration:**
```typescript
import fc from 'fast-check';

// Configure to run 100+ iterations per property
fc.assert(fc.property(...), { numRuns: 100 });
```

**Generators:**
- `arbitraryJsonTemplate()` - Generate valid JSON templates with placeholders
- `arbitraryUserInputs()` - Generate user input placeholder names and values
- `arbitraryRowInputs()` - Generate row input placeholder names and values per row
- `arbitraryCsvRows()` - Generate CSV row data
- `arbitraryMethods()` - Generate valid transformation method chains
- `arbitraryNumericString()` - Generate valid numeric strings
- `arbitraryNonNumericString()` - Generate invalid numeric strings

**Property Tests:**

Each property test will be tagged with a comment referencing the design document:

```typescript
// **Feature: user-and-row-inputs, Property 1: User input placeholder detection**
// **Validates: Requirements 1.1, 1.2, 1.4**
```

**Key Properties to Test:**
1. Detection properties (Properties 1, 3) - Verify all placeholders are found
2. Consistency properties (Properties 2, 4) - Verify values applied correctly
3. Formatting properties (Properties 5, 6) - Verify JSON type correctness
4. Validation properties (Properties 7, 8, 9, 10) - Verify error detection
5. Context properties (Property 11) - Verify autocomplete filtering
6. Transformation properties (Properties 12, 13, 14) - Verify method application

**Design Decision:** Property-based testing is ideal for this feature because it involves parsing, validation, and transformation - areas where edge cases are common. Generators will create diverse inputs including edge cases like empty strings, special characters, nested structures, and boundary values.

### Integration Testing

Integration tests will verify end-to-end workflows:

- Complete user input workflow: detect → prompt → collect → merge
- Complete row input workflow: detect → validate → prompt → collect → merge
- Mixed workflow with both user and row inputs
- Workflow with validation errors and recovery
- Workflow with method transformations

**Design Decision:** Integration tests ensure components work together correctly and state flows properly through the application.


## Implementation Details

### Array Detection Algorithm

The `isInsideJsonArray` function determines if a cursor position is within a JSON array:

```typescript
function isInsideJsonArray(text: string, cursorPosition: number): boolean {
  let arrayDepth = 0;
  let inString = false;
  let escapeNext = false;
  
  // Scan from start to cursor position
  for (let i = 0; i < cursorPosition; i++) {
    const char = text[i];
    
    // Handle escape sequences
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    
    // Track string boundaries
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    // Track array depth (only outside strings)
    if (!inString) {
      if (char === '[') arrayDepth++;
      if (char === ']') arrayDepth = Math.max(0, arrayDepth - 1);
    }
  }
  
  return arrayDepth > 0;
}
```

**Design Rationale:** This algorithm correctly handles:
- Nested arrays (tracks depth)
- Strings containing brackets (ignores brackets in strings)
- Escaped quotes in strings (handles escape sequences)
- Malformed JSON (gracefully degrades)

### Number Formatting Logic

Number placeholders require special handling during merge:

```typescript
// In mergePlaceholders function
if (isNumberPlaceholder && !isNaN(Number(transformedValue))) {
  // Match both quoted and unquoted versions
  const quotedRegex = new RegExp(`"\\{\\{\\s*${escapedBase}${methodsPattern}\\s*\\}\\}"`, 'g');
  const unquotedRegex = new RegExp(`\\{\\{\\s*${escapedBase}${methodsPattern}\\s*\\}\\}`, 'g');
  
  // Replace with unquoted number
  result = result.replace(quotedRegex, transformedValue);
  result = result.replace(unquotedRegex, transformedValue);
}
```

**Design Rationale:** JSON editors often auto-quote values. This logic handles both cases:
- `"{{userInputNumber}}"` → `42` (remove quotes)
- `{{userInputNumber}}` → `42` (already unquoted)

This ensures valid JSON output regardless of how users format their templates.

### State Management

The main page (Index.tsx) manages input state:

```typescript
// User inputs: global values
const [userInputValues, setUserInputValues] = useState<Record<string, string>>({});

// Row inputs: per-row values
const [rowInputValues, setRowInputValues] = useState<Record<number, Record<string, string>>>({});
```

**Design Rationale:** Separate state objects keep concerns separated. User inputs are flat (one value per placeholder), while row inputs are nested (one value per placeholder per row). This structure mirrors the conceptual model and simplifies validation logic.

### Merge-Ready Condition

The `canMerge` flag determines when merge is allowed:

```typescript
const canMerge = 
  jsonValidation.valid &&                           // Valid JSON
  parsedCsv.rows.length > 0 &&                      // Has CSV data
  (!arrayMode || selectedArrayPath) &&              // Array selected if needed
  (requiredUserInputs.length === 0 || userInputsValid) &&  // User inputs valid
  (requiredRowInputs.length === 0 || rowInputsValid) &&    // Row inputs valid
  !hasRowInputPlacementErrors;                      // No placement errors
```

**Design Rationale:** All conditions must be true for merge to proceed. This prevents partial or invalid merges. The condition is computed reactively, so UI updates automatically when state changes.


## UI/UX Considerations

### Progressive Disclosure

Input prompts only appear when needed:
- No placeholders → No prompts
- Only user inputs → Show UserInputPrompt only
- Only row inputs → Show RowInputPrompt only (if valid placement)
- Both types → Show both prompts in order

**Design Rationale:** Reduces cognitive load by showing only relevant UI. Users aren't overwhelmed with empty forms.

### Visual Hierarchy

Components are ordered by workflow:
1. JSON Editor (define template)
2. CSV Editor (provide data)
3. Array Mode Toggle (configure output)
4. User Input Prompt (global values)
5. Row Input Prompt (per-row values)
6. Merge Status (readiness check)
7. Results (output)

**Design Rationale:** Top-to-bottom flow matches the mental model of the merge process.

### Feedback Mechanisms

**Real-time Validation:**
- Number inputs show errors immediately on invalid input
- Red border on invalid fields
- Error icon and message below field

**Progress Indicators:**
- Row input table shows "X/Y rows complete"
- Checkmark icon for completed rows
- Merge status shows next required action

**Visual Cues:**
- User input placeholders tagged with "Input" badge (amber)
- Row input placeholders tagged with "Row" badge (cyan)
- "Array only" indicator in autocomplete
- Animated pulse on merge-ready indicator

**Design Rationale:** Multiple feedback channels ensure users always know the system state and what action is needed next.

### Accessibility

**Keyboard Navigation:**
- Tab through input fields in logical order
- Enter to submit (when ready)
- Escape to close autocomplete

**Screen Readers:**
- Labels associated with inputs via htmlFor
- Error messages announced via aria-live regions
- Status indicators have descriptive text

**Visual Accessibility:**
- High contrast error states
- Icons paired with text
- Color not sole indicator of state

**Design Rationale:** Ensures feature is usable by all users regardless of input method or assistive technology.


## Performance Considerations

### Validation Performance

**Debouncing:**
- Input validation runs on every keystroke
- For large templates, validation could be expensive
- Consider debouncing validation by 300ms for better UX

**Memoization:**
- Detection and validation results are memoized with useMemo
- Recompute only when template or CSV changes
- Prevents unnecessary re-renders

**Design Rationale:** Real-time feedback is important, but shouldn't cause UI lag. Memoization ensures expensive operations run only when inputs change.

### Merge Performance

**Batch Processing:**
- Current implementation merges all rows synchronously
- For large CSV files (1000+ rows), this could block UI
- Consider Web Workers for large merges

**Memory Management:**
- Row input state grows with CSV size
- For 1000 rows × 5 inputs = 5000 values in state
- Current approach is acceptable for typical use (< 100 rows)

**Design Rationale:** Current implementation prioritizes simplicity. Performance optimizations can be added if users report issues with large datasets.

## Security Considerations

### Input Sanitization

**User-Provided Values:**
- All input values are treated as plain text
- No code execution or eval() used
- JSON.parse() only on validated JSON

**Template Injection:**
- Placeholders use regex replacement, not template literals
- No risk of code injection through placeholder values

**Design Rationale:** The merge process is purely data transformation. No user input is executed as code.

### Data Privacy

**Client-Side Processing:**
- All merge operations happen in browser
- No data sent to servers
- CSV and JSON data never leave user's machine

**Design Rationale:** Privacy-first approach. Users can merge sensitive data without concerns about data leakage.

## Future Enhancements

### Potential Improvements

**Input Types:**
- Date inputs with calendar picker
- Boolean inputs with checkbox
- Enum inputs with dropdown

**Validation:**
- Custom validation rules (regex patterns, min/max)
- Cross-field validation (e.g., startDate < endDate)

**Bulk Operations:**
- Copy value to all rows
- Fill down from first row
- Import row inputs from CSV

**Templates:**
- Save input configurations
- Reuse input values across sessions
- Input value suggestions based on history

**Design Rationale:** These enhancements would improve usability but aren't required for MVP. They can be added based on user feedback.

## Dependencies

### External Libraries

- **React** - UI framework
- **fast-check** - Property-based testing library
- **Vitest** - Test runner
- **shadcn/ui** - UI components (already in use)

### Internal Dependencies

- `placeholderMethods.ts` - Method transformation system
- `jsonMerge.ts` - Core merge logic
- `systemPlaceholders.ts` - Placeholder definitions

**Design Rationale:** Minimal new dependencies. fast-check is the only addition, specifically for property-based testing.

## Migration Strategy

### Backward Compatibility

**Existing Features:**
- System placeholders continue to work unchanged
- CSV column placeholders continue to work unchanged
- Method transformations continue to work unchanged

**New Features:**
- User and row input placeholders are additive
- Templates without input placeholders work as before
- No breaking changes to existing functionality

**Design Rationale:** The feature extends the system without modifying existing behavior. Users can adopt input placeholders gradually.

### Rollout Plan

1. **Phase 1:** Implement core detection and validation
2. **Phase 2:** Implement UI components (prompts)
3. **Phase 3:** Integrate with merge logic
4. **Phase 4:** Add autocomplete enhancements
5. **Phase 5:** Write comprehensive tests

**Design Rationale:** Incremental implementation allows testing at each phase. Core logic is validated before UI is built.

