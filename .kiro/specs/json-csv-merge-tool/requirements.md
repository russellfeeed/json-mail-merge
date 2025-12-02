# Requirements Document

## Introduction

The JSON-CSV Merge Tool is a web-based application that enables users to merge CSV data into JSON templates using placeholder substitution. The system supports two operational modes: individual file generation (one JSON per CSV row) and array mode (single JSON with all rows as array items). The tool provides real-time validation, interactive editing, and system-generated placeholders for dynamic values like timestamps and UUIDs.

## Glossary

- **JSON Template**: A JSON structure containing placeholder markers in the format `{{placeholderName}}` that will be replaced with actual values
- **CSV Data**: Comma-separated values data with headers in the first row and data rows following
- **Placeholder**: A marker in the format `{{name}}` within the JSON template that indicates where values should be substituted
- **System Placeholder**: A built-in placeholder that generates dynamic values (e.g., `{{uuid}}`, `{{currentDatetime}}`) without requiring CSV data
- **CSV Placeholder**: A placeholder that corresponds to a column header in the CSV data
- **Array Mode**: An operational mode where all CSV rows are merged into a single JSON file as array items
- **Individual Mode**: An operational mode where each CSV row generates a separate JSON file
- **Merge Operation**: The process of replacing placeholders in the JSON template with values from CSV rows or system-generated values
- **The System**: The JSON-CSV Merge Tool application

## Requirements

### Requirement 1

**User Story:** As a user, I want to input a JSON template with placeholders, so that I can define the structure for my merged data.

#### Acceptance Criteria

1. WHEN a user pastes JSON text into the template editor THEN the System SHALL accept and display the input
2. WHEN a user uploads a JSON file THEN the System SHALL read the file contents and populate the template editor
3. WHEN a user drags and drops a JSON file onto the template editor THEN the System SHALL read the file contents and populate the template editor
4. WHEN the JSON template contains syntax errors THEN the System SHALL display an error message indicating the validation failure
5. WHEN the JSON template is syntactically valid THEN the System SHALL display a validation success indicator

### Requirement 2

**User Story:** As a user, I want the system to detect placeholders in my JSON template, so that I know which CSV columns are required.

#### Acceptance Criteria

1. WHEN the JSON template contains text matching the pattern `{{placeholderName}}` THEN the System SHALL extract and display all unique placeholder names
2. WHEN a placeholder is a system placeholder THEN the System SHALL mark it with a "SYS" indicator
3. WHEN a placeholder is not a system placeholder THEN the System SHALL treat it as a CSV placeholder requiring a matching CSV column
4. WHEN the System detects placeholders THEN the System SHALL display them in a visual list below the template editor

### Requirement 3

**User Story:** As a user, I want to input CSV data with column headers, so that I can provide the values to merge into my JSON template.

#### Acceptance Criteria

1. WHEN a user pastes CSV text into the CSV editor THEN the System SHALL accept and display the input
2. WHEN a user uploads a CSV file THEN the System SHALL read the file contents and populate the CSV editor
3. WHEN a user drags and drops a CSV file onto the CSV editor THEN the System SHALL read the file contents and populate the CSV editor
4. WHEN the CSV data is provided THEN the System SHALL parse the first line as column headers
5. WHEN the CSV data contains quoted fields THEN the System SHALL correctly handle commas within quoted values
6. WHEN the CSV data contains escaped quotes THEN the System SHALL correctly parse double-quote escape sequences

### Requirement 4

**User Story:** As a user, I want to see a preview of my parsed CSV data in table format, so that I can verify the data was parsed correctly.

#### Acceptance Criteria

1. WHEN CSV data is successfully parsed THEN the System SHALL display the data in a tabular format with headers and rows
2. WHEN displaying the CSV preview THEN the System SHALL highlight column headers that match CSV placeholders in the JSON template
3. WHEN displaying the CSV preview THEN the System SHALL show row numbers for each data row
4. WHEN the CSV preview is displayed THEN the System SHALL indicate the total number of rows in the tab label

### Requirement 5

**User Story:** As a user, I want the system to validate that my CSV has all required columns, so that I know if the merge can proceed successfully.

#### Acceptance Criteria

