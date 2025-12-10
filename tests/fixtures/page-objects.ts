/**
 * Page Object Model for the JSON-CSV Merge Tool
 * Encapsulates page elements and interactions for maintainability
 */

import { Page, Locator, expect } from '@playwright/test';

export class MergeToolPage {
  readonly page: Page;

  // Navigation
  readonly baseUrl: string;

  // JSON Editor elements
  readonly jsonEditorSection: Locator;
  readonly jsonTextarea: Locator;
  readonly jsonUploadInput: Locator;
  readonly jsonDropZone: Locator;
  readonly jsonValidationStatus: Locator;
  readonly jsonDownloadButton: Locator;
  readonly jsonTemplateSelect: Locator;
  readonly placeholderHelpButton: Locator;

  // CSV Editor elements
  readonly csvEditorSection: Locator;
  readonly csvTextarea: Locator;
  readonly csvUploadInput: Locator;
  readonly csvDropZone: Locator;
  readonly csvTabText: Locator;
  readonly csvTabPreview: Locator;
  readonly csvGenerateSampleButton: Locator;
  readonly csvDownloadButton: Locator;

  // Array Mode elements
  readonly arrayModeSection: Locator;
  readonly arrayModeSwitch: Locator;
  readonly arrayPathSelect: Locator;

  // User Input elements
  readonly userInputSection: Locator;

  // Row Input elements
  readonly rowInputSection: Locator;

  // Merge Status elements
  readonly mergeStatusSection: Locator;
  readonly mergeStatusText: Locator;
  readonly statusIndicators: Locator;

  // Results elements
  readonly resultsSection: Locator;
  readonly downloadAllButton: Locator;
  readonly resultItems: Locator;

  // Tour elements
  readonly takeTourButton: Locator;
  readonly tourNextButton: Locator;
  readonly tourSkipButton: Locator;
  readonly tourBackButton: Locator;
  readonly tourCloseButton: Locator;

  // Header elements
  readonly loadExampleButton: Locator;
  readonly clearAllButton: Locator;

  // Help Modal elements
  readonly helpModalTrigger: Locator;
  readonly helpModalContent: Locator;
  readonly helpModalClose: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:8080') {
    this.page = page;
    this.baseUrl = baseUrl;

    // JSON Editor
    this.jsonEditorSection = page.locator('[data-tour="json-editor"]');
    this.jsonTextarea = this.jsonEditorSection.locator('textarea');
    this.jsonUploadInput = page.locator('#json-upload');
    this.jsonDropZone = this.jsonEditorSection.locator('.drop-zone');
    this.jsonValidationStatus = this.jsonEditorSection.locator('span:has-text("Valid JSON"), span:has-text("Invalid JSON")');
    this.jsonDownloadButton = this.jsonEditorSection.locator('button:has(svg)').filter({ hasText: '' }).first();
    this.jsonTemplateSelect = this.jsonEditorSection.locator('button[role="combobox"]');
    this.placeholderHelpButton = this.jsonEditorSection.locator('button:has(svg)').first();

    // CSV Editor
    this.csvEditorSection = page.locator('[data-tour="csv-editor"]');
    this.csvTextarea = this.csvEditorSection.locator('textarea');
    this.csvUploadInput = page.locator('#csv-upload');
    this.csvDropZone = this.csvEditorSection.locator('.drop-zone');
    this.csvTabText = this.csvEditorSection.locator('button[role="tab"]:has-text("Raw Text")');
    this.csvTabPreview = this.csvEditorSection.locator('button[role="tab"]:has-text("Preview")');
    this.csvGenerateSampleButton = this.csvEditorSection.locator('button:has-text("Generate Sample")');
    this.csvDownloadButton = this.csvEditorSection.locator('button:has(svg)').filter({ hasText: '' }).first();

    // Array Mode
    this.arrayModeSection = page.locator('[data-tour="array-mode"]');
    this.arrayModeSwitch = this.arrayModeSection.locator('button[role="switch"]');
    this.arrayPathSelect = this.arrayModeSection.locator('button[role="combobox"]');

    // User Input
    this.userInputSection = page.locator('div:has(h3:has-text("User Inputs"))').first();

    // Row Input
    this.rowInputSection = page.locator('div:has(label:has-text("Row Inputs"))').first();

