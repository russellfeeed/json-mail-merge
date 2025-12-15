# Implementation Plan: Playwright E2E Testing

- [x] 1. Install and configure Playwright









  - Install @playwright/test and fast-check as dev dependencies
  - Run Playwright init command to generate initial configuration
  - Configure playwright.config.ts with base URL, browsers, and test settings
  - Add npm scripts for running tests (test:e2e, test:e2e:ui, test:e2e:debug, test:e2e:headed, test:e2e:report)
  - Create tests directory structure (e2e/, fixtures/)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create test fixtures and utilities





  - [x] 2.1 Create test data fixtures


    - Create tests/fixtures/test-data.ts with sample JSON templates (simple, with placeholders, with transformations, with user inputs, with row inputs)
    - Create sample CSV data (simple, with headers, multi-row, with special characters)
    - Define TypeScript interfaces for test data structures
    - _Requirements: 8.4_
  
  - [x] 2.2 Create page object model


    - Create tests/fixtures/page-objects.ts with MergeToolPage class
    - Implement navigation methods (goto)
    - Implement JSON editor methods (getJsonEditor, setJsonContent, getJsonValidationError, selectPresetTemplate, clearJsonEditor)
    - Implement CSV editor methods (getCsvEditor, setCsvContent, clearCsvEditor)
    - Implement merge operation methods (clickMergeButton, getMergeResults, downloadResults)
    - Implement user input methods (fillUserInputPrompt, fillRowInputPrompt, cancelInputPrompt)
    - Implement tour/help methods (startTour, skipTour, openPlaceholderHelp, closePlaceholderHelp)
    - _Requirements: 8.2_
  


  - [x] 2.3 Create test helper utilities





    - Create tests/fixtures/test-helpers.ts with TestHelpers class
    - Implement parseJsonResults helper
    - Implement validateJsonStructure helper
    - Implement compareMergedOutput helper
    - Implement generateLargeCsv helper
    - Implement waitForMergeComplete helper
    - _Requirements: 8.3_

- [x] 3. Implement JSON editor tests




  - [x] 3.1 Write basic JSON editor tests


    - Test initial state displays JSON editor (example test)
    - Test selecting preset template populates editor (example test)
    - Test clearing JSON editor removes content (example test)
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [x] 3.2 Write property test for JSON validation
















    - **Property 1: JSON validation consistency**
    - **Validates: Requirements 2.2**
    - Use fast-check to generate valid JSON strings
    - Verify no validation errors appear for valid JSON
    - Run minimum 10 iterations
  
  - [x] 3.3 Write property test for invalid JSON error display









    - **Property 2: Invalid JSON error display**
    - **Validates: Requirements 2.3**
    - Use fast-check to generate invalid JSON strings
    - Verify error messages appear for invalid JSON
    - Run minimum 10 iterations

- [x] 4. Implement CSV editor tests




  - [x] 4.1 Write basic CSV editor tests


    - Test initial state displays CSV editor (example test)
    - Test clearing CSV editor removes content (example test)
    - _Requirements: 3.1, 3.4_
  
  - [x] 4.2 Write property test for CSV header recognition









    - **Property 3: CSV header recognition**
    - **Validates: Requirements 3.3**
    - Use fast-check to generate CSV with random headers
    - Verify headers are recognized and available as placeholders
    - Run minimum 10 iterations
  
  - [x] 4.3 Write property test for special character preservation





    - **Property 10: Special character preservation**
    - **Validates: Requirements 3.5, 9.4**
    - Use fast-check to generate CSV values with special characters (quotes, commas, newlines, unicode)
    - Verify characters are correctly preserved in merge output
    - Run minimum 10 iterations

- [ ] 5. Implement merge workflow tests


  - [x] 5.1 Write basic merge workflow tests



    - Test merging simple JSON template with simple CSV (example test)
    - Test download results button triggers download (example test)
    - _Requirements: 4.1, 4.4_
  
  - [x] 5.2 Write property test for placeholder replacement






    - **Property 4: Placeholder replacement completeness**
    - **Validates: Requirements 4.2**
    - Use fast-check to generate JSON templates with placeholders matching CSV columns
    - Verify no unreplaced placeholder syntax remains in output
    - Run minimum 10 iterations
  
  - [x] 5.3 Write property test for row count preservation








    - **Property 5: Row count preservation**
    - **Validates: Requirements 4.1, 4.5**
    - Use fast-check to generate CSV with N rows
    - Verify merge produces exactly N JSON objects
    - Run minimum 10 iterations

- [x] 6. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement placeholder transformation tests




  - [x] 7.1 Write basic transformation tests


    - Test system placeholders generate appropriate values (UUID, timestamp, etc.) (example test)
    - Test invalid transformation methods are handled gracefully (example test)
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 7.2 Write property test for transformation method application
    - **Property 6: Transformation method application**
    - **Validates: Requirements 5.1, 5.5**
    - Use fast-check to generate random strings and transformation methods (toUpperCase, toLowerCase, trim, capitalize)
    - Verify output equals expected transformation result
    - Run minimum 10 iterations
  
  - [ ]* 7.3 Write property test for transformation chain ordering
    - **Property 7: Transformation chain ordering**
    - **Validates: Requirements 5.2**
    - Use fast-check to generate random transformation chains
    - Verify transformations are applied left-to-right
    - Run minimum 10 iterations

- [x] 8. Implement user input and row input tests




  - [x] 8.1 Write basic user input tests


    - Test canceling input prompt is handled gracefully (example test)
    - Test multiple input prompts appear in sequence (example test)
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 8.2 Write property test for user input propagation
    - **Property 8: User input propagation**
    - **Validates: Requirements 6.3**
    - Use fast-check to generate JSON with userInput placeholders and random input values
    - Verify input value appears in all merged rows
    - Run minimum 10 iterations
  
  - [ ]* 8.3 Write property test for row input prompt count
    - **Property 9: Row input prompt count**
    - **Validates: Requirements 6.2**
    - Use fast-check to generate JSON with rowInput placeholders and CSV with N rows
    - Verify system prompts exactly N times
    - Run minimum 10 iterations

- [x] 9. Implement tour and help feature tests




  - [x] 9.1 Write tour and help tests

    - Test first visit offers interactive tour (example test)
    - Test starting tour guides through features (example test)
    - Test accessing placeholder help displays documentation (example test)
    - Test viewing help content shows examples (example test)
    - Test dismissing tour/help remembers preference (example test)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Implement error handling and edge case tests
  - [ ] 10.1 Write error handling tests
    - Test network request failures are handled gracefully (example test with mocked failures)
    - Test browser storage errors are handled appropriately (example test)
    - _Requirements: 9.2, 9.5_

- [ ] 11. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Configure CI/CD integration
  - Create GitHub Actions workflow file (or equivalent CI config)
  - Configure workflow to install dependencies and run Playwright tests
  - Set up test artifact upload (reports, screenshots, traces)
  - Add status badge to README
  - Document CI/CD setup in project documentation
  - _Requirements: 10.2, 10.3, 10.4_
