# Requirements Document

## Introduction

The Placeholder Transformations feature extends the JSON-CSV Merge Tool by enabling users to apply transformation methods to placeholder values during the merge process. Users can chain multiple methods to transform CSV data, system-generated values, and user inputs into the desired format without manual post-processing.

## Glossary

- **Placeholder Method**: A function that transforms a placeholder value, written in the format `.methodName()` after a placeholder name
- **Method Chaining**: The ability to apply multiple transformation methods sequentially to a single placeholder value
- **Base Placeholder**: The original placeholder name before any methods are applied (e.g., `name` in `{{name.toUpperCase()}}`)
- **Transformed Placeholder**: A placeholder with one or more methods applied (e.g., `{{name.toUpperCase().slugify()}}`)
- **The System**: The JSON-CSV Merge Tool application

## Requirements

### Requirement 1

**User Story:** As a user, I want to apply transformation methods to placeholders, so that I can format values without manual post-processing.

#### Acceptance Criteria

1. WHEN a placeholder contains a method in the format `.methodName()` THEN the System SHALL apply that transformation to the placeholder value during merge
2. WHEN multiple methods are chained on a placeholder THEN the System SHALL apply them sequentially from left to right
3. WHEN a method is applied to a CSV placeholder THEN the System SHALL transform the value from the corresponding CSV column
4. WHEN a method is applied to a system placeholder THEN the System SHALL transform the generated system value
5. WHEN a method is applied to a user input placeholder THEN the System SHALL transform the user-provided value

### Requirement 2

**User Story:** As a user, I want to convert text to different cases, so that I can ensure consistent formatting across my data.

#### Acceptance Criteria

1. WHEN a placeholder contains `.toLowerCase()` THEN the System SHALL convert all characters to lowercase
2. WHEN a placeholder contains `.toUpperCase()` THEN the System SHALL convert all characters to uppercase
3. WHEN a placeholder contains `.capitalize()` THEN the System SHALL capitalize only the first letter and lowercase the rest
4. WHEN a placeholder contains `.titleCase()` THEN the System SHALL capitalize the first letter of each word
5. WHEN a placeholder contains `.camelCase()` THEN the System SHALL convert the text to camelCase format removing spaces and special characters
6. WHEN a placeholder contains `.snakeCase()` THEN the System SHALL convert the text to snake_case format replacing spaces with underscores

### Requirement 3

**User Story:** As a user, I want to create URL-friendly slugs from text, so that I can generate valid identifiers and URLs.

#### Acceptance Criteria

1. WHEN a placeholder contains `.slugify()` THEN the System SHALL convert the text to lowercase
2. WHEN a placeholder contains `.slugify()` THEN the System SHALL replace spaces with hyphens
3. WHEN a placeholder contains `.slugify()` THEN the System SHALL remove special characters except hyphens
4. WHEN a placeholder contains `.slugify()` THEN the System SHALL remove leading and trailing hyphens

### Requirement 4

**User Story:** As a user, I want to manipulate string content, so that I can derive additional values from my data.

#### Acceptance Criteria

1. WHEN a placeholder contains `.trim()` THEN the System SHALL remove leading and trailing whitespace
2. WHEN a placeholder contains `.reverse()` THEN the System SHALL reverse the character order
3. WHEN a placeholder contains `.length()` THEN the System SHALL replace the value with its character count as a string

### Requirement 5

**User Story:** As a user, I want autocomplete suggestions for methods, so that I can discover and apply transformations easily.

#### Acceptance Criteria

1. WHEN a user types a dot after a valid placeholder name in the JSON editor THEN the System SHALL display method autocomplete suggestions
2. WHEN the method autocomplete is displayed THEN the System SHALL show all available method names with descriptions
3. WHEN a user types characters after the dot THEN the System SHALL filter method suggestions to match the typed text
4. WHEN a user selects a method from autocomplete THEN the System SHALL insert the complete method with parentheses
5. WHEN a user presses Tab or Enter with method autocomplete open THEN the System SHALL insert the selected method

### Requirement 6

**User Story:** As a user, I want to see which placeholders have methods applied, so that I can understand what transformations will occur.

#### Acceptance Criteria

1. WHEN displaying detected placeholders THEN the System SHALL show the full placeholder including all methods
2. WHEN a placeholder has methods applied THEN the System SHALL display a badge indicating the number of methods
3. WHEN displaying placeholder tags THEN the System SHALL maintain the complete method chain in the tag text

### Requirement 7

**User Story:** As a user, I want method transformations to work with all placeholder types, so that I have consistent transformation capabilities.

#### Acceptance Criteria

1. WHEN methods are applied to CSV column placeholders THEN the System SHALL transform values from CSV data
2. WHEN methods are applied to system placeholders THEN the System SHALL transform generated values
3. WHEN methods are applied to user input placeholders THEN the System SHALL transform user-provided values
4. WHEN methods are applied to row input placeholders THEN the System SHALL transform per-row input values

### Requirement 8

**User Story:** As a user, I want invalid methods to be handled gracefully, so that my merge process doesn't fail unexpectedly.

#### Acceptance Criteria

1. WHEN a placeholder contains an unrecognized method name THEN the System SHALL ignore that method and continue processing
2. WHEN method parsing fails THEN the System SHALL treat the placeholder as having no methods
3. WHEN a method is applied to an empty or null value THEN the System SHALL handle it without errors
