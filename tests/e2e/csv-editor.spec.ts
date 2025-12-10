/**
 * CSV Editor E2E Tests
 * Tests for CSV editor functionality including initial state and clearing
 * Requirements: 3.1, 3.4
 */

import { test, expect } from '@playwright/test';
import * as fc from 'fast-check';
import { MergeToolPage } from '../fixtures/page-objects';
import { sampleCsvData } from '../fixtures/test-data';

test.describe('CSV Editor', () => {
  let mergeTool: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeTool = new MergeToolPage(page);
    await mergeTool.goto();
    
    // Skip tour if it appears
    await mergeTool.skipTour();
  });

  /**
   * Test: Initial state displays CSV editor
   * Validates: Requirement 3.1 - WHEN a user loads the application THEN the Test Application 
   * SHALL display the CSV editor ready for input
   */
  test('should display CSV editor in initial state', async () => {
    // Verify CSV editor section is visible
    await expect(mergeTool.csvEditorSection).toBeVisible();
    
    // Verify CSV textarea is present and editable
    const csvEditor = await mergeTool.getCsvEditor();
    await expect(csvEditor).toBeVisible();
    await expect(csvEditor).toBeEditable();
    
    // Verify editor starts empty or ready for input
    const initialContent = await csvEditor.inputValue();
    expect(initialContent).toBeDefined();
    
    // Verify CSV tabs are present (Raw Text and Preview)
    await expect(mergeTool.csvTabText).toBeVisible();
    await expect(mergeTool.csvTabPreview).toBeVisible();
    
    // Verify Raw Text tab is initially selected
    const rawTextTab = mergeTool.csvTabText;
    const tabState = await rawTextTab.getAttribute('data-state');
    expect(tabState).toBe('active');
  });

  /**
   * Test: Clearing CSV editor removes content
   * Validates: Requirement 3.4 - WHEN a user clears the CSV editor THEN the Test Application 
   * SHALL remove all content and reset to empty state
   */
  test('should clear editor content when cleared', async () => {
    // First, add some content to the CSV editor
    await mergeTool.setCsvContent(sampleCsvData.simple);
    
    // Verify content was added
    const csvEditor = await mergeTool.getCsvEditor();
    let content = await csvEditor.inputValue();
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('name,email,role');
    
    // Clear the editor
    await mergeTool.clearCsvEditor();
    
    // Verify editor is now empty
    content = await csvEditor.inputValue();
    expect(content).toBe('');
  });

  /**
   * Property Test: CSV header recognition
   * **Feature: playwright-e2e-testing, Property 3: CSV header recognition**
   * **Validates: Requirements 3.3**
   * Verifies that CSV headers are recognized and available as placeholders
   */
  test('CSV header recognition property', async ({ page }) => {
    // Create a fresh page object for each test to avoid state issues
    const mergeTool = new MergeToolPage(page);
    
    await fc.assert(
      fc.asyncProperty(
        // Generate simple CSV headers (valid identifier names)
        fc.array(
          fc.string({ minLength: 1, maxLength: 8 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)), 
          { minLength: 1, maxLength: 3 }
        ).filter(headers => {
          // Ensure unique headers
          const uniqueHeaders = new Set(headers);
          return uniqueHeaders.size === headers.length && headers.length > 0;
        }),
        async (headers) => {
          try {
            // Navigate to fresh page for each iteration
            await mergeTool.goto();
            await mergeTool.skipTour();
            
            // Create simple CSV content with one data row
            const csvContent = [
              headers.join(','),
              headers.map((_, i) => `value${i + 1}`).join(',')
            ].join('\n');

            // Set CSV content in the editor
            await mergeTool.setCsvContent(csvContent);
            
            // Wait for processing
            await mergeTool.waitForValidation();
            
            // Get the detected headers from the CSV preview
            const detectedHeaders = await mergeTool.getCsvHeaders();
            
            // Verify that all original headers are detected
            expect(detectedHeaders.length).toBe(headers.length);
            
            // Check that all original headers are present in the same order
            for (let i = 0; i < headers.length; i++) {
              expect(detectedHeaders[i]).toBe(headers[i]);
            }
            
          } catch (error) {
            // Log the error for debugging
            console.log('Property test iteration failed:', error.message);
            console.log('Headers:', headers);
            throw error;
          }
        }
      ),
      { 
        numRuns: 10,
        timeout: 5000, // 5 seconds timeout per iteration
        verbose: false
      }
    );
  });

  /**
   * Property Test: Special character preservation
   * **Feature: playwright-e2e-testing, Property 10: Special character preservation**
   * **Validates: Requirements 3.5, 9.4**
   * Verifies that special characters in CSV values are correctly preserved in merge output
   */
  test('Special character preservation property', async ({ page }) => {
    // Create a fresh page object for each test to avoid state issues
    const mergeTool = new MergeToolPage(page);
    
    await fc.assert(
      fc.asyncProperty(
        // Generate CSV values with special characters - simplified to focus on core cases
        fc.record({
          name: fc.oneof(
            // Basic ASCII strings
            fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-zA-Z0-9 ]+$/.test(s)),
            // Strings with quotes (but not nested quotes to avoid complexity)
            fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9 ]+$/.test(s)).map(s => `"${s}"`),
            // Strings with commas
            fc.string({ minLength: 1, maxLength: 8 }).filter(s => /^[a-zA-Z0-9 ]+$/.test(s)).map(s => `${s}, extra`),
            // Common Unicode characters (one at a time to isolate issues)
            fc.constant('José'),
            fc.constant('Müller'),
            fc.constant('Café')
          ),
          email: fc.oneof(
            fc.emailAddress(),
            fc.constant('test+tag@example.com'),
            fc.constant('user.name@example.com')
          ),
          role: fc.oneof(
            fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9 ]+$/.test(s)),
            fc.constant('Admin, Senior'),
            fc.constant('Editor & Writer')
          )
        }),
        async (testData) => {
          try {
            // Navigate to fresh page for each iteration
            await mergeTool.goto();
            await mergeTool.skipTour();
            
            // Create JSON template that uses all CSV columns
            const jsonTemplate = `{
  "name": "{{name}}",
  "email": "{{email}}",
  "role": "{{role}}"
}`;
            
            // Create CSV content with proper escaping for special characters
            const escapeCsvValue = (value: string): string => {
              // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
              if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            };
            
            const csvContent = [
              'name,email,role',
              `${escapeCsvValue(testData.name)},${escapeCsvValue(testData.email)},${escapeCsvValue(testData.role)}`
            ].join('\n');
            
            // Set JSON template
            await mergeTool.setJsonContent(jsonTemplate);
            await mergeTool.waitForValidation();
            
            // Verify JSON is valid
            const isJsonValid = await mergeTool.isJsonValid();
            expect(isJsonValid).toBe(true);
            
            // Set CSV content
            await mergeTool.setCsvContent(csvContent);
            await mergeTool.waitForValidation();
            
            // Wait for merge to complete
            await mergeTool.waitForMergeComplete();
            
            // Get merge results
            const results = await mergeTool.getMergeResults();
            
            // Verify we got exactly one result
            expect(results.length).toBe(1);
            
            // Parse the result JSON
            const parsedResult = JSON.parse(results[0]);
            
            // Verify that special characters are preserved exactly
            expect(parsedResult.name).toBe(testData.name);
            expect(parsedResult.email).toBe(testData.email);
            expect(parsedResult.role).toBe(testData.role);
            
          } catch (error) {
            // Log the error for debugging
            console.log('Property test iteration failed:', error.message);
            console.log('Test data:', testData);
            throw error;
          }
        }
      ),
      { 
        numRuns: 10,
        timeout: 10000, // 10 seconds timeout per iteration (longer for merge operations)
        verbose: false
      }
    );
  });
});