1. WHEN the JSON template contains CSV placeholders THEN the System SHALL identify which CSV column headers are required
2. WHEN a required CSV column header is missing from the CSV data THEN the System SHALL display a warning message listing the missing columns
3. WHEN all required CSV column headers are present in the CSV data THEN the System SHALL not display any missing column warnings

### Requirement 6

**User Story:** As a user, I want to merge CSV data into JSON templates in individual mode, so that I can generate one JSON file per CSV row.

#### Acceptance Criteria

1. WHEN the JSON template is valid and CSV data contains rows and individual mode is active THEN the System SHALL generate one merged JSON result for each CSV row
2. WHEN merging in individual mode THEN the System SHALL replace each CSV placeholder with the corresponding value from the current CSV row
3. WHEN merging in individual mode THEN the System SHALL resolve all system placeholders with freshly generated values for each result
4. WHEN merging in individual mode THEN the System SHALL format each result as properly indented JSON with 2-space indentation

### Requirement 7

**User Story:** As a user, I want to merge CSV data into JSON templates in array mode, so that I can generate a single JSON file with all rows as array items.

#### Acceptance Criteria

1. WHEN array mode is enabled and an array path is selected THEN the System SHALL generate a single merged JSON result containing all CSV rows
2. WHEN merging in array mode THEN the System SHALL identify arrays in the JSON template and present them as selectable targets
3. WHEN merging in array mode THEN the System SHALL use the first item in the selected array as the template for generating array items
4. WHEN merging in array mode THEN the System SHALL replace the selected array with items generated from each CSV row
5. WHEN merging in array mode THEN the System SHALL resolve system placeholders in both the array items and the surrounding template structure

### Requirement 8

**User Story:** As a user, I want to use system placeholders for dynamic values, so that I can include timestamps, UUIDs, and other generated data without CSV input.

#### Acceptance Criteria

1. WHEN the JSON template contains `{{currentDatetime}}` THEN the System SHALL replace it with the current datetime in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.SSS)
2. WHEN the JSON template contains `{{currentDate}}` THEN the System SHALL replace it with the current date in YYYY-MM-DD format
3. WHEN the JSON template contains `{{currentTime}}` THEN the System SHALL replace it with the current time in HH:mm:ss format
4. WHEN the JSON template contains `{{timestamp}}` THEN the System SHALL replace it with the current Unix timestamp in milliseconds
5. WHEN the JSON template contains `{{uuid}}` THEN the System SHALL replace it with a randomly generated UUID v4
6. WHEN the JSON template contains `{{randomNumber}}` THEN the System SHALL replace it with a random integer between 0 and 999999

### Requirement 9

**User Story:** As a user, I want to download individual merged JSON files, so that I can use them in other applications.

#### Acceptance Criteria

1. WHEN merged results are displayed THEN the System SHALL provide a download button for each individual result
2. WHEN a user clicks the download button for a result THEN the System SHALL download the JSON content as a file with a sequential filename
3. WHEN a user clicks the "Download All" button THEN the System SHALL download a single JSON file containing all results as an array of objects

### Requirement 10

**User Story:** As a user, I want to copy merged JSON to my clipboard, so that I can quickly paste it into other tools.

#### Acceptance Criteria

1. WHEN merged results are displayed THEN the System SHALL provide a copy button for each individual result
2. WHEN a user clicks the copy button THEN the System SHALL copy the JSON content to the system clipboard
3. WHEN the copy operation succeeds THEN the System SHALL display a visual confirmation indicator for 2 seconds

### Requirement 11

**User Story:** As a user, I want to see real-time merge status, so that I understand what steps remain before I can generate results.

#### Acceptance Criteria

1. WHEN no JSON template is provided THEN the System SHALL display a status message indicating a template is needed
2. WHEN the JSON template is invalid THEN the System SHALL display a status message indicating JSON errors must be fixed
3. WHEN the JSON template is valid but no CSV data is provided THEN the System SHALL display a status message indicating CSV data is needed
4. WHEN array mode is enabled but no array is selected THEN the System SHALL display a status message indicating an array must be selected
5. WHEN all requirements are met THEN the System SHALL display a status message indicating the number of files ready to generate

### Requirement 12

