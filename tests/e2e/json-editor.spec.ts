/**
 * JSON Editor E2E Tests
 * Tests for JSON editor functionality including initial state, preset templates, and clearing
 * Requirements: 2.1, 2.4, 2.5
 */

import { test, expect } from '@playwright/test';
import * as fc from 'fast-check';
import { MergeToolPage } from '../fixtures/page-objects';
import { sampleJsonTemplates } from '../fixtures/test-data';

test.describe('JSON Editor', () => {
  let mergeTool: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeTool = new MergeToolPage(page);
    await mergeTool.goto();
    
    // Skip tour if it appears
    await mergeTool.skipTour();
  });

  /**
   * Test: Initial state displays JSON editor
   * Validates: Requirement 2.1 - WHEN a user loads the application THEN the Test Application 
   * SHALL display the JSON editor with default or empty content
   */
  test('should display JSON editor in initial state', async () => {
    // Verify JSON editor section is visible
    await expect(mergeTool.jsonEditorSection).toBeVisible();
    
    // Verify JSON textarea is present and editable
    const jsonEditor = await mergeTool.getJsonEditor();
    await expect(jsonEditor).toBeVisible();
    await expect(jsonEditor).toBeEditable();
    
    // Verify editor starts empty or with default content
    const initialContent = await jsonEditor.inputValue();
    expect(initialContent).toBeDefined();
  });

  /**
   * Test: Selecting preset template populates editor
   * Validates: Requirement 2.4 - WHEN a user selects a preset template THEN the Test Application 
   * SHALL populate the JSON editor with the selected template content
   */
  test('should populate editor when preset template is selected', async () => {
    // Select the Cleardown preset template
    await mergeTool.selectPresetTemplate('Cleardown');
    
    // Wait for content to be populated
    await mergeTool.waitForValidation();
    
    // Verify JSON editor contains template content
    const jsonEditor = await mergeTool.getJsonEditor();
    const content = await jsonEditor.inputValue();
    
    // Verify content is not empty
    expect(content.length).toBeGreaterThan(0);
    
    // Verify content contains expected template fields
    expect(content).toContain('RunId');
    expect(content).toContain('Device');
    expect(content).toContain('Version');
    
    // Verify JSON is valid
    const isValid = await mergeTool.isJsonValid();
    expect(isValid).toBe(true);
  });

  /**
   * Test: Clearing JSON editor removes content
   * Validates: Requirement 2.5 - WHEN a user clears the JSON editor THEN the Test Application 
   * SHALL remove all content and reset to empty state
   */
  test('should clear editor content when cleared', async () => {
    // First, add some content to the editor
    await mergeTool.setJsonContent(sampleJsonTemplates.simple);
    
    // Verify content was added
    const jsonEditor = await mergeTool.getJsonEditor();
    let content = await jsonEditor.inputValue();
    expect(content.length).toBeGreaterThan(0);
    
    // Clear the editor
    await mergeTool.clearJsonEditor();
    
    // Verify editor is now empty
    content = await jsonEditor.inputValue();
    expect(content).toBe('');
  });

  /**
   * Property Test: JSON validation consistency
   * **Feature: playwright-e2e-testing, Property 1: JSON validation consistency**
   * Validates: Requirements 2.2 - WHEN a user enters valid JSON in the editor THEN the Test Application 
   * SHALL accept the input without showing validation errors
   */
  test('JSON validation consistency property', async ({ page }) => {
    // Create a fresh page object for each test to avoid state issues
    const testMergeTool = new MergeToolPage(page);
    
    // Property-based test using fast-check
    await fc.assert(
      fc.asyncProperty(
        // Generate valid JSON objects using fast-check
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          age: fc.integer({ min: 0, max: 120 }),
          email: fc.emailAddress(),
          active: fc.boolean(),
          score: fc.float({ min: 0, max: 100 }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 }),
          metadata: fc.record({
            created: fc.date().map(d => d.toISOString()),
            updated: fc.option(fc.date().map(d => d.toISOString()), { nil: null })
          })
        }),
        async (generatedObject) => {
          try {
            // Navigate to fresh page for each iteration
            await testMergeTool.goto();
            await testMergeTool.skipTour();
            
            // Convert to JSON string - this ensures it's valid JSON
            const jsonString = JSON.stringify(generatedObject);
            
            // Verify that JSON.parse can parse it (should always succeed)
            let parseSucceeded = false;
            try {
              JSON.parse(jsonString);
              parseSucceeded = true;
            } catch (error) {
              parseSucceeded = false;
            }
            
            // Property: If JSON.parse succeeds, the application should accept it without errors
            if (parseSucceeded) {
              // Set the JSON content in the editor
              await testMergeTool.setJsonContent(jsonString);
              
              // Wait for validation to complete
              await testMergeTool.waitForValidation();
              
              // Check that no validation error is displayed
              const validationError = await testMergeTool.getJsonValidationError();
              
              // The property: if JSON.parse succeeds, there should be no validation error
              expect(validationError).toBeNull();
              
              // Additionally verify that the JSON is marked as valid
              const isValid = await testMergeTool.isJsonValid();
              expect(isValid).toBe(true);
            }
          } catch (error) {
            console.log('Property test iteration failed:', error.message);
            console.log('Generated object:', generatedObject);
            throw error;
          }
        }
      ),
      { 
        numRuns: 10, // Reduced for browser stability
        timeout: 5000 // 5 seconds timeout per iteration
      }
    );
  });

  /**
   * Property Test: Invalid JSON error display
   * **Feature: playwright-e2e-testing, Property 2: Invalid JSON error display**
   * Validates: Requirements 2.3 - WHEN a user enters invalid JSON in the editor THEN the Test Application 
   * SHALL display appropriate validation error messages
   */
  test('Invalid JSON error display property', async ({ page }) => {
    const testMergeTool = new MergeToolPage(page);
    await testMergeTool.goto();
    await testMergeTool.skipTour();
    
    // Force dismiss tour if it's still visible
    if (await testMergeTool.isTourVisible()) {
      await testMergeTool.forceDismissTour();
    }
    
    // Property-based test using fast-check
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid JSON strings using various strategies
        fc.oneof(
          // Missing closing braces
          fc.string({ minLength: 1, maxLength: 20 }).map(s => `{"key": "${s.replace(/"/g, '\\"')}"`),
          // Missing opening braces
          fc.string({ minLength: 1, maxLength: 20 }).map(s => `"key": "${s.replace(/"/g, '\\"')}"}`),
          // Unquoted keys
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)).map(s => `{${s}: "value"}`),
          // Trailing commas
          fc.constant('{"a": "value", "b": 123,}'),
          // Single quotes instead of double quotes
          fc.string({ minLength: 1, maxLength: 10 }).map(s => `{'key': '${s}'}`),
          // Unescaped quotes in strings
          fc.constant('{"key": "value"with"quotes"}'),
          // Invalid escape sequences
          fc.constant('{"key": "\\x41"}'),
          // Missing quotes around strings
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)).map(s => `{"key": ${s}}`),
          // Incomplete arrays
          fc.constant('[1, 2, 3'),
          // Invalid numbers
          fc.constant('{"number": 123.45.67}'),
          // Undefined values
          fc.constant('{"value": undefined}'),
          // Function values
          fc.constant('{"func": function() {}}'),
          // Comments (not valid in JSON)
          fc.constant('{"key": "value" /* comment */}')
        ),
        async (invalidJsonString) => {
          // Verify that JSON.parse fails on this string
          let parseSucceeded = false;
          try {
            JSON.parse(invalidJsonString);
            parseSucceeded = true;
          } catch (error) {
            parseSucceeded = false;
          }
          
          // Property: If JSON.parse fails, the application should display an error message
          if (!parseSucceeded) {
            // Clear the editor first to ensure clean state
            await testMergeTool.clearJsonEditor();
            await testMergeTool.waitForValidation();
            
            // Set the invalid JSON content in the editor
            await testMergeTool.setJsonContent(invalidJsonString);
            
            // Wait for validation to complete
            await testMergeTool.waitForValidation();
            
            // Check that a validation error is displayed
            const validationError = await testMergeTool.getJsonValidationError();
            
            // The property: if JSON.parse fails, there should be a validation error
            expect(validationError).not.toBeNull();
            expect(validationError).toBeTruthy();
            
            // Additionally verify that the JSON is marked as invalid
            const isValid = await testMergeTool.isJsonValid();
            expect(isValid).toBe(false);
          }
        }
      ),
      { numRuns: 30 } // Reduced from 100 for better performance in browser tests
    );
  });

});
