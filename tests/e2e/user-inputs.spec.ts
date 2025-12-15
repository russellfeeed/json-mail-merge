/**
 * User Input E2E Tests
 * Tests for user input and row input prompt functionality
 * Requirements: 6.4, 6.5
 */

import { test, expect } from '@playwright/test';
import { MergeToolPage } from '../fixtures/page-objects';
import { sampleCsvData } from '../fixtures/test-data';

test.describe('User Input Tests', () => {
  let mergeTool: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeTool = new MergeToolPage(page);
    await mergeTool.goto();
    
    // Skip tour if it appears
    await mergeTool.skipTour();
  });

  /**
   * Test: Canceling input prompt is handled gracefully
   * Validates: Requirement 6.4 - WHEN a user cancels an input prompt THEN the Test Application 
   * SHALL handle the cancellation gracefully
   */
  test('should handle canceling input prompt gracefully', async () => {
    // Set up JSON template with user input placeholders
    const jsonWithUserInputs = `{
  "name": "{{name}}",
  "department": "{{userInputString}}"
}`;

    // Set JSON content
    await mergeTool.setJsonContent(jsonWithUserInputs);
    await mergeTool.waitForValidation();

    // Set CSV content
    await mergeTool.setCsvContent(sampleCsvData.simple);
    await mergeTool.waitForValidation();

    // Wait for user input section to appear
    await expect(mergeTool.userInputSection).toBeVisible();

    // Verify that user input field is present
    const userInputStringField = mergeTool.userInputSection.locator('input#userInputString');
    await expect(userInputStringField).toBeVisible();

    // Fill in input and then clear it (simulating cancellation)
    await userInputStringField.fill('Engineering');
    
    // Verify input was filled
    expect(await userInputStringField.inputValue()).toBe('Engineering');

    // Clear the input (simulating cancellation)
    await userInputStringField.fill('');

    // Verify input is cleared
    expect(await userInputStringField.inputValue()).toBe('');

    // Verify the application handles this gracefully - the user input section should still be visible
    await expect(mergeTool.userInputSection).toBeVisible();
    
    // Verify that the application doesn't crash or show unexpected errors
    await expect(mergeTool.jsonEditorSection).toBeVisible();
    await expect(mergeTool.csvEditorSection).toBeVisible();
  });

  /**
   * Test: Multiple input prompts appear in sequence
   * Validates: Requirement 6.5 - WHEN multiple input prompts are needed THEN the Test Application 
   * SHALL present them in a logical sequence
   */
  test('should present multiple input prompts in logical sequence', async () => {
    // Set up JSON template with multiple user input placeholders
    const jsonWithMultipleInputs = `{
  "name": "{{name}}",
  "department": "{{userInputString}}",
  "version": "{{userInputNumber}}"
}`;

    // Set JSON content
    await mergeTool.setJsonContent(jsonWithMultipleInputs);
    await mergeTool.waitForValidation();

    // Set CSV content
    await mergeTool.setCsvContent(sampleCsvData.simple);
    await mergeTool.waitForValidation();

    // Wait for user input section to appear
    await expect(mergeTool.userInputSection).toBeVisible();

    // Verify that both user input fields are present
    const userInputStringField = mergeTool.userInputSection.locator('input#userInputString');
    const userInputNumberField = mergeTool.userInputSection.locator('input#userInputNumber');
    
    await expect(userInputStringField).toBeVisible();
    await expect(userInputNumberField).toBeVisible();

    // Verify the fields have appropriate labels
    const stringLabel = mergeTool.userInputSection.locator('label[for="userInputString"]');
    const numberLabel = mergeTool.userInputSection.locator('label[for="userInputNumber"]');
    
    await expect(stringLabel).toBeVisible();
    await expect(numberLabel).toBeVisible();
    
    // Verify label content shows the placeholder syntax
    expect(await stringLabel.textContent()).toContain('{{userInputString}}');
    expect(await numberLabel.textContent()).toContain('{{userInputNumber}}');

    // Verify input placeholders are appropriate
    expect(await userInputStringField.getAttribute('placeholder')).toContain('Enter text');
    expect(await userInputNumberField.getAttribute('placeholder')).toContain('Enter a number');

    // Fill inputs in sequence and verify they work correctly
    await userInputStringField.fill('Engineering');
    await userInputNumberField.fill('42');

    // Verify values are set correctly
    expect(await userInputStringField.inputValue()).toBe('Engineering');
    expect(await userInputNumberField.inputValue()).toBe('42');

    // Verify that both inputs are presented in a logical, organized manner
    const userInputSection = mergeTool.userInputSection;
    await expect(userInputSection).toContainText('User Inputs');
    await expect(userInputSection).toContainText('These values will be applied to all rows');
  });


});