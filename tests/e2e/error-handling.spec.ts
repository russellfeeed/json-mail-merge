/**
 * Error Handling and Edge Case Tests
 * Tests application behavior under error conditions and unusual scenarios
 */

import { test, expect, Page } from '@playwright/test';
import { MergeToolPage } from '../fixtures/page-objects';
import { TestHelpers } from '../fixtures/test-helpers';

test.describe('Error Handling and Edge Cases', () => {
  let mergeToolPage: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeToolPage = new MergeToolPage(page);
    await mergeToolPage.goto();
    await mergeToolPage.skipTour();
  });

  test.describe('Network Request Failures', () => {
    test('handles network failures gracefully when downloading results', async ({ page }) => {
      // Set up valid JSON and CSV for merge
      const jsonTemplate = '{"name": "{{name}}", "email": "{{email}}"}';
      const csvData = 'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com';

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvData);
      await mergeToolPage.waitForMergeComplete();

      // Mock network failure for download requests
      await page.route('**/*', (route) => {
        // Only fail download-related requests
        if (route.request().url().includes('download') || 
            route.request().method() === 'POST' ||
            route.request().headers()['content-disposition']) {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      // Attempt to download results - should handle failure gracefully
      try {
        await mergeToolPage.downloadResults();
        
        // Check that the application doesn't crash and shows appropriate feedback
        // The download might fail silently or show an error message
        const pageContent = await page.textContent('body');
        expect(pageContent).toBeTruthy(); // Page should still be functional
        
        // Verify the application is still responsive
        await expect(mergeToolPage.resultsSection).toBeVisible();
        
      } catch (error) {
        // If download throws an error, that's acceptable as long as the app doesn't crash
        console.log('Download failed as expected:', error);
      }

      // Verify the application remains functional after network failure
      await mergeToolPage.clearAll();
      await mergeToolPage.setJsonContent('{"test": "value"}');
      await expect(mergeToolPage.jsonTextarea).toHaveValue('{"test": "value"}');
    });

    test('handles file upload failures gracefully', async ({ page }) => {
      // Mock network failures for file operations
      await page.route('**/*', (route) => {
        const url = route.request().url();
        const method = route.request().method();
        
        // Fail requests that might be related to file processing
        if (method === 'POST' || url.includes('upload') || url.includes('file')) {
          route.abort('internetdisconnected');
        } else {
          route.continue();
        }
      });

      // Try to use the application normally despite network issues
      const jsonTemplate = '{"name": "{{name}}"}';
      const csvData = 'name\nTest User';

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvData);

      // The application should still work for basic operations
      await expect(mergeToolPage.jsonTextarea).toHaveValue(jsonTemplate);
      await expect(mergeToolPage.csvTextarea).toHaveValue(csvData);

      // Verify JSON validation still works (client-side)
      const isValid = await mergeToolPage.isJsonValid();
      expect(isValid).toBe(true);
    });

    test('handles slow network responses without crashing', async ({ page }) => {
      // Simulate slow network by delaying all requests
      await page.route('**/*', async (route) => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 100));
        route.continue();
      });

      const jsonTemplate = '{"id": "{{id}}", "name": "{{name}}"}';
      const csvData = 'id,name\n1,Alice\n2,Bob';

      // Operations should still work, just slower
      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvData);

      // Wait for merge with longer timeout due to slow network
      await TestHelpers.waitForMergeComplete(page, 10000);

      const resultCount = await mergeToolPage.getResultCount();
      expect(resultCount).toBe(2);
    });
  });

  test.describe('Browser Storage Errors', () => {
    test('handles localStorage unavailability gracefully', async ({ page }) => {
      // Disable localStorage to simulate storage errors
      await page.addInitScript(() => {
        // Override localStorage to throw errors
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('Storage unavailable'); },
            setItem: () => { throw new Error('Storage unavailable'); },
            removeItem: () => { throw new Error('Storage unavailable'); },
            clear: () => { throw new Error('Storage unavailable'); },
            length: 0,
            key: () => null
          },
          writable: false
        });
      });

      // Create a new page instance to ensure the script is applied
      const newPage = await page.context().newPage();
      const newMergeToolPage = new MergeToolPage(newPage);
      
      // Navigate with localStorage disabled
      await newMergeToolPage.goto();
      await newMergeToolPage.skipTour();

      // Application should still function without localStorage
      const jsonTemplate = '{"message": "{{message}}"}';
      const csvData = 'message\nHello World';

      await newMergeToolPage.setJsonContent(jsonTemplate);
      await newMergeToolPage.setCsvContent(csvData);

      // Basic functionality should work even without storage
      await expect(newMergeToolPage.jsonTextarea).toHaveValue(jsonTemplate);
      await expect(newMergeToolPage.csvTextarea).toHaveValue(csvData);

      // Merge should still work
      await newMergeToolPage.waitForMergeComplete();
      const resultCount = await newMergeToolPage.getResultCount();
      expect(resultCount).toBe(1);
      
      // Clean up
      await newPage.close();
    });

    test('handles storage quota exceeded errors', async ({ page }) => {
      // Simulate storage quota exceeded
      await page.addInitScript(() => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key: string, value: string) {
          if (value.length > 100) { // Simulate quota exceeded for large values
            throw new Error('QuotaExceededError: Storage quota exceeded');
          }
          return originalSetItem.call(this, key, value);
        };
      });

      await mergeToolPage.goto();
      await mergeToolPage.skipTour();

      // Try to store large amounts of data
      const largeJsonTemplate = '{"data": "' + 'x'.repeat(200) + '"}';
      const csvData = 'data\ntest';

      // Application should handle storage errors gracefully
      await mergeToolPage.setJsonContent(largeJsonTemplate);
      await mergeToolPage.setCsvContent(csvData);

      // The application should continue to function
      await expect(mergeToolPage.jsonTextarea).toHaveValue(largeJsonTemplate);
      await expect(mergeToolPage.csvTextarea).toHaveValue(csvData);

      // Basic operations should still work
      const isValid = await mergeToolPage.isJsonValid();
      expect(isValid).toBe(true);
    });

    test('handles sessionStorage errors appropriately', async ({ page }) => {
      // Disable sessionStorage
      await page.addInitScript(() => {
        Object.defineProperty(window, 'sessionStorage', {
          value: {
            getItem: () => { throw new Error('SessionStorage unavailable'); },
            setItem: () => { throw new Error('SessionStorage unavailable'); },
            removeItem: () => { throw new Error('SessionStorage unavailable'); },
            clear: () => { throw new Error('SessionStorage unavailable'); },
            length: 0,
            key: () => null
          },
          writable: false
        });
      });

      await mergeToolPage.goto();
      await mergeToolPage.skipTour();

      // Test that the application works without sessionStorage
      const jsonTemplate = '{"user": "{{user}}", "role": "{{role}}"}';
      const csvData = 'user,role\nAdmin,administrator\nUser,standard';

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvData);

      // Verify functionality works
      await mergeToolPage.waitForMergeComplete();
      const resultCount = await mergeToolPage.getResultCount();
      expect(resultCount).toBe(2);

      // Test that tour preferences might not be saved, but app still works
      await mergeToolPage.loadExample();
      const jsonContent = await mergeToolPage.jsonTextarea.inputValue();
      expect(jsonContent).toBeTruthy(); // Should load example even without storage
    });
  });

  test.describe('Edge Cases and Resilience', () => {
    test('handles very large CSV files without crashing', async ({ page }) => {
      // Generate a large CSV (but not too large to avoid timeout)
      const largeCsv = TestHelpers.generateLargeCsv(100);
      const jsonTemplate = '{"name": "{{name}}", "email": "{{email}}"}';

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(largeCsv);

      // Application should handle large data without crashing
      await expect(mergeToolPage.csvTextarea).toHaveValue(largeCsv);
      
      // Check that CSV is parsed correctly
      const rowCount = await mergeToolPage.getCsvRowCount();
      expect(rowCount).toBe(100);

      // Merge should work (though might be slow)
      await TestHelpers.waitForMergeComplete(page, 15000); // Longer timeout for large data
      const resultCount = await mergeToolPage.getResultCount();
      expect(resultCount).toBe(100);
    });

    test('handles malformed JSON gracefully', async ({ page }) => {
      const malformedJson = '{"name": "{{name}",, "invalid": }';
      
      await mergeToolPage.setJsonContent(malformedJson);
      
      // Should show validation error
      const error = await mergeToolPage.getJsonValidationError();
      expect(error).toBeTruthy();
      // The error message might vary, but should indicate JSON parsing issue
      expect(error.toLowerCase()).toMatch(/json|syntax|parse|invalid|expected/i);

      // Application should remain functional
      await mergeToolPage.clearJsonEditor();
      await mergeToolPage.setJsonContent('{"valid": "json"}');
      
      const isValid = await mergeToolPage.isJsonValid();
      expect(isValid).toBe(true);
    });

    test('handles special characters and encoding issues', async ({ page }) => {
      // Test with various special characters and encodings
      const jsonTemplate = '{"message": "{{message}}", "emoji": "{{emoji}}"}';
      const csvData = 'message,emoji\n"Hello, 世界!","🌍🚀"\n"Café & résumé","🎉✨"';

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvData);

      // Should handle special characters correctly
      await mergeToolPage.waitForMergeComplete();
      const results = await mergeToolPage.getMergeResults();
      
      expect(results).toHaveLength(2);
      
      const parsedResults = TestHelpers.parseJsonResults(results);
      expect(parsedResults[0].message).toBe('Hello, 世界!');
      expect(parsedResults[0].emoji).toBe('🌍🚀');
      expect(parsedResults[1].message).toBe('Café & résumé');
      expect(parsedResults[1].emoji).toBe('🎉✨');
    });

    test('handles empty and whitespace-only inputs', async ({ page }) => {
      // Test empty JSON
      await mergeToolPage.setJsonContent('');
      await mergeToolPage.setCsvContent('name\nTest');
      
      // Should not crash with empty JSON
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();

      // Test whitespace-only JSON
      await mergeToolPage.setJsonContent('   \n\t  ');
      
      // Should handle gracefully
      const error = await mergeToolPage.getJsonValidationError();
      expect(error).toBeTruthy(); // Should show some kind of validation feedback

      // Test empty CSV
      await mergeToolPage.setJsonContent('{"test": "value"}');
      await mergeToolPage.setCsvContent('');
      
      // Should handle empty CSV gracefully
      const csvContent = await mergeToolPage.csvTextarea.inputValue();
      expect(csvContent).toBe('');
    });

    test('handles browser console errors without affecting functionality', async ({ page }) => {
      // Listen for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Inject some code that might cause console errors
      await page.addInitScript(() => {
        // Simulate some console errors that might occur
        setTimeout(() => {
          console.error('Simulated error: Network timeout');
        }, 100);
      });

      await mergeToolPage.goto();
      await mergeToolPage.skipTour();

      // Despite console errors, application should work
      const jsonTemplate = '{"status": "{{status}}"}';
      const csvData = 'status\nactive';

      await mergeToolPage.setJsonContent(jsonTemplate);
      await mergeToolPage.setCsvContent(csvData);

      await mergeToolPage.waitForMergeComplete();
      const resultCount = await mergeToolPage.getResultCount();
      expect(resultCount).toBe(1);

      // Verify that we did capture some console errors (to validate our test setup)
      expect(consoleErrors.length).toBeGreaterThan(0);
    });
  });
});