**User Story:** As a user, I want autocomplete suggestions when typing placeholders, so that I can quickly insert valid placeholder names.

#### Acceptance Criteria

1. WHEN a user types `{{` in the JSON template editor THEN the System SHALL display an autocomplete dropdown with available placeholders
2. WHEN the autocomplete dropdown is displayed THEN the System SHALL include all system placeholder names
3. WHEN CSV data is loaded and the autocomplete dropdown is displayed THEN the System SHALL include all CSV column headers
4. WHEN a user types additional characters after `{{` THEN the System SHALL filter the autocomplete suggestions to match the typed text
5. WHEN a user selects a suggestion from the autocomplete dropdown THEN the System SHALL insert the complete placeholder with closing braces
6. WHEN a user presses Escape while the autocomplete dropdown is open THEN the System SHALL close the dropdown

### Requirement 13

**User Story:** As a user, I want to generate sample CSV data from my template placeholders, so that I can quickly test my template structure.

#### Acceptance Criteria

1. WHEN the JSON template contains CSV placeholders THEN the System SHALL provide a "Generate Sample" button in the CSV editor
2. WHEN a user clicks the "Generate Sample" button THEN the System SHALL create CSV data with headers matching all CSV placeholders
3. WHEN generating sample CSV data THEN the System SHALL include one sample row with values prefixed by "sample_"

### Requirement 14

**User Story:** As a user, I want to load example data, so that I can quickly understand how the tool works.

#### Acceptance Criteria

1. WHEN a user clicks the "Load Example" button THEN the System SHALL populate the JSON template with example content
2. WHEN a user clicks the "Load Example" button THEN the System SHALL populate the CSV data with example content
3. WHEN array mode is active and a user clicks "Load Example" THEN the System SHALL load an example template containing an array structure
4. WHEN individual mode is active and a user clicks "Load Example" THEN the System SHALL load an example template for individual file generation

### Requirement 15

**User Story:** As a user, I want to clear all inputs, so that I can start fresh without manually deleting content.

#### Acceptance Criteria

1. WHEN a user clicks the "Clear All" button THEN the System SHALL remove all content from the JSON template editor
2. WHEN a user clicks the "Clear All" button THEN the System SHALL remove all content from the CSV data editor
3. WHEN a user clicks the "Clear All" button THEN the System SHALL reset the selected array path

### Requirement 16

**User Story:** As a user, I want to replace datetime system placeholders with fixed values, so that I can use specific timestamps instead of dynamic ones.

#### Acceptance Criteria

1. WHEN a datetime system placeholder is detected THEN the System SHALL provide an edit button on the placeholder tag
2. WHEN a user clicks the edit button on a datetime placeholder THEN the System SHALL display a popover with replacement options
3. WHEN a user selects "Use current value" THEN the System SHALL replace all instances of that placeholder with the current datetime value
4. WHEN a user selects a time offset option THEN the System SHALL replace all instances of that placeholder with the offset datetime value
5. WHERE the placeholder is `{{currentDatetime}}`, `{{currentDate}}`, or `{{timestamp}}` THEN the System SHALL provide "+1 hour" and "+1 day" offset options
6. WHERE the placeholder is `{{currentTime}}` THEN the System SHALL provide a "+1 hour" offset option

### Requirement 17

**User Story:** As a user, I want visual feedback on the merge readiness, so that I can quickly see if all prerequisites are met.

#### Acceptance Criteria

1. WHEN displaying merge status THEN the System SHALL show three status indicators representing template validity, CSV data presence, and merge readiness
2. WHEN the JSON template is valid THEN the System SHALL display the first status indicator in green
3. WHEN CSV data contains rows THEN the System SHALL display the second status indicator in green
4. WHEN all merge prerequisites are met THEN the System SHALL display the third status indicator in green with a pulsing animation

### Requirement 18

**User Story:** As a user, I want to see syntax highlighting for placeholders in my JSON template, so that I can easily identify them.

#### Acceptance Criteria

1. WHEN the JSON template contains placeholders THEN the System SHALL highlight them with a distinct background color
2. WHEN displaying the JSON template THEN the System SHALL maintain proper text formatting and line breaks
3. WHEN a user edits the JSON template THEN the System SHALL update the syntax highlighting in real-time
