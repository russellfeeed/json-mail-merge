/**
 * Coverage Integration E2E Tests
 * Demonstrates how to collect coverage data during E2E test execution
 */

import { test, expect } from '@playwright/test';
import { MergeToolPage } from '../fixtures/page-objects';
import { CoverageHelpers } from '../fixtures/coverage-helpers';
import { sampleJsonTemplates, sampleCsvData } from '../fixtures/test-data';

test.describe('Coverage Integration Tests', () => {
  let mergeToolPage: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeToolPage = new MergeToolPage(page);
    
    // Start coverage collection before navigating to the page
    await mergeToolPage.startCoverageCollection();
    
    await mergeToolPage.goto();
    await mergeToolPage.skipTour();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Stop coverage collection and save data
    await mergeToolPage.stopCoverageCollection();
    await mergeToolPage.saveCoverageData(testInfo.title.replace(/[^a-zA-Z0-9]/g, '-'));
  });

  test('should collect coverage during basic merge workflow', async () => {
    // This test exercises the core merge functionality while collecting coverage
    // Requirements: 4.2 - E2E test coverage collection

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
    await mergeToolPage.waitForMergeComplete();

    // Get merge results
    const results = await mergeToolPage.getMergeResults();
    expect(results.length).toBeGreaterThan(0);

    // Verify results structure
    expect(results.length).toBe(3); // Should have 3 rows from CSV
  });

  test('should collect coverage during array mode operations', async () => {
    // Test array mode functionality with coverage collection
    // Requirements: 4.2 - E2E test coverage collection

    // Set up JSON template with array structure
    const arrayJson = `{
      "users": [
        {
          "name": "{{name}}",
          "email": "{{email}}"
        }
      ]
    }`;

    await mergeToolPage.setJsonContent(arrayJson);
    await mergeToolPage.setCsvContent(sampleCsvData.simple);
    await mergeToolPage.waitForValidation();

    // Enable array mode
    await mergeToolPage.enableArrayMode();

    // Select array path
    const availablePaths = await mergeToolPage.getAvailableArrayPaths();
    expect(availablePaths.length).toBeGreaterThan(0);

    if (availablePaths.includes('users')) {
      await mergeToolPage.selectArrayPath('users');
    }

    // Wait for merge to complete
    await mergeToolPage.waitForMergeComplete();

    // Verify results
    const results = await mergeToolPage.getMergeResults();
    expect(results.length).toBeGreaterThan(0);
  });

  test('should collect coverage during error handling scenarios', async () => {
    // Test error handling paths with coverage collection
    // Requirements: 4.2 - E2E test coverage collection

    // Test invalid JSON handling
    await mergeToolPage.setJsonContent('{ invalid json }');
    await mergeToolPage.waitForValidation();

    const isJsonValid = await mergeToolPage.isJsonValid();
    expect(isJsonValid).toBe(false);

    // Test empty CSV handling
    await mergeToolPage.setJsonContent(sampleJsonTemplates.simple);
    await mergeToolPage.setCsvContent('');
    await mergeToolPage.waitForValidation();

    const canMerge = await mergeToolPage.canMerge();
    expect(canMerge).toBe(false);

    // Test valid scenario to ensure recovery
    await mergeToolPage.setCsvContent(sampleCsvData.simple);
    await mergeToolPage.waitForValidation();

    const canMergeAfterFix = await mergeToolPage.canMerge();
    expect(canMergeAfterFix).toBe(true);
  });

  test('should collect coverage during placeholder operations', async () => {
    // Test placeholder detection and replacement with coverage collection
    // Requirements: 4.2 - E2E test coverage collection

    const placeholderJson = `{
      "user": {
        "name": "{{firstName}} {{lastName}}",
        "contact": {
          "email": "{{email}}",
          "phone": "{{phone}}"
        },
        "metadata": {
          "role": "{{role}}",
          "department": "{{department}}"
        }
      }
    }`;

    await mergeToolPage.setJsonContent(placeholderJson);
    await mergeToolPage.waitForValidation();

    // Get detected placeholders
    const placeholders = await mergeToolPage.getDetectedPlaceholders();
    expect(placeholders.length).toBeGreaterThan(0);

    // Set up CSV with matching columns
    const csvWithPlaceholders = `firstName,lastName,email,phone,role,department
John,Smith,john@example.com,555-0101,Admin,IT
Jane,Doe,jane@example.com,555-0102,Editor,Marketing`;

    await mergeToolPage.setCsvContent(csvWithPlaceholders);
    await mergeToolPage.waitForValidation();

    // Wait for merge to complete
    await mergeToolPage.waitForMergeComplete();

    // Verify results
    const results = await mergeToolPage.getMergeResults();
    expect(results.length).toBe(2);

    // Verify placeholder replacement worked
    const parsedResults = results.map(result => JSON.parse(result));
    expect(parsedResults[0].user.name).toBe('John Smith');
    expect(parsedResults[1].user.name).toBe('Jane Doe');
  });

  test('should collect coverage during file operations', async () => {
    // Test file upload/download operations with coverage collection
    // Requirements: 4.2 - E2E test coverage collection

    // Load example data
    await mergeToolPage.loadExample();
    await mergeToolPage.waitForValidation();

    // Verify example loaded
    const isJsonValid = await mergeToolPage.isJsonValid();
    expect(isJsonValid).toBe(true);

    const canMerge = await mergeToolPage.canMerge();
    expect(canMerge).toBe(true);

    // Test download functionality
    await mergeToolPage.waitForMergeComplete();
    
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

    // Test clear all functionality
    await mergeToolPage.clearAll();
    await mergeToolPage.waitForValidation();

    // Verify cleared state
    const canMergeAfterClear = await mergeToolPage.canMerge();
    expect(canMergeAfterClear).toBe(false);
  });
});