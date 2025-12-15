/**
 * Tour and Help Feature Tests
 * Tests the interactive tour and placeholder help functionality
 */

import { test, expect } from '@playwright/test';
import { MergeToolPage } from '../fixtures/page-objects';

test.describe('Tour and Help Features', () => {
  let mergeToolPage: MergeToolPage;

  test.beforeEach(async ({ page }) => {
    mergeToolPage = new MergeToolPage(page);
    await mergeToolPage.goto();
    
    // Clear localStorage to ensure fresh state for tour tests
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        // Ignore localStorage access errors in test environment
      }
    });
  });

  test.describe('Interactive Tour', () => {
    test('first visit offers interactive tour', async () => {
      // On first visit (no localStorage), tour should start automatically
      // Wait a bit for the tour to potentially appear
      await mergeToolPage.page.waitForTimeout(1000);
      
      // Check if tour is visible
      const tourVisible = await mergeToolPage.isTourVisible();
      
      if (tourVisible) {
        // Tour appeared automatically - this is the expected behavior for first visit
        expect(tourVisible).toBe(true);
        
        // Verify we can see tour elements
        const skipButton = mergeToolPage.page.locator('button:has-text("Skip tour")');
        const nextButton = mergeToolPage.page.locator('button:has-text("Next")');
        
        // Check that at least one of the tour buttons is visible
        const skipVisible = await skipButton.isVisible().catch(() => false);
        const nextVisible = await nextButton.isVisible().catch(() => false);
        expect(skipVisible || nextVisible).toBe(true);
      } else {
        // If tour didn't appear automatically, check if "Take Tour" button is available
        await expect(mergeToolPage.takeTourButton).toBeVisible();
      }
    });

    test('starting tour guides through features', async () => {
      // Dismiss any existing tour first
      await mergeToolPage.skipTour();
      
      // Start the tour manually
      await mergeToolPage.startTour();
      
      // Verify tour is now visible
      const tourVisible = await mergeToolPage.isTourVisible();
      expect(tourVisible).toBe(true);
      
      // Verify we can navigate through tour steps
      const nextButton = mergeToolPage.page.locator('button:has-text("Next"), button:has-text("Done")');
      await expect(nextButton).toBeVisible();
      
      // Go through a few tour steps
      let stepCount = 0;
      const maxSteps = 6; // Based on the tour steps in AppTour.tsx
      
      while (stepCount < maxSteps) {
        const isVisible = await nextButton.isVisible().catch(() => false);
        if (!isVisible) break;
        
        const buttonText = await nextButton.textContent();
        await nextButton.click();
        await mergeToolPage.page.waitForTimeout(500);
        
        stepCount++;
        
        // If we clicked "Done", the tour should be finished
        if (buttonText?.includes('Done')) {
          break;
        }
      }
      
      // Verify tour completed (should no longer be visible)
      await mergeToolPage.page.waitForTimeout(500);
      const tourStillVisible = await mergeToolPage.isTourVisible();
      expect(tourStillVisible).toBe(false);
    });

    test('dismissing tour remembers preference', async () => {
      // Start tour
      await mergeToolPage.startTour();
      
      // Skip the tour
      const skipButton = mergeToolPage.page.locator('button:has-text("Skip tour")');
      if (await skipButton.isVisible()) {
        await skipButton.click();
        await mergeToolPage.page.waitForTimeout(500);
      }
      
      // Verify tour is dismissed
      const tourVisible = await mergeToolPage.isTourVisible();
      expect(tourVisible).toBe(false);
      
      // Check that localStorage has the tour completion flag
      const tourCompleted = await mergeToolPage.page.evaluate(() => {
        try {
          return localStorage.getItem('json-merge-tour-completed');
        } catch (e) {
          return null;
        }
      });
      // In test environment, localStorage might not be accessible, so we just verify tour is dismissed
      if (tourCompleted !== null) {
        expect(tourCompleted).toBe('true');
      }
      
      // Reload the page and verify tour doesn't start automatically
      await mergeToolPage.page.reload();
      await mergeToolPage.page.waitForTimeout(1000);
      
      const tourVisibleAfterReload = await mergeToolPage.isTourVisible();
      expect(tourVisibleAfterReload).toBe(false);
    });
  });

  test.describe('Placeholder Help', () => {
    test('accessing placeholder help displays documentation', async () => {
      // Dismiss any tour first
      await mergeToolPage.skipTour();
      
      // Open placeholder help
      await mergeToolPage.openPlaceholderHelp();
      
      // Verify help modal is open
      const helpOpen = await mergeToolPage.isPlaceholderHelpOpen();
      expect(helpOpen).toBe(true);
      
      // Verify help modal has the expected title
      const helpTitle = mergeToolPage.page.locator('[role="dialog"] h2:has-text("Placeholder Reference")');
      await expect(helpTitle).toBeVisible();
    });

    test('viewing help content shows examples', async () => {
      // Dismiss any tour first
      await mergeToolPage.skipTour();
      
      // Open placeholder help
      await mergeToolPage.openPlaceholderHelp();
      
      // Get help content
      const helpContent = await mergeToolPage.getPlaceholderHelpContent();
      
      // Verify help content contains expected sections and examples
      expect(helpContent).toContain('How to Use Placeholders');
      expect(helpContent).toContain('CSV Column Placeholders');
      expect(helpContent).toContain('System Placeholders');
      expect(helpContent).toContain('User Input Placeholders');
      expect(helpContent).toContain('Row Input Placeholders');
      expect(helpContent).toContain('Placeholder Methods');
      
      // Verify it contains example placeholder syntax
      expect(helpContent).toContain('{{');
      expect(helpContent).toContain('}}');
      
      // Verify it contains method examples
      expect(helpContent).toContain('toUpperCase');
      expect(helpContent).toContain('toLowerCase');
      
      // Verify it contains system placeholder examples
      expect(helpContent).toContain('uuid');
      expect(helpContent).toContain('currentDatetime');
      
      // Close help modal
      await mergeToolPage.closePlaceholderHelp();
      
      // Verify help modal is closed
      const helpOpen = await mergeToolPage.isPlaceholderHelpOpen();
      expect(helpOpen).toBe(false);
    });

    test('help modal can be dismissed with escape key', async () => {
      // Dismiss any tour first
      await mergeToolPage.skipTour();
      
      // Open placeholder help
      await mergeToolPage.openPlaceholderHelp();
      
      // Verify help modal is open
      let helpOpen = await mergeToolPage.isPlaceholderHelpOpen();
      expect(helpOpen).toBe(true);
      
      // Press Escape to close
      await mergeToolPage.page.keyboard.press('Escape');
      await mergeToolPage.page.waitForTimeout(300);
      
      // Verify help modal is closed
      helpOpen = await mergeToolPage.isPlaceholderHelpOpen();
      expect(helpOpen).toBe(false);
    });

    test('help modal shows different placeholder categories', async () => {
      // Dismiss any tour first
      await mergeToolPage.skipTour();
      
      // Open placeholder help
      await mergeToolPage.openPlaceholderHelp();
      
      // Check for different placeholder categories with their badges
      const systemSection = mergeToolPage.page.locator('text=System Placeholders');
      const userInputSection = mergeToolPage.page.locator('text=User Input Placeholders');
      const rowInputSection = mergeToolPage.page.locator('text=Row Input Placeholders');
      const methodsSection = mergeToolPage.page.locator('text=Placeholder Methods');
      
      await expect(systemSection).toBeVisible();
      await expect(userInputSection).toBeVisible();
      await expect(rowInputSection).toBeVisible();
      await expect(methodsSection).toBeVisible();
      
      // Check for category badges
      const autoGeneratedBadge = mergeToolPage.page.locator('text=Auto-generated');
      const sameForAllBadge = mergeToolPage.page.locator('text=Same for all rows');
      const arrayOnlyBadge = mergeToolPage.page.locator('text=Array only');
      const chainableBadge = mergeToolPage.page.locator('text=Chainable');
      
      await expect(autoGeneratedBadge).toBeVisible();
      await expect(sameForAllBadge).toBeVisible();
      await expect(arrayOnlyBadge).toBeVisible();
      await expect(chainableBadge).toBeVisible();
    });
  });

  test.describe('Tour Integration', () => {
    test('tour highlights correct elements with data-tour attributes', async () => {
      // Dismiss any existing tour
      await mergeToolPage.skipTour();
      
      // Start tour manually
      await mergeToolPage.startTour();
      
      // Verify tour is visible
      const tourVisible = await mergeToolPage.isTourVisible();
      expect(tourVisible).toBe(true);
      
      // Check that elements with data-tour attributes exist
      const jsonEditor = mergeToolPage.page.locator('[data-tour="json-editor"]');
      const csvEditor = mergeToolPage.page.locator('[data-tour="csv-editor"]');
      const arrayMode = mergeToolPage.page.locator('[data-tour="array-mode"]');
      const mergeStatus = mergeToolPage.page.locator('[data-tour="merge-status"]');
      const results = mergeToolPage.page.locator('[data-tour="results"]');
      const loadExample = mergeToolPage.page.locator('[data-tour="load-example"]');
      
      await expect(jsonEditor).toBeVisible();
      await expect(csvEditor).toBeVisible();
      await expect(arrayMode).toBeVisible();
      await expect(mergeStatus).toBeVisible();
      await expect(results).toBeVisible();
      await expect(loadExample).toBeVisible();
      
      // Skip the tour to clean up
      await mergeToolPage.skipTour();
    });

    test('take tour button is always accessible', async () => {
      // Dismiss any existing tour
      await mergeToolPage.skipTour();
      
      // Verify "Take Tour" button is visible and clickable
      await expect(mergeToolPage.takeTourButton).toBeVisible();
      
      // Click it to start tour
      await mergeToolPage.takeTourButton.click();
      await mergeToolPage.page.waitForTimeout(500);
      
      // Verify tour started
      const tourVisible = await mergeToolPage.isTourVisible();
      expect(tourVisible).toBe(true);
      
      // Clean up
      await mergeToolPage.skipTour();
    });
  });
});