/**
 * Test helper utilities for Playwright E2E tests
 * Provides common functions for parsing, validation, and comparison
 */

import { Page, expect } from '@playwright/test';

export class TestHelpers {
  /**
   * Parse JSON results from string array
   * Converts string representations of JSON objects into parsed objects
   * @param results - Array of JSON strings
   * @returns Array of parsed JSON objects
   */
  static parseJsonResults(results: string[]): any[] {
    return results.map(result => {
      try {
        return JSON.parse(result);
      } catch (error) {
        throw new Error(`Failed to parse JSON result: ${result}. Error: ${error}`);
      }
    });
  }

  /**
   * Validate JSON structure
   * Checks if a string is valid JSON
   * @param json - JSON string to validate
   * @returns true if valid JSON, false otherwise
   */
  static validateJsonStructure(json: string): boolean {
    if (!json || json.trim() === '') {
      return false;
    }
    
    try {
      JSON.parse(json);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Compare merged output with expected output
   * Performs deep comparison of actual vs expected results
   * @param actual - Actual merged output
   * @param expected - Expected output
   * @returns true if outputs match, false otherwise
   */
  static compareMergedOutput(actual: any, expected: any): boolean {
    try {
      // Handle null/undefined cases
      if (actual === null && expected === null) return true;
      if (actual === undefined && expected === undefined) return true;
      if (actual === null || expected === null) return false;
      if (actual === undefined || expected === undefined) return false;

      // Handle primitive types
      if (typeof actual !== 'object' || typeof expected !== 'object') {
        return actual === expected;
      }

      // Handle arrays
      if (Array.isArray(actual) && Array.isArray(expected)) {
        if (actual.length !== expected.length) return false;
        
        for (let i = 0; i < actual.length; i++) {
          if (!this.compareMergedOutput(actual[i], expected[i])) {
            return false;
          }
        }
        return true;
      }

      // Handle objects
      if (Array.isArray(actual) !== Array.isArray(expected)) {
        return false;
      }

      const actualKeys = Object.keys(actual).sort();
      const expectedKeys = Object.keys(expected).sort();

      // Compare keys
      if (actualKeys.length !== expectedKeys.length) return false;
      if (!actualKeys.every((key, index) => key === expectedKeys[index])) {
        return false;
      }

      // Compare values recursively
      for (const key of actualKeys) {
        if (!this.compareMergedOutput(actual[key], expected[key])) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error comparing merged output:', error);
      return false;
    }
  }

  /**
   * Generate large CSV for performance testing
   * Creates a CSV string with specified number of rows
   * @param rows - Number of data rows to generate
   * @returns CSV string with headers and data rows
   */
  static generateLargeCsv(rows: number): string {
    if (rows < 0) {
      throw new Error('Number of rows must be non-negative');
    }

    const headers = 'name,email,role,department,location';
    
    if (rows === 0) {
      return headers;
    }

    const dataRows = Array.from({ length: rows }, (_, i) => {
      const index = i + 1;
      return `User ${index},user${index}@example.com,Role ${i % 5},Department ${i % 10},Location ${i % 3}`;
    });

    return [headers, ...dataRows].join('\n');
  }

  /**
   * Wait for merge operation to complete
   * Polls the page until merge results are available or timeout occurs
   * @param page - Playwright page object
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   */
  static async waitForMergeComplete(page: Page, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      // Check if results section shows actual results
      const resultsHeading = page.locator('[data-tour="results"] h2');
      const headingText = await resultsHeading.textContent().catch(() => '');
      
      if (headingText && headingText.includes('Merged Results')) {
        // Check if there are actual result items (not just "No Results Yet")
        const resultItems = page.locator('[data-tour="results"] div.border.border-border.rounded-lg');
        const count = await resultItems.count();
        
        if (count > 0) {
          // Wait a bit more for rendering to stabilize
          await page.waitForTimeout(200);
          return;
        }
      }
      
      // Wait before next check
      await page.waitForTimeout(100);
    }
    
    // Timeout reached - check if there's an error or just no results
    const noResultsText = await page.locator('text=No Results Yet').isVisible().catch(() => false);
    if (noResultsText) {
      throw new Error('Merge operation did not produce results within timeout period');
    }
  }

  /**
   * Extract placeholder names from JSON template
   * Finds all {{placeholder}} patterns in a JSON string
   * @param jsonTemplate - JSON template string
   * @returns Array of placeholder names (without {{ }})
   */
  static extractPlaceholders(jsonTemplate: string): string[] {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(jsonTemplate)) !== null) {
      placeholders.push(match[1].trim());
    }

    return placeholders;
  }

  /**
   * Check if string contains unreplaced placeholders
   * Useful for verifying merge completeness
   * @param text - Text to check
   * @returns true if unreplaced placeholders found, false otherwise
   */
  static hasUnreplacedPlaceholders(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(text);
  }

  /**
   * Count CSV rows (excluding header)
   * @param csv - CSV string
   * @returns Number of data rows
   */
  static countCsvRows(csv: string): number {
    if (!csv || csv.trim() === '') return 0;
    
    const lines = csv.trim().split('\n');
    // Subtract 1 for header row
    return Math.max(0, lines.length - 1);
  }

  /**
   * Parse CSV headers
   * @param csv - CSV string
   * @returns Array of header names
   */
  static parseCsvHeaders(csv: string): string[] {
    if (!csv || csv.trim() === '') return [];
    
    const firstLine = csv.trim().split('\n')[0];
    return firstLine.split(',').map(header => header.trim());
  }

  /**
   * Create a simple CSV from data
   * @param headers - Column headers
   * @param rows - Array of row data (arrays matching header order)
   * @returns CSV string
   */
  static createCsv(headers: string[], rows: string[][]): string {
    const headerLine = headers.join(',');
    const dataLines = rows.map(row => row.join(','));
    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Wait for element with retry
   * Useful for flaky elements that may take time to appear
   * @param page - Playwright page object
   * @param selector - Element selector
   * @param timeout - Maximum time to wait in milliseconds
   */
  static async waitForElement(page: Page, selector: string, timeout: number = 5000): Promise<void> {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
  }

  /**
   * Safely get text content from element
   * Returns empty string if element not found
   * @param page - Playwright page object
   * @param selector - Element selector
   * @returns Text content or empty string
   */
  static async getTextContent(page: Page, selector: string): Promise<string> {
    const element = page.locator(selector);
    const isVisible = await element.isVisible().catch(() => false);
    
    if (!isVisible) return '';
    
    return await element.textContent() || '';
  }

  /**
   * Check if two arrays have the same elements (order-independent)
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns true if arrays contain same elements
   */
  static arraysHaveSameElements(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    
    return sorted1.every((val, index) => val === sorted2[index]);
  }

  /**
   * Normalize whitespace in string for comparison
   * Useful when comparing text that may have varying whitespace
   * @param text - Text to normalize
   * @returns Normalized text
   */
  static normalizeWhitespace(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Deep clone an object
   * @param obj - Object to clone
   * @returns Cloned object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Generate random string for testing
   * @param length - Length of string to generate
   * @returns Random string
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Retry an async operation with exponential backoff
   * @param operation - Async function to retry
   * @param maxRetries - Maximum number of retry attempts
   * @param initialDelay - Initial delay in milliseconds
   * @returns Result of the operation
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 100
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }
}
