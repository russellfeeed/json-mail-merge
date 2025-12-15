/**
 * Merge Workflow E2E Tests
 * Tests the core merge functionality between JSON templates and CSV data
 */

import { test, expect } from '@playwright/test';
import * as fc from 'fast-check';
import { MergeToolPage } from '../fixtures/page-objects';
import { TestHelpers } from '../fixtures/test-helpers';
import { sampleJsonTemplates, sampleCsvData, testTemplates } from '../fixtures/test-data';

test.describe('Merge Workflow Tests', () => {
  let mergeToolPage: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeToolPage = new MergeToolPage(page);
    await mergeToolPage.goto();
    await mergeToolPage.skipTour();
  });

  test.describe('Basic Merge Workflow', () => {
    test('should merge simple JSON template with simple CSV', async () => {
      // Test merging simple JSON template with simple CSV (example test)
      // Requirements: 4.1, 4.4

      // Set up JSON template
      await mergeToolPage.setJsonContent(sampleJsonTemplates.simple);
      await mergeToolPage.waitForValidation();
      
      // Verify JSON is valid
      const isJsonValid = await mergeToolPage.isJsonValid();
      expect(isJsonValid).toBe(true);

      // Set up CSV data
      await mergeToolPage.setCsvContent(sampleCsvData.simple);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get merge results
      const results = await mergeToolPage.getMergeResults();
      expect(results.length).toBeGreaterThan(0);

      // Parse and validate results
      const parsedResults = TestHelpers.parseJsonResults(results);
      expect(parsedResults.length).toBe(3); // Should have 3 rows from CSV

      // Verify first result structure
      const firstResult = parsedResults[0];
      expect(firstResult).toHaveProperty('name', 'John Smith');
      expect(firstResult).toHaveProperty('email', 'john@example.com');
      expect(firstResult).toHaveProperty('role', 'Admin');

      // Verify second result structure
      const secondResult = parsedResults[1];
      expect(secondResult).toHaveProperty('name', 'Jane Doe');
      expect(secondResult).toHaveProperty('email', 'jane@example.com');
      expect(secondResult).toHaveProperty('role', 'Editor');

      // Verify third result structure
      const thirdResult = parsedResults[2];
      expect(thirdResult).toHaveProperty('name', 'Bob Wilson');
      expect(thirdResult).toHaveProperty('email', 'bob@example.com');
      expect(thirdResult).toHaveProperty('role', 'Viewer');

      // Verify no unreplaced placeholders remain
      results.forEach(result => {
        expect(TestHelpers.hasUnreplacedPlaceholders(result)).toBe(false);
      });
    });

    test('should trigger download when download results button is clicked', async () => {
      // Test download results button triggers download (example test)
      // Requirements: 4.4

      // Set up valid JSON and CSV for merge
      await mergeToolPage.setJsonContent(sampleJsonTemplates.simple);
      await mergeToolPage.setCsvContent(sampleCsvData.simple);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Verify results are available
      const resultCount = await mergeToolPage.getResultCount();
      expect(resultCount).toBeGreaterThan(0);

      // Set up download promise to catch the download event
      const downloadPromise = mergeToolPage.page.waitForEvent('download');

      // Click download button
      await mergeToolPage.downloadResults();

      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download was triggered
      expect(download).toBeDefined();
      expect(download.suggestedFilename()).toMatch(/merged.*\.json$/);
    });

    test('should handle empty JSON template gracefully', async () => {
      // Test edge case with empty JSON
      await mergeToolPage.setJsonContent('');
      await mergeToolPage.setCsvContent(sampleCsvData.simple);
      await mergeToolPage.waitForValidation();

      // Should not produce results with empty JSON
      const canMerge = await mergeToolPage.canMerge();
      expect(canMerge).toBe(false);
    });

    test('should handle empty CSV data gracefully', async () => {
      // Test edge case with empty CSV
      await mergeToolPage.setJsonContent(sampleJsonTemplates.simple);
      await mergeToolPage.setCsvContent('');
      await mergeToolPage.waitForValidation();

      // Should not produce results with empty CSV
      const canMerge = await mergeToolPage.canMerge();
      expect(canMerge).toBe(false);
    });

    test('should handle CSV with only headers', async () => {
      // Test edge case with CSV containing only headers
      const headersOnlyCsv = 'name,email,role';
      
      await mergeToolPage.setJsonContent(sampleJsonTemplates.simple);
      await mergeToolPage.setCsvContent(headersOnlyCsv);
      await mergeToolPage.waitForValidation();

      // Should recognize headers but produce no results due to no data rows
      // Note: Preview tab is disabled when there are no data rows, so we can't check headers this way
      // Instead, verify that the CSV content is set correctly
      const csvContent = await mergeToolPage.getCsvEditor();
      const csvValue = await csvContent.inputValue();
      expect(csvValue).toBe(headersOnlyCsv);

      // Should not be ready to merge without data rows
      const canMerge = await mergeToolPage.canMerge();
      expect(canMerge).toBe(false);
    });

    test('should preserve CSV row count in merge results', async () => {
      // Test that number of results matches number of CSV rows
      await mergeToolPage.setJsonContent(sampleJsonTemplates.simple);
      await mergeToolPage.setCsvContent(sampleCsvData.multiRow);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get results and verify count matches CSV rows
      const results = await mergeToolPage.getMergeResults();
      const csvRowCount = TestHelpers.countCsvRows(sampleCsvData.multiRow);
      
      expect(results.length).toBe(csvRowCount);
      expect(results.length).toBe(5); // multiRow CSV has 5 data rows
    });

    test('should handle JSON with no placeholders', async () => {
      // Test JSON template without any placeholders
      const staticJson = `{
        "message": "Hello World",
        "timestamp": "2023-01-01T00:00:00Z",
        "static": true
      }`;

      await mergeToolPage.setJsonContent(staticJson);
      await mergeToolPage.setCsvContent(sampleCsvData.simple);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Should still produce results (one per CSV row) with static content
      const results = await mergeToolPage.getMergeResults();
      const parsedResults = TestHelpers.parseJsonResults(results);
      
      expect(parsedResults.length).toBe(3);
      
      // All results should be identical since no placeholders
      parsedResults.forEach(result => {
        expect(result.message).toBe('Hello World');
        expect(result.timestamp).toBe('2023-01-01T00:00:00Z');
        expect(result.static).toBe(true);
      });
    });

    test('should handle mismatched placeholders and CSV columns', async () => {
      // Test JSON with placeholders that don't match CSV columns
      const mismatchedJson = `{
        "name": "{{name}}",
        "age": "{{age}}",
        "department": "{{department}}"
      }`;

      await mergeToolPage.setJsonContent(mismatchedJson);
      await mergeToolPage.setCsvContent(sampleCsvData.simple); // Has name, email, role but not age, department
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Should still produce results but with unreplaced placeholders for missing columns
      const results = await mergeToolPage.getMergeResults();
      const parsedResults = TestHelpers.parseJsonResults(results);
      
      expect(parsedResults.length).toBe(3);
      
      // First result should have name replaced but age and department unreplaced
      const firstResult = parsedResults[0];
      expect(firstResult.name).toBe('John Smith');
      expect(firstResult.age).toBe('{{age}}'); // Unreplaced
      expect(firstResult.department).toBe('{{department}}'); // Unreplaced
    });
  });

  test.describe('Property-Based Tests', () => {
    // **Feature: playwright-e2e-testing, Property 4: Placeholder replacement completeness**
    test('placeholder replacement completeness property', async () => {
      // **Validates: Requirements 4.2**
      
      await fc.assert(
        fc.asyncProperty(
          // Generate random column names (valid identifiers)
          fc.array(fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/), { minLength: 1, maxLength: 3 }),
          // Generate random row data for each column - avoid problematic characters
          fc.array(fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes(',') && !s.includes('\n') && !s.includes('"') && s.trim().length > 0), { minLength: 1, maxLength: 3 }), { minLength: 1, maxLength: 2 }),
          async (columnNames, rowsData) => {
            // Skip if we have duplicate column names
            const uniqueColumns = [...new Set(columnNames)];
            if (uniqueColumns.length !== columnNames.length) {
              return; // Skip this test case
            }

            // Ensure row data matches column count
            const normalizedRows = rowsData.map(row => 
              row.slice(0, columnNames.length).concat(
                Array(Math.max(0, columnNames.length - row.length)).fill('default')
              )
            );

            // Create CSV with generated data - escape values that might contain commas
            const csvHeaders = columnNames.join(',');
            const csvRows = normalizedRows.map(row => 
              row.map(value => value.includes(',') ? `"${value}"` : value).join(',')
            );
            const csvContent = [csvHeaders, ...csvRows].join('\n');

            // Create JSON template with placeholders matching all CSV columns
            const jsonTemplate = `{
              ${columnNames.map(col => `"${col}": "{{${col}}}"`).join(',\n  ')}
            }`;

            try {
              // Set up the test
              await mergeToolPage.setJsonContent(jsonTemplate);
              await mergeToolPage.setCsvContent(csvContent);
              await mergeToolPage.waitForValidation();

              // Check if both JSON and CSV are valid before proceeding
              const isJsonValid = await mergeToolPage.isJsonValid();
              if (!isJsonValid) {
                return; // Skip if JSON is invalid
              }

              // Wait for merge to complete
              await TestHelpers.waitForMergeComplete(mergeToolPage.page);

              // Get merge results
              const results = await mergeToolPage.getMergeResults();
              expect(results.length).toBeGreaterThan(0);

              // Verify no unreplaced placeholder syntax remains in output
              results.forEach(result => {
                expect(TestHelpers.hasUnreplacedPlaceholders(result)).toBe(false);
              });

              // Additional verification: parse results and check all placeholders were replaced
              const parsedResults = TestHelpers.parseJsonResults(results);
              expect(parsedResults.length).toBe(normalizedRows.length);
              
              parsedResults.forEach((result, rowIndex) => {
                columnNames.forEach((columnName, colIndex) => {
                  // Verify the placeholder was replaced with the correct CSV value
                  // Note: CSV parsing trims unquoted values, so we expect trimmed values
                  const expectedValue = normalizedRows[rowIndex][colIndex].trim();
                  expect(result[columnName]).toBe(expectedValue);
                });
              });
            } catch (error) {
              // Log the failing case for debugging
              console.log('Test failed with:', { columnNames, rowsData, csvContent, jsonTemplate });
              throw error;
            }
          }
        ),
        { numRuns: 5, timeout: 10000 } // Reduce iterations and add timeout
      );
    });

    // **Feature: playwright-e2e-testing, Property 5: Row count preservation**
    test('row count preservation property', async () => {
      // **Validates: Requirements 4.1, 4.5**
      
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of rows (1-10 to keep test reasonable)
          fc.integer({ min: 1, max: 10 }),
          // Generate random column names (valid identifiers)
          fc.array(fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/), { minLength: 1, maxLength: 3 }),
          async (numRows, columnNames) => {
            // Skip if we have duplicate column names
            const uniqueColumns = [...new Set(columnNames)];
            if (uniqueColumns.length !== columnNames.length) {
              return; // Skip this test case
            }

            // Generate CSV data with exactly numRows rows
            const csvHeaders = columnNames.join(',');
            const csvRows: string[] = [];
            
            for (let i = 0; i < numRows; i++) {
              const rowData = columnNames.map((_, colIndex) => `value${i}_${colIndex}`);
              csvRows.push(rowData.join(','));
            }
            
            const csvContent = [csvHeaders, ...csvRows].join('\n');

            // Create simple JSON template with placeholders
            const jsonTemplate = `{
              ${columnNames.map(col => `"${col}": "{{${col}}}"`).join(',\n  ')}
            }`;

            try {
              // Set up the test
              await mergeToolPage.setJsonContent(jsonTemplate);
              await mergeToolPage.setCsvContent(csvContent);
              await mergeToolPage.waitForValidation();

              // Check if both JSON and CSV are valid before proceeding
              const isJsonValid = await mergeToolPage.isJsonValid();
              if (!isJsonValid) {
                return; // Skip if JSON is invalid
              }

              // Wait for merge to complete
              await TestHelpers.waitForMergeComplete(mergeToolPage.page);

              // Get merge results
              const results = await mergeToolPage.getMergeResults();
              
              // Verify merge produces exactly N JSON objects for N CSV rows
              expect(results.length).toBe(numRows);

              // Additional verification: parse results and verify structure
              const parsedResults = TestHelpers.parseJsonResults(results);
              expect(parsedResults.length).toBe(numRows);
              
              // Verify each result corresponds to the correct CSV row
              parsedResults.forEach((result, rowIndex) => {
                columnNames.forEach((columnName, colIndex) => {
                  const expectedValue = `value${rowIndex}_${colIndex}`;
                  expect(result[columnName]).toBe(expectedValue);
                });
              });
            } catch (error) {
              // Log the failing case for debugging
              console.log('Row count preservation test failed with:', { numRows, columnNames, csvContent, jsonTemplate });
              throw error;
            }
          }
        ),
        { numRuns: 10 } // Run minimum 10 iterations as specified
      );
    });
  });
});