# User Experience Enhancements Design Document

## Overview

This feature enhances the JSON-CSV Merge Tool's usability through three key components: an interactive guided tour using react-joyride, a preset template library for quick starts, and comprehensive placeholder reference documentation. These enhancements reduce the learning curve for new users while providing convenient shortcuts and reference materials for experienced users.

The design leverages existing UI components and patterns from the application, ensuring visual consistency and maintainable code. The tour system uses localStorage for persistence, templates are defined as simple configuration objects, and the help modal extends the existing PlaceholderHelpModal component.

## Architecture

### Component Structure

```
src/components/
├── AppTour.tsx (existing - enhance)
├── PlaceholderHelpModal.tsx (existing - enhance)
└── JsonEditor.tsx (existing - enhance template dropdown)
```

### Data Flow

1. **Tour Flow**: AppTour component → localStorage (persistence) → User interaction → Completion state
2. **Template Flow**: Template selection → JsonEditor state update → Placeholder detection → Validation
3. **Help Modal Flow**: Help button click → Modal display → Scrollable reference content → Close

### State Management

- **Tour State**: Managed by react-joyride with localStorage persistence
- **Template State**: Managed within JsonEditor component via onChange callback
- **Modal State**: Managed by Radix UI Dialog component (existing pattern)

## Components and Interfaces

### 1. AppTour Component (Enhancement)

**Location**: `src/components/AppTour.tsx`

**Current Implementation**: Already exists with basic tour functionality using react-joyride

**Enhancements Needed**:
- Expand tour steps to cover all major features (Requirements 11.1-11.6)
- Ensure visual consistency with application theme (Requirements 12.1-12.5)
- Maintain existing localStorage persistence and manual restart capability

**Interface**:
```typescript
export interface AppTourRef {
  startTour: () => void;
}

interface Step {
  target: string;        // CSS selector for element to highlight
  content: string;       // Explanation text
  placement: string;     // Tooltip position
  disableBeacon?: boolean;
}
```

**Design Rationale**: The existing react-joyride implementation already handles spotlight effects, overlay dimming, navigation controls, and progress indicators. We only need to expand the step definitions to cover all features mentioned in the requirements.

### 2. Preset Template System

**Location**: `src/components/JsonEditor.tsx`

**Current Implementation**: Already has a `presetTemplates` array and Select dropdown for template loading

**Enhancements Needed**:
- Expand template library with additional common use cases
- Ensure templates are easily maintainable and extensible

**Interface**:
```typescript
interface PresetTemplate {
  id: string;           // Unique identifier
  name: string;         // Display name in dropdown
  content: string;      // JSON template content
}

const presetTemplates: PresetTemplate[] = [
  // Template definitions
];
```

**Design Rationale**: The template system is already implemented with a clean separation between configuration and UI. Templates are defined as simple objects, making it easy for developers to add new templates without modifying component logic. The Select component from shadcn/ui provides a polished dropdown interface.

### 3. PlaceholderHelpModal Component (Enhancement)

**Location**: `src/components/PlaceholderHelpModal.tsx`

**Current Implementation**: Comprehensive modal with sections for different placeholder types and methods

**Enhancements Needed**:
- Ensure all documentation requirements are met (Requirements 7.1-7.6, 8.1-8.5, 9.1-9.5, 10.1-10.5)
- Verify organization, searchability, and visual clarity
- Add any missing special behavior explanations

**Interface**:
```typescript
export function PlaceholderHelpModal(): JSX.Element

// Uses existing Dialog component from shadcn/ui
// Content organized in sections with ScrollArea
```

**Design Rationale**: The existing modal already provides comprehensive documentation with visual badges, syntax highlighting, and organized sections. The ScrollArea component handles long content gracefully, and the Badge components distinguish placeholder types effectively.

## Data Models

### Tour Step Model

```typescript
interface TourStep {
  target: string;           // CSS selector (e.g., '[data-tour="json-editor"]')
  content: string;          // Instructional text
  placement: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;  // Skip initial beacon animation
}
```

### Template Model

```typescript
interface PresetTemplate {
  id: string;              // Kebab-case identifier (e.g., 'user-profile')
  name: string;            // Human-readable name (e.g., 'User Profile')
  content: string;         // Valid JSON string with placeholders
}
```