    // Merge Status
    this.mergeStatusSection = page.locator('[data-tour="merge-status"]');
    this.mergeStatusText = this.mergeStatusSection.locator('p.text-sm');
    this.statusIndicators = this.mergeStatusSection.locator('div[class*="rounded-full"]');

    // Results
    this.resultsSection = page.locator('[data-tour="results"]');
    this.downloadAllButton = this.resultsSection.locator('button:has-text("Download All")');
    this.resultItems = this.resultsSection.locator('div.border.border-border.rounded-lg');

    // Tour
    this.takeTourButton = page.locator('button:has-text("Take Tour")');
    this.tourNextButton = page.locator('button:has-text("Next"), button:has-text("Done")');
    this.tourSkipButton = page.locator('button:has-text("Skip tour")');
    this.tourBackButton = page.locator('button:has-text("Back")');
    this.tourCloseButton = page.locator('button:has-text("Close")');

    // Header
    this.loadExampleButton = page.locator('[data-tour="load-example"]');
    this.clearAllButton = page.locator('button:has-text("Clear All")');

    // Help Modal
    this.helpModalTrigger = this.jsonEditorSection.locator('button').first();
    this.helpModalContent = page.locator('[role="dialog"]:has-text("Placeholder Reference")');
    this.helpModalClose = this.helpModalContent.locator('button[aria-label="Close"]');
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('networkidle');
  }

  // JSON Editor methods
  async getJsonEditor(): Promise<Locator> {
    return this.jsonTextarea;
  }

  async setJsonContent(content: string): Promise<void> {
    await this.jsonTextarea.click();
    await this.jsonTextarea.fill(content);
    // Wait a bit for validation to process
    await this.page.waitForTimeout(100);
  }

  async getJsonValidationError(): Promise<string | null> {
    const errorElement = this.jsonEditorSection.locator('p.text-destructive');
    const isVisible = await errorElement.isVisible().catch(() => false);
    if (!isVisible) return null;
    return await errorElement.textContent();
  }

  async isJsonValid(): Promise<boolean> {
    const status = await this.jsonValidationStatus.textContent();
    return status?.includes('Valid JSON') || false;
  }

  async selectPresetTemplate(templateName: string): Promise<void> {
    await this.jsonTemplateSelect.click();
    await this.page.locator(`[role="option"]:has-text("${templateName}")`).click();
    await this.page.waitForTimeout(100);
  }

  async clearJsonEditor(): Promise<void> {
    await this.jsonTextarea.click();
    await this.jsonTextarea.fill('');
  }

  async downloadJsonTemplate(): Promise<void> {
    await this.jsonDownloadButton.click();
  }

  async getDetectedPlaceholders(): Promise<string[]> {
    const placeholderTags = this.jsonEditorSection.locator('.placeholder-tag');
    const count = await placeholderTags.count();
    const placeholders: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await placeholderTags.nth(i).textContent();
      if (text) {
        // Extract placeholder from {{placeholder}} format
        const match = text.match(/\{\{([^}]+)\}\}/);
        if (match) placeholders.push(match[1]);
      }
    }
    
    return placeholders;
  }

  // CSV Editor methods
  async getCsvEditor(): Promise<Locator> {
    return this.csvTextarea;
  }

  async setCsvContent(content: string): Promise<void> {
    await this.csvTextarea.click();
    await this.csvTextarea.fill(content);
    await this.page.waitForTimeout(100);
  }

  async clearCsvEditor(): Promise<void> {
    await this.csvTextarea.click();
    await this.csvTextarea.fill('');
  }

  async switchToCsvPreview(): Promise<void> {
    await this.csvTabPreview.click();
  }

  async switchToCsvText(): Promise<void> {
    await this.csvTabText.click();
  }

  async getCsvRowCount(): Promise<number> {
    await this.switchToCsvPreview();
    const rows = this.csvEditorSection.locator('tbody tr');
    return await rows.count();
  }

  async getCsvHeaders(): Promise<string[]> {
    await this.switchToCsvPreview();
    const headers = this.csvEditorSection.locator('thead th');
    const count = await headers.count();
    const headerTexts: string[] = [];
    
    // Skip first header (row number column)
    for (let i = 1; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) headerTexts.push(text.trim());
    }
    
    return headerTexts;
  }

  async generateSampleCsv(): Promise<void> {
    await this.csvGenerateSampleButton.click();
  }

  // Merge operation methods
  async clickMergeButton(): Promise<void> {
    // The merge happens automatically when conditions are met
    // This method waits for results to appear
    await this.waitForMergeComplete();
  }

  async getMergeResults(): Promise<string[]> {
    const count = await this.resultItems.count();
    const results: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const item = this.resultItems.nth(i);
      // Expand the item to see content
      await item.locator('button').first().click();
      await this.page.waitForTimeout(200);
      
      const codeBlock = item.locator('pre code');
      const content = await codeBlock.textContent();
      if (content) results.push(content);
    }
    
    return results;
  }

  async downloadResults(): Promise<void> {
    await this.downloadAllButton.click();
  }

  async getResultCount(): Promise<number> {
    const countText = await this.resultsSection.locator('h2').textContent();
    const match = countText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async waitForMergeComplete(): Promise<void> {
    // Wait for results section to show actual results (not "No Results Yet")
    await this.page.waitForSelector('[data-tour="results"] h2:has-text("Merged Results")', {
      timeout: 5000
    }).catch(() => {
      // If it doesn't appear, that's okay - might not have valid data
    });
  }

  // Array Mode methods
  async enableArrayMode(): Promise<void> {
    const isChecked = await this.arrayModeSwitch.getAttribute('data-state');
    if (isChecked !== 'checked') {
      await this.arrayModeSwitch.click();
      await this.page.waitForTimeout(100);
    }
  }

  async disableArrayMode(): Promise<void> {
    const isChecked = await this.arrayModeSwitch.getAttribute('data-state');
    if (isChecked === 'checked') {
      await this.arrayModeSwitch.click();
      await this.page.waitForTimeout(100);
    }
  }

  async selectArrayPath(path: string): Promise<void> {
    await this.arrayPathSelect.click();
    await this.page.locator(`[role="option"]:has-text("${path}")`).click();
  }

  async getAvailableArrayPaths(): Promise<string[]> {
    await this.arrayPathSelect.click();
    const options = this.page.locator('[role="option"]');
    const count = await options.count();
    const paths: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) paths.push(text.trim());
    }
    
    // Close the select
    await this.page.keyboard.press('Escape');
    return paths;
  }

  // User input methods
  async fillUserInputPrompt(inputName: string, value: string): Promise<void> {
    const input = this.userInputSection.locator(`input#${inputName}`);
    await input.fill(value);
  }

  async fillAllUserInputs(values: Record<string, string>): Promise<void> {
    for (const [name, value] of Object.entries(values)) {
      await this.fillUserInputPrompt(name, value);
    }
  }

  async getUserInputValue(inputName: string): Promise<string> {
    const input = this.userInputSection.locator(`input#${inputName}`);
    return await input.inputValue();
  }

  async cancelInputPrompt(): Promise<void> {
    // This would be for a modal-based input prompt
    // Current implementation uses inline inputs, so this is a no-op
    // Kept for interface compatibility
  }

  // Row input methods
  async fillRowInputPrompt(rowIndex: number, inputName: string, value: string): Promise<void> {
    const row = this.rowInputSection.locator('tbody tr').nth(rowIndex);
    const input = row.locator('input').first(); // Simplified - would need better selector
    await input.fill(value);
  }

  async fillAllRowInputs(values: Record<number, Record<string, string>>): Promise<void> {
    for (const [rowIndex, inputs] of Object.entries(values)) {
      for (const [inputName, value] of Object.entries(inputs)) {
        await this.fillRowInputPrompt(parseInt(rowIndex), inputName, value);
      }
    }
  }

  async getRowInputValue(rowIndex: number, inputName: string): Promise<string> {
    const row = this.rowInputSection.locator('tbody tr').nth(rowIndex);
    const input = row.locator('input').first();
    return await input.inputValue();
  }

  // Tour methods
  async startTour(): Promise<void> {
    await this.takeTourButton.click();
    await this.page.waitForTimeout(500);
  }

  async skipTour(): Promise<void> {
    try {
      // Wait a bit for the tour to potentially appear
      await this.page.waitForTimeout(1000);
      
      // Look for the tour portal and any tour elements
      const tourPortal = this.page.locator('#react-joyride-portal');
      const skipButton = this.page.locator('button:has-text("Skip tour")');
      const closeButton = this.page.locator('button[aria-label="Close"], button:has-text("Close")');
      const tourOverlay = this.page.locator('[class*="react-joyride"]');
      const spotlight = this.page.locator('[data-test-id="spotlight"]');
      
      // Multiple attempts to dismiss the tour
      for (let attempt = 0; attempt < 3; attempt++) {
        // Check if tour elements are present
        const tourVisible = await tourPortal.isVisible().catch(() => false) || 
                           await tourOverlay.isVisible().catch(() => false) ||
                           await spotlight.isVisible().catch(() => false);
        
        if (!tourVisible) {
          break; // Tour is gone, we're done
        }
        
        // Try different dismissal methods
        if (await skipButton.isVisible().catch(() => false)) {
          await skipButton.click();
          await this.page.waitForTimeout(500);
        } else if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
          await this.page.waitForTimeout(500);
        } else {
          // Try pressing Escape multiple times
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(200);
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(500);
        }
      }
      
      // Final check - if tour is still there, try to force dismiss it
      if (await tourPortal.isVisible().catch(() => false)) {
        // Try clicking outside the tour area to dismiss it
        await this.page.click('body', { position: { x: 10, y: 10 } });
        await this.page.waitForTimeout(300);
      }
      
    } catch (error) {
      // If tour handling fails, continue anyway
      console.log('Tour dismissal failed, continuing:', error);
    }
  }

  async nextTourStep(): Promise<void> {
    await this.tourNextButton.click();
    await this.page.waitForTimeout(300);
  }

  async completeTour(): Promise<void> {
    // Click through all tour steps
    let hasNext = true;
    while (hasNext) {
      const nextButton = this.page.locator('button:has-text("Next"), button:has-text("Done")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await this.page.waitForTimeout(300);
      } else {
        hasNext = false;
      }
    }
  }

  async isTourVisible(): Promise<boolean> {
    const tourOverlay = this.page.locator('[class*="react-joyride"]');
    const tourPortal = this.page.locator('#react-joyride-portal');
    const spotlight = this.page.locator('[data-test-id="spotlight"]');
    
    return await tourOverlay.isVisible().catch(() => false) ||
           await tourPortal.isVisible().catch(() => false) ||
           await spotlight.isVisible().catch(() => false);
  }

  async forceDismissTour(): Promise<void> {
    // Aggressive tour dismissal for tests
    try {
      // Inject JavaScript to remove tour elements
      await this.page.evaluate(() => {
        // Remove react-joyride portal
        const portal = document.getElementById('react-joyride-portal');
        if (portal) {
          portal.remove();
        }
        
        // Remove any elements with joyride classes
        const joyrideElements = document.querySelectorAll('[class*="react-joyride"], [class*="joyride"]');
        joyrideElements.forEach(el => el.remove());
        
        // Remove spotlight elements
        const spotlights = document.querySelectorAll('[data-test-id="spotlight"]');
        spotlights.forEach(el => el.remove());
      });
      
      await this.page.waitForTimeout(200);
    } catch (error) {
      console.log('Force tour dismissal failed:', error);
    }
  }

  // Help modal methods
  async openPlaceholderHelp(): Promise<void> {
    await this.helpModalTrigger.click();
    await this.helpModalContent.waitFor({ state: 'visible' });
  }

  async closePlaceholderHelp(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.helpModalContent.waitFor({ state: 'hidden' });
  }

  async isPlaceholderHelpOpen(): Promise<boolean> {
    return await this.helpModalContent.isVisible().catch(() => false);
  }

  async getPlaceholderHelpContent(): Promise<string> {
    return await this.helpModalContent.textContent() || '';
  }

  // Utility methods
  async loadExample(): Promise<void> {
    await this.loadExampleButton.click();
    await this.page.waitForTimeout(200);
  }

  async clearAll(): Promise<void> {
    if (await this.clearAllButton.isVisible()) {
      await this.clearAllButton.click();
      await this.page.waitForTimeout(100);
    }
  }

  async getMergeStatus(): Promise<string> {
    return await this.mergeStatusText.textContent() || '';
  }

  async canMerge(): Promise<boolean> {
    const status = await this.getMergeStatus();
    return status.includes('Ready to generate');
  }

  async waitForValidation(): Promise<void> {
    await this.page.waitForTimeout(200);
  }

  // Screenshot helper
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }
}
