# Requirements Document

## Introduction

The User and Row Inputs feature extends the JSON-CSV Merge Tool by providing special placeholder types that prompt users for additional input values during the merge process. User inputs apply the same value across all generated outputs, while row inputs allow unique values for each CSV row. This enables dynamic data generation beyond what's available in CSV columns or system placeholders.

## Glossary

- **User Input Placeholder**: A special placeholder (`{{userInputString}}` or `{{userInputNumber}}`) that prompts for a single value applied to all output rows
- **Row Input Placeholder**: A special placeholder (`{{rowInputString}}` or `{{rowInputNumber}}`) that prompts for a unique value for each CSV row
- **Input Type**: The data type constraint for an input placeholder (string or number)
- **Input Validation**: The process of verifying that user-provided values match the expected type
- **Array Context**: The requirement that row input placeholders must be placed inside JSON array structures
- **The System**: The JSON-CSV Merge Tool application

## Requirements

### Requirement 1

**User Story:** As a user, I want to provide a single value that applies to all output rows, so that I can add consistent metadata without modifying my CSV data.

#### Acceptance Criteria

1. WHEN the JSON template contains `{{userInputString}}` THEN the System SHALL prompt the user for a text input
2. WHEN the JSON template contains `{{userInputNumber}}` THEN the System SHALL prompt the user for a numeric input
3. WHEN a user provides a value for a user input placeholder THEN the System SHALL apply that value to all generated output rows
4. WHEN multiple user input placeholders are present THEN the System SHALL prompt for each unique placeholder
5. WHEN a user input placeholder appears multiple times in the template THEN the System SHALL use the same value for all occurrences

### Requirement 2

**User Story:** As a user, I want to provide unique values for each CSV row, so that I can add row-specific data that isn't in my CSV file.

#### Acceptance Criteria

1. WHEN the JSON template contains `{{rowInputString}}` inside an array THEN the System SHALL prompt for text input for each CSV row
2. WHEN the JSON template contains `{{rowInputNumber}}` inside an array THEN the System SHALL prompt for numeric input for each CSV row
3. WHEN a user provides row input values THEN the System SHALL apply each value to its corresponding CSV row
4. WHEN multiple row input placeholders are present THEN the System SHALL prompt for each unique placeholder per row
5. WHEN a row input placeholder appears multiple times in the array template THEN the System SHALL use the same value for all occurrences within that row

### Requirement 3

**User Story:** As a user, I want number inputs to be rendered as JSON numbers, so that my output has correct data types.

#### Acceptance Criteria

1. WHEN a `{{userInputNumber}}` placeholder is merged THEN the System SHALL output the value without quotes as a JSON number
2. WHEN a `{{rowInputNumber}}` placeholder is merged THEN the System SHALL output the value without quotes as a JSON number
3. WHEN a number input contains a valid numeric value THEN the System SHALL preserve the numeric format in the output
4. WHEN a number input is used in a string context THEN the System SHALL convert it to a string representation

### Requirement 4

**User Story:** As a user, I want to see validation errors for invalid number inputs, so that I can correct them before merging.

#### Acceptance Criteria

1. WHEN a user enters non-numeric text in a number input field THEN the System SHALL display a validation error
2. WHEN a user enters an empty value in a number input field THEN the System SHALL display a validation error
3. WHEN a number input has a validation error THEN the System SHALL prevent the merge operation
4. WHEN a user corrects an invalid number input THEN the System SHALL remove the validation error and allow merging

### Requirement 5

**User Story:** As a user, I want row input placeholders to only work inside arrays, so that the system can properly associate values with rows.

#### Acceptance Criteria

1. WHEN a row input placeholder is placed outside a JSON array THEN the System SHALL display an error message
2. WHEN a row input placeholder is placed inside a JSON array THEN the System SHALL allow the merge operation
3. WHEN displaying row input placement errors THEN the System SHALL list all incorrectly placed placeholders
4. WHEN row input placement errors exist THEN the System SHALL prevent the merge operation
5. WHEN all row input placeholders are correctly placed THEN the System SHALL not display placement errors

### Requirement 6

**User Story:** As a user, I want a clear interface to enter user input values, so that I can provide the required data efficiently.

#### Acceptance Criteria

1. WHEN user input placeholders are detected THEN the System SHALL display a user input prompt section
2. WHEN displaying the user input prompt THEN the System SHALL show each required input with its placeholder name
3. WHEN displaying the user input prompt THEN the System SHALL indicate whether each input expects text or a number
4. WHEN displaying the user input prompt THEN the System SHALL show a description that values apply to all rows
5. WHEN all required user inputs are provided THEN the System SHALL enable the merge operation

### Requirement 7

**User Story:** As a user, I want a clear interface to enter row input values, so that I can provide unique data for each CSV row.

#### Acceptance Criteria

1. WHEN row input placeholders are detected and properly placed THEN the System SHALL display a row input prompt section
2. WHEN displaying the row input prompt THEN the System SHALL show a table with one row per CSV row
3. WHEN displaying the row input table THEN the System SHALL show row numbers and context from the CSV data
4. WHEN displaying the row input table THEN the System SHALL provide input fields for each required row input placeholder
5. WHEN displaying the row input table THEN the System SHALL show completion status for each row
6. WHEN all row inputs are provided for all rows THEN the System SHALL enable the merge operation

### Requirement 8

**User Story:** As a user, I want autocomplete to show row input placeholders only when appropriate, so that I don't accidentally place them incorrectly.

#### Acceptance Criteria

1. WHEN autocomplete is triggered inside a JSON array THEN the System SHALL include row input placeholders in suggestions
2. WHEN autocomplete is triggered outside a JSON array THEN the System SHALL exclude row input placeholders from suggestions
3. WHEN displaying row input placeholders in autocomplete THEN the System SHALL mark them with an "Array only" indicator
4. WHEN a user selects a row input placeholder from autocomplete THEN the System SHALL insert it at the cursor position

### Requirement 9

**User Story:** As a user, I want to see merge status that accounts for input requirements, so that I know what's needed before I can generate results.

#### Acceptance Criteria

1. WHEN user input placeholders are present but not filled THEN the System SHALL display a status message indicating user inputs are required
2. WHEN row input placeholders are present but not filled THEN the System SHALL display a status message indicating row inputs are required
3. WHEN row input placeholders are incorrectly placed THEN the System SHALL display a status message about placement errors
4. WHEN all input requirements are met THEN the System SHALL display a ready status
5. WHEN displaying merge status THEN the System SHALL prioritize showing the next required action

### Requirement 10

**User Story:** As a user, I want input placeholders to work with transformation methods, so that I can format input values like other placeholders.

#### Acceptance Criteria

1. WHEN a user input placeholder has methods applied THEN the System SHALL transform the user-provided value
2. WHEN a row input placeholder has methods applied THEN the System SHALL transform each row-specific value
3. WHEN methods are chained on input placeholders THEN the System SHALL apply them sequentially
4. WHEN displaying input prompts THEN the System SHALL show the base placeholder name without methods