### Tour Persistence Model

```typescript
// Stored in localStorage
interface TourState {
  key: 'json-merge-tour-completed';
  value: 'true' | null;    // 'true' when completed, null when not
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tour persistence across sessions
*For any* user who completes or skips the tour, when they return to the application in a new session, the tour should not automatically start again.
**Validates: Requirements 1.5, 1.6**

### Property 2: Tour manual restart clears completion state
*For any* tour completion state, when a user clicks "Take Tour", the tour should start from the beginning regardless of previous completion status.
**Validates: Requirements 2.1, 2.2**

### Property 3: Template loading replaces editor content
*For any* preset template and any existing JSON editor content, when a user selects that template, the editor should contain exactly the template's content.
**Validates: Requirements 5.3, 5.4**

### Property 4: Template content is valid JSON
*For any* preset template in the configuration, the content should parse as valid JSON.
**Validates: Requirements 6.3**

### Property 5: Tour steps highlight correct elements
*For any* tour step with a target selector, when that step is displayed, the System should highlight the element matching that selector.
**Validates: Requirements 4.1, 4.2**

### Property 6: Help modal displays all placeholder types
*For any* help modal display, the content should include sections for CSV column placeholders, system placeholders, user input placeholders, and row input placeholders.
**Validates: Requirements 7.3, 7.4, 7.5, 7.6**

### Property 7: Help modal documents all methods
*For any* available placeholder method in the system, the help modal should display that method's name, syntax, description, and example.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 8: Tour navigation maintains step order
*For any* sequence of "Next" button clicks during the tour, the displayed steps should follow the defined order without skipping or repeating.
**Validates: Requirements 3.2**

### Property 9: Tour back navigation reverses order
*For any* sequence of "Back" button clicks during the tour, the displayed steps should follow the reverse of the defined order.
**Validates: Requirements 3.3**

### Property 10: Template selection triggers validation
*For any* template selection, the System should immediately validate the JSON and detect placeholders in the loaded content.
**Validates: Requirements 5.5**

## Error Handling

### Tour Errors

**Missing Target Elements**:
- **Scenario**: Tour step targets an element that doesn't exist in the DOM
- **Handling**: react-joyride automatically skips steps with missing targets
- **User Experience**: Tour continues to next valid step without error message
- **Prevention**: Use data-tour attributes on stable elements that always render

**LocalStorage Unavailable**:
- **Scenario**: Browser has localStorage disabled or in private mode
- **Handling**: Tour will show on every visit (graceful degradation)
- **User Experience**: No error shown; tour simply doesn't persist completion state
- **Mitigation**: Wrap localStorage calls in try-catch blocks

### Template Errors

**Invalid JSON in Template**:
- **Scenario**: Developer adds template with malformed JSON
- **Handling**: JSON validation will catch error when template is loaded
- **User Experience**: "Invalid JSON" indicator appears in editor
- **Prevention**: Validate all templates during development; consider adding automated tests

**Template Loading Failure**:
- **Scenario**: Template content fails to load into editor
- **Handling**: Editor state remains unchanged
- **User Experience**: No visible change; user can try again
- **Mitigation**: Ensure onChange callback is always defined

### Help Modal Errors

**Content Rendering Issues**:
- **Scenario**: Help modal content fails to render properly
- **Handling**: ScrollArea component provides fallback scrolling
- **User Experience**: Content remains accessible even if styling breaks
- **Mitigation**: Use semantic HTML and test with various content lengths

**Missing Documentation**:
- **Scenario**: New placeholder type added but not documented in modal
- **Handling**: No automatic detection; requires manual update
- **User Experience**: Users won't see documentation for new placeholders
- **Prevention**: Add documentation updates to definition of done for new placeholder types

## Testing Strategy

### Unit Testing

**Tour Component Tests**:
- Test that tour starts automatically on first visit
- Test that tour doesn't start on subsequent visits after completion
- Test that manual restart clears completion state
- Test localStorage interaction with mocked storage

**Template System Tests**:
- Test that template selection updates editor content
- Test that all preset templates contain valid JSON
- Test that template dropdown displays all available templates
- Test that template loading triggers placeholder detection

**Help Modal Tests**:
- Test that modal opens and closes correctly
- Test that all placeholder types are documented
- Test that all methods are documented with examples
- Test that scroll functionality works with long content

### Property-Based Testing

The design document identifies 10 correctness properties that should be validated through property-based testing. Each property represents a universal rule that should hold across all valid inputs.

**Testing Framework**: Use `fast-check` for TypeScript property-based testing

**Test Configuration**: Each property test should run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Property Test Tagging**: Each property-based test must include a comment tag in this format:
```typescript
// Feature: user-experience-enhancements, Property 1: Tour persistence across sessions
```

### Integration Testing

**End-to-End Tour Flow**:
- Verify complete tour flow from start to finish
- Test tour interaction with actual DOM elements
- Verify visual appearance matches design specifications

**Template to Merge Flow**:
- Load template → Add CSV data → Verify merge works correctly
- Test with multiple different templates
- Verify placeholder detection works for all templates

**Help Modal Accessibility**:
- Test keyboard navigation through modal content
- Verify screen reader compatibility
- Test modal focus management

### Visual Regression Testing

- Capture screenshots of tour steps to ensure consistent styling
- Verify help modal layout with various content lengths
- Test template dropdown appearance and behavior

## Implementation Notes

### Tour Step Definitions

Tour steps should use `data-tour` attributes on target elements for stable selectors. These attributes are already present in the Index.tsx component:
- `data-tour="json-editor"` - JSON template editor section
- `data-tour="csv-editor"` - CSV data editor section
- `data-tour="array-mode"` - Array mode toggle section
- `data-tour="merge-status"` - Status indicator section
- `data-tour="results"` - Results display section
- `data-tour="load-example"` - Load example button

### Template Organization

Templates should be organized by use case:
- **Basic**: Simple object templates for common data structures
- **Array**: Templates demonstrating array mode functionality
- **Advanced**: Templates with method chaining and complex transformations
- **Domain-Specific**: Industry-specific templates (e.g., Cleardown, API payloads)

### Help Modal Content Structure

The help modal should maintain this section order for optimal learning flow:
1. How to Use Placeholders (introduction)
2. CSV Column Placeholders (most common use case)
3. System Placeholders (auto-generated values)
4. User Input Placeholders (global inputs)
5. Row Input Placeholders (per-row inputs with special constraints)
6. Placeholder Methods (transformations)
7. Number Placeholders (special formatting)

### Accessibility Considerations

**Tour Accessibility**:
- Ensure tour tooltips are keyboard navigable
- Provide skip functionality for users who want to bypass the tour
- Use sufficient color contrast for tour UI elements
- Ensure focus management works correctly during tour

**Help Modal Accessibility**:
- Modal should trap focus when open
- Escape key should close modal
- Modal should return focus to trigger button when closed
- Content should be screen reader friendly with proper heading hierarchy

**Template Dropdown Accessibility**:
- Dropdown should be keyboard navigable
- Selected template should be announced to screen readers
- Dropdown should have proper ARIA labels

### Performance Considerations

**Tour Performance**:
- Tour initialization is delayed by 500ms to ensure DOM is ready
- Tour state is stored in localStorage for instant retrieval
- react-joyride handles spotlight rendering efficiently

**Template Loading**:
- Templates are defined as static objects (no network requests)
- Template content is loaded synchronously into editor
- Placeholder detection runs automatically after template load

**Help Modal Performance**:
- Modal content is rendered only when opened (lazy rendering)
- ScrollArea component virtualizes long content if needed
- Modal uses Radix UI's optimized dialog implementation

### Browser Compatibility

**LocalStorage Support**:
- All modern browsers support localStorage
- Graceful degradation for browsers with disabled storage
- No polyfills required

**CSS Features**:
- Tour styling uses CSS custom properties (widely supported)
- Backdrop blur effects may degrade in older browsers
- Fallback styles provided for unsupported features

### Maintenance and Extensibility

**Adding New Templates**:
1. Define template object with id, name, and content
2. Add to `presetTemplates` array in JsonEditor.tsx
3. Ensure content is valid JSON with appropriate placeholders
4. Test template loading and merge functionality

**Adding New Tour Steps**:
1. Add `data-tour` attribute to target element
2. Define step object with target, content, and placement
3. Add to `tourSteps` array in AppTour.tsx
4. Test step highlighting and navigation

**Updating Help Documentation**:
1. Locate relevant section in PlaceholderHelpModal.tsx
2. Update content while maintaining existing structure
3. Ensure visual badges and formatting are consistent
4. Test modal scrolling and layout with new content

## Dependencies

### Existing Dependencies (Already Installed)

- **react-joyride** (^2.9.3): Tour functionality with spotlight effects and navigation
- **@radix-ui/react-dialog**: Modal/dialog component for help modal
- **@radix-ui/react-select**: Dropdown component for template selection
- **@radix-ui/react-scroll-area**: Scrollable area for help modal content
- **lucide-react**: Icon library for UI elements

### No New Dependencies Required

All functionality can be implemented using existing dependencies and React built-ins. The design leverages the current tech stack effectively.

## Design Decisions and Rationales

### Decision 1: Use react-joyride for Tour

**Rationale**: react-joyride is already installed and provides all required tour functionality out of the box, including spotlight effects, overlay dimming, navigation controls, and progress indicators. Building a custom tour system would be significantly more complex and error-prone.

**Alternatives Considered**:
- Custom tour implementation: Rejected due to complexity and maintenance burden
- intro.js: Rejected because react-joyride is already installed and integrated

### Decision 2: Static Template Configuration

**Rationale**: Templates are defined as static objects in the component file rather than fetched from an API or stored in a database. This approach is simpler, faster, and sufficient for the current use case. Templates can be easily added by developers without backend changes.

**Alternatives Considered**:
- Database-stored templates: Rejected as over-engineering for current needs
- User-created templates: Deferred to future enhancement; current focus is on curated examples

### Decision 3: Enhance Existing Components

**Rationale**: The PlaceholderHelpModal and AppTour components already exist with solid implementations. Enhancing them is more efficient than creating new components and ensures consistency with existing patterns.

**Alternatives Considered**:
- Create new components: Rejected to avoid duplication and maintain consistency
- Complete rewrite: Rejected because existing implementations are well-structured

### Decision 4: localStorage for Tour Persistence

**Rationale**: localStorage provides simple, synchronous persistence for tour completion state without requiring backend infrastructure. It's appropriate for non-critical user preferences.

**Alternatives Considered**:
- Session storage: Rejected because tour completion should persist across sessions
- Cookies: Rejected as unnecessary complexity for client-side-only data
- Backend storage: Rejected as over-engineering for a simple preference

### Decision 5: Comprehensive Help Modal Over Inline Tooltips

**Rationale**: A single comprehensive help modal provides better organization and searchability than scattered inline tooltips. Users can reference all documentation in one place, and the modal can be opened on demand without cluttering the interface.

**Alternatives Considered**:
- Inline tooltips for each placeholder: Rejected due to UI clutter and poor organization
- Separate documentation page: Rejected because modal keeps users in context
- Contextual help only: Rejected because users need comprehensive reference

### Decision 6: Manual Tour Restart via Button

**Rationale**: Providing a "Take Tour" button in the header allows users to restart the tour at any time, which is useful for reviewing features or demonstrating the tool to others. This is more user-friendly than requiring users to clear localStorage manually.

**Alternatives Considered**:
- Settings panel for tour reset: Rejected as adding unnecessary UI complexity
- Automatic tour on major updates: Rejected to avoid annoying returning users
- No manual restart: Rejected because users requested this functionality

## Future Enhancements

### Template Categories and Search

As the template library grows, consider adding:
- Category grouping in dropdown (e.g., "Basic", "Advanced", "Domain-Specific")
- Search/filter functionality for templates
- Template preview before loading

### User-Created Templates

Allow users to:
- Save their own templates to localStorage
- Share templates via URL or export
- Import templates from files

### Tour Customization

Potential enhancements:
- Multiple tour tracks (beginner, advanced, feature-specific)
- Tour progress tracking and analytics
- Contextual tours triggered by specific actions

### Interactive Help

Enhance help modal with:
- Live playground for testing placeholders
- Copy-to-clipboard for examples
- Search functionality within documentation

### Accessibility Improvements

- Add keyboard shortcuts for common actions
- Improve screen reader announcements
- Add high contrast mode support
- Provide tour transcript for users who skip visual tour
