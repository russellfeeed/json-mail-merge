/**
 * Placeholder Transformation E2E Tests
 * Tests placeholder transformation functionality including system placeholders and transformation methods
 */

import { test, expect } from '@playwright/test';
import { MergeToolPage } from '../fixtures/page-objects';
import { TestHelpers } from '../fixtures/test-helpers';
import { sampleCsvData, systemPlaceholders } from '../fixtures/test-data';

test.describe('Placeholder Transformation Tests', () => {
  let mergeToolPage: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeToolPage = new MergeToolPage(page);
    await mergeToolPage.goto();
    await mergeToolPage.skipTour();
  });

  test.describe('Basic Transformation Tests', () => {
    test('should generate appropriate values for system placeholders', async () => {
      // Test system placeholders generate appropriate values (UUID, timestamp, etc.) (example test)
      // Requirements: 5.3, 5.4

      // Create JSON template with various system placeholders
      const jsonTemplate = `{
        "id": "{{uuid}}",
        "createdAt": "{{currentDatetime}}",
        "date": "{{currentDate}}",
        "time": "{{currentTime}}",
        "timestamp": "{{timestamp}}",
        "randomNum": "{{randomNumber}}",
        "name": "{{name}}"
      }`;

      // Set up JSON and CSV
      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(sampleCsvData.singleRow);
      await mergeToolPage.waitForValidation();

      // Verify JSON is valid
      const isJsonValid = await mergeToolPage.isJsonValid();
      expect(isJsonValid).toBe(true);

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get merge results
      const results = await mergeToolPage.getMergeResults();
      expect(results.length).toBe(1);

      // Parse the result
      const parsedResults = TestHelpers.parseJsonResults(results);
      const result = parsedResults[0];

      // Verify UUID format (should be a valid UUID v4)
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

      // Verify currentDatetime format (ISO datetime)
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/);

      // Verify currentDate format (YYYY-MM-DD)
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify currentTime format (HH:mm:ss)
      expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);

      // Verify timestamp is a number
      expect(result.timestamp).toMatch(/^\d+$/);
      const timestampValue = parseInt(result.timestamp);
      expect(timestampValue).toBeGreaterThan(0);

      // Verify randomNumber is a number
      expect(result.randomNum).toMatch(/^\d+$/);
      const randomValue = parseInt(result.randomNum);
      expect(randomValue).toBeGreaterThanOrEqual(0);
      expect(randomValue).toBeLessThan(1000000);

      // Verify CSV placeholder was replaced
      expect(result.name).toBe('John Smith');
    });

    test('should handle invalid transformation methods gracefully', async () => {
      // Test invalid transformation methods are handled gracefully (example test)
      // Requirements: 5.3, 5.4

      // Create JSON template with invalid transformation methods
      const jsonTemplate = `{
        "name": "{{name}}",
        "invalidMethod1": "{{name.invalidMethod()}}",
        "invalidMethod2": "{{name.nonExistentTransform()}}",
        "chainedInvalid": "{{name.toUpperCase().invalidMethod()}}",
        "validAfterInvalid": "{{name.invalidMethod().toLowerCase()}}"
      }`;

      // Set up JSON and CSV
      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(sampleCsvData.singleRow);
      await mergeToolPage.waitForValidation();

      // Verify JSON is valid (should still be valid JSON syntax)
      const isJsonValid = await mergeToolPage.isJsonValid();
      expect(isJsonValid).toBe(true);

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get merge results
      const results = await mergeToolPage.getMergeResults();
      expect(results.length).toBe(1);

      // Parse the result
      const parsedResults = TestHelpers.parseJsonResults(results);
      const result = parsedResults[0];

      // Verify valid placeholder was replaced
      expect(result.name).toBe('John Smith');

      // Verify invalid methods are handled gracefully
      // The behavior should be that invalid methods are ignored, leaving the value unchanged
      // or the placeholder unreplaced, depending on implementation
      expect(result.invalidMethod1).toBeDefined();
      expect(result.invalidMethod2).toBeDefined();
      expect(result.chainedInvalid).toBeDefined();
      expect(result.validAfterInvalid).toBeDefined();

      // The exact behavior for invalid methods may vary, but the application should not crash
      // and should produce some reasonable output
    });

    test('should apply basic transformation methods correctly', async () => {
      // Test basic transformation methods work as expected
      const jsonTemplate = `{
        "original": "{{name}}",
        "upper": "{{name.toUpperCase()}}",
        "lower": "{{name.toLowerCase()}}",
        "trimmed": "{{role.trim()}}",
        "capitalized": "{{email.capitalize()}}"
      }`;

      // Use CSV with values that will show transformation effects
      const csvWithSpaces = `name,email,role
John Smith,john@example.com,  Admin  `;

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvWithSpaces);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get merge results
      const results = await mergeToolPage.getMergeResults();
      expect(results.length).toBe(1);

      // Parse the result
      const parsedResults = TestHelpers.parseJsonResults(results);
      const result = parsedResults[0];

      // Verify transformations were applied correctly
      expect(result.original).toBe('John Smith');
      expect(result.upper).toBe('JOHN SMITH');
      expect(result.lower).toBe('john smith');
      expect(result.trimmed).toBe('Admin'); // Should trim the spaces
      expect(result.capitalized).toBe('John@example.com'); // Capitalize first letter
    });

    test('should handle chained transformation methods', async () => {
      // Test multiple transformation methods chained together
      const jsonTemplate = `{
        "name": "{{name}}",
        "processed": "{{name.toLowerCase().capitalize()}}",
        "complex": "{{email.toLowerCase().trim()}}"
      }`;

      const csvWithMixedCase = `name,email
JOHN SMITH,  JOHN@EXAMPLE.COM  `;

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvWithMixedCase);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get merge results
      const results = await mergeToolPage.getMergeResults();
      expect(results.length).toBe(1);

      // Parse the result
      const parsedResults = TestHelpers.parseJsonResults(results);
      const result = parsedResults[0];

      // Verify chained transformations were applied in order
      expect(result.name).toBe('JOHN SMITH');
      expect(result.processed).toBe('John smith'); // toLowerCase then capitalize
      expect(result.complex).toBe('john@example.com'); // toLowerCase then trim
    });

    test('should handle system placeholders with transformation methods', async () => {
      // Test that system placeholders can also have transformation methods applied
      const jsonTemplate = `{
        "uuid": "{{uuid}}",
        "uuidUpper": "{{uuid.toUpperCase()}}",
        "date": "{{currentDate}}",
        "dateReversed": "{{currentDate.reverse()}}",
        "timestamp": "{{timestamp}}",
        "timestampLength": "{{timestamp.length()}}"
      }`;

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(sampleCsvData.singleRow);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get merge results
      const results = await mergeToolPage.getMergeResults();
      expect(results.length).toBe(1);

      // Parse the result
      const parsedResults = TestHelpers.parseJsonResults(results);
      const result = parsedResults[0];

      // Verify system placeholders work
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.timestamp).toMatch(/^\d+$/);

      // Verify transformations were applied to system placeholders
      // Note: System placeholders generate different values each time, so we verify the transformation pattern
      expect(result.uuidUpper).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);
      expect(result.dateReversed).toMatch(/^\d{2}-\d{2}-\d{4}$/); // Reversed date format
      expect(parseInt(result.timestampLength)).toBeGreaterThan(10); // Timestamp should be at least 10+ digits
    });

    test('should handle empty and whitespace values in transformations', async () => {
      // Test edge cases with empty values and whitespace
      const jsonTemplate = `{
        "empty": "{{empty}}",
        "emptyTrimmed": "{{empty.trim()}}",
        "emptyUpper": "{{empty.toUpperCase()}}",
        "whitespace": "{{whitespace}}",
        "whitespaceTrimmed": "{{whitespace.trim()}}",
        "whitespaceLength": "{{whitespace.length()}}"
      }`;

      const csvWithEmptyValues = `empty,whitespace
,"   "`;

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvWithEmptyValues);
      await mergeToolPage.waitForValidation();

      // Wait for merge to complete
      await TestHelpers.waitForMergeComplete(mergeToolPage.page);

      // Get merge results
      const results = await mergeToolPage.getMergeResults();
      expect(results.length).toBe(1);

      // Parse the result
      const parsedResults = TestHelpers.parseJsonResults(results);
      const result = parsedResults[0];

      // Verify empty value handling
      expect(result.empty).toBe('');
      expect(result.emptyTrimmed).toBe('');
      expect(result.emptyUpper).toBe('');

      // Verify whitespace handling
      expect(result.whitespace).toBe('   ');
      expect(result.whitespaceTrimmed).toBe('');
      expect(result.whitespaceLength).toBe('3');
    });
  });